import { Router } from "express";
import pool from "../db/pool";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GIS data: farms with location + risk level
router.get("/farms", requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT f.id, f.farm_name, f.municipality, f.barangay, f.latitude, f.longitude,
              f.total_swine, f.status, f.farm_type,
              COALESCE(fc.risk_level, 'low') as risk_level,
              COALESCE(fc.predicted_cases, 0) as predicted_cases
       FROM farms f
       LEFT JOIN LATERAL (
         SELECT fo.risk_level, fo.predicted_cases
         FROM forecasts fo WHERE fo.municipality = f.municipality
         ORDER BY fo.generated_at DESC LIMIT 1
       ) fc ON true
       WHERE f.latitude IS NOT NULL AND f.longitude IS NOT NULL`
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

// Municipality risk overview for map
router.get("/municipalities", requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         f.municipality,
         COUNT(DISTINCT f.id) as farm_count,
         SUM(f.total_swine) as swine_population,
         COUNT(dr.id) FILTER (WHERE dr.reported_at >= NOW() - INTERVAL '30 days') as recent_reports,
         COUNT(dr.id) FILTER (WHERE dr.disease_category = 'high_risk_viral') as viral_reports,
         COALESCE(MAX(fo.risk_level), 'low') as risk_level
       FROM farms f
       LEFT JOIN disease_reports dr ON dr.farm_id = f.id
       LEFT JOIN forecasts fo ON fo.municipality = f.municipality
       GROUP BY f.municipality
       ORDER BY f.municipality`
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

export default router;
