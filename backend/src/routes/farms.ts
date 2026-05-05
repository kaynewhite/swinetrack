import { Router } from "express";
import pool from "../db/pool";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Get all farms (MAO/PAO)
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const user = (req as any).dbUser;
    let query = `SELECT f.*, u.full_name as owner_name, u.email as owner_email
                 FROM farms f JOIN users u ON f.owner_id = u.id`;
    const params: any[] = [];
    if (user.role === "farm_owner") {
      query += " WHERE f.owner_id = $1";
      params.push(user.id);
    } else if (user.role === "mao" && user.municipality) {
      query += " WHERE f.municipality = $1";
      params.push(user.municipality);
    }
    query += " ORDER BY f.created_at DESC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
});

// Get single farm
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT f.*, u.full_name as owner_name FROM farms f JOIN users u ON f.owner_id = u.id WHERE f.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) { res.status(404).json({ error: "Farm not found" }); return; }
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// Register farm
router.post("/", requireAuth, requireRole("farm_owner", "mao"), async (req, res, next) => {
  try {
    const user = (req as any).dbUser;
    const { farmName, farmType, municipality, barangay, address, latitude, longitude, totalSwine } = req.body;
    const result = await pool.query(
      `INSERT INTO farms (owner_id, farm_name, farm_type, municipality, barangay, address, latitude, longitude, total_swine)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [user.id, farmName, farmType, municipality, barangay, address, latitude || null, longitude || null, totalSwine || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// Update farm
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const user = (req as any).dbUser;
    const { farmName, farmType, municipality, barangay, address, latitude, longitude, totalSwine, status } = req.body;
    const check = await pool.query("SELECT owner_id FROM farms WHERE id = $1", [req.params.id]);
    if (!check.rows[0]) { res.status(404).json({ error: "Farm not found" }); return; }
    if (user.role === "farm_owner" && check.rows[0].owner_id !== user.id) {
      res.status(403).json({ error: "Forbidden" }); return;
    }
    const result = await pool.query(
      `UPDATE farms SET
        farm_name = COALESCE($1, farm_name), farm_type = COALESCE($2, farm_type),
        municipality = COALESCE($3, municipality), barangay = COALESCE($4, barangay),
        address = COALESCE($5, address), latitude = COALESCE($6, latitude),
        longitude = COALESCE($7, longitude), total_swine = COALESCE($8, total_swine),
        status = COALESCE($9, status), updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [farmName, farmType, municipality, barangay, address, latitude, longitude, totalSwine, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// Farm stats for dashboard
router.get("/stats/summary", requireAuth, async (req, res, next) => {
  try {
    const user = (req as any).dbUser;
    let whereClause = "";
    const params: any[] = [];
    if (user.role === "mao" && user.municipality) {
      whereClause = "WHERE municipality = $1";
      params.push(user.municipality);
    }
    const result = await pool.query(
      `SELECT
         COUNT(*) as total_farms,
         SUM(total_swine) as total_swine,
         COUNT(*) FILTER (WHERE status='active') as active_farms,
         COUNT(*) FILTER (WHERE status='quarantined') as quarantined_farms,
         COUNT(*) FILTER (WHERE farm_type='commercial') as commercial_farms,
         COUNT(*) FILTER (WHERE farm_type='backyard') as backyard_farms
       FROM farms ${whereClause}`,
      params
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

export default router;
