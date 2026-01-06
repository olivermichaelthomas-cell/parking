import { Router } from 'express';
import { authMiddleware, roleGuard } from '../middleware/auth';
import { pool } from '../db';
import { z } from 'zod';

const router = Router();

router.get('/', async (_req, res) => {
  const zones = await pool.query('SELECT * FROM zones WHERE active = true ORDER BY id');
  res.json(zones.rows);
});

const zoneSchema = z.object({
  name: z.string().min(2),
  price_per_unit: z.number().positive(),
  unit_minutes: z.number().min(1),
  enforcement_hours_by_day: z.record(z.any()),
  max_duration_minutes: z.number().min(1),
  active: z.boolean().default(true),
});

router.post('/admin/zones', authMiddleware, roleGuard('ADMIN'), async (req, res) => {
  const parsed = zoneSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());
  const { name, price_per_unit, unit_minutes, enforcement_hours_by_day, max_duration_minutes, active } = parsed.data;
  const zone = await pool.query(
    `INSERT INTO zones (name, price_per_unit, unit_minutes, enforcement_hours_by_day, max_duration_minutes, active)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [name, price_per_unit, unit_minutes, enforcement_hours_by_day, max_duration_minutes, active]
  );
  res.status(201).json(zone.rows[0]);
});

router.put('/admin/zones/:id', authMiddleware, roleGuard('ADMIN'), async (req, res) => {
  const parsed = zoneSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());
  const id = Number(req.params.id);
  const fields = parsed.data;
  const keys = Object.keys(fields);
  if (!keys.length) return res.status(400).json({ message: 'No fields provided' });
  const setClauses = keys.map((k, i) => `${k}=$${i + 1}`).join(', ');
  const values = Object.values(fields);
  values.push(id);
  const updated = await pool.query(`UPDATE zones SET ${setClauses} WHERE id=$${values.length} RETURNING *`, values);
  res.json(updated.rows[0]);
});

export default router;
