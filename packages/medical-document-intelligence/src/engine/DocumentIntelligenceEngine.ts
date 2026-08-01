import { FHIRPatient, FHIRObservation, FHIRDiagnosticReport } from '@healthsense/clinical-models';
import { ClinicalEngine, UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { MedicalDocumentPayload, DocumentCategory } from '../interfaces/MedicalDocument';
import { OCRPipeline } from './OCRPipeline';
import { DocumentClassifier } from '../services/DocumentClassifier';
import { MedicalEntityExtractor } from '../services/MedicalEntityExtractor';
import { FHIRMapper } from '../services/FHIRMapper';

export interface DocumentProcessingResult {
  documentId: string;
  category: DocumentCategory;
  rawText: string;
  extractedObservations: FHIRObservation[];
  diagnosticReport: FHIRDiagnosticReport;
  unifiedRiskAssessment: UnifiedRiskAssessment;
}

export class DocumentIntelligenceEngine {
  private ocrPipeline = new OCRPipeline();
  private clinicalEngine = new ClinicalEngine();

  public async processDocumentAndEvaluate(
    document: MedicalDocumentPayload,
    patient: FHIRPatient,
    existingVitals: FHIRObservation[] = [],
    existingConditions: any[] = []
  ): Promise<DocumentProcessingResult> {
    // Step 1: Run OCR Pipeline
    const ocrResult = await this.ocrPipeline.runOCR(document);

    // Step 2: Classify Document Type
    const category = DocumentClassifier.classify(ocrResult.fullText);

    // Step 3: Extract Key Medical Entities & Observations
    const extractedObs = MedicalEntityExtractor.extractObservations(ocrResult.fullText);

    // Step 4: Map Extracted Findings to HL7 FHIR Observations & DiagnosticReport
    const fhirObservations = FHIRMapper.mapToFHIRObservations(patient.id, extractedObs);
    const diagnosticReport = FHIRMapper.mapToFHIRDiagnosticReport(patient.id, `${category} OCR Extraction`, fhirObservations);

    // Step 5: Feed Extracted Observations Directly into Clinical Engine
    const mergedLabs = [...fhirObservations];
    const unifiedRiskAssessment = this.clinicalEngine.evaluatePatient(
      patient,
      existingVitals,
      mergedLabs,
      existingConditions,
      [],
      [diagnosticReport]
    );

    return {
      documentId: document.documentId,
      category,
      rawText: ocrResult.fullText,
      extractedObservations: fhirObservations,
      diagnosticReport,
      unifiedRiskAssessment
    };
  }
}

export const documentIntelligenceEngine = new DocumentIntelligenceEngine();
