import { Router } from "express";
import pool from "../db/pool";
import { requireAuth, requireRole } from "../middleware/auth";
import { arimaForecast, classifyRisk } from "../analytics/arima";
import { randomForestPredict, computeTrendSlope, RFInput } from "../analytics/randomForest";
import { generateRecommendations } from "../analytics/prescriptive";

const router = Router();

const MUNICIPALITIES = [
  "Biñan","Calamba","Los Baños","San Pablo","Santa Rosa",
  "Cabuyao","Calauan","Pagsanjan","Lumban","Majayjay"
];

// Run forecast for all municipalities or a specific one
router.post("/forecast", requireAuth, requireRole("mao","pao"), async (req, res, next) => {
  try {
    const { municipality, diseaseName } = req.body;
    const targets = municipality ? [municipality] : MUNICIPALITIES;
    const diseases = diseaseName ? [diseaseName]
      : ["African Swine Fever","PRRS","Classical Swine Fever","Bacterial Infections","Parasitic Infections"];

    const results = [];

    for (const mun of targets) {
      for (const disease of diseases) {
        // Get historical data (training data + actual reports)
        const trainingData = await pool.query(
          `SELECT month, year, case_count, mortality_count, farm_count, swine_population
           FROM model_training_data
           WHERE municipality = $1 AND disease_name = $2
           ORDER BY year, month`,
          [mun, disease]
        );

        const reportData = await pool.query(
          `SELECT DATE_PART('year', dr.reported_at) as year,
                  DATE_PART('month', dr.reported_at) as month,
                  COUNT(*) as case_count,
                  SUM(dr.affected_count) as affected
           FROM disease_reports dr JOIN farms f ON dr.farm_id = f.id
           WHERE f.municipality = $1 AND dr.disease_name = $2
           GROUP BY year, month ORDER BY year, month`,
          [mun, disease]
        );

        // Merge historical data
        const historicalCases: number[] = [];
        const historicalMortality: number[] = [];

        if (trainingData.rows.length > 0) {
          trainingData.rows.forEach(r => {
            historicalCases.push(Number(r.case_count));
            historicalMortality.push(Number(r.mortality_count));
          });
        }
        reportData.rows.forEach(r => {
          historicalCases.push(Number(r.case_count));
        });

        if (historicalCases.length === 0) {
          historicalCases.push(0, 0, 0);
        }

        // ARIMA forecast (6 months)
        const predicted = arimaForecast(historicalCases, 6);
        const maxPredicted = Math.max(...predicted);

        // Farm stats for RF
        const farmStats = await pool.query(
          `SELECT COUNT(*) as farm_count, SUM(total_swine) as population FROM farms WHERE municipality = $1`,
          [mun]
        );
        const farmCount = Number(farmStats.rows[0]?.farm_count || 0);
        const swinePopulation = Number(farmStats.rows[0]?.population || 500);
        const trendSlope = computeTrendSlope(historicalCases);

        const cat = ["African Swine Fever","PRRS","Classical Swine Fever"].includes(disease)
          ? "high_risk_viral"
          : disease.includes("Bacterial") ? "bacterial" : "parasitic";

        const rfInput: RFInput = {
          recent_cases: historicalCases.slice(-3).reduce((a,b)=>a+b,0),
          mortality_count: historicalMortality.slice(-3).reduce((a,b)=>a+b,0),
          farm_count: farmCount,
          swine_population: swinePopulation,
          trend_slope: trendSlope,
          disease_category: cat as any,
        };

        const rfResult = randomForestPredict(rfInput);
        const arimaRisk = classifyRisk(maxPredicted, swinePopulation);

        // Ensemble: take higher of ARIMA and RF
        const riskRanks = { low: 0, moderate: 1, high: 2, critical: 3 };
        const riskLabels = ["low","moderate","high","critical"] as const;
        const finalRiskIdx = Math.max(riskRanks[arimaRisk as keyof typeof riskRanks], riskRanks[rfResult.riskLevel as keyof typeof riskRanks]);
        const finalRisk = riskLabels[finalRiskIdx];

        // Save forecast to DB
        const forecastRecord = await pool.query(
          `INSERT INTO forecasts (municipality, disease_name, forecast_period, predicted_cases, risk_level, confidence_score, model_used)
           VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
          [mun, disease, "6-month", maxPredicted, finalRisk, rfResult.confidence, "ARIMA+RF"]
        );
        const forecastId = forecastRecord.rows[0].id;

        // Generate prescriptive recommendations
        const recs = generateRecommendations({
          municipality: mun,
          riskLevel: finalRisk,
          diseaseCategory: cat as any,
          diseaseName: disease,
          predictedCases: maxPredicted,
          trendSlope,
          farmCount,
        });

        // Save recommendations
        for (const rec of recs) {
          await pool.query(
            `INSERT INTO recommendations (forecast_id, municipality, risk_level, action_type, recommendation, priority)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [forecastId, mun, finalRisk, rec.actionType, rec.recommendation, rec.priority]
          );
        }

        results.push({
          municipality: mun,
          disease,
          forecastId,
          predictedCases: predicted,
          maxPredicted,
          riskLevel: finalRisk,
          confidence: rfResult.confidence,
          recommendations: recs,
        });
      }
    }

    res.json({ success: true, results });
  } catch (err) { next(err); }
});

