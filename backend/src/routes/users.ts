import { Router } from "express";
import { getAuth } from "@clerk/express";
import pool from "../db/pool";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Create or update user profile after Clerk signup
router.post("/sync", async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    const { email, fullName, role, municipality, contactNumber } = req.body;
    if (!email || !fullName || !role) {
      res.status(400).json({ error: "Missing required fields" }); return;
    }
    const allowed = ["farm_owner", "mao", "veterinarian"];
    if (!allowed.includes(role)) {
      res.status(400).json({ error: "Invalid role" }); return;
    }
    const result = await pool.query(
      `INSERT INTO users (id, clerk_id, email, full_name, role, municipality, contact_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (clerk_id) DO UPDATE SET
         email = EXCLUDED.email,
         full_name = EXCLUDED.full_name,
         municipality = EXCLUDED.municipality,
         contact_number = EXCLUDED.contact_number
       RETURNING *`,
      [userId, userId, email, fullName, role, municipality || null, contactNumber || null]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// Get current user profile
router.get("/me", requireAuth, async (req, res) => {
  res.json((req as any).dbUser);
});

// Update profile
router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const user = (req as any).dbUser;
    const { fullName, municipality, contactNumber } = req.body;
    const result = await pool.query(
      `UPDATE users SET full_name = COALESCE($1, full_name),
         municipality = COALESCE($2, municipality),
         contact_number = COALESCE($3, contact_number)
       WHERE id = $4 RETURNING *`,
      [fullName, municipality, contactNumber, user.id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

export default router;
