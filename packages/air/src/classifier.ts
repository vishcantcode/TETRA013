export type AIRRequestCategory = 
  | 'AUTHENTICATION'
  | 'PROFILE_MANAGEMENT'
  | 'MEDICAL_RECORD_MANAGEMENT'
  | 'HEALTH_ASSESSMENT'
  | 'CLINICAL_REASONING'
  | 'DECISION_SUPPORT'
  | 'EXPLAINABILITY'
  | 'PREVENTIVE_INTELLIGENCE'
  | 'REPORTING'
  | 'ADMINISTRATION'
  | 'NOTIFICATIONS';

export interface AIRClassification {
  category: AIRRequestCategory;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresAI: boolean;
  isCacheable: boolean;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
}

export class AIRClassifier {
  public static classify(workflowName: string, payload?: any): AIRClassification {
    const name = workflowName.toLowerCase();

    if (name.includes('auth') || name.includes('login') || name.includes('register')) {
      return { category: 'AUTHENTICATION', complexity: 'LOW', requiresAI: false, isCacheable: false, priority: 'CRITICAL' };
    }

    if (name.includes('triage') || name.includes('symptom')) {
      return { category: 'CLINICAL_REASONING', complexity: 'HIGH', requiresAI: true, isCacheable: false, priority: 'CRITICAL' };
    }

    if (name.includes('decision') || name.includes('reasoning')) {
      return { category: 'DECISION_SUPPORT', complexity: 'HIGH', requiresAI: true, isCacheable: true, priority: 'HIGH' };
    }

    if (name.includes('preventive') || name.includes('risk') || name.includes('trend')) {
      return { category: 'PREVENTIVE_INTELLIGENCE', complexity: 'MEDIUM', requiresAI: false, isCacheable: true, priority: 'NORMAL' };
    }

    if (name.includes('profile') || name.includes('user')) {
      return { category: 'PROFILE_MANAGEMENT', complexity: 'LOW', requiresAI: false, isCacheable: true, priority: 'NORMAL' };
    }

    if (name.includes('record') || name.includes('upload')) {
      return { category: 'MEDICAL_RECORD_MANAGEMENT', complexity: 'MEDIUM', requiresAI: false, isCacheable: false, priority: 'NORMAL' };
    }

    if (name.includes('admin') || name.includes('audit') || name.includes('metric')) {
      return { category: 'ADMINISTRATION', complexity: 'LOW', requiresAI: false, isCacheable: false, priority: 'HIGH' };
    }

    return { category: 'HEALTH_ASSESSMENT', complexity: 'MEDIUM', requiresAI: false, isCacheable: false, priority: 'NORMAL' };
  }
}