// Get latest forecasts
router.get("/forecasts", requireAuth, async (req, res, next) => {
  try {
    const { municipality } = req.query;
    const params: any[] = [];
    let where = "";
    if (municipality) { where = "WHERE municipality = $1"; params.push(municipality); }
    const result = await pool.query(
      `SELECT DISTINCT ON (municipality, disease_name) *
       FROM forecasts ${where}
       ORDER BY municipality, disease_name, generated_at DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

// Get recommendations
router.get("/recommendations", requireAuth, async (req, res, next) => {
  try {
    const { municipality, status } = req.query;
    const params: any[] = [];
    let where = "WHERE 1=1";
    let idx = 1;
    if (municipality) { where += ` AND municipality = $${idx++}`; params.push(municipality); }
    if (status) { where += ` AND status = $${idx++}`; params.push(status); }
    const result = await pool.query(
      `SELECT * FROM recommendations ${where} ORDER BY priority DESC, created_at DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

// Update recommendation status
router.patch("/recommendations/:id", requireAuth, requireRole("mao","pao"), async (req, res, next) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE recommendations SET status=$1 WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// Training data input (MAO only)
router.get("/training-data", requireAuth, requireRole("mao","pao"), async (req, res, next) => {
  try {
    const { municipality } = req.query;
    const params: any[] = [];
    let where = "";
    if (municipality) { where = "WHERE municipality = $1"; params.push(municipality); }
    const result = await pool.query(
      `SELECT * FROM model_training_data ${where} ORDER BY year DESC, month DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post("/training-data", requireAuth, requireRole("mao"), async (req, res, next) => {
  try {
    const user = (req as any).dbUser;
    const { municipality, month, year, diseaseName, caseCount, mortalityCount, farmCount, swinePopulation } = req.body;
    const result = await pool.query(
      `INSERT INTO model_training_data (municipality, month, year, disease_name, case_count, mortality_count, farm_count, swine_population, entered_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (municipality, month, year, disease_name)
       DO UPDATE SET case_count=$5, mortality_count=$6, farm_count=$7, swine_population=$8
       RETURNING *`,
      [municipality, month, year, diseaseName, caseCount, mortalityCount||0, farmCount||0, swinePopulation||0, user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.delete("/training-data/:id", requireAuth, requireRole("mao"), async (req, res, next) => {
  try {
    await pool.query("DELETE FROM model_training_data WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// Supply data
router.get("/supply", requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM supply_data ORDER BY year DESC, month DESC LIMIT 120`
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post("/supply", requireAuth, requireRole("mao","pao"), async (req, res, next) => {
  try {
    const { municipality, month, year, totalSwinePopulation, swineSlaughtered, swineTransported } = req.body;
    const result = await pool.query(
      `INSERT INTO supply_data (municipality, month, year, total_swine_population, swine_slaughtered, swine_transported)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (municipality, month, year) DO UPDATE SET
         total_swine_population=$4, swine_slaughtered=$5, swine_transported=$6
       RETURNING *`,
      [municipality, month, year, totalSwinePopulation, swineSlaughtered, swineTransported]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

export default router;
