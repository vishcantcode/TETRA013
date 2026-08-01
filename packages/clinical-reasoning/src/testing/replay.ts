import { ReasoningContext, ReasoningRequest, FinalClinicalDecision } from '../contracts';
import { ClinicalReasoningPipeline } from '../pipeline';

export class ReasoningReplayService {
  private pipeline = new ClinicalReasoningPipeline();

  public async replay(
    storedContext: ReasoningContext, 
    storedRequest: ReasoningRequest, 
    storedOutputHash: string
  ): Promise<{ match: boolean; decision: FinalClinicalDecision; newHash: string }> {
    
    // Force context to replay mode
    const replayContext: ReasoningContext = {
      ...storedContext,
      metadata: {
        ...storedContext.metadata,
        executionMode: 'replay'
      }
    };

    const decision = await this.pipeline.execute(replayContext, storedRequest);
    const newHash = this.hashDecision(decision);

    return {
      match: newHash === storedOutputHash,
      decision,
      newHash
    };
  }

  private hashDecision(data: any): string {
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
