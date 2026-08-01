export class OCRPostProcessor {
  public static cleanOCRText(text: string): string {
    return text
      .replace(/(\d+)\s*O%/gi, '$1.0%')    // Fix '8.4O%' -> '8.40%'
      .replace(/(\d+)\s*o%/gi, '$1.0%')
      .replace(/(\d+)\s*l\b/gi, '$11')      // Fix 'l' typo in numbers
      .replace(/\bO(\d+)/gi, '0$1')         // Fix 'O5' -> '05'
      .replace(/[|]/g, ' ')
      .trim();
  }
}
