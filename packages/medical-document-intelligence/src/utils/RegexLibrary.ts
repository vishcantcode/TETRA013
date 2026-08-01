export const REGEX_PATTERNS = {
  HBA1C: /(?:hba1c|glycated\s*hemoglobin|a1c)\s*[:=-]?\s*(\d{1,2}(?:\.\d{1,2})?)\s*%/i,
  FASTING_GLUCOSE: /(?:fasting\s*(?:plasma|blood)?\s*glucose|fbs)\s*[:=-]?\s*(\d{2,3}(?:\.\d{1,2})?)\s*(?:mg\/dl)?/i,
  SERUM_CREATININE: /(?:serum\s*creatinine|creatinine)\s*[:=-]?\s*(\d{1,2}(?:\.\d{1,2})?)\s*(?:mg\/dl)?/i,
  EGFR: /(?:egfr|estimated\s*gfr)\s*[:=-]?\s*(\d{1,3}(?:\.\d{1,2})?)\s*(?:ml\/min)?/i,
  UACR: /(?:uacr|urine\s*albumin-to-creatinine|microalbumin)\s*[:=-]?\s*(\d{1,4}(?:\.\d{1,2})?)\s*(?:mg\/g)?/i,
  BLOOD_PRESSURE: /(?:bp|blood\s*pressure)\s*[:=-]?\s*(\d{2,3})\s*[\/\\]\s*(\d{2,3})/i,
  BMI: /(?:bmi|body\s*mass\s*index)\s*[:=-]?\s*(\d{1,2}(?:\.\d{1,2})?)/i,
  TOTAL_CHOLESTEROL: /(?:total\s*cholesterol|cholesterol)\s*[:=-]?\s*(\d{2,3})\s*(?:mg\/dl)?/i
} as const;
