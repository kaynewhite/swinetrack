// Random Forest-inspired ensemble risk classifier
// Uses multiple decision trees (simplified) to classify outbreak risk
// Features: recent_cases, mortality_rate, farm_density, population, trend_slope

export interface RFInput {
  recent_cases: number;
  mortality_count: number;
  farm_count: number;
  swine_population: number;
  trend_slope: number; // positive = increasing
  disease_category: "high_risk_viral" | "bacterial" | "parasitic";
}

interface DecisionTree {
  predict: (input: RFInput) => number; // 0=low,1=moderate,2=high,3=critical
}

function buildTree(seed: number): DecisionTree {
  // Pseudo-random thresholds per tree for ensemble diversity
  const s = seed % 10;
  return {
    predict(input: RFInput): number {
      const mortalityRate = input.swine_population > 0
        ? input.mortality_count / input.swine_population
        : 0;
      const caseRate = input.farm_count > 0
        ? input.recent_cases / input.farm_count
        : input.recent_cases;
      const isViral = input.disease_category === "high_risk_viral";
      const multiplier = isViral ? 1.5 : input.disease_category === "bacterial" ? 1.1 : 1.0;

      let score = 0;
      if (input.recent_cases > 10 + s) score += 2;
      else if (input.recent_cases > 5 + s / 2) score += 1;
      if (mortalityRate > 0.05 + s * 0.003) score += 2;
      else if (mortalityRate > 0.01) score += 1;
      if (caseRate > 2 + s * 0.2) score += 2;
      else if (caseRate > 0.5) score += 1;
      if (input.trend_slope > 2 + s * 0.1) score += 2;
      else if (input.trend_slope > 0) score += 1;
      if (isViral) score += 2;

      const finalScore = score * multiplier;
      if (finalScore >= 7) return 3;
      if (finalScore >= 4) return 2;
      if (finalScore >= 2) return 1;
      return 0;
    }
  };
}

const RISK_LABELS = ["low", "moderate", "high", "critical"] as const;
const NUM_TREES = 15;
const trees: DecisionTree[] = Array.from({ length: NUM_TREES }, (_, i) => buildTree(i * 7 + 3));

export function randomForestPredict(input: RFInput): {
  riskLevel: string;
  confidence: number;
  votes: number[];
} {
  const votes = [0, 0, 0, 0];
  for (const tree of trees) {
    votes[tree.predict(input)]++;
  }
  const maxIdx = votes.indexOf(Math.max(...votes));
  const confidence = votes[maxIdx] / NUM_TREES;
  return {
    riskLevel: RISK_LABELS[maxIdx],
    confidence: Math.round(confidence * 100) / 100,
    votes,
  };
}

export function computeTrendSlope(series: number[]): number {
  if (series.length < 2) return 0;
  const n = series.length;
  const xMean = (n - 1) / 2;
  const yMean = series.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  series.forEach((y, x) => {
    num += (x - xMean) * (y - yMean);
    den += (x - xMean) ** 2;
  });
  return den === 0 ? 0 : num / den;
}
