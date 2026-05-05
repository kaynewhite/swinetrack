import { Router } from "express";
import pool from "../db/pool";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Get all disease reports
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const user = (req as any).dbUser;
    const { municipality, status, category } = req.query;
    let query = `
      SELECT dr.*, f.farm_name, f.municipality, f.barangay, u.full_name as reporter_name
      FROM disease_reports dr
      JOIN farms f ON dr.farm_id = f.id
      JOIN users u ON dr.reported_by = u.id
      WHERE 1=1`;
    const params: any[] = [];
    let idx = 1;

    if (user.role === "farm_owner") {
      query += ` AND f.owner_id = $${idx++}`;
      params.push(user.id);
    } else if (municipality) {
      query += ` AND f.municipality = $${idx++}`;
      params.push(municipality);
    }
    if (status) { query += ` AND dr.status = $${idx++}`; params.push(status); }
    if (category) { query += ` AND dr.disease_category = $${idx++}`; params.push(category); }
    query += " ORDER BY dr.reported_at DESC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
});

// Submit disease report
router.post("/", requireAuth, requireRole("farm_owner", "mao", "veterinarian"), async (req, res, next) => {
  try {
    const user = (req as any).dbUser;
    const { farmId, diseaseCategory, diseaseName, affectedCount, mortalityCount, symptoms, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO disease_reports (farm_id, reported_by, disease_category, disease_name, affected_count, mortality_count, symptoms, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [farmId, user.id, diseaseCategory, diseaseName, affectedCount, mortalityCount || 0, symptoms, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// Update report status (MAO/vet)
router.patch("/:id/status", requireAuth, requireRole("mao", "veterinarian"), async (req, res, next) => {
  try {
    const user = (req as any).dbUser;
    const { status, notes } = req.body;
    const valid = ["verified", "resolved", "rejected"];
    if (!valid.includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
    const result = await pool.query(
      `UPDATE disease_reports SET status=$1, verified_by=$2, verified_at=NOW(), notes=COALESCE($3,notes)
       WHERE id=$4 RETURNING *`,
      [status, user.id, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// Disease stats
router.get("/stats/summary", requireAuth, async (req, res, next) => {
  try {
    const { municipality } = req.query;
    const params: any[] = [];
    let whereClause = "";
    if (municipality) { whereClause = "WHERE f.municipality = $1"; params.push(municipality); }
    const result = await pool.query(
      `SELECT
         COUNT(*) as total_reports,
         COUNT(*) FILTER (WHERE dr.status='pending') as pending,
         COUNT(*) FILTER (WHERE dr.status='verified') as verified,
         COUNT(*) FILTER (WHERE dr.disease_category='high_risk_viral') as high_risk_viral,
         SUM(dr.affected_count) as total_affected,
         SUM(dr.mortality_count) as total_mortality
       FROM disease_reports dr JOIN farms f ON dr.farm_id = f.id ${whereClause}`,
      params
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// Monthly disease trend
router.get("/stats/monthly", requireAuth, async (req, res, next) => {
  try {
    const { municipality } = req.query;
    const params: any[] = [];
    let whereClause = "";
    if (municipality) { whereClause = "AND f.municipality = $1"; params.push(municipality); }
    const result = await pool.query(
      `SELECT
         DATE_TRUNC('month', dr.reported_at) as month,
         COUNT(*) as case_count,
         SUM(dr.affected_count) as affected,
         dr.disease_category
       FROM disease_reports dr JOIN farms f ON dr.farm_id = f.id
       WHERE dr.reported_at >= NOW() - INTERVAL '12 months' ${whereClause}
       GROUP BY DATE_TRUNC('month', dr.reported_at), dr.disease_category
       ORDER BY month`,
      params
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

export default router;
