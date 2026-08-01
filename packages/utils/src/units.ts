/**
 * Medical Unit Conversions
 */

export function convertGlucoseMgDlToMmolL(mgDl: number): number {
  return Number((mgDl / 18.0156).toFixed(2));
}

export function convertGlucoseMmolLToMgDl(mmolL: number): number {
  return Math.round(mmolL * 18.0156);
}

export function convertCreatinineMgDlToUmolL(mgDl: number): number {
  return Math.round(mgDl * 88.4);
}

export function convertCreatinineUmolLToMgDl(umolL: number): number {
  return Number((umolL / 88.4).toFixed(2));
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (!heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function calculateeGFR(serumCreatinine: number, age: number, isFemale: boolean): number {
  // CKD-EPI 2021 race-free equation
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const genderFactor = isFemale ? 1.012 : 1.0;

  const scrRatio = serumCreatinine / kappa;
  const minScr = Math.min(scrRatio, 1.0);
  const maxScr = Math.max(scrRatio, 1.0);

  const egfr = 142 * Math.pow(minScr, alpha) * Math.pow(maxScr, -1.200) * Math.pow(0.9938, age) * genderFactor;
  return Math.round(Math.max(1, Math.min(140, egfr)));
}
