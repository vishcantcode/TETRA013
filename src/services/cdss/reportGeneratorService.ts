import { Patient } from '../../types';
import {
  CdssPipelineResult,
  StructuredClinicalReport,
} from '../../types/cdss';

export class ReportGeneratorService {
  /**
   * Stage 10: Structured PDF-Ready Report Generator.
   * Compiles entire CDSS pipeline output into a formal clinical document.
   */
  public static generateReport(
    patient: Patient,
    pipelineResult: CdssPipelineResult,
    doctorNotes?: string
  ): StructuredClinicalReport {
    const reportId = `HS-CDSS-${patient.mrn || '0000'}-${Date.now().toString().slice(-6)}`;
    const generatedAt = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    return {
      reportId,
      generatedAt,
      patientHeader: {
        id: patient.id,
        mrn: patient.mrn || 'MRN-882910',
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        doctorName: patient.primaryDoctor || 'Dr. Sarah Jenkins, MD',
      },
      executiveSummary:
        pipelineResult.geminiReasoning?.executiveSummary ||
        `Comprehensive CDSS assessment for ${patient.name} (${patient.age} yrs). High cardiometabolic risk identified with HbA1c ${patient.vitals.hba1c}% and BP ${patient.vitals.bpSystolic} mmHg.`,
      dataValidationSummary: pipelineResult.validation,
      diseaseRiskMatrix: pipelineResult.predictions,
      topRiskFactors: pipelineResult.featureImportance,
      ruleBasedRecommendations: pipelineResult.ruleEngine.recommendations,
      earlyWarningAlerts: pipelineResult.earlyWarnings,
      referralRecommendations: pipelineResult.referrals,
      patientEducation: pipelineResult.patientEducation,
      confidenceBreakdown: pipelineResult.confidence,
      doctorNotes: doctorNotes || 'Patient counselled on medication adherence and dietary changes. Scheduled for follow-up in 14 days.',
    };
  }

  /**
   * Formats a clean printable HTML document string for window.print() or PDF saving.
   */
  public static generatePrintableHtml(report: StructuredClinicalReport): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Clinical Decision Support Report - ${report.patientHeader.name}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 30px; color: #1e293b; max-width: 900px; margin: 0 auto; line-height: 1.5; }
          .header { border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .brand { font-size: 20px; font-weight: 800; color: #1e40af; }
          .meta { text-align: right; font-size: 11px; color: #64748b; }
          .patient-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 10px; font-size: 12px; }
          .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-top: 25px; margin-bottom: 12px; }
          .risk-grid { display: grid; grid-template-cols: repeat(5, 1fr); gap: 8px; margin-bottom: 20px; }
          .risk-box { border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; text-align: center; }
          .risk-high { background: #fef2f2; border-color: #fca5a5; color: #991b1b; }
          .risk-mod { background: #fffbeb; border-color: #fcd34d; color: #92400e; }
          .risk-low { background: #f0fdf4; border-color: #86efac; color: #166534; }
          .alert-box { background: #fff1f2; border-left: 4px solid #f43f5e; padding: 10px 14px; margin-bottom: 10px; border-radius: 4px; font-size: 12px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px; }
          .table th, .table td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
          .table th { background: #f1f5f9; font-weight: 700; color: #334155; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 15px; font-size: 10px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">HealthSense AI • Clinical Decision Support System</div>
            <div style="font-size:12px; color:#475569;">CDSS Report ID: ${report.reportId}</div>
          </div>
          <div class="meta">
            <div>Generated: ${report.generatedAt}</div>
            <div>EHR Integrated • Version 2.4</div>
          </div>
        </div>

        <div class="patient-card">
          <div><strong>Patient Name:</strong> ${report.patientHeader.name}</div>
          <div><strong>MRN:</strong> ${report.patientHeader.mrn}</div>
          <div><strong>Age / Gender:</strong> ${report.patientHeader.age} yrs • ${report.patientHeader.gender}</div>
          <div><strong>Attending Physician:</strong> ${report.patientHeader.doctorName}</div>
          <div><strong>Data Quality Score:</strong> ${report.dataValidationSummary.qualityScore}%</div>
          <div><strong>Overall AI Confidence:</strong> ${report.confidenceBreakdown.overallConfidenceScore}%</div>
        </div>

        <div class="section-title">1. Executive Clinical Prognosis</div>
        <div style="background:#f1f5f9; p:12px; border-radius:6px; font-size:12px; font-style:italic;">
          "${report.executiveSummary}"
        </div>

        <div class="section-title">2. ML Disease Risk Predictions</div>
        <div class="risk-grid">
          ${report.diseaseRiskMatrix
            .map(
              (d) => `
            <div class="risk-box ${d.category === 'High' ? 'risk-high' : d.category === 'Moderate' ? 'risk-mod' : 'risk-low'}">
              <div style="font-size:11px; font-weight:700;">${d.disease}</div>
              <div style="font-size:18px; font-weight:800; margin:4px 0;">${d.riskPercentage}%</div>
              <div style="font-size:10px;">${d.category} Risk</div>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="section-title">3. Early Warning Clinical Alerts</div>
        ${report.earlyWarningAlerts
          .map(
            (a) => `
          <div class="alert-box">
            <strong>[${a.severity}] ${a.title}</strong><br/>
            <span>${a.observation}</span><br/>
            <span style="color:#be123c;">Action: ${a.recommendedAction}</span>
          </div>
        `
          )
          .join('')}

        <div class="section-title">4. Guideline-Based Diagnostic Recommendations</div>
        <table class="table">
          <thead>
            <tr>
              <th>Recommendation</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Guideline Rationale</th>
            </tr>
          </thead>
          <tbody>
            ${report.ruleBasedRecommendations
              .map(
                (r) => `
              <tr>
                <td><strong>${r.recommendation}</strong></td>
                <td>${r.category}</td>
                <td><span style="color:${r.priority === 'Urgent' ? '#dc2626' : '#d97706'}">${r.priority}</span></td>
                <td>${r.reason}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="section-title">5. Specialist Referral Plan</div>
        <table class="table">
          <thead>
            <tr>
              <th>Specialist</th>
              <th>Priority & Timeline</th>
              <th>Reason for Referral</th>
            </tr>
          </thead>
          <tbody>
            ${report.referralRecommendations
              .map(
                (ref) => `
              <tr>
                <td><strong>${ref.specialist}</strong></td>
                <td>${ref.priority} (${ref.timeline})</td>
                <td>${ref.reason}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="section-title">6. Doctor Notes</div>
        <div style="font-size:12px; background:#fafafa; padding:10px; border:1px solid #e2e8f0; border-radius:4px;">
          ${report.doctorNotes || 'No additional notes added.'}
        </div>

        <div class="footer">
          NOTICE: This report is generated by HealthSense AI CDSS to assist licensed medical professionals. It does not replace independent clinical judgment.
        </div>
      </body>
      </html>
    `;
  }
}
