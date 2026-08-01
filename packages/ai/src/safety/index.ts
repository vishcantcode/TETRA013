export class SafetyEngine {
  validateOutput(aiOutput: string): boolean {
    const forbiddenPhrases = ['definitely', '100% cure', 'ignore doctor'];
    return !forbiddenPhrases.some(p => aiOutput.toLowerCase().includes(p));
  }

  checkMissingInformation(context: any): boolean {
    return context.completenessScore > 0.5;
  }
}
