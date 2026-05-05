// ARIMA (p=2, d=1, q=2) implementation in TypeScript
// Used for short-term disease case forecasting per municipality

export function arimaForecast(historicalCases: number[], steps: number = 6): number[] {
  if (historicalCases.length < 4) {
    const avg = historicalCases.reduce((a, b) => a + b, 0) / (historicalCases.length || 1);
    return Array(steps).fill(Math.round(avg));
  }

  // Step 1: First difference (d=1) to achieve stationarity
  const diff: number[] = [];
  for (let i = 1; i < historicalCases.length; i++) {
    diff.push(historicalCases[i] - historicalCases[i - 1]);
  }

  // Step 2: Estimate AR(2) coefficients via Yule-Walker equations
  const n = diff.length;
  const mean = diff.reduce((a, b) => a + b, 0) / n;
  const centered = diff.map(x => x - mean);

  function acf(lag: number): number {
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) den += centered[i] ** 2;
    for (let i = lag; i < n; i++) num += centered[i] * centered[i - lag];
    return den === 0 ? 0 : num / den;
  }

  const r1 = acf(1);
  const r2 = acf(2);
  const denom = 1 - r1 ** 2;
  const phi1 = denom === 0 ? r1 : (r1 * (1 - r2)) / denom;
  const phi2 = denom === 0 ? 0 : (r2 - r1 ** 2) / denom;

  // Step 3: Estimate MA(2) residuals
  const residuals: number[] = new Array(n).fill(0);
  const predictions: number[] = new Array(n).fill(mean);
  for (let i = 2; i < n; i++) {
    predictions[i] = mean + phi1 * (diff[i - 1] - mean) + phi2 * (diff[i - 2] - mean);
    residuals[i] = diff[i] - predictions[i];
  }
  const theta1 = acf(1) * 0.3;
  const theta2 = acf(2) * 0.15;

  // Step 4: Forecast differences
  const forecastDiff: number[] = [];
  const extDiff = [...diff];
  const extRes = [...residuals];

  for (let s = 0; s < steps; s++) {
    const len = extDiff.length;
    const p1 = phi1 * (extDiff[len - 1] - mean);
    const p2 = phi2 * (extDiff[len - 2] - mean);
    const ma1 = theta1 * (extRes[extRes.length - 1] || 0);
    const ma2 = theta2 * (extRes[extRes.length - 2] || 0);
    const next = mean + p1 + p2 + ma1 + ma2;
    forecastDiff.push(next);
    extDiff.push(next);
    extRes.push(0);
  }

  // Step 5: Integrate (invert differencing)
  const result: number[] = [];
  let last = historicalCases[historicalCases.length - 1];
  for (const d of forecastDiff) {
    last = last + d;
    result.push(Math.max(0, Math.round(last)));
  }

  return result;
}

export function classifyRisk(predictedCases: number, population: number = 500): string {
  const rate = population > 0 ? (predictedCases / population) * 1000 : predictedCases;
  if (rate >= 50 || predictedCases >= 100) return "critical";
  if (rate >= 20 || predictedCases >= 50) return "high";
  if (rate >= 5 || predictedCases >= 20) return "moderate";
  return "low";
}
