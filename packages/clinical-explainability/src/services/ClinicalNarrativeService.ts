import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';

export class ClinicalNarrativeService {
  public static generateClinicianNarrative(assessment: UnifiedRiskAssessment): string {
    const f = assessment.snapshot.features;
    const parts: string[] = [];

    parts.push(`Patient (${f.age}Y, ${f.gender}) presents with an overall health risk score of ${assessment.overallRiskScore}% (${assessment.overallTier.toUpperCase()} risk tier).`);

    const highRisks = Object.values(assessment.diseaseResults).filter(r => r.riskScore >= 60);
    if (highRisks.length > 0) {
      const names = highRisks.map(r => `${r.diseaseName} (${r.riskScore}%)`).join(', ');
      parts.push(`Primary risk drivers: ${names}.`);
    }

    if (f.hba1c !== null && f.hba1c >= 6.5) {
      parts.push(`Glycemic control is uncontrolled with HbA1c ${f.hba1c}%.`);
    }

    if (f.egfr !== null && f.egfr < 60) {
      parts.push(`Renal function shows eGFR reduction to ${f.egfr} mL/min/1.73m2.`);
    }

    if (f.systolicBP !== null && f.systolicBP >= 140) {
      parts.push(`Blood pressure is elevated at ${f.systolicBP}/${f.diastolicBP ?? '--'} mmHg.`);
    }

    parts.push(`Follow-up clinical action recommended per active guidelines.`);
    return parts.join(' ');
  }

  public static generateVernacularSummaries(assessment: UnifiedRiskAssessment): { en: string; hi: string; gu: string } {
    const score = assessment.overallRiskScore;

    if (score < 30) {
      return {
        en: 'Your vital signs and blood test results are in good standing. Continue regular daily walks and balanced eating.',
        hi: 'आपकी रिपोर्ट और स्वास्थ्य संकेत अच्छे हैं। नियमित सैर और संतुलित भोजन जारी रखें।',
        gu: 'તમારું સ્વાસ્થ્ય અને બ્લડ રિપોર્ટ સારા છે. નિયમિત વ્યાયામ અને પૌષ્ટિક આહાર ચાલુ રાખો.'
      };
    } else if (score < 75) {
      return {
        en: 'Your blood sugar or blood pressure shows mild elevation. A few small dietary changes and regular medication can protect your health.',
        hi: 'आपका ब्लड शुगर या बीपी थोड़ा बढ़ा हुआ है। सही खान-पान और नियमित दवा से स्वास्थ्य सुरक्षित रहेगा।',
        gu: 'તમારું બ્લડ શુગર અથવા બીપી થોડું વધારે છે. યોગ્ય ખોરાક અને નિયમિત દવાથી તમારું સ્વાસ્થ્ય સારું રહેશે.'
      };
    } else {
      return {
        en: 'HIGH HEALTH ALERT: Your blood sugar, blood pressure, or kidney numbers require doctor evaluation as soon as possible.',
        hi: 'आवश्यक स्वास्थ्य चेतावनी: आपका ब्लड शुगर, बीपी या किडनी रिपोर्ट चिंताजनक है। जल्द से जल्द डॉक्टर को दिखाएं।',
        gu: 'મહત્વની સૂચના: તમારું બ્લડ શુગર, બીપી અથવા કિડની રિપોર્ટ ગંભીર છે. તાત્કાલિક ડોક્ટરની સલાહ લો.'
      };
    }
  }
}
