import { Router } from "express";
import pool from "../db/pool";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const user = (req as any).dbUser;
    let query = `SELECT p.*, f.farm_name, f.municipality, u.full_name as requester_name
                 FROM permits p JOIN farms f ON p.farm_id = f.id JOIN users u ON p.requested_by = u.id WHERE 1=1`;
    const params: any[] = [];
    let idx = 1;
    if (user.role === "farm_owner") {
      query += ` AND p.requested_by = $${idx++}`; params.push(user.id);
    } else if (user.role === "mao" && user.municipality) {
      query += ` AND f.municipality = $${idx++}`; params.push(user.municipality);
    }
    query += " ORDER BY p.requested_at DESC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post("/", requireAuth, requireRole("farm_owner"), async (req, res, next) => {
  try {
    const user = (req as any).dbUser;
    const { farmId, permitType, origin, destination, swineCount, purpose, transportDate } = req.body;
    const result = await pool.query(
      `INSERT INTO permits (farm_id, requested_by, permit_type, origin, destination, swine_count, purpose, transport_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [farmId, user.id, permitType, origin, destination, swineCount, purpose, transportDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.patch("/:id/review", requireAuth, requireRole("mao"), async (req, res, next) => {
  try {
    const user = (req as any).dbUser;
    const { status, remarks } = req.body;
    if (!["approved", "rejected"].includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
    const result = await pool.query(
      `UPDATE permits SET status=$1, reviewed_by=$2, reviewed_at=NOW(), remarks=$3 WHERE id=$4 RETURNING *`,
      [status, user.id, remarks, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

export default router;
