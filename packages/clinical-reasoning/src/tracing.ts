import { ReasoningTrace, ReasoningMetadata } from './contracts';

export class Tracer {
  private trace: ReasoningTrace;

  constructor(metadata: ReasoningMetadata) {
    this.trace = {
      id: metadata.traceId,
      metadata,
      stages: [],
      finalOutputHash: ''
    };
  }

  public recordStage(
    stageName: string, 
    inputData: any, 
    outputData: any, 
    durationMs: number, 
    errors: string[] = [], 
    warnings: string[] = []
  ) {
    this.trace.stages.push({
      stageName,
      inputHash: this.hashData(inputData),
      outputHash: this.hashData(outputData),
      durationMs,
      errors,
      warnings
    });
  }

  public complete(finalOutputData: any) {
    this.trace.finalOutputHash = this.hashData(finalOutputData);
  }

  public getTrace(): ReasoningTrace {
    return JSON.parse(JSON.stringify(this.trace));
  }

  private hashData(data: any): string {
    // Simple deterministic hash for observability purposes
    // In production, this might use crypto.createHash('sha256')
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash.toString(16);
  }
}
