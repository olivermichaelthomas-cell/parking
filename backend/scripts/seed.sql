INSERT INTO zones (name, price_per_unit, unit_minutes, enforcement_hours_by_day, max_duration_minutes) VALUES
  ('Zone 1', 20.00, 30, '{"mon":{"start":"08:00","end":"17:00"},"tue":{"start":"08:00","end":"17:00"},"wed":{"start":"08:00","end":"17:00"},"thu":{"start":"08:00","end":"17:00"},"fri":{"start":"08:00","end":"17:00"},"sat":{"start":"08:00","end":"13:00"}}', 120),
  ('Zone 2', 10.00, 30, '{"mon":{"start":"08:00","end":"17:00"},"tue":{"start":"08:00","end":"17:00"},"wed":{"start":"08:00","end":"17:00"},"thu":{"start":"08:00","end":"17:00"},"fri":{"start":"08:00","end":"17:00"},"sat":{"start":"08:00","end":"13:00"}}', 180)
ON CONFLICT DO NOTHING;
