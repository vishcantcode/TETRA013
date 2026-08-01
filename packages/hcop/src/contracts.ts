import { HIEKContext } from '@healthsense/hiek';

export type HCOPCapabilityCategory = 
  | 'CLINICAL_REASONING'
  | 'KNOWLEDGE'
  | 'TIMELINE'
  | 'RISK_ASSESSMENT'
  | 'MEDICATION'
  | 'EXPLAINABILITY'
  | 'REPORTING'
  | 'NOTIFICATIONS'
  | 'DIGITAL_TWIN';

export interface HCOPCapabilityContract<TInput = any, TOutput = any> {
  id: string;
  name: string;
  category: HCOPCapabilityCategory;
  version: string;
  description: string;
  dependencies?: string[];
  handler: (input: TInput, ctx: HIEKContext) => Promise<TOutput>;
}
