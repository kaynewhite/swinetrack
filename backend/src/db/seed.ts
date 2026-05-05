import "dotenv/config";
import pool from "./pool";
import { createSchema } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  await createSchema();

  // Check if PAO account already seeded
  const existing = await pool.query("SELECT id FROM users WHERE role = 'pao' LIMIT 1");
  if (existing.rows.length > 0) {
    console.log("PAO account already seeded.");
    process.exit(0);
  }

  // Seed the single PAO account
  await pool.query(
    `INSERT INTO users (id, clerk_id, email, full_name, role, municipality)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (email) DO NOTHING`,
    [
      "pao-laguna-001",
      null,
      "pao@swinetrack.laguna.gov.ph",
      "PAO Laguna Administrator",
      "pao",
      "Laguna Province",
    ]
  );

  console.log("Seeded PAO account: pao@swinetrack.laguna.gov.ph");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
