import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini-service';
import { sendSuccess, sendError } from '../response';

export async function handleReport(req: Request, res: Response) {
  try {
    const { patient, assessment, language = 'en' } = req.body;

    if (!patient || !assessment) {
      return sendError(res, 400, 'INVALID_INPUT', 'Patient and assessment payload are required.');
    }

    const prompt = `Generate a printable clinical report & patient education sheet in language '${language}'.
Patient: ${patient.name?.[0]?.given?.join(' ') || 'Patient'}, Age ${assessment.snapshot?.features?.age || 50}.
Overall Risk Score: ${assessment.overallRiskScore}%.
Highest Disease Priority: ${assessment.highestPriorityDisease?.diseaseName || 'Type 2 Diabetes'}.

Include:
1. Clinical Summary
2. Indian Diet Plan (Millets, Ragi, Dal, Sabzi)
3. Physical Activity Goals (30-min walking checklist)
4. Medication Schedule
5. Warning Signs & Emergencies`;

    let generatedContent = await GeminiService.generate(prompt);

    if (!generatedContent) {
      // Structured fallback sheet
      generatedContent = `### HealthSense AI Clinical & Patient Guidance Sheet (${language.toUpperCase()})

**Patient Name**: ${patient.name?.[0]?.given?.join(' ') || 'Patient'}
**Overall Risk Status**: ${assessment.overallRiskScore}% (${assessment.overallTier || 'HIGH'})

---

#### 1. Indian Dietary Recommendations
- **Breakfast**: Ragi Dosa / Bajra Porridge with boiled sprouts (Low Glycemic Index).
- **Lunch**: Foxtail Millet / Brown Rice with Tur Dal, Palak Sabzi, and Fresh Curd.
- **Dinner**: 2 Multigrain Roti with Methi Chana Dal & Salad. Avoid late night snacks.

#### 2. Physical Activity & Daily Routine
- 🚶 **Daily Goal**: 30 minutes of brisk walking (5,000 to 7,000 steps).
- 💧 **Hydration**: Drink 2.5 - 3 Liters of water daily.
- 🚭 **Lifestyle**: Complete tobacco & smoking cessation.

#### 3. Warning Signs - Seek Immediate PHC Assistance If:
- Sudden chest pain, shortness of breath, or cold sweats.
- Blood pressure > 160/100 mmHg or severe headache.
- Blurry vision or numbness/tingling in feet.`;
    }

    return sendSuccess(res, {
      reportId: `REP-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      language,
      content: generatedContent,
      printable: true
    });
  } catch (error: any) {
    console.error('[handleReport Error]', error);
    return sendError(res, 500, 'REPORT_GENERATION_FAILED', error.message || 'Error generating report.');
  }
}
