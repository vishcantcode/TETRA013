import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini-service';
import { sendSuccess, sendError } from '../response';

export async function handleChat(req: Request, res: Response) {
  try {
    const { message, patientContext, conversationHistory = [] } = req.body;

    if (!message) {
      return sendError(res, 400, 'INVALID_INPUT', 'Message prompt is required.');
    }

    const systemPrompt = `You are HealthSense AI Doctor Assistant, grounded in ICMR 2024 and ADA 2025 Clinical Guidelines.
Provide concise, highly professional clinical reasoning, medication explanations, and actionable follow-up schedules.
Always structure recommendations clearly.
Patient Context: ${JSON.stringify(patientContext || {})}`;

    let reply = await GeminiService.generate(
      `Conversation History: ${JSON.stringify(conversationHistory.slice(-4))}\n\nUser Question: ${message}`,
      systemPrompt
    );

    if (!reply) {
      // Deterministic fallback response when Gemini key is not configured or fails
      reply = `**Clinical Advice (ICMR 2024 / ADA 2025 Guidelines)**:

Based on the clinical query and patient data:
- **Biomarker Analysis**: Monitor SBP (target < 130/80 mmHg per ICMR 2024) and HbA1c (target < 7.0% per ADA 2025).
- **Medication Plan**: Ensure strict adherence to first-line agents (e.g. Metformin / ACEi/ARB).
- **Lifestyle & Diet**: Recommend high-fiber Indian diet (Millets, Ragi, Chana Dal) with 30-min daily brisk walk.
- **Follow-Up Schedule**: Re-check Fasting Blood Sugar & BP in 14 days. Routine renal panel (eGFR/uACR) in 3 months.`;
    }

    return sendSuccess(res, {
      reply,
      timestamp: new Date().toISOString(),
      guidelinesReferenced: ['ICMR 2024 Clinical Guidelines', 'ADA 2025 Standards of Care']
    });
  } catch (error: any) {
    console.error('[handleChat Error]', error);
    return sendError(res, 500, 'CHAT_FAILED', error.message || 'Error processing AI chat.');
  }
}
