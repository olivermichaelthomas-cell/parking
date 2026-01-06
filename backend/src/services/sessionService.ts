import dayjs from 'dayjs';
import { PoolClient } from 'pg';
import { EnforcementHours } from '../config';
import { Zone, ParkingSession } from '../types/entities';

export function isWithinEnforcement(time: dayjs.Dayjs, hours?: EnforcementHours) {
  if (!hours) return true;
  const dayKey = time.format('ddd').toLowerCase().slice(0, 3);
  const window = hours[dayKey];
  if (!window) return false;
  const start = dayjs(time.format('YYYY-MM-DD') + 'T' + window.start);
  const end = dayjs(time.format('YYYY-MM-DD') + 'T' + window.end);
  return time.isAfter(start) && time.isBefore(end);
}

export function calculateEndTime(start: dayjs.Dayjs, minutes: number) {
  return start.add(minutes, 'minute');
}

export function calculatePrice(zone: Zone, durationMinutes: number) {
  const units = Math.ceil(durationMinutes / zone.unit_minutes);
  return Number(zone.price_per_unit) * units;
}

export async function expireOldSessions(client: PoolClient) {
  await client.query(
    `UPDATE parking_sessions SET status = 'EXPIRED'
     WHERE status = 'ACTIVE' AND end_time <= NOW()`
  );
}

export async function findActiveSessionForPlate(client: PoolClient, plate: string) {
  const session = await client.query<ParkingSession & { plate_number: string; zone_name: string }>(
    `SELECT ps.*, v.plate_number, z.name as zone_name FROM parking_sessions ps
     JOIN vehicles v ON v.id = ps.vehicle_id
     JOIN zones z ON z.id = ps.zone_id
     WHERE v.plate_number = $1 AND ps.status = 'ACTIVE' AND NOW() BETWEEN ps.start_time AND ps.end_time
     ORDER BY ps.end_time DESC LIMIT 1`,
    [plate]
  );
  return session.rows[0];
}

export function validateDuration(zone: Zone, requestedMinutes: number, start: dayjs.Dayjs) {
  if (requestedMinutes <= 0) throw new Error('Duration must be positive');
  if (requestedMinutes > zone.max_duration_minutes) {
    throw new Error('Duration exceeds maximum for zone');
  }
  if (!isWithinEnforcement(start, zone.enforcement_hours_by_day)) {
    throw new Error('Cannot start outside enforcement hours');
  }
  const end = calculateEndTime(start, requestedMinutes);
  if (!isWithinEnforcement(end.subtract(1, 'minute'), zone.enforcement_hours_by_day)) {
    throw new Error('Duration exceeds enforcement window');
  }
  return end;
}
