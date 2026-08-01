import { createSuccessResponse } from '../response';
import { LongitudinalIntelligenceEngine } from '@healthsense/longitudinal-intelligence';
import { TwinRepositoryDB } from '@healthsense/db';
import { TwinFactory } from '@healthsense/patient-digital-twin';
import { DecisionAggregationPipeline } from '@healthsense/clinical-decision-platform';
import crypto from 'crypto';

const twinRepo = new TwinRepositoryDB();
const lcie = new LongitudinalIntelligenceEngine();

export const getDashboardData = async (req: any, res: any) => {
  try {
    const patientId = req.user?.id;
    if (!patientId) return res.status(401).json({ error: 'Unauthorized' });

    let twinRecord = await twinRepo.findByPatientId(patientId);
    let twinState: any;
    if (!twinRecord) {
       const initialTwin = TwinFactory.createInitial(patientId);
       await twinRepo.saveRecord(patientId, initialTwin.currentVersion, initialTwin.profile, initialTwin.clinicalHistory, initialTwin.snapshots);
       twinState = initialTwin.profile;
    } else {
       twinState = twinRecord.state;
    }

    const insights = lcie.analyze(twinState as any);

    let riskScore = 0;
    if (twinState?.risk?.factors?.length) {
      riskScore = Math.min(100, twinState.risk.factors.length * 15);
    }
    
    const deterioratingTrends = insights.filter((i: any) => i.type === 'trend' && i.payload?.direction === 'deteriorating');
    riskScore = Math.min(100, riskScore + (deterioratingTrends.length * 20));

    const adherence = twinState?.behavior?.adherenceScore || 0;
    const activeConditions = twinState?.conditions || [];

    const pipeline = new DecisionAggregationPipeline();
    insights.forEach((insight: any) => {
        pipeline.addEvidence({
            sourceEngine: 'longitudinal-intelligence',
            confidence: 0.9,
            data: insight,
            timestamp: insight.timestamp || new Date()
        });
    });

    const finalDecision = pipeline.generateDecision(patientId, crypto.randomUUID());

    res.json(createSuccessResponse({
      riskScore,
      adherence,
      activeConditions,
      insight: finalDecision?.explanation?.patientFriendlySummary || 'All parameters look stable.',
      confidence: finalDecision?.confidence?.overallScore || 0.95,
      recommendation: finalDecision?.recommendations?.[0]?.actions?.[0]?.description || 'Maintain current protocols.',
      evidence: finalDecision?.explanation?.evidenceChain || ['System baseline evaluation'],
      recentActivity: []
    }, crypto.randomUUID()));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};
