import pool from "./pool";

export async function createSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      clerk_id TEXT UNIQUE,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('farm_owner','mao','pao','veterinarian')),
      municipality TEXT,
      contact_number TEXT,
      password_hash TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS farms (
      id SERIAL PRIMARY KEY,
      owner_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      farm_name TEXT NOT NULL,
      farm_type TEXT NOT NULL CHECK (farm_type IN ('backyard','commercial')),
      municipality TEXT NOT NULL,
      barangay TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      total_swine INT DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','quarantined')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS disease_reports (
      id SERIAL PRIMARY KEY,
      farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
      reported_by TEXT REFERENCES users(id),
      disease_category TEXT NOT NULL CHECK (disease_category IN ('high_risk_viral','bacterial','parasitic')),
      disease_name TEXT NOT NULL,
      affected_count INT NOT NULL DEFAULT 0,
      mortality_count INT DEFAULT 0,
      symptoms TEXT,
      notes TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending','verified','resolved','rejected')),
      verified_by TEXT REFERENCES users(id),
      verified_at TIMESTAMPTZ,
      reported_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS forecasts (
      id SERIAL PRIMARY KEY,
      municipality TEXT NOT NULL,
      disease_name TEXT,
      forecast_period TEXT NOT NULL,
      predicted_cases INT NOT NULL,
      risk_level TEXT NOT NULL CHECK (risk_level IN ('low','moderate','high','critical')),
      confidence_score DOUBLE PRECISION,
      model_used TEXT DEFAULT 'ARIMA+RF',
      generated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS recommendations (
      id SERIAL PRIMARY KEY,
      forecast_id INT REFERENCES forecasts(id),
      municipality TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      action_type TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      priority TEXT NOT NULL CHECK (priority IN ('low','medium','high','urgent')),
      status TEXT DEFAULT 'active' CHECK (status IN ('active','implemented','dismissed')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS permits (
      id SERIAL PRIMARY KEY,
      farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
      requested_by TEXT REFERENCES users(id),
      permit_type TEXT NOT NULL CHECK (permit_type IN ('transport','slaughter','movement')),
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      swine_count INT NOT NULL,
      purpose TEXT,
      transport_date DATE,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired')),
      reviewed_by TEXT REFERENCES users(id),
      reviewed_at TIMESTAMPTZ,
      remarks TEXT,
      requested_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS model_training_data (
      id SERIAL PRIMARY KEY,
      municipality TEXT NOT NULL,
      month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
      year INT NOT NULL,
      disease_name TEXT NOT NULL,
      case_count INT NOT NULL DEFAULT 0,
      mortality_count INT DEFAULT 0,
      farm_count INT DEFAULT 0,
      swine_population INT DEFAULT 0,
      entered_by TEXT REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(municipality, month, year, disease_name)
    );

    CREATE TABLE IF NOT EXISTS supply_data (
      id SERIAL PRIMARY KEY,
      municipality TEXT NOT NULL,
      month INT NOT NULL,
      year INT NOT NULL,
      total_swine_population INT DEFAULT 0,
      swine_slaughtered INT DEFAULT 0,
      swine_transported INT DEFAULT 0,
      recorded_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(municipality, month, year)
    );
  `);

  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
  `);

  console.log("Schema created successfully.");
}
