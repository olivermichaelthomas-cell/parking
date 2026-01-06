import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { pool } from '../db';

const router = Router();

const vehicleSchema = z.object({ plate_number: z.string().min(4).max(20), nickname: z.string().optional() });

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());
  const { plate_number, nickname } = parsed.data;
  const result = await pool.query(
    `INSERT INTO vehicles (user_id, plate_number, nickname) VALUES ($1,$2,$3) RETURNING *`,
    [req.user!.id, plate_number.toUpperCase(), nickname || null]
  );
  res.status(201).json(result.rows[0]);
});

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const result = await pool.query('SELECT * FROM vehicles WHERE user_id=$1 ORDER BY created_at DESC', [req.user!.id]);
  res.json(result.rows);
});

export default router;
