import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db';
import { comparePassword, hashPassword, signToken } from '../utils/auth';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  role: z.enum(['DRIVER', 'OFFICER', 'ADMIN']).optional(),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());
  const { email, password, phone, role } = parsed.data;
  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rowCount) return res.status(400).json({ message: 'Email already used' });
    const hash = await hashPassword(password);
    const insert = await client.query(
      `INSERT INTO users (email, phone, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, role`,
      [email, phone || null, hash, role || 'DRIVER']
    );
    const user = insert.rows[0];
    const token = signToken(user.id, user.role);
    res.json({ token });
  } finally {
    client.release();
  }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());
  const { email, password } = parsed.data;
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, role, password_hash FROM users WHERE email=$1', [email]);
    if (!result.rowCount) return res.status(401).json({ message: 'Invalid credentials' });
    const user = result.rows[0];
    const match = await comparePassword(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken(user.id, user.role);
    res.json({ token, role: user.role });
  } finally {
    client.release();
  }
});

export default router;
