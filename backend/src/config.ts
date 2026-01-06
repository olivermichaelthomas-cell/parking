import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

authenticateEnv('JWT_SECRET');

type EnforcementHours = Record<string, { start: string; end: string } | null>;

function authenticateEnv(key: string) {
  if (!process.env[key]) {
    console.warn(`Environment variable ${key} is not set. Using placeholder.`);
  }
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'changeme',
  databaseUrl: process.env.DATABASE_URL || 'postgres://parking:parking@localhost:5432/parking',
  notificationMinutesBefore: parseInt(process.env.NOTIFICATION_MINUTES_BEFORE || '10', 10),
};

export type { EnforcementHours };
