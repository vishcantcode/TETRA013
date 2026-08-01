export interface PromptRequest {
  context: any;
  promptTemplate: string;
}

export interface AIProvider {
  execute(prompt: string): Promise<string>;
}

export class AIOrchestrationEngine {
  constructor(private provider: AIProvider) {}

  async evaluate(request: PromptRequest): Promise<string> {
    const prompt = this.injectContext(request.promptTemplate, request.context);
    try {
      return await this.provider.execute(prompt);
    } catch (error) {
      throw new Error('AI Provider execution failed: ' + String(error));
    }
  }

  private injectContext(template: string, context: any): string {
    return `${template}\nContext: ${JSON.stringify(context)}`;
  }
}
