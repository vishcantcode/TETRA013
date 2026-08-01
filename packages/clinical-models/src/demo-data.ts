/**
 * HealthSense AI CDSS — Demo Patient Data System
 * Pre-seeded realistic patient profiles representing clinical cases across
 * Primary Health Centres (PHCs) and Community Health Centres (CHCs) in India.
 */

import { FHIRPatient, FHIRObservation, FHIRCondition, FHIRRiskAssessment, MissingInvestigation, FHIRServiceRequest, PatientEducationAdvice } from './domain';

export interface DemoPatientBundle {
  patient: FHIRPatient;
  vitals: FHIRObservation[];
  labs: FHIRObservation[];
  conditions: FHIRCondition[];
  riskAssessment: FHIRRiskAssessment;
  missingInvestigations: MissingInvestigation[];
  referral?: FHIRServiceRequest;
  education: Record<'en' | 'hi' | 'gu', PatientEducationAdvice>;
}

export const DEMO_PATIENTS: Record<string, DemoPatientBundle> = {
  // 1. Healthy Patient
  'patient-healthy': {
    patient: {
      resourceType: 'Patient',
      id: 'patient-healthy',
      name: [{ use: 'official', text: 'Aarav Sharma', family: 'Sharma', given: ['Aarav'] }],
      gender: 'male',
      birthDate: '1992-05-14',
      telecom: [{ system: 'phone', value: '+91 98765 43210' }],
      address: [{ text: 'Sector 4, Gandhinagar, Gujarat', city: 'Gandhinagar', state: 'Gujarat' }]
    },
    vitals: [
      { resourceType: 'Observation', id: 'v1', status: 'final', code: { coding: [{ system: 'LOINC', code: '8480-6', display: 'Systolic Blood Pressure' }] }, subject: { reference: 'Patient/patient-healthy' }, effectiveDateTime: '2026-07-20T09:00:00Z', valueQuantity: { value: 118, unit: 'mmHg' } },
      { resourceType: 'Observation', id: 'v2', status: 'final', code: { coding: [{ system: 'LOINC', code: '8462-4', display: 'Diastolic Blood Pressure' }] }, subject: { reference: 'Patient/patient-healthy' }, effectiveDateTime: '2026-07-20T09:00:00Z', valueQuantity: { value: 76, unit: 'mmHg' } },
      { resourceType: 'Observation', id: 'v3', status: 'final', code: { coding: [{ system: 'LOINC', code: '39156-5', display: 'Body Mass Index' }] }, subject: { reference: 'Patient/patient-healthy' }, effectiveDateTime: '2026-07-20T09:00:00Z', valueQuantity: { value: 22.4, unit: 'kg/m2' } }
    ],
    labs: [
      { resourceType: 'Observation', id: 'l1', status: 'final', code: { coding: [{ system: 'LOINC', code: '4548-4', display: 'HbA1c' }] }, subject: { reference: 'Patient/patient-healthy' }, effectiveDateTime: '2026-07-20T09:00:00Z', valueQuantity: { value: 5.2, unit: '%' } },
      { resourceType: 'Observation', id: 'l2', status: 'final', code: { coding: [{ system: 'LOINC', code: '1558-6', display: 'Fasting Plasma Glucose' }] }, subject: { reference: 'Patient/patient-healthy' }, effectiveDateTime: '2026-07-20T09:00:00Z', valueQuantity: { value: 92, unit: 'mg/dL' } },
      { resourceType: 'Observation', id: 'l3', status: 'final', code: { coding: [{ system: 'LOINC', code: '33914-3', display: 'eGFR' }] }, subject: { reference: 'Patient/patient-healthy' }, effectiveDateTime: '2026-07-20T09:00:00Z', valueQuantity: { value: 104, unit: 'mL/min/1.73m2' } }
    ],
    conditions: [],
    riskAssessment: {
      resourceType: 'RiskAssessment',
      id: 'ra-healthy',
      status: 'final',
      subject: { reference: 'Patient/patient-healthy' },
      occurrenceDateTime: '2026-07-20T09:15:00Z',
      overallRiskScore: 12,
      overallTier: 'low',
      diseaseRisks: [
        { diseaseId: 'diabetes', diseaseName: 'Type 2 Diabetes', riskScore: 10, severityTier: 'low', confidenceScore: 0.98, contributingFactors: [{ metric: 'HbA1c', value: '5.2%', impactPercentage: 5, rationale: 'Normal glycemic index' }], guidelineCitations: [{ source: 'ADA', title: 'ADA Standards of Care 2024', section: 'Sec 2. Normoglycemia' }] },
        { diseaseId: 'hypertension', diseaseName: 'Essential Hypertension', riskScore: 12, severityTier: 'low', confidenceScore: 0.98, contributingFactors: [{ metric: 'BP', value: '118/76 mmHg', impactPercentage: 5, rationale: 'Optimal blood pressure' }], guidelineCitations: [{ source: 'AHA', title: 'AHA/ACC BP Guidelines', section: 'Normal BP' }] },
        { diseaseId: 'ckd', diseaseName: 'Chronic Kidney Disease', riskScore: 8, severityTier: 'low', confidenceScore: 0.95, contributingFactors: [{ metric: 'eGFR', value: '104 mL/min', impactPercentage: 4, rationale: 'Normal kidney filtration' }], guidelineCitations: [{ source: 'KDIGO', title: 'KDIGO 2023 Guidelines', section: 'G1 Normal eGFR' }] },
        { diseaseId: 'cvd', diseaseName: 'Cardiovascular Disease', riskScore: 11, severityTier: 'low', confidenceScore: 0.96, contributingFactors: [{ metric: 'BMI', value: '22.4 kg/m2', impactPercentage: 4, rationale: 'Healthy body mass index' }], guidelineCitations: [{ source: 'ICMR', title: 'ICMR CVD Guidelines', section: 'Sec 1. Low Risk' }] },
        { diseaseId: 'stroke', diseaseName: 'Ischemic Stroke', riskScore: 6, severityTier: 'low', confidenceScore: 0.97, contributingFactors: [{ metric: 'Age & BP', value: '34 yrs, Normal BP', impactPercentage: 3, rationale: 'Low vascular risk profile' }], guidelineCitations: [{ source: 'AHA', title: 'AHA Stroke Prevention', section: 'Low Risk Category' }] }
      ],
      mitigationStrategies: ['Maintain balanced diet', 'Regular physical activity (150 mins/week)', 'Annual preventive checkup']
    },
    missingInvestigations: [],
    education: {
      en: { language: 'en', title: 'Excellent Health Status', summary: 'Your vital signs and blood test results are completely normal.', keyActionSteps: ['Maintain healthy eating habits', 'Exercise 30 minutes daily'], dietaryAdvice: ['Include fresh vegetables and fruits', 'Drink 2.5L water daily'], warningSignsToWatch: ['Consult doctor if you experience unexplained fatigue'], translatedAt: '2026-07-20T09:15:00Z' },
      hi: { language: 'hi', title: 'उत्कृष्ट स्वास्थ्य स्थिति', summary: 'आपके सभी रक्त परीक्षण और बीपी रिपोर्ट सामान्य हैं।', keyActionSteps: ['स्वस्थ आहार बनाए रखें', 'प्रतिदिन 30 मिनट व्यायाम करें'], dietaryAdvice: ['ताजी सब्जियां और फल खाएं', 'पर्याप्त पानी पिएं'], warningSignsToWatch: ['अत्यधिक थकान महसूस होने पर डॉक्टर से सलाह लें'], translatedAt: '2026-07-20T09:15:00Z' },
      gu: { language: 'gu', title: 'ઉત્તમ આરોગ્ય સ્થિતિ', summary: 'તમારા બધા બ્લડ રિપોર્ટ અને બીપી નોર્મલ છે.', keyActionSteps: ['નિયમિત વ્યાયામ કરો', 'પૌષ્ટિક ખોરાક લો'], dietaryAdvice: ['લીલા શાકભાજી અને ફળો ખાવા', 'પૂરતું પાણી પીવું'], warningSignsToWatch: ['કોઈપણ અસામાન્ય અસ્વસ્થતા જણાય તો તબીબનો સંપર્ક કરવો'], translatedAt: '2026-07-20T09:15:00Z' }
    }
  },

  // 2. Prediabetic Patient
  'patient-prediabetes': {
    patient: {
      resourceType: 'Patient',
      id: 'patient-prediabetes',
      name: [{ use: 'official', text: 'Priya Verma', family: 'Verma', given: ['Priya'] }],
      gender: 'female',
      birthDate: '1984-09-22',
      telecom: [{ system: 'phone', value: '+91 98123 45678' }],
      address: [{ text: 'Civil Lines, Bhopal, Madhya Pradesh', city: 'Bhopal', state: 'Madhya Pradesh' }]
    },
    vitals: [
      { resourceType: 'Observation', id: 'pv1', status: 'final', code: { coding: [{ system: 'LOINC', code: '8480-6', display: 'Systolic Blood Pressure' }] }, subject: { reference: 'Patient/patient-prediabetes' }, effectiveDateTime: '2026-07-22T10:30:00Z', valueQuantity: { value: 126, unit: 'mmHg' } },
      { resourceType: 'Observation', id: 'pv2', status: 'final', code: { coding: [{ system: 'LOINC', code: '8462-4', display: 'Diastolic Blood Pressure' }] }, subject: { reference: 'Patient/patient-prediabetes' }, effectiveDateTime: '2026-07-22T10:30:00Z', valueQuantity: { value: 82, unit: 'mmHg' } },
      { resourceType: 'Observation', id: 'pv3', status: 'final', code: { coding: [{ system: 'LOINC', code: '39156-5', display: 'Body Mass Index' }] }, subject: { reference: 'Patient/patient-prediabetes' }, effectiveDateTime: '2026-07-22T10:30:00Z', valueQuantity: { value: 26.8, unit: 'kg/m2' } }
    ],
    labs: [
      { resourceType: 'Observation', id: 'pl1', status: 'final', code: { coding: [{ system: 'LOINC', code: '4548-4', display: 'HbA1c' }] }, subject: { reference: 'Patient/patient-prediabetes' }, effectiveDateTime: '2026-07-22T10:30:00Z', valueQuantity: { value: 6.1, unit: '%' } },
      { resourceType: 'Observation', id: 'pl2', status: 'final', code: { coding: [{ system: 'LOINC', code: '1558-6', display: 'Fasting Plasma Glucose' }] }, subject: { reference: 'Patient/patient-prediabetes' }, effectiveDateTime: '2026-07-22T10:30:00Z', valueQuantity: { value: 114, unit: 'mg/dL' } }
    ],
    conditions: [
      { resourceType: 'Condition', id: 'pc1', clinicalStatus: 'active', code: { coding: [{ system: 'ICD-10', code: 'R73.03', display: 'Prediabetes' }] }, subject: { reference: 'Patient/patient-prediabetes' } }
    ],
    riskAssessment: {
      resourceType: 'RiskAssessment',
      id: 'ra-prediabetes',
      status: 'final',
      subject: { reference: 'Patient/patient-prediabetes' },
      occurrenceDateTime: '2026-07-22T10:45:00Z',
      overallRiskScore: 48,
      overallTier: 'moderate',
      diseaseRisks: [
        { diseaseId: 'diabetes', diseaseName: 'Type 2 Diabetes', riskScore: 58, severityTier: 'moderate', confidenceScore: 0.94, contributingFactors: [{ metric: 'HbA1c', value: '6.1%', impactPercentage: 35, rationale: 'Elevated prediabetic range (5.7-6.4%)' }, { metric: 'Fasting Glucose', value: '114 mg/dL', impactPercentage: 20, rationale: 'Impaired fasting glucose' }], guidelineCitations: [{ source: 'ADA', title: 'ADA 2024 Standards of Care', section: 'Sec 2. Prediabetes Diagnosis' }, { source: 'ICMR', title: 'ICMR Guidelines for Type 2 Diabetes', section: 'Prediabetes Intervention' }] },
        { diseaseId: 'hypertension', diseaseName: 'Essential Hypertension', riskScore: 32, severityTier: 'moderate', confidenceScore: 0.92, contributingFactors: [{ metric: 'BP', value: '126/82 mmHg', impactPercentage: 15, rationale: 'Elevated systolic BP' }], guidelineCitations: [{ source: 'AHA', title: 'AHA/ACC Guidelines', section: 'Elevated BP' }] },
        { diseaseId: 'ckd', diseaseName: 'Chronic Kidney Disease', riskScore: 18, severityTier: 'low', confidenceScore: 0.88, contributingFactors: [{ metric: 'Glucose Trend', value: 'Mild Elevation', impactPercentage: 8, rationale: 'Early metabolic stress' }], guidelineCitations: [{ source: 'KDIGO', title: 'KDIGO Guidelines', section: 'Screening in Prediabetes' }] },
        { diseaseId: 'cvd', diseaseName: 'Cardiovascular Disease', riskScore: 28, severityTier: 'low', confidenceScore: 0.90, contributingFactors: [{ metric: 'BMI', value: '26.8 kg/m2', impactPercentage: 12, rationale: 'Overweight status for Asian demographic' }], guidelineCitations: [{ source: 'ICMR', title: 'ICMR Obesity & CVD Guidelines', section: 'BMI Cutoffs' }] },
        { diseaseId: 'stroke', diseaseName: 'Ischemic Stroke', riskScore: 14, severityTier: 'low', confidenceScore: 0.91, contributingFactors: [{ metric: 'Age & Metabolic Risk', value: '41 yrs, Prediabetes', impactPercentage: 6, rationale: 'Low acute cerebrovascular risk' }], guidelineCitations: [{ source: 'AHA', title: 'Stroke Guidelines', section: 'Metabolic Risk Factors' }] }
      ],
      mitigationStrategies: ['Initiate 7% weight reduction program', '150 mins moderate aerobic exercise weekly', 'Repeat HbA1c in 6 months']
    },
    missingInvestigations: [
      { id: 'mi-1', testName: 'Lipid Profile', loincCode: '24331-1', reasoning: 'Baseline dyslipidemia screening recommended for prediabetic individuals.', urgency: 'routine', guidelineSource: 'ADA', guidelineRef: 'ADA 2024 Sec 10. Lipid Management' }
    ],
    education: {
      en: { language: 'en', title: 'Prediabetes Action Plan', summary: 'Your blood sugar is slightly higher than normal, but diabetes can be prevented with early action.', keyActionSteps: ['Reduce refined sugars and white rice', 'Walk 30 minutes after meals'], dietaryAdvice: ['Switch to millets, oats, and whole grains', 'Avoid sugary beverages and sweets'], warningSignsToWatch: ['Increased thirst or frequent urination'], translatedAt: '2026-07-22T10:45:00Z' },
      hi: { language: 'hi', title: 'प्री-डायबिटीज एक्शन प्लान', summary: 'आपका ब्लड शुगर सामान्य से थोड़ा अधिक है, लेकिन सही समय पर बदलाव से डायबिटीज से बचा जा सकता है।', keyActionSteps: ['मीठे पेय और रिफाइंड भोजन से बचें', 'भोजन के बाद 30 मिनट टहलें'], dietaryAdvice: ['बाजरा, ज्वार और साबुत अनाज खाएं', 'मिठाइयों से परहेज करें'], warningSignsToWatch: ['बार-बार प्यास लगना या पेशाब आना'], translatedAt: '2026-07-22T10:45:00Z' },
      gu: { language: 'gu', title: 'પ્રી-ડાયાબિટીસ એક્શન પ્લાન', summary: 'તમારું બ્લડ શુગર સામાન્ય કરતાં થોડું વધારે છે, પરંતુ યોગ્ય કાળજીથી ડાયાબિટીસ અટકાવી શકાય છે.', keyActionSteps: ['ખાંડ અને મિઠાઈનું પ્રમાણ ઘટાડવું', 'રોજ ૩૦ મિનિટ ચાલવું'], dietaryAdvice: ['જુવાર, બાજરી અને અનાજ લેવું', 'ગળ્યા પીણાં ન પીવા'], warningSignsToWatch: ['વધુ પડતી તરસ અથવા વારંવાર પેશાબ થવો'], translatedAt: '2026-07-22T10:45:00Z' }
    }
  },

  // 3. Type 2 Diabetes Patient (High HbA1c + Missing UACR Screening)
  'patient-diabetes': {
    patient: {
      resourceType: 'Patient',
      id: 'patient-diabetes',
      name: [{ use: 'official', text: 'Ramesh Patel', family: 'Patel', given: ['Ramesh'] }],
      gender: 'male',
      birthDate: '1970-03-18',
      telecom: [{ system: 'phone', value: '+91 94250 99887' }],
      address: [{ text: 'Station Road, Anand, Gujarat', city: 'Anand', state: 'Gujarat' }]
    },
    vitals: [
      { resourceType: 'Observation', id: 'dv1', status: 'final', code: { coding: [{ system: 'LOINC', code: '8480-6', display: 'Systolic Blood Pressure' }] }, subject: { reference: 'Patient/patient-diabetes' }, effectiveDateTime: '2026-07-25T08:15:00Z', valueQuantity: { value: 138, unit: 'mmHg' } },
      { resourceType: 'Observation', id: 'dv2', status: 'final', code: { coding: [{ system: 'LOINC', code: '8462-4', display: 'Diastolic Blood Pressure' }] }, subject: { reference: 'Patient/patient-diabetes' }, effectiveDateTime: '2026-07-25T08:15:00Z', valueQuantity: { value: 88, unit: 'mmHg' } },
      { resourceType: 'Observation', id: 'dv3', status: 'final', code: { coding: [{ system: 'LOINC', code: '39156-5', display: 'Body Mass Index' }] }, subject: { reference: 'Patient/patient-diabetes' }, effectiveDateTime: '2026-07-25T08:15:00Z', valueQuantity: { value: 28.4, unit: 'kg/m2' } }
    ],
    labs: [
      { resourceType: 'Observation', id: 'dl1', status: 'final', code: { coding: [{ system: 'LOINC', code: '4548-4', display: 'HbA1c' }] }, subject: { reference: 'Patient/patient-diabetes' }, effectiveDateTime: '2026-07-25T08:15:00Z', valueQuantity: { value: 8.4, unit: '%' } },
      { resourceType: 'Observation', id: 'dl2', status: 'final', code: { coding: [{ system: 'LOINC', code: '1558-6', display: 'Fasting Plasma Glucose' }] }, subject: { reference: 'Patient/patient-diabetes' }, effectiveDateTime: '2026-07-25T08:15:00Z', valueQuantity: { value: 164, unit: 'mg/dL' } },
      { resourceType: 'Observation', id: 'dl3', status: 'final', code: { coding: [{ system: 'LOINC', code: '33914-3', display: 'eGFR' }] }, subject: { reference: 'Patient/patient-diabetes' }, effectiveDateTime: '2026-07-25T08:15:00Z', valueQuantity: { value: 78, unit: 'mL/min/1.73m2' } }
    ],
    conditions: [
      { resourceType: 'Condition', id: 'dc1', clinicalStatus: 'active', code: { coding: [{ system: 'ICD-10', code: 'E11.9', display: 'Type 2 Diabetes Mellitus' }] }, subject: { reference: 'Patient/patient-diabetes' } },
      { resourceType: 'Condition', id: 'dc2', clinicalStatus: 'active', code: { coding: [{ system: 'ICD-10', code: 'I10', display: 'Essential Hypertension' }] }, subject: { reference: 'Patient/patient-diabetes' } }
    ],
    riskAssessment: {
      resourceType: 'RiskAssessment',
      id: 'ra-diabetes',
      status: 'final',
      subject: { reference: 'Patient/patient-diabetes' },
      occurrenceDateTime: '2026-07-25T08:30:00Z',
      overallRiskScore: 82,
      overallTier: 'high',
      diseaseRisks: [
        { diseaseId: 'diabetes', diseaseName: 'Type 2 Diabetes Mellitus', riskScore: 88, severityTier: 'high', confidenceScore: 0.96, contributingFactors: [{ metric: 'HbA1c', value: '8.4%', impactPercentage: 42, rationale: 'Poor glycemic control (> 8.0%)' }, { metric: 'Fasting Glucose', value: '164 mg/dL', impactPercentage: 24, rationale: 'Persistent hyperglycemia' }], guidelineCitations: [{ source: 'ADA', title: 'ADA Standards of Care 2024', section: 'Sec 6. Glycemic Targets' }, { source: 'ICMR', title: 'ICMR Guidelines for T2D', section: 'Sec 4. Management' }] },
        { diseaseId: 'ckd', diseaseName: 'Chronic Kidney Disease', riskScore: 74, severityTier: 'high', confidenceScore: 0.91, contributingFactors: [{ metric: 'Uncontrolled HbA1c', value: '8.4%', impactPercentage: 32, rationale: 'Diabetic nephropathy risk' }, { metric: 'eGFR', value: '78 mL/min', impactPercentage: 18, rationale: 'Early filtration decline (Stage 2 CKD)' }], guidelineCitations: [{ source: 'KDIGO', title: 'KDIGO 2023 Clinical Practice Guideline', section: 'Sec 1.3. Screening for Diabetic Kidney Disease' }] },
        { diseaseId: 'hypertension', diseaseName: 'Essential Hypertension', riskScore: 68, severityTier: 'moderate', confidenceScore: 0.94, contributingFactors: [{ metric: 'BP', value: '138/88 mmHg', impactPercentage: 22, rationale: 'Stage 1 hypertension in diabetic patient' }], guidelineCitations: [{ source: 'AHA', title: 'AHA Hypertension Guidelines', section: 'Diabetic BP Targets (< 130/80)' }] },
        { diseaseId: 'cvd', diseaseName: 'Cardiovascular Disease', riskScore: 62, severityTier: 'moderate', confidenceScore: 0.93, contributingFactors: [{ metric: 'Age & Diabetes', value: '54 yrs, T2D', impactPercentage: 28, rationale: 'High 10-year ASCVD risk score' }], guidelineCitations: [{ source: 'WHO', title: 'WHO CVD Risk Charts (South Asia)', section: 'Diabetic Risk Matrix' }] },
        { diseaseId: 'stroke', diseaseName: 'Ischemic Stroke', riskScore: 38, severityTier: 'moderate', confidenceScore: 0.89, contributingFactors: [{ metric: 'Hypertension + Diabetes', value: 'Combined Risk', impactPercentage: 16, rationale: 'Vascular stiffness & endothelial stress' }], guidelineCitations: [{ source: 'AHA', title: 'Stroke Prevention in Diabetes', section: 'Vascular Risk Management' }] }
      ],
      mitigationStrategies: ['Intensify antidiabetic therapy (Consider SGLT2i/GLP-1RA)', 'Perform mandatory UACR kidney screening', 'Refer to Nephrologist if proteinuria detected']
    },
    missingInvestigations: [
      { id: 'mi-uacr', testName: 'Urine Albumin-to-Creatinine Ratio (UACR)', loincCode: '14959-1', reasoning: 'Mandatory annual screening for diabetic nephropathy required per KDIGO 2023 Guidelines.', urgency: 'urgent', guidelineSource: 'KDIGO', guidelineRef: 'KDIGO 2023 Guideline 1.3.1' },
      { id: 'mi-eyecare', testName: 'Dilated Retinal Examination (Fundoscopy)', loincCode: '32451-7', reasoning: 'Annual diabetic retinopathy screening overdue.', urgency: 'routine', guidelineSource: 'ADA', guidelineRef: 'ADA 2024 Sec 12. Retinopathy' }
    ],
    referral: {
      resourceType: 'ServiceRequest',
      id: 'ref-nephro-1',
      status: 'active',
      intent: 'order',
      specialty: 'Nephrology',
      urgency: 'urgent',
      code: { coding: [{ system: 'SNOMED', code: '306206005', display: 'Referral to Nephrologist' }] },
      subject: { reference: 'Patient/patient-diabetes' },
      occurrenceDateTime: '2026-07-25T08:30:00Z',
      reasonText: 'Type 2 Diabetes with HbA1c 8.4%, eGFR 78 mL/min, requiring specialized diabetic kidney disease evaluation and ACEi/ARB optimization.'
    },
    education: {
      en: { language: 'en', title: 'Diabetic Kidney Care Plan', summary: 'Your blood sugar (HbA1c 8.4%) is elevated, which increases stress on your kidneys and blood vessels.', keyActionSteps: ['Take prescribed diabetic medications regularly', 'Schedule Urine Albumin test this week', 'Monitor BP daily'], dietaryAdvice: ['Limit salt to less than 1 teaspoon daily', 'Avoid white bread, sweets, and fried foods'], warningSignsToWatch: ['Swelling in feet or ankles', 'Puffiness around eyes in the morning'], translatedAt: '2026-07-25T08:30:00Z' },
      hi: { language: 'hi', title: 'डायबिटिक किडनी केयर प्लान', summary: 'आपका ब्लड शुगर (HbA1c 8.4%) बढ़ा हुआ है, जिससे आपकी किडनी और रक्त वाहिकाओं पर दबाव बढ़ रहा है।', keyActionSteps: ['दवाएं नियमित समय पर लें', 'इस सप्ताह यूरीन एल्ब्यूमिन (UACR) जांच करवाएं', 'प्रतिदिन बीपी चेक करें'], dietaryAdvice: ['नमक का सेवन प्रतिदिन 1 चम्मच से कम करें', 'मीठा, मैदा और तला भोजन बंद करें'], warningSignsToWatch: ['पैरों या टखनों में सूजन', 'सुबह आंखों के आसपास सूजन'], translatedAt: '2026-07-25T08:30:00Z' },
      gu: { language: 'gu', title: 'ડાયાબિટીક કિડની કેર પ્લાન', summary: 'તમારું બ્લડ શુગર (HbA1c 8.4%) વધારે છે, જે કિડની અને રક્તવાહિનીઓ પર દબાણ વધારે છે.', keyActionSteps: ['દવાઓ સમયસર લેવી', 'આ અઠવાડિયે યુરિન આલ્બ્યુમિન ટેસ્ટ કરાવવો', 'દરરોજ બીપી ચેક કરવું'], dietaryAdvice: ['મીઠું દિવસમાં ૧ ચમચીથી ઓછું લેવું', 'ગળ્યા, તળેલા અને મેંદાના ખોરાક ન લેવા'], warningSignsToWatch: ['પગમાં અથવા ઘૂંટીમાં સોજા આવવા', 'સવારે આંખોની આસપાસ સોજા'], translatedAt: '2026-07-25T08:30:00Z' }
    }
  },

  // 4. Essential Hypertension Patient
  'patient-hypertension': {
    patient: {
      resourceType: 'Patient',
      id: 'patient-hypertension',
      name: [{ use: 'official', text: 'Sunita Devi', family: 'Devi', given: ['Sunita'] }],
      gender: 'female',
      birthDate: '1968-11-05',
      telecom: [{ system: 'phone', value: '+91 97110 22334' }],
      address: [{ text: 'Village Rampur, Varanasi, Uttar Pradesh', city: 'Varanasi', state: 'Uttar Pradesh' }]
    },
    vitals: [
      { resourceType: 'Observation', id: 'hv1', status: 'final', code: { coding: [{ system: 'LOINC', code: '8480-6', display: 'Systolic Blood Pressure' }] }, subject: { reference: 'Patient/patient-hypertension' }, effectiveDateTime: '2026-07-26T11:00:00Z', valueQuantity: { value: 154, unit: 'mmHg' } },
      { resourceType: 'Observation', id: 'hv2', status: 'final', code: { coding: [{ system: 'LOINC', code: '8462-4', display: 'Diastolic Blood Pressure' }] }, subject: { reference: 'Patient/patient-hypertension' }, effectiveDateTime: '2026-07-26T11:00:00Z', valueQuantity: { value: 96, unit: 'mmHg' } },
      { resourceType: 'Observation', id: 'hv3', status: 'final', code: { coding: [{ system: 'LOINC', code: '39156-5', display: 'Body Mass Index' }] }, subject: { reference: 'Patient/patient-hypertension' }, effectiveDateTime: '2026-07-26T11:00:00Z', valueQuantity: { value: 29.1, unit: 'kg/m2' } }
    ],
    labs: [
      { resourceType: 'Observation', id: 'hl1', status: 'final', code: { coding: [{ system: 'LOINC', code: '4548-4', display: 'HbA1c' }] }, subject: { reference: 'Patient/patient-hypertension' }, effectiveDateTime: '2026-07-26T11:00:00Z', valueQuantity: { value: 5.6, unit: '%' } },
      { resourceType: 'Observation', id: 'hl2', status: 'final', code: { coding: [{ system: 'LOINC', code: '2093-3', display: 'Total Cholesterol' }] }, subject: { reference: 'Patient/patient-hypertension' }, effectiveDateTime: '2026-07-26T11:00:00Z', valueQuantity: { value: 238, unit: 'mg/dL' } }
    ],
    conditions: [
      { resourceType: 'Condition', id: 'hc1', clinicalStatus: 'active', code: { coding: [{ system: 'ICD-10', code: 'I10', display: 'Stage 2 Essential Hypertension' }] }, subject: { reference: 'Patient/patient-hypertension' } }
    ],
    riskAssessment: {
      resourceType: 'RiskAssessment',
      id: 'ra-htn',
      status: 'final',
      subject: { reference: 'Patient/patient-hypertension' },
      occurrenceDateTime: '2026-07-26T11:15:00Z',
      overallRiskScore: 76,
      overallTier: 'high',
      diseaseRisks: [
        { diseaseId: 'hypertension', diseaseName: 'Essential Hypertension', riskScore: 84, severityTier: 'high', confidenceScore: 0.97, contributingFactors: [{ metric: 'Systolic BP', value: '154 mmHg', impactPercentage: 45, rationale: 'Stage 2 Hypertension (> 140 mmHg)' }, { metric: 'Diastolic BP', value: '96 mmHg', impactPercentage: 25, rationale: 'Stage 2 Diastolic Pressure' }], guidelineCitations: [{ source: 'AHA', title: 'AHA/ACC 2017 Hypertension Guidelines', section: 'Stage 2 HTN Management' }] },
        { diseaseId: 'cvd', diseaseName: 'Cardiovascular Disease', riskScore: 72, severityTier: 'high', confidenceScore: 0.93, contributingFactors: [{ metric: 'BP & Cholesterol', value: '154/96 mmHg, Chol 238 mg/dL', impactPercentage: 38, rationale: 'Elevated ASCVD 10-year event risk' }], guidelineCitations: [{ source: 'WHO', title: 'WHO CVD Risk Charts', section: 'High Risk Hypertensive Category' }] },
        { diseaseId: 'stroke', diseaseName: 'Ischemic Stroke', riskScore: 62, severityTier: 'high', confidenceScore: 0.92, contributingFactors: [{ metric: 'Stage 2 BP', value: '154/96 mmHg', impactPercentage: 30, rationale: 'Cerebrovascular pressure strain' }], guidelineCitations: [{ source: 'AHA', title: 'AHA Primary Stroke Prevention', section: 'Hypertension Management' }] },
        { diseaseId: 'ckd', diseaseName: 'Chronic Kidney Disease', riskScore: 48, severityTier: 'moderate', confidenceScore: 0.89, contributingFactors: [{ metric: 'Persistent High BP', value: '154 mmHg', impactPercentage: 20, rationale: 'Hypertensive nephrosclerosis risk' }], guidelineCitations: [{ source: 'KDIGO', title: 'KDIGO BP in CKD Guidelines', section: 'Target BP < 120 mmHg' }] },
        { diseaseId: 'diabetes', diseaseName: 'Type 2 Diabetes', riskScore: 22, severityTier: 'low', confidenceScore: 0.94, contributingFactors: [{ metric: 'HbA1c', value: '5.6%', impactPercentage: 5, rationale: 'Normal glucose range' }], guidelineCitations: [{ source: 'ADA', title: 'ADA 2024 Standards', section: 'Glycemic Control' }] }
      ],
      mitigationStrategies: ['Initiate dual antihypertensive combination therapy (CCB + ARB)', 'Sodium restriction (< 2g/day)', 'Cardiology consult if SBP > 160 mmHg']
    },
    missingInvestigations: [
      { id: 'mi-ecg', testName: '12-Lead Electrocardiogram (ECG)', loincCode: '11524-6', reasoning: 'Screening for Left Ventricular Hypertrophy (LVH) in Stage 2 Hypertension.', urgency: 'urgent', guidelineSource: 'AHA', guidelineRef: 'AHA 2017 Sec 5. Workup of HTN' },
      { id: 'mi-scr', testName: 'Serum Creatinine & eGFR', loincCode: '33914-3', reasoning: 'Baseline renal function assessment required before ARB therapy.', urgency: 'urgent', guidelineSource: 'KDIGO', guidelineRef: 'KDIGO BP Guidelines Sec 2' }
    ],
    education: {
      en: { language: 'en', title: 'Hypertension Management Plan', summary: 'Your blood pressure (154/96 mmHg) is in Stage 2 range, requiring immediate lifestyle and medical steps.', keyActionSteps: ['Take prescribed BP medicine at the same time daily', 'Reduce salt in cooking by half', 'Check BP twice weekly'], dietaryAdvice: ['Eat potash-rich foods like bananas and spinach', 'Avoid pickles, papads, and packaged salty snacks'], warningSignsToWatch: ['Severe headache, dizziness, or blurred vision', 'Chest tightness or shortness of breath'], translatedAt: '2026-07-26T11:15:00Z' },
      hi: { language: 'hi', title: 'उच्च रक्तचाप (बीपी) प्रबंधन योजना', summary: 'आपका बीपी (154/96 mmHg) काफी बढ़ा हुआ है, जिसके लिए तुरंत दवा और परहेज आवश्यक है।', keyActionSteps: ['बीपी की दवा रोज सही समय पर लें', 'भोजन में नमक आधा करें', 'हफ्ते में दो बार बीपी चेक कराएं'], dietaryAdvice: ['अचार, पापड़, नमकीन और डिब्बाबंद भोजन पूरी तरह बंद करें', 'हरी पत्तेदार सब्जियां खाएं'], warningSignsToWatch: ['तेज सिरदर्द, चक्कर आना या धुंधला दिखना', 'छाती में भारीपन या सांस फूलना'], translatedAt: '2026-07-26T11:15:00Z' },
      gu: { language: 'gu', title: 'હાઇ બ્લડ પ્રેશર નિયંત્રણ યોજના', summary: 'તમારું બીપી (154/96 mmHg) વધારે સ્ટેજ-૨ માં છે, જે માટે નિયમિત દવા અને પરહેજ જરૂરી છે.', keyActionSteps: ['બીપીની દવા રોજ નિયમિત સમય પર લેવી', 'રસોઈમાં મીઠું અડધું કરવું', 'અઠવાડિયામાં બે વાર બીપી ચેક કરવું'], dietaryAdvice: ['અથાણાં, પાપડ અને ખારા નમકીન બંધ કરવા', 'લીલા શાકભાજી લેવા'], warningSignsToWatch: ['અતિશય માથાનો દુખાવો, ચક્કર આવવા', 'છાતીમાં ભારેપણું અનુભવાવું'], translatedAt: '2026-07-26T11:15:00Z' }
    }
  },

  // 5. Chronic Kidney Disease Patient (eGFR 48, UACR 140)
  'patient-ckd': {
    patient: {
      resourceType: 'Patient',
      id: 'patient-ckd',
      name: [{ use: 'official', text: 'Kishore Bhai', family: 'Bhai', given: ['Kishore'] }],
      gender: 'male',
      birthDate: '1962-07-10',
      telecom: [{ system: 'phone', value: '+91 93770 11223' }],
      address: [{ text: 'Rajkot Rural, Gujarat', city: 'Rajkot', state: 'Gujarat' }]
    },
    vitals: [
      { resourceType: 'Observation', id: 'ckv1', status: 'final', code: { coding: [{ system: 'LOINC', code: '8480-6', display: 'Systolic Blood Pressure' }] }, subject: { reference: 'Patient/patient-ckd' }, effectiveDateTime: '2026-07-28T09:30:00Z', valueQuantity: { value: 146, unit: 'mmHg' } },
      { resourceType: 'Observation', id: 'ckv2', status: 'final', code: { coding: [{ system: 'LOINC', code: '8462-4', display: 'Diastolic Blood Pressure' }] }, subject: { reference: 'Patient/patient-ckd' }, effectiveDateTime: '2026-07-28T09:30:00Z', valueQuantity: { value: 90, unit: 'mmHg' } }
    ],
    labs: [
      { resourceType: 'Observation', id: 'ckl1', status: 'final', code: { coding: [{ system: 'LOINC', code: '33914-3', display: 'eGFR' }] }, subject: { reference: 'Patient/patient-ckd' }, effectiveDateTime: '2026-07-28T09:30:00Z', valueQuantity: { value: 48, unit: 'mL/min/1.73m2' } },
      { resourceType: 'Observation', id: 'ckl2', status: 'final', code: { coding: [{ system: 'LOINC', code: '14959-1', display: 'Urine Albumin-to-Creatinine Ratio (UACR)' }] }, subject: { reference: 'Patient/patient-ckd' }, effectiveDateTime: '2026-07-28T09:30:00Z', valueQuantity: { value: 140, unit: 'mg/g' } },
      { resourceType: 'Observation', id: 'ckl3', status: 'final', code: { coding: [{ system: 'LOINC', code: '2160-0', display: 'Serum Creatinine' }] }, subject: { reference: 'Patient/patient-ckd' }, effectiveDateTime: '2026-07-28T09:30:00Z', valueQuantity: { value: 1.6, unit: 'mg/dL' } }
    ],
    conditions: [
      { resourceType: 'Condition', id: 'ckc1', clinicalStatus: 'active', code: { coding: [{ system: 'ICD-10', code: 'N18.32', display: 'Chronic Kidney Disease, Stage 3b (Moderate to Severe)' }] }, subject: { reference: 'Patient/patient-ckd' } }
    ],
    riskAssessment: {
      resourceType: 'RiskAssessment',
      id: 'ra-ckd',
      status: 'final',
      subject: { reference: 'Patient/patient-ckd' },
      occurrenceDateTime: '2026-07-28T09:45:00Z',
      overallRiskScore: 86,
      overallTier: 'severe',
      diseaseRisks: [
        { diseaseId: 'ckd', diseaseName: 'Chronic Kidney Disease', riskScore: 92, severityTier: 'severe', confidenceScore: 0.98, contributingFactors: [{ metric: 'eGFR', value: '48 mL/min', impactPercentage: 50, rationale: 'Stage 3b CKD (Moderate-Severe Filtration Impairment)' }, { metric: 'UACR', value: '140 mg/g', impactPercentage: 30, rationale: 'Persistent Microalbuminuria (A2 Category)' }], guidelineCitations: [{ source: 'KDIGO', title: 'KDIGO 2023 Clinical Practice Guideline', section: 'Sec 1.4. CKD Heatmap Staging G3bA2' }] },
        { diseaseId: 'hypertension', diseaseName: 'Essential Hypertension', riskScore: 78, severityTier: 'high', confidenceScore: 0.95, contributingFactors: [{ metric: 'BP in CKD', value: '146/90 mmHg', impactPercentage: 35, rationale: 'Accelerates renal function decline' }], guidelineCitations: [{ source: 'KDIGO', title: 'KDIGO BP in CKD Guidelines', section: 'BP Target < 120 mmHg Systolic' }] },
        { diseaseId: 'cvd', diseaseName: 'Cardiovascular Disease', riskScore: 74, severityTier: 'high', confidenceScore: 0.94, contributingFactors: [{ metric: 'Stage 3b CKD', value: 'eGFR 48 mL/min', impactPercentage: 40, rationale: 'CKD is a major independent cardiovascular risk multiplier' }], guidelineCitations: [{ source: 'AHA', title: 'AHA Cardiorenal Syndrome Guidelines', section: 'CKD & Heart Failure Risk' }] },
        { diseaseId: 'stroke', diseaseName: 'Ischemic Stroke', riskScore: 48, severityTier: 'moderate', confidenceScore: 0.91, contributingFactors: [{ metric: 'Uremic Risk & High BP', value: '146 mmHg, eGFR 48', impactPercentage: 22, rationale: 'Vascular calcification & stroke risk' }], guidelineCitations: [{ source: 'AHA', title: 'Stroke in Renal Disease', section: 'Risk Stratification' }] },
        { diseaseId: 'diabetes', diseaseName: 'Type 2 Diabetes', riskScore: 30, severityTier: 'low', confidenceScore: 0.92, contributingFactors: [{ metric: 'Fasting Glucose', value: '102 mg/dL', impactPercentage: 8, rationale: 'Non-diabetic etiology likely' }], guidelineCitations: [{ source: 'KDIGO', title: 'KDIGO Non-Diabetic CKD Protocol', section: 'Etiology Workup' }] }
      ],
      mitigationStrategies: ['Urgent Nephrology Consultation', 'Initiate ACEi/ARB or SGLT2i therapy under supervision', 'Strict Protein & Potassium dietary monitoring']
    },
    missingInvestigations: [
      { id: 'mi-pth', testName: 'Serum Intact Parathyroid Hormone (PTH) & Vitamin D', loincCode: '2731-8', reasoning: 'Evaluate CKD-Mineral and Bone Disorder (CKD-MBD) in Stage 3b CKD.', urgency: 'urgent', guidelineSource: 'KDIGO', guidelineRef: 'KDIGO 2023 Guideline 3.1' },
      { id: 'mi-bicarb', testName: 'Serum Bicarbonate / Electrolytes', loincCode: '1963-8', reasoning: 'Check for metabolic acidosis in Stage 3b CKD.', urgency: 'urgent', guidelineSource: 'KDIGO', guidelineRef: 'KDIGO Guideline 3.3' }
    ],
    referral: {
      resourceType: 'ServiceRequest',
      id: 'ref-nephro-2',
      status: 'active',
      intent: 'order',
      specialty: 'Nephrology',
      urgency: 'urgent',
      code: { coding: [{ system: 'SNOMED', code: '306206005', display: 'Referral to Nephrologist' }] },
      subject: { reference: 'Patient/patient-ckd' },
      occurrenceDateTime: '2026-07-28T09:45:00Z',
      reasonText: 'Stage 3b CKD (eGFR 48 mL/min/1.73m2, UACR 140 mg/g) with uncontrolled BP 146/90 mmHg. Needs urgent specialist evaluation for SGLT2i initiation and renal protection.'
    },
    education: {
      en: { language: 'en', title: 'Kidney Health Protection Plan', summary: 'Your kidney filtration rate (eGFR 48) has decreased to Stage 3b. Specialized kidney care is required.', keyActionSteps: ['Consult Nephrologist within 7 days', 'Avoid taking painkiller medicines (NSAIDs like Ibuprofen/Diclofenac) without doctor approval', 'Keep BP below 120/80'], dietaryAdvice: ['Limit high-protein intake (red meat, heavy pulses)', 'Do not add extra salt to cooked food'], warningSignsToWatch: ['Reduced urine volume', 'Nausea, vomiting, or metallic taste in mouth'], translatedAt: '2026-07-28T09:45:00Z' },
      hi: { language: 'hi', title: 'किडनी स्वास्थ्य सुरक्षा योजना', summary: 'आपकी किडनी की कार्यक्षमता (eGFR 48) घटकर स्टेज 3b में आ गई है। तुरंत विशेषज्ञ परामर्श आवश्यक है।', keyActionSteps: ['7 दिनों के भीतर किडनी विशेषज्ञ (नेफ्रोलॉजिस्ट) से मिलें', 'बिना डॉक्टर की सलाह के दर्द निवारक गोलियां (जैसे डाइक्लोफेनाक/इबुप्रोफेन) बिल्कुल न लें', 'बीपी 120/80 के नीचे रखें'], dietaryAdvice: ['दालों और हैवी प्रोटीन का सेवन सीमित करें', 'खाने में ऊपर से नमक न डालें'], warningSignsToWatch: ['पेशाब की मात्रा कम होना', 'उल्टी, मिचली या मुंह का स्वाद खराब होना'], translatedAt: '2026-07-28T09:45:00Z' },
      gu: { language: 'gu', title: 'કિડની આરોગ્ય સુરક્ષા યોજના', summary: 'તમારી કિડનીની કાર્યક્ષમતા (eGFR 48) ઘટીને સ્ટેજ ૩b માં આવી ગઈ છે. નિષ્ણાતની સલાહ જરૂરી છે.', keyActionSteps: ['૭ દિવસમાં કિડનીના ડોક્ટર (નેફ્રોલોજીસ્ટ) ને બતાવવું', 'પેઇનકિલર (દર્દ શામક) દવાઓ ડૉક્ટરની સલાહ વગર ક્યારેય ન લેવી', 'બીપી નિયંત્રણમાં રાખવું'], dietaryAdvice: ['વધારે પ્રોટીનવાળો ખોરાક મર્યાદિત કરવો', 'ઉપરથી કાચું મીઠું ન ઉમેરવું'], warningSignsToWatch: ['પેશાબ ઓછો આવવો', 'ઊલટી-ઉબકા અથવા મોંનો સ્વાદ બગડવો'], translatedAt: '2026-07-28T09:45:00Z' }
    }
  },

  // 6. Multi-Comorbid Patient (Diabetes + HTN + CKD + High CVD/Stroke Risk)
  'patient-multimorbid': {
    patient: {
      resourceType: 'Patient',
      id: 'patient-multimorbid',
      name: [{ use: 'official', text: 'Vikram Singh', family: 'Singh', given: ['Vikram'] }],
      gender: 'male',
      birthDate: '1958-12-01',
      telecom: [{ system: 'phone', value: '+91 99887 66554' }],
      address: [{ text: 'Civil Lines, Jaipur, Rajasthan', city: 'Jaipur', state: 'Rajasthan' }]
    },
    vitals: [
      { resourceType: 'Observation', id: 'mv1', status: 'final', code: { coding: [{ system: 'LOINC', code: '8480-6', display: 'Systolic Blood Pressure' }] }, subject: { reference: 'Patient/patient-multimorbid' }, effectiveDateTime: '2026-07-30T11:20:00Z', valueQuantity: { value: 168, unit: 'mmHg' } },
      { resourceType: 'Observation', id: 'mv2', status: 'final', code: { coding: [{ system: 'LOINC', code: '8462-4', display: 'Diastolic Blood Pressure' }] }, subject: { reference: 'Patient/patient-multimorbid' }, effectiveDateTime: '2026-07-30T11:20:00Z', valueQuantity: { value: 102, unit: 'mmHg' } },
      { resourceType: 'Observation', id: 'mv3', status: 'final', code: { coding: [{ system: 'LOINC', code: '39156-5', display: 'Body Mass Index' }] }, subject: { reference: 'Patient/patient-multimorbid' }, effectiveDateTime: '2026-07-30T11:20:00Z', valueQuantity: { value: 31.2, unit: 'kg/m2' } }
    ],
    labs: [
      { resourceType: 'Observation', id: 'ml1', status: 'final', code: { coding: [{ system: 'LOINC', code: '4548-4', display: 'HbA1c' }] }, subject: { reference: 'Patient/patient-multimorbid' }, effectiveDateTime: '2026-07-30T11:20:00Z', valueQuantity: { value: 9.8, unit: '%' } },
      { resourceType: 'Observation', id: 'ml2', status: 'final', code: { coding: [{ system: 'LOINC', code: '1558-6', display: 'Fasting Plasma Glucose' }] }, subject: { reference: 'Patient/patient-multimorbid' }, effectiveDateTime: '2026-07-30T11:20:00Z', valueQuantity: { value: 210, unit: 'mg/dL' } },
      { resourceType: 'Observation', id: 'ml3', status: 'final', code: { coding: [{ system: 'LOINC', code: '33914-3', display: 'eGFR' }] }, subject: { reference: 'Patient/patient-multimorbid' }, effectiveDateTime: '2026-07-30T11:20:00Z', valueQuantity: { value: 42, unit: 'mL/min/1.73m2' } },
      { resourceType: 'Observation', id: 'ml4', status: 'final', code: { coding: [{ system: 'LOINC', code: '14959-1', display: 'Urine Albumin-to-Creatinine Ratio (UACR)' }] }, subject: { reference: 'Patient/patient-multimorbid' }, effectiveDateTime: '2026-07-30T11:20:00Z', valueQuantity: { value: 320, unit: 'mg/g' } }
    ],
    conditions: [
      { resourceType: 'Condition', id: 'mc1', clinicalStatus: 'active', code: { coding: [{ system: 'ICD-10', code: 'E11.22', display: 'Type 2 Diabetes with Diabetic Nephropathy' }] }, subject: { reference: 'Patient/patient-multimorbid' } },
      { resourceType: 'Condition', id: 'mc2', clinicalStatus: 'active', code: { coding: [{ system: 'ICD-10', code: 'I12.9', display: 'Hypertensive Chronic Kidney Disease' }] }, subject: { reference: 'Patient/patient-multimorbid' } },
      { resourceType: 'Condition', id: 'mc3', clinicalStatus: 'active', code: { coding: [{ system: 'ICD-10', code: 'N18.32', display: 'CKD Stage 3b (Macroalbuminuric A3 Category)' }] }, subject: { reference: 'Patient/patient-multimorbid' } }
    ],
    riskAssessment: {
      resourceType: 'RiskAssessment',
      id: 'ra-multimorbid',
      status: 'final',
      subject: { reference: 'Patient/patient-multimorbid' },
      occurrenceDateTime: '2026-07-30T11:35:00Z',
      overallRiskScore: 96,
      overallTier: 'severe',
      diseaseRisks: [
        { diseaseId: 'diabetes', diseaseName: 'Type 2 Diabetes Mellitus', riskScore: 98, severityTier: 'severe', confidenceScore: 0.99, contributingFactors: [{ metric: 'HbA1c', value: '9.8%', impactPercentage: 40, rationale: 'Severe hyperglycemia & microvascular damage' }], guidelineCitations: [{ source: 'ADA', title: 'ADA Standards of Care 2024', section: 'Sec 10. Cardiorenal Risk' }] },
        { diseaseId: 'ckd', diseaseName: 'Chronic Kidney Disease', riskScore: 96, severityTier: 'severe', confidenceScore: 0.98, contributingFactors: [{ metric: 'UACR & eGFR', value: '320 mg/g, eGFR 42', impactPercentage: 45, rationale: 'Macroalbuminuric Stage 3b CKD (High ESKD Risk)' }], guidelineCitations: [{ source: 'KDIGO', title: 'KDIGO 2023 Clinical Practice Guideline', section: 'Sec 1.4. Heatmap Staging G3bA3' }] },
        { diseaseId: 'hypertension', diseaseName: 'Essential Hypertension', riskScore: 94, severityTier: 'severe', confidenceScore: 0.98, contributingFactors: [{ metric: 'Stage 2 BP', value: '168/102 mmHg', impactPercentage: 35, rationale: 'Severe hypertensive crisis range' }], guidelineCitations: [{ source: 'AHA', title: 'AHA/ACC 2017 Guidelines', section: 'Hypertensive Urgency Thresholds' }] },
        { diseaseId: 'cvd', diseaseName: 'Cardiovascular Disease', riskScore: 91, severityTier: 'severe', confidenceScore: 0.96, contributingFactors: [{ metric: 'Triad Risk Factors', value: 'BP + HbA1c + CKD', impactPercentage: 40, rationale: 'Multi-organ cardiorenal metabolic syndrome' }], guidelineCitations: [{ source: 'WHO', title: 'WHO CVD South Asia Risk Matrix', section: 'Very High Risk Group' }] },
        { diseaseId: 'stroke', diseaseName: 'Ischemic Stroke', riskScore: 82, severityTier: 'high', confidenceScore: 0.94, contributingFactors: [{ metric: 'CHA2DS2-VASc Equivalent', value: 'Age 67 + HTN + Diabetes', impactPercentage: 30, rationale: 'High 5-year stroke probability' }], guidelineCitations: [{ source: 'AHA', title: 'AHA Stroke Prevention Guidelines', section: 'Multi-Factorial Risk Stratification' }] }
      ],
      mitigationStrategies: ['EMERGENCY: Immediate specialist intervention required', 'Initiate SGLT2i (Dapagliflozin) + ACEi/ARB combo under supervision', 'Cardiology & Nephrology joint consultation']
    },
    missingInvestigations: [
      { id: 'mi-echo', testName: 'Echocardiogram (Transthoracic ECHO)', loincCode: '18056-2', reasoning: 'Evaluate hypertensive heart disease, LV ejection fraction, and diastolic dysfunction.', urgency: 'emergency', guidelineSource: 'AHA', guidelineRef: 'AHA Cardiorenal Guidelines Sec 4' },
      { id: 'mi-potassium', testName: 'Serum Potassium & Electrolytes', loincCode: '2823-3', reasoning: 'Mandatory monitoring for hyperkalemia prior to ACEi/ARB titration in Stage 3b CKD.', urgency: 'emergency', guidelineSource: 'KDIGO', guidelineRef: 'KDIGO 2023 Guideline 2.1' }
    ],
    referral: {
      resourceType: 'ServiceRequest',
      id: 'ref-multi-1',
      status: 'active',
      intent: 'order',
      specialty: 'Nephrology',
      urgency: 'emergency',
      code: { coding: [{ system: 'SNOMED', code: '306206005', display: 'Emergency Referral to Nephrology & Cardiology' }] },
      subject: { reference: 'Patient/patient-multimorbid' },
      occurrenceDateTime: '2026-07-30T11:35:00Z',
      reasonText: 'CRITICAL MULTI-ORGAN RISK: Patient presents with Stage 3b Macroalbuminuric CKD (eGFR 42 mL/min, UACR 320 mg/g), Severe Uncontrolled Diabetes (HbA1c 9.8%), and Stage 2 Hypertensive Crisis (BP 168/102 mmHg). Requires immediate multi-specialty intervention.'
    },
    education: {
      en: { language: 'en', title: 'Critical Multi-Organ Care Plan', summary: 'HIGH RISK ALERT: Your blood sugar, blood pressure, and kidney numbers require immediate medical attention.', keyActionSteps: ['Visit hospital specialist clinic within 24-48 hours', 'Take all prescribed blood pressure and sugar medicines without missing doses', 'Check blood pressure daily'], dietaryAdvice: ['Strict salt restriction (less than 1/2 teaspoon per day)', 'Avoid all fruit juices, sweets, fried foods, and high-potassium raw salads until doctor review'], warningSignsToWatch: ['Shortness of breath or chest discomfort', 'Sudden swelling of legs, feet, or face', 'Extreme dizziness or confusion'], translatedAt: '2026-07-30T11:35:00Z' },
      hi: { language: 'hi', title: 'गंभीर मल्टी-ऑर्गन केयर प्लान', summary: 'अति आवश्यक चेतावनी: आपका ब्लड शुगर, बीपी और किडनी रिपोर्ट अत्यधिक खतरनाक स्तर पर है। तुरंत डॉक्टर से संपर्क करें।', keyActionSteps: ['24-48 घंटे के भीतर बड़े अस्पताल में विशेषज्ञ डॉक्टर को दिखाएं', 'दवाएं बिना चूके समय पर लें', 'रोजाना बीपी चेक करें'], dietaryAdvice: ['नमक बहुत कम (आधा चम्मच से भी कम) करें', 'मीठा, तला भोजन, जूस और बिना सलाह कच्ची सब्जियां न खाएं'], warningSignsToWatch: ['सांस फूलना या सीने में भारीपन', 'पैरों या चेहरे पर अचानक सूजन', 'अत्यधिक चक्कर आना'], translatedAt: '2026-07-30T11:35:00Z' },
      gu: { language: 'gu', title: 'ગંભીર મલ્ટિ-ઓર્ગન કેર પ્લાન', summary: 'અતિ મહત્વની સૂચના: તમારું બ્લડ શુગર, બીપી અને કિડની રિપોર્ટ ગંભીર તબક્કામાં છે. તાત્કાલિક નિષ્ણાતની સલાહ લો.', keyActionSteps: ['૨૪-૪૮ કલાકમાં હોસ્પિટલમાં નિષ્ણાત ડૉક્ટરને બતાવવું', 'દવાઓ સમયસર નિયમિત લેવી', 'દરરોજ બીપી માપવું'], dietaryAdvice: ['મીઠું ખૂબ જ ઓછું કરવું (દિવસમાં અડધી ચમચીથી પણ ઓછું)', 'ગળ્યો, તળેલો ખોરાક અને ફળોનો રસ ન લેવો'], warningSignsToWatch: ['શ્વાસ ચડવો અથવા છાતીમાં દુખાવો થવો', 'પગમાં કે મોં પર અચાનક સોજા આવવા'], translatedAt: '2026-07-30T11:35:00Z' }
    }
  }
};
