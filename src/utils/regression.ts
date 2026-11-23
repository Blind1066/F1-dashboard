export interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
  n: number;
}

/**
 * Computes simple linear regression y = slope * x + intercept
 * and R-squared coefficient of determination.
 * Returns null if points array has fewer than 2 points or zero variance in x.
 */
export function computeLinearRegression(
  points: Array<{ x: number; y: number }>
): RegressionResult | null {
  if (!points || !Array.isArray(points)) return null;
  const n = points.length;
  if (n < 2) return null;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
    sumYY += p.y * p.y;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    // All x points identical
    return null;
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Compute R-squared
  const meanY = sumY / n;
  let ssTot = 0;
  let ssRes = 0;

  for (const p of points) {
    const predictedY = slope * p.x + intercept;
    ssTot += Math.pow(p.y - meanY, 2);
    ssRes += Math.pow(p.y - predictedY, 2);
  }

  const r2 = ssTot === 0 ? 1 : Math.max(0, Math.min(1, 1 - ssRes / ssTot));

  return {
    slope: Number(slope.toFixed(4)),
    intercept: Number(intercept.toFixed(4)),
    r2: Number(r2.toFixed(4)),
    n,
  };
}
