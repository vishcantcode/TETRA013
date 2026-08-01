import { TwinState } from '../domain';
import { FeatureExtractor } from './feature-extractor';
import { RiskIntelligenceEngine } from './risk-engine';
import { ThresholdEngine } from './threshold-engine';
import { SummaryGenerator } from './summary-generator';
import { InsightPublisher } from './insight-publisher';
import { ClinicalSummary } from './types';
import { IKafkaProducer } from '../events';

export class ClinicalIntelligenceEngine {
  private publisher: InsightPublisher;

  constructor(kafkaProducer?: IKafkaProducer) {
    this.publisher = new InsightPublisher(kafkaProducer);
  }

  /**
   * Main entry point: Computes deterministic clinical intelligence from TwinState.
   */
  public async processState(state: TwinState, previousState?: TwinState): Promise<ClinicalSummary> {
    // 1. Extract derived physiological & hemodynamic features
    const derivedFeatures = FeatureExtractor.extractFeatures(state);

    // 2. Evaluate risk scores & trend changes
    const riskInsight = RiskIntelligenceEngine.evaluateRisk(state, previousState);

    // 3. Evaluate clinical thresholds & range violations
    const violations = ThresholdEngine.evaluateThresholds(state);

    // 4. Construct structured clinical summary
    const summary = SummaryGenerator.generateSummary(state, derivedFeatures, riskInsight, violations);

    // 5. Publish insights via Kafka
    await this.publisher.publishSummary(summary);

    return summary;
  }
}
