import { readFileSync } from 'fs';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    const schemaSql = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schemaSql);
    const seedSql = readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await client.query(seedSql);

    const adminPassword = await bcrypt.hash('AdminPass123!', 10);
    const officerPassword = await bcrypt.hash('OfficerPass123!', 10);

    await client.query(
      `INSERT INTO users (role, email, password_hash) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
      ['ADMIN', 'admin@parking.mu', adminPassword]
    );
    await client.query(
      `INSERT INTO users (role, email, password_hash) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
      ['OFFICER', 'officer@parking.mu', officerPassword]
    );
    console.log('Database initialized');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
