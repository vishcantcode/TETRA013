import { GuidelineRule } from '../../types/clinicalGuideline';
import { DIABETES_RULES } from './diabetesRules';
import { HYPERTENSION_RULES } from './hypertensionRules';
import { CKD_RULES } from './ckdRules';
import { CARDIOVASCULAR_RULES } from './cardiovascularRules';
import { STROKE_RULES } from './strokeRules';

export { DIABETES_RULES, HYPERTENSION_RULES, CKD_RULES, CARDIOVASCULAR_RULES, STROKE_RULES };

export const ALL_CLINICAL_RULES: GuidelineRule[] = [
  ...DIABETES_RULES,
  ...HYPERTENSION_RULES,
  ...CKD_RULES,
  ...CARDIOVASCULAR_RULES,
  ...STROKE_RULES,
];
