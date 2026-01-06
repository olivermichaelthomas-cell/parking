import { Router } from 'express';
import { z } from 'zod';
import dayjs from 'dayjs';
import { authMiddleware, AuthRequest, roleGuard } from '../middleware/auth';
import { pool, withClient } from '../db';
import { calculatePrice, expireOldSessions, findActiveSessionForPlate, validateDuration } from '../services/sessionService';

const router = Router();

const startSchema = z.object({ vehicle_id: z.string().uuid(), zone_id: z.number().int(), duration_minutes: z.number().positive() });

router.post('/start', authMiddleware, async (req: AuthRequest, res) => {
  const parsed = startSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());
  const { vehicle_id, zone_id, duration_minutes } = parsed.data;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const vehicle = await client.query('SELECT * FROM vehicles WHERE id=$1 AND user_id=$2', [vehicle_id, req.user!.id]);
    if (!vehicle.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    const zoneRes = await client.query('SELECT * FROM zones WHERE id=$1', [zone_id]);
    if (!zoneRes.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Zone not found' });
    }
    const zone = zoneRes.rows[0];
    const now = dayjs();
    let endTime;
    try {
      endTime = validateDuration(zone, duration_minutes, now);
    } catch (err: any) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: err.message });
    }
    const amount = calculatePrice(zone, duration_minutes);
    const paymentRef = `PAY-${Date.now()}`;
    await expireOldSessions(client);
    const activeExisting = await client.query(
      `SELECT id FROM parking_sessions WHERE vehicle_id=$1 AND status='ACTIVE' AND NOW() BETWEEN start_time AND end_time`,
      [vehicle_id]
    );
    if (activeExisting.rowCount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Active session already exists for this vehicle' });
    }
    const insert = await client.query(
      `INSERT INTO parking_sessions (vehicle_id, zone_id, start_time, end_time, status, amount_paid, payment_ref)
       VALUES ($1,$2,$3,$4,'ACTIVE',$5,$6) RETURNING *`,
      [vehicle_id, zone_id, now.toISOString(), endTime.toISOString(), amount, paymentRef]
    );
    await client.query('COMMIT');
    res.status(201).json(insert.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Failed to start session' });
  } finally {
    client.release();
  }
});

const extendSchema = z.object({ session_id: z.string().uuid(), additional_minutes: z.number().positive() });

router.post('/extend', authMiddleware, async (req: AuthRequest, res) => {
  const parsed = extendSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());
  const { session_id, additional_minutes } = parsed.data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const sessionRes = await client.query(
      `SELECT ps.*, z.* as zone FROM parking_sessions ps JOIN vehicles v ON v.id = ps.vehicle_id JOIN zones z ON z.id = ps.zone_id WHERE ps.id=$1 AND v.user_id=$2`,
      [session_id, req.user!.id]
    );
    if (!sessionRes.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Session not found' });
    }
    const session = sessionRes.rows[0];
    if (session.status !== 'ACTIVE') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Session not active' });
    }
    const zone = {
      id: session.zone_id,
      name: session.name,
      price_per_unit: session.price_per_unit,
      unit_minutes: session.unit_minutes,
      enforcement_hours_by_day: session.enforcement_hours_by_day,
      max_duration_minutes: session.max_duration_minutes,
      active: session.active,
      created_at: session.created_at,
    } as any;
    const startTime = dayjs(session.start_time);
    const proposedMinutes = dayjs(session.end_time).diff(startTime, 'minute') + additional_minutes;
    let endTime;
    try {
      endTime = validateDuration(zone, proposedMinutes, startTime);
    } catch (err: any) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: err.message });
    }
    const addedCost = calculatePrice(zone, additional_minutes);
    const paymentRef = `PAY-${Date.now()}`;
    const update = await client.query(
      `UPDATE parking_sessions SET end_time=$1, amount_paid = amount_paid + $2, payment_ref=$3 WHERE id=$4 RETURNING *`,
      [endTime.toISOString(), addedCost, paymentRef, session_id]
    );
    await client.query('COMMIT');
    res.json(update.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Failed to extend session' });
  } finally {
    client.release();
  }
});

router.get('/mine', authMiddleware, async (req: AuthRequest, res) => {
  const sessions = await pool.query(
    `SELECT ps.*, v.plate_number, z.name as zone_name FROM parking_sessions ps
     JOIN vehicles v ON v.id = ps.vehicle_id
     JOIN zones z ON z.id = ps.zone_id
     WHERE v.user_id=$1 ORDER BY ps.created_at DESC LIMIT 20`,
    [req.user!.id]
  );
  res.json(sessions.rows);
});

router.get('/active', authMiddleware, roleGuard('OFFICER', 'ADMIN'), async (req: AuthRequest, res) => {
  const plate = String(req.query.plate || '').toUpperCase();
  if (!plate) return res.status(400).json({ message: 'Plate required' });
  const result = await withClient(async (client) => {
    await expireOldSessions(client);
    const session = await findActiveSessionForPlate(client, plate);
    const status = session ? 'VALID' : 'NOT_VALID';
    await client.query(
      `INSERT INTO officer_lookups (officer_id, plate_number, result_status, session_id)
       VALUES ($1,$2,$3,$4)`
      , [req.user!.id, plate, status, session?.id || null]
    );
    return { session, status };
  });
  if (result.session) {
    res.json({ status: 'VALID', session: result.session });
  } else {
    res.json({ status: 'NOT_VALID' });
  }
});

export default router;
