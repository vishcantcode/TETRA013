import { PersonalizedEducationPlan } from '../interfaces/EducationPlan';
import { LOCALIZATION_DICTIONARY } from '../utils/Localization';

export class PDFEducationGenerator {
  public static generatePrintableHTML(plan: PersonalizedEducationPlan): string {
    const dict = LOCALIZATION_DICTIONARY[plan.selectedLanguage] || LOCALIZATION_DICTIONARY.en;

    return `
<!DOCTYPE html>
<html lang="${plan.selectedLanguage}">
<head>
  <meta charset="UTF-8">
  <title>${dict.HEALTH_SUMMARY_TITLE}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 30px; color: #1e293b; }
    .header { border-bottom: 2px solid #0ea5e9; padding-bottom: 15px; margin-bottom: 20px; }
    .title { font-size: 22px; font-weight: bold; color: #0f172a; }
    .subtitle { font-size: 14px; color: #64748b; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
    .card-title { font-size: 16px; font-weight: bold; color: #0284c7; margin-bottom: 8px; }
    .red-flag { background: #fff1f2; border: 1px solid #fecdd3; color: #9f1239; }
    .list { margin: 5px 0 0 20px; padding: 0; }
    .footer { font-size: 11px; text-align: center; color: #94a3b8; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${dict.HEALTH_SUMMARY_TITLE}</div>
    <div class="subtitle">Patient ID: ${plan.patientId} | Generated: ${new Date(plan.createdAt).toLocaleDateString()}</div>
  </div>

  <div class="card">
    <div class="card-title">${plan.summary.headline}</div>
    <p>${plan.summary.summaryText}</p>
    <p><strong>Main Action:</strong> ${plan.summary.keyActionMessage}</p>
  </div>

  <div class="card red-flag">
    <div class="card-title" style="color: #9f1239;">${dict.RED_FLAGS_LABEL}</div>
    <ul class="list">
      ${plan.actionPlan.redFlagSymptoms.map(s => `<li>${s}</li>`).join('')}
    </ul>
    <p style="margin-top: 10px; font-size: 12px;">${plan.actionPlan.emergencyContactInstructions}</p>
  </div>

  <div class="card">
    <div class="card-title">${dict.DIET_LABEL}: ${plan.lifestylePlan.diet.category}</div>
    <p><strong>Focus:</strong> ${plan.lifestylePlan.diet.primaryFocus}</p>
    <p><strong>Recommended Foods:</strong> ${plan.lifestylePlan.diet.recommendedFoods.join(', ')}</p>
    <p><strong>Foods to Limit/Avoid:</strong> ${plan.lifestylePlan.diet.foodsToAvoid.join(', ')}</p>
  </div>

  <div class="card">
    <div class="card-title">${dict.EXERCISE_LABEL}: ${plan.lifestylePlan.exercise.type}</div>
    <p>Frequency: ${plan.lifestylePlan.exercise.weeklyFrequency} (${plan.lifestylePlan.exercise.durationMinutesPerSession} mins per session)</p>
  </div>

  <div class="footer">
    HealthSense AI CDSS — Powered by Evidence-Based Guidelines (ICMR, ADA, KDIGO, AHA, WHO). This document is for patient education.
  </div>
</body>
</html>
    `.trim();
  }
}
