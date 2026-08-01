export class ReadingLevelFormatter {
  public static simplifyMedicalText(text: string): string {
    return text
      .replace(/uncontrolled diabetes/gi, 'blood sugar higher than normal')
      .replace(/hyperglycemia/gi, 'high blood sugar')
      .replace(/stage 2 hypertension/gi, 'high blood pressure requiring medication')
      .replace(/microalbuminuria/gi, 'small amount of protein in urine')
      .replace(/macroalbuminuria/gi, 'high protein in urine requiring kidney care')
      .replace(/diabetic nephropathy/gi, 'kidney stress from high blood sugar')
      .replace(/chronic kidney disease/gi, 'reduced kidney filtration')
      .replace(/myocardial infarction/gi, 'heart attack')
      .replace(/cerebrovascular accident/gi, 'stroke');
  }
}
