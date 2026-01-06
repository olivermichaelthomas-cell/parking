import dayjs from 'dayjs';
import { calculatePrice, validateDuration } from '../src/services/sessionService';
import { Zone } from '../src/types/entities';

describe('sessionService', () => {
  const zone: Zone = {
    id: 1,
    name: 'Zone 1',
    price_per_unit: 20,
    unit_minutes: 30,
    enforcement_hours_by_day: {
      mon: { start: '08:00', end: '17:00' },
    },
    max_duration_minutes: 120,
    active: true,
    created_at: new Date().toISOString(),
  };

  it('calculates pricing based on units', () => {
    expect(calculatePrice(zone, 30)).toBe(20);
    expect(calculatePrice(zone, 45)).toBe(40);
  });

  it('validates duration within limits', () => {
    const start = dayjs('2023-06-05T09:00:00');
    const end = validateDuration(zone, 60, start);
    expect(end.format()).toBe(dayjs('2023-06-05T10:00:00').format());
  });

  it('rejects duration beyond enforcement hours', () => {
    const start = dayjs('2023-06-05T16:30:00');
    expect(() => validateDuration(zone, 60, start)).toThrow('Duration exceeds enforcement window');
  });
});
