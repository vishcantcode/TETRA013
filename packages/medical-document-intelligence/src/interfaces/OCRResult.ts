export interface OCRLine {
  text: string;
  confidence: number; // 0 to 1.0
  lineNumber: number;
}

export interface OCRResult {
  providerName: string;
  fullText: string;
  lines: OCRLine[];
  overallOCRConfidence: number;
  processedAt: string;
}
