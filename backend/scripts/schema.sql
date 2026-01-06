CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(20) NOT NULL CHECK (role IN ('DRIVER','OFFICER','ADMIN')),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price_per_unit NUMERIC(10,2) NOT NULL,
    unit_minutes INT NOT NULL DEFAULT 30,
    enforcement_hours_by_day JSONB NOT NULL,
    max_duration_minutes INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plate_number VARCHAR(20) NOT NULL,
    nickname VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, plate_number)
);

CREATE TABLE IF NOT EXISTS parking_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    zone_id INT NOT NULL REFERENCES zones(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE','EXPIRED','CANCELLED')),
    amount_paid NUMERIC(10,2) NOT NULL,
    payment_ref VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS officer_lookups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    officer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plate_number VARCHAR(20) NOT NULL,
    lookup_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    result_status VARCHAR(20) NOT NULL,
    session_id UUID REFERENCES parking_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_parking_sessions_vehicle_time ON parking_sessions(vehicle_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_status ON parking_sessions(status);
