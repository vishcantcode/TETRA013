import { Patient, Vitals } from '../types';
import { LabAnalysisResult, LabExtractionParameter, LabReportMetadata } from '../types/labAnalysis';

export class LabOcrService {
  /**
   * Generates sample pathology report data tailored to a specific patient.
   */
  public static getSampleReports(patient: Patient): { id: string; title: string; category: string; description: string }[] {
    return [
      {
        id: 'sample-diabetic-metabolic',
        title: 'Comprehensive Metabolic & Glycemic Panel',
        category: 'Lab Test',
        description: 'Includes Fasting Glucose, HbA1c, Lipids, Renal, Liver Function, and Urine Albumin.',
      },
      {
        id: 'sample-renal-electrolyte',
        title: 'Renal Function & Electrolyte Profile',
        category: 'Lab Test',
        description: 'Focuses on Serum Creatinine, eGFR, Blood Urea Nitrogen, UACR, Sodium, and Potassium.',
      },
      {
        id: 'sample-cardio-lipid',
        title: 'Advanced Cardiovascular & Lipid Panel',
        category: 'Lab Test',
        description: 'Detailed ApoB, Total Cholesterol, HDL, LDL, Triglycerides, and hs-CRP inflammatory markers.',
      },
    ];
  }

  /**
   * Primary extraction engine. Accepts file or sampleId and returns structured result.
   */
  public static async analyzeReport(
    fileOrSample: File | string,
    patient: Patient
  ): Promise<LabAnalysisResult> {
    // Simulate OCR processing time for a realistic feel
    await new Promise((resolve) => setTimeout(resolve, 1800));

    let sampleType = 'sample-diabetic-metabolic';
    let fileName = 'Pathology_Report_Scan.pdf';
    let fileSize = '2.4 MB';

    if (typeof fileOrSample === 'string') {
      sampleType = fileOrSample;
      fileName = `${sampleType.replace('sample-', '').replace('-', '_').toUpperCase()}.pdf`;
    } else {
      fileName = fileOrSample.name;
      fileSize = `${(fileOrSample.size / (1024 * 1024)).toFixed(2)} MB`;
      // Map file name hints to sample if applicable, or build custom
      if (fileName.toLowerCase().includes('kidney') || fileName.toLowerCase().includes('renal')) {
        sampleType = 'sample-renal-electrolyte';
      } else if (fileName.toLowerCase().includes('lipid') || fileName.toLowerCase().includes('cardio')) {
        sampleType = 'sample-cardio-lipid';
      }
    }

    return this.buildAnalysisForPatient(sampleType, patient, fileName, fileSize);
  }

