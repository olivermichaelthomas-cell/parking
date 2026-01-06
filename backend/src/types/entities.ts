import { EnforcementHours } from '../config';

export type Role = 'DRIVER' | 'OFFICER' | 'ADMIN';

export interface User {
  id: string;
  role: Role;
  email: string;
  phone?: string;
  password_hash: string;
  created_at: string;
}

export interface Zone {
  id: number;
  name: string;
  price_per_unit: number;
  unit_minutes: number;
  enforcement_hours_by_day: EnforcementHours;
  max_duration_minutes: number;
  active: boolean;
  created_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  plate_number: string;
  nickname?: string;
  created_at: string;
}

export interface ParkingSession {
  id: string;
  vehicle_id: string;
  zone_id: number;
  start_time: string;
  end_time: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  amount_paid: number;
  payment_ref: string;
  created_at: string;
}

export interface OfficerLookup {
  id: string;
  officer_id: string;
  plate_number: string;
  lookup_time: string;
  result_status: string;
  session_id?: string;
}
