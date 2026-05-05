import { Pool } from "pg";

let connectionString = process.env.NEON_DATABASE_URL || "";

// Fix URL if it starts with // instead of postgresql://
if (connectionString.startsWith("//")) {
  connectionString = "postgresql:" + connectionString;
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export default pool;
