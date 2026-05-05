import "dotenv/config";
import pool from "./pool";
import { createSchema } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  await createSchema();

  const PAO_EMAIL = "pao@swinetrack.laguna.gov.ph";
  const PAO_PASSWORD = "SwineTrack@PAO2024!";
  const hash = await bcrypt.hash(PAO_PASSWORD, 12);

  await pool.query(
    `INSERT INTO users (id, clerk_id, email, full_name, role, municipality, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, full_name = EXCLUDED.full_name`,
    [
      "pao-laguna-001",
      null,
      PAO_EMAIL,
      "PAO Laguna Administrator",
      "pao",
      "Laguna Province",
      hash,
    ]
  );

  console.log("✓ PAO account seeded:");
  console.log("  Email:", PAO_EMAIL);
  console.log("  Password:", PAO_PASSWORD);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