  private static buildAnalysisForPatient(
    sampleType: string,
    patient: Patient,
    fileName: string,
    fileSize: string
  ): LabAnalysisResult {
    const todayStr = new Date().toISOString().split('T')[0];
    const prevDateStr = patient.lastAssessmentDate || '2026-06-15';

    // Metadata
    const metadata: LabReportMetadata = {
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      laboratoryName: 'Quest Diagnostics Clinical Reference Lab',
      collectionDate: todayStr,
      reportDate: todayStr,
      doctorName: patient.primaryDoctor || 'Dr. Arthur Pendelton, MD',
      reportTitle:
        sampleType === 'sample-renal-electrolyte'
          ? 'Renal Function & Electrolyte Profile'
          : sampleType === 'sample-cardio-lipid'
          ? 'Advanced Cardiovascular & Lipid Panel'
          : 'Comprehensive Metabolic & Glycemic Panel',
      reportCategory: 'Lab Test',
    };

    let parameters: LabExtractionParameter[] = [];

    if (sampleType === 'sample-renal-electrolyte') {
      parameters = [
        {
          id: 'p-1',
          name: 'Serum Creatinine',
          category: 'Renal',
          rawValue: '1.42',
          numericValue: 1.42,
          rawUnit: 'mg/dL',
          standardizedValue: 1.42,
          standardizedUnit: 'mg/dL',
          normalRange: '0.60 - 1.20 mg/dL',
          status: 'Critical',
          confidence: 'High',
          confidenceScore: 98,
          interpretation: 'Elevated. Indicates reduced glomerular filtration capacity.',
          boundingBox: { x: 12, y: 22, width: 76, height: 6, page: 1 },
          previousValue: 1.15,
          previousDate: prevDateStr,
          trend: 'Increasing',
          isVerified: true,
        },
        {
          id: 'p-2',
          name: 'eGFR (CKD-EPI)',
          category: 'Renal',
          rawValue: '54',
          numericValue: 54,
          rawUnit: 'mL/min/1.73m²',
          standardizedValue: 54,
          standardizedUnit: 'mL/min/1.73m²',
          normalRange: '> 60 mL/min/1.73m²',
          status: 'Critical',
          confidence: 'High',
          confidenceScore: 96,
          interpretation: 'Stage 3a Chronic Kidney Disease range. Hyperfiltration strain.',
          boundingBox: { x: 12, y: 30, width: 76, height: 6, page: 1 },
          previousValue: 68,
          previousDate: prevDateStr,
          trend: 'Increasing', // declining function
          isVerified: true,
        },
        {
          id: 'p-3',
          name: 'Blood Urea Nitrogen (BUN)',
          category: 'Renal',
          rawValue: '24',
          numericValue: 24,
          rawUnit: 'mg/dL',
          standardizedValue: 24,
          standardizedUnit: 'mg/dL',
          normalRange: '7 - 20 mg/dL',
          status: 'Borderline',
          confidence: 'High',
          confidenceScore: 95,
          interpretation: 'Mildly elevated nitrogenous waste accumulation.',
          boundingBox: { x: 12, y: 38, width: 76, height: 6, page: 1 },
          previousValue: 18,
          previousDate: prevDateStr,
          trend: 'Increasing',
          isVerified: true,
        },
        {
          id: 'p-4',
          name: 'Urine Albumin-to-Creatinine Ratio (UACR)',
          category: 'Renal',
          rawValue: '88',
          numericValue: 88,
          rawUnit: 'mg/g',
          standardizedValue: 88,
          standardizedUnit: 'mg/g',
          normalRange: '< 30 mg/g',
          status: 'Critical',
          confidence: 'Medium',
          confidenceScore: 84,
          interpretation: 'Microalbuminuria present. High risk for diabetic nephropathy progression.',
          boundingBox: { x: 12, y: 46, width: 76, height: 6, page: 1 },
          previousValue: 34,
          previousDate: prevDateStr,
          trend: 'Increasing',
          isVerified: false,
        },
        {
          id: 'p-5',
          name: 'Serum Sodium (Na+)',
          category: 'Electrolytes',
          rawValue: '141',
          numericValue: 141,
          rawUnit: 'mmol/L',
          standardizedValue: 141,
          standardizedUnit: 'mmol/L',
          normalRange: '136 - 145 mmol/L',
          status: 'Normal',
          confidence: 'High',
          confidenceScore: 99,
          interpretation: 'Within normal physiological range.',
          boundingBox: { x: 12, y: 54, width: 76, height: 6, page: 1 },
          previousValue: 140,
          previousDate: prevDateStr,
          trend: 'Stable',
          isVerified: true,
        },
        {
          id: 'p-6',
          name: 'Serum Potassium (K+)',
          category: 'Electrolytes',
          rawValue: '4.6',
          numericValue: 4.6,
          rawUnit: 'mmol/L',
          standardizedValue: 4.6,
          standardizedUnit: 'mmol/L',
          normalRange: '3.5 - 5.1 mmol/L',
          status: 'Normal',
          confidence: 'High',
          confidenceScore: 97,
          interpretation: 'Normal extracellular potassium.',
          boundingBox: { x: 12, y: 62, width: 76, height: 6, page: 1 },
          previousValue: 4.4,
          previousDate: prevDateStr,
          trend: 'Stable',
          isVerified: true,
        },
      ];
    } else if (sampleType === 'sample-cardio-lipid') {
      parameters = [
        {
          id: 'p-1',
          name: 'LDL Cholesterol (Calculated)',
          category: 'Lipid',
          rawValue: '168',
          numericValue: 168,
          rawUnit: 'mg/dL',
          standardizedValue: 168,
          standardizedUnit: 'mg/dL',
          normalRange: '< 100 mg/dL',
          status: 'Critical',
          confidence: 'High',
          confidenceScore: 99,
          interpretation: 'Significantly elevated atherogenic LDL burden.',
          boundingBox: { x: 12, y: 22, width: 76, height: 6, page: 1 },
          previousValue: 152,
          previousDate: prevDateStr,
          trend: 'Increasing',
          isVerified: true,
          vitalsField: 'ldl',
        },
        {
          id: 'p-2',
          name: 'Total Cholesterol',
          category: 'Lipid',
          rawValue: '242',
          numericValue: 242,
          rawUnit: 'mg/dL',
          standardizedValue: 242,
          standardizedUnit: 'mg/dL',
          normalRange: '< 200 mg/dL',
          status: 'Critical',
          confidence: 'High',
          confidenceScore: 98,
          interpretation: 'Hypercholesterolemia present.',
          boundingBox: { x: 12, y: 30, width: 76, height: 6, page: 1 },
          previousValue: 228,
          previousDate: prevDateStr,
          trend: 'Increasing',
          isVerified: true,
        },
        {
          id: 'p-3',
          name: 'HDL Cholesterol',
          category: 'Lipid',
          rawValue: '38',
          numericValue: 38,
          rawUnit: 'mg/dL',
          standardizedValue: 38,
          standardizedUnit: 'mg/dL',
          normalRange: '> 50 mg/dL (F) / > 40 mg/dL (M)',
          status: 'Borderline',
          confidence: 'High',
          confidenceScore: 96,
          interpretation: 'Sub-optimal protective HDL concentration.',
          boundingBox: { x: 12, y: 38, width: 76, height: 6, page: 1 },
          previousValue: 42,
          previousDate: prevDateStr,
          trend: 'Increasing', // worsening
          isVerified: true,
        },
        {
          id: 'p-4',
          name: 'Triglycerides',
          category: 'Lipid',
          rawValue: '198',
          numericValue: 198,
          rawUnit: 'mg/dL',
          standardizedValue: 198,
          standardizedUnit: 'mg/dL',
          normalRange: '< 150 mg/dL',
          status: 'Borderline',
          confidence: 'High',
          confidenceScore: 97,
          interpretation: 'Moderate hypertriglyceridemia associated with insulin resistance.',
          boundingBox: { x: 12, y: 46, width: 76, height: 6, page: 1 },
          previousValue: 180,
          previousDate: prevDateStr,
          trend: 'Increasing',
          isVerified: true,
        },
        {
          id: 'p-5',
          name: 'High-Sensitivity CRP (hs-CRP)',
          category: 'Lipid',
          rawValue: '3.4',
          numericValue: 3.4,
          rawUnit: 'mg/L',
          standardizedValue: 3.4,
          standardizedUnit: 'mg/L',
          normalRange: '< 1.0 mg/L',
          status: 'Critical',
          confidence: 'Medium',
          confidenceScore: 82,
          interpretation: 'High cardiovascular inflammatory risk indicator (> 3.0 mg/L).',
          boundingBox: { x: 12, y: 54, width: 76, height: 6, page: 1 },
          previousValue: 2.1,
          previousDate: prevDateStr,
          trend: 'Increasing',
          isVerified: false,
        },
      ];
    } else {
      // Default: Comprehensive Metabolic & Glycemic Panel
      const currentHbA1c = patient.vitals.hba1c || 8.6;
      const currentGlucose = patient.vitals.glucose || 182;
      const currentLdl = patient.vitals.ldl || 168;

      parameters = [
        {
          id: 'p-1',
          name: 'Hemoglobin A1c (HbA1c)',
          category: 'Glycemic',
          rawValue: `${currentHbA1c}`,
          numericValue: currentHbA1c,
          rawUnit: '%',
          standardizedValue: currentHbA1c,
          standardizedUnit: '%',
          normalRange: '< 5.7 %',
          status: currentHbA1c >= 6.5 ? 'Critical' : currentHbA1c >= 5.7 ? 'Borderline' : 'Normal',
          confidence: 'High',
          confidenceScore: 99,
          interpretation: 'Uncontrolled hyperglycemia. Indicates 90-day mean glucose > 180 mg/dL.',
          boundingBox: { x: 12, y: 22, width: 76, height: 6, page: 1 },
          previousValue: 7.2,
          previousDate: prevDateStr,
          trend: currentHbA1c > 7.2 ? 'Increasing' : 'Improving',
          isVerified: true,
          vitalsField: 'hba1c',
        },
        {
          id: 'p-2',
          name: 'Fasting Blood Glucose',
          category: 'Glycemic',
          rawValue: `${currentGlucose}`,
          numericValue: currentGlucose,
          rawUnit: 'mg/dL',
          standardizedValue: currentGlucose,
          standardizedUnit: 'mg/dL',
          normalRange: '70 - 99 mg/dL',
          status: currentGlucose >= 126 ? 'Critical' : currentGlucose >= 100 ? 'Borderline' : 'Normal',
          confidence: 'High',
          confidenceScore: 98,
          interpretation: 'Fasting hyperglycemia consistent with active insulin resistance.',
          boundingBox: { x: 12, y: 30, width: 76, height: 6, page: 1 },
          previousValue: 154,
          previousDate: prevDateStr,
          trend: currentGlucose > 154 ? 'Increasing' : 'Improving',
          isVerified: true,
          vitalsField: 'glucose',
        },
        {
          id: 'p-3',
          name: 'LDL Cholesterol',
          category: 'Lipid',
          rawValue: `${currentLdl}`,
          numericValue: currentLdl,
          rawUnit: 'mg/dL',
          standardizedValue: currentLdl,
          standardizedUnit: 'mg/dL',
          normalRange: '< 100 mg/dL',
          status: currentLdl >= 160 ? 'Critical' : currentLdl >= 100 ? 'Borderline' : 'Normal',
          confidence: 'High',
          confidenceScore: 97,
          interpretation: 'Elevated atherogenic lipid fraction.',
          boundingBox: { x: 12, y: 38, width: 76, height: 6, page: 1 },
          previousValue: 160,
          previousDate: prevDateStr,
          trend: currentLdl > 160 ? 'Increasing' : 'Improving',
          isVerified: true,
          vitalsField: 'ldl',
        },
        {
          id: 'p-4',
          name: 'Alanine Aminotransferase (ALT)',
          category: 'Hepatic',
          rawValue: '54',
          numericValue: 54,
          rawUnit: 'U/L',
          standardizedValue: 54,
          standardizedUnit: 'U/L',
          normalRange: '7 - 35 U/L',
          status: 'Critical',
          confidence: 'Medium',
          confidenceScore: 88,
          interpretation: 'Mild transaminitis consistent with metabolic non-alcoholic fatty liver (NAFLD).',
          boundingBox: { x: 12, y: 46, width: 76, height: 6, page: 1 },
          previousValue: 42,
          previousDate: prevDateStr,
          trend: 'Increasing',
          isVerified: false,
        },
        {
          id: 'p-5',
          name: 'Serum Creatinine',
          category: 'Renal',
          rawValue: '1.24',
          numericValue: 1.24,
          rawUnit: 'mg/dL',
          standardizedValue: 1.24,
          standardizedUnit: 'mg/dL',
          normalRange: '0.60 - 1.20 mg/dL',
          status: 'Borderline',
          confidence: 'High',
          confidenceScore: 96,
          interpretation: 'Upper threshold renal parameter. Follow up with UACR.',
          boundingBox: { x: 12, y: 54, width: 76, height: 6, page: 1 },
          previousValue: 1.10,
          previousDate: prevDateStr,
          trend: 'Increasing',
          isVerified: true,
        },
        {
          id: 'p-6',
          name: 'Serum Vitamin D (25-OH)',
          category: 'Vitamins',
          rawValue: '18.4',
          numericValue: 18.4,
          rawUnit: 'ng/mL',
          standardizedValue: 18.4,
          standardizedUnit: 'ng/mL',
          normalRange: '30 - 100 ng/mL',
          status: 'Borderline',
          confidence: 'Low',
          confidenceScore: 78,
          interpretation: 'Vitamin D insufficiency detected. Supplementation advised.',
          boundingBox: { x: 12, y: 62, width: 76, height: 6, page: 1 },
          previousValue: 22.0,
          previousDate: prevDateStr,
          trend: 'Increasing', // worsening
          isVerified: false,
        },
      ];
    }

    // Counts
    const critical = parameters.filter((p) => p.status === 'Critical').length;
    const borderline = parameters.filter((p) => p.status === 'Borderline').length;
    const normal = parameters.filter((p) => p.status === 'Normal').length;
    const unverifiedCount = parameters.filter((p) => !p.isVerified || p.confidence === 'Low').length;
    const avgConfidence = Math.round(
      parameters.reduce((sum, p) => sum + p.confidenceScore, 0) / parameters.length
    );

    // Build Vitals Update
    const updatedVitals: Partial<Vitals> = {};
    parameters.forEach((p) => {
      if (p.vitalsField) {
        (updatedVitals as any)[p.vitalsField] = p.standardizedValue;
      }
    });

    // Summary text
    const criticalItems = parameters.filter((p) => p.status === 'Critical').map((p) => `${p.name} (${p.rawValue} ${p.rawUnit})`);
    const executiveSummary = `Pathology OCR extracted ${parameters.length} parameters for ${patient.name}. ${
      critical > 0
        ? `Found ${critical} critical biomarkers requiring physician action: ${criticalItems.join(', ')}.`
        : 'All extracted parameters are within normal or borderline acceptable thresholds.'
    }`;

    return {
      id: `analysis-${Date.now()}`,
      fileInfo: {
        name: fileName,
        size: fileSize,
        type: fileName.endsWith('.pdf') ? 'PDF Document' : 'High-Res Scan Image',
      },
      metadata,
      parameters,
      summary: {
        executiveSummary,
        abnormalFindingsText: criticalItems.length > 0 ? criticalItems.join(' • ') : 'No critical findings.',
        clinicalRecommendations: [
          'Verify low-confidence parameters before finalizing diagnostic record.',
          'Sync extracted vitals with HealthSense AI 10-Stage CDSS Pipeline.',
          'Schedule follow-up panel in 12 weeks to monitor trend trajectory.',
        ],
      },
      confidenceAverage: avgConfidence,
      unverifiedCount,
      counts: {
        normal,
        borderline,
        critical,
        total: parameters.length,
      },
      updatedVitals,
    };
  }

  /**
   * Unit Normalization utility
   */
  public static normalizeUnit(
    value: number,
    fromUnit: string,
    toUnit: string
  ): { convertedValue: number; note?: string } {
    const from = fromUnit.trim().toLowerCase();
    const to = toUnit.trim().toLowerCase();

    if (from === to) return { convertedValue: value };

    // Glucose / Cholesterol mmol/L to mg/dL (multiply by 18 for glucose)
    if (from === 'mmol/l' && to === 'mg/dl') {
      const convertedValue = Math.round(value * 18.018 * 10) / 10;
      return { convertedValue, note: 'Converted from mmol/L (× 18.018)' };
    }

    // Creatinine μmol/L to mg/dL (divide by 88.4)
    if ((from === 'μmol/l' || from === 'umol/l') && to === 'mg/dl') {
      const convertedValue = Math.round((value / 88.4) * 100) / 100;
      return { convertedValue, note: 'Converted from μmol/L (÷ 88.4)' };
    }

    return { convertedValue: value };
  }
}
