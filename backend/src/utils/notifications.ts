import dayjs from 'dayjs';
import { pool } from '../db';
import { config } from '../config';

export async function scheduleNotificationSweep() {
  setInterval(async () => {
    const threshold = config.notificationMinutesBefore;
    const windowStart = dayjs();
    const windowEnd = windowStart.add(threshold, 'minute');
    const sessions = await pool.query(
      `SELECT ps.id, v.plate_number, ps.end_time FROM parking_sessions ps
       JOIN vehicles v ON v.id = ps.vehicle_id
       WHERE ps.status='ACTIVE' AND ps.end_time BETWEEN $1 AND $2`,
      [windowStart.toISOString(), windowEnd.toISOString()]
    );
    sessions.rows.forEach((row) => {
      console.log(`Notify ${row.plate_number}: parking expires at ${row.end_time}`);
    });
  }, 60 * 1000);
}
