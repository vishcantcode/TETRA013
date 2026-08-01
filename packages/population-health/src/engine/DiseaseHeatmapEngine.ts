import { DeIdentifiedPatientRecord } from '../services/AnonymizationService';
import { DiseasePrevalence, MultimorbidityOverlap } from '../interfaces/DiseaseDistribution';
import { Statistics } from '../utils/Statistics';

export class DiseaseHeatmapEngine {
  public static computePrevalence(records: DeIdentifiedPatientRecord[]): DiseasePrevalence[] {
    const total = records.length;
    if (total === 0) return [];

    const counts = {
      diabetes: records.filter(r => (r.diseaseRisks['diabetes'] || 0) >= 50).length,
      hypertension: records.filter(r => (r.diseaseRisks['hypertension'] || 0) >= 50).length,
      ckd: records.filter(r => (r.diseaseRisks['ckd'] || 0) >= 50).length,
      cvd: records.filter(r => (r.diseaseRisks['cvd'] || 0) >= 50).length,
      stroke: records.filter(r => (r.diseaseRisks['stroke'] || 0) >= 50).length
    };

    return [
      { diseaseId: 'diabetes', diseaseName: 'Type 2 Diabetes', casesCount: counts.diabetes, prevalencePercentage: Statistics.calculatePercentage(counts.diabetes, total) },
      { diseaseId: 'hypertension', diseaseName: 'Essential Hypertension', casesCount: counts.hypertension, prevalencePercentage: Statistics.calculatePercentage(counts.hypertension, total) },
      { diseaseId: 'ckd', diseaseName: 'Chronic Kidney Disease', casesCount: counts.ckd, prevalencePercentage: Statistics.calculatePercentage(counts.ckd, total) },
      { diseaseId: 'cvd', diseaseName: 'Cardiovascular Disease', casesCount: counts.cvd, prevalencePercentage: Statistics.calculatePercentage(counts.cvd, total) },
      { diseaseId: 'stroke', diseaseName: 'Ischemic Stroke', casesCount: counts.stroke, prevalencePercentage: Statistics.calculatePercentage(counts.stroke, total) }
    ];
  }

  public static computeMultimorbidity(records: DeIdentifiedPatientRecord[]): MultimorbidityOverlap {
    const total = records.length;
    if (total === 0) return { singleDiseaseCount: 0, twoDiseasesCount: 0, threeOrMoreDiseasesCount: 0, multimorbidPercentage: 0 };

    let single = 0;
    let two = 0;
    let threePlus = 0;

    records.forEach(r => {
      const activeCount = Object.values(r.diseaseRisks).filter(score => score >= 50).length;
      if (activeCount === 1) single++;
      else if (activeCount === 2) two++;
      else if (activeCount >= 3) threePlus++;
    });

    const multimorbidCount = two + threePlus;
    return {
      singleDiseaseCount: single,
      twoDiseasesCount: two,
      threeOrMoreDiseasesCount: threePlus,
      multimorbidPercentage: Statistics.calculatePercentage(multimorbidCount, total)
    };
  }
}
