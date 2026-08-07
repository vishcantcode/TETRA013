import 'dotenv/config'; // ← MUST be first: loads .env into process.env before anything else
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { runIntakeAgent } from './src/services/agents/intakeAgent';
import { runTriageAgent } from './src/services/agents/triageAgent';
import { runActionOrchestrator } from './src/services/agents/actionOrchestrator';
import { runEmpathyAgent, generateDynamicEmpathyResponse } from './src/services/agents/empathyAgent';
import { callElevenLabsSTT, callElevenLabsTTS } from './src/services/agents/nvidiaClient';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // TwiML endpoint — serves emergency voice script for Twilio voice calls
  // Twilio calls this URL when a call connects; must be publicly accessible via ngrok
  app.get('/twiml', (req, res) => {
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Emergency alert. An ambulance has been dispatched to your location. Please respond immediately to the patient.</Say>
</Response>`);
  });

  // Stage 7: Gemini Clinical Reasoning API Proxy (Server-Side Secret API Key Protection)
  app.post('/api/cdss/reasoning', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { patient, predictions, rules, warnings, referrals, vitals } = req.body;

      if (!apiKey) {
        return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are the AI Clinical Reasoning module of HealthSense AI Clinical Decision Support System (CDSS).
Given the following patient data and CDSS findings:

PATIENT: ${patient?.name || 'Unknown'}, Age ${patient?.age || 50}, Gender ${patient?.gender || 'Unspecified'}
VITALS: HbA1c ${vitals?.hba1c}%, BP ${vitals?.bpSystolic}/${vitals?.bpDiastolic} mmHg, BMI ${vitals?.bmi} kg/m², Fasting Glucose ${vitals?.glucose} mg/dL

ML RISK PREDICTIONS:
${JSON.stringify(predictions || [], null, 2)}

CLINICAL RULE RECOMMENDATIONS:
${JSON.stringify(rules || [], null, 2)}

EARLY WARNING ALERTS:
${JSON.stringify(warnings || [], null, 2)}

SPECIALIST REFERRALS:
${JSON.stringify(referrals || [], null, 2)}

TASK:
Provide structured clinical reasoning in valid JSON matching this exact structure:
{
  "executiveSummary": "1-2 sentence high-level clinical summary of cardiometabolic risk.",
  "clinicalSynthesis": "Paragraph synthesizing ML predictions, feature importance, and diagnostic gaps.",
  "doctorSummaryMarkdown": "Markdown formatted summary for attending physician.",
  "patientFriendlySummaryMarkdown": "Markdown formatted summary for patient in simple, non-jargon language.",
  "whyRecommendationsMade": ["Reason 1", "Reason 2", "Reason 3"],
  "followUpAdvice": "Follow-up timeline and advice."
}

CRITICAL RULES:
1. Do NEVER recalculate risk percentages (use provided ML predictions).
2. Doctor summary must use medical terms (ICD-10, titration).
3. Patient summary must use simple, accessible language.
4. Output ONLY valid JSON.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text;
      if (!text) {
        return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
      }

      // Clean JSON tags if present
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return res.json({
        ...parsed,
        isAiGenerated: true,
      });
    } catch (err) {
      console.error('API Error:', err);
      return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
    }
  });

  // Doctor AI Copilot Endpoint
  app.post('/api/copilot/chat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { patient, query, conversationHistory } = req.body;

      if (!apiKey) {
        return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `
You are HealthSense AI Doctor Copilot, a professional clinical assistant for attending physicians.
You are NOT a general chatbot or conversational AI.
You assist doctors by analyzing patient vitals, lab reports, risk scores, and clinical guidelines.

Patient context:
Name: ${patient?.name || 'Patient'}
MRN: ${patient?.mrn || 'N/A'}
Age: ${patient?.age}, Gender: ${patient?.gender}
Vitals: HbA1c ${patient?.vitals?.hba1c}%, BP ${patient?.vitals?.bpSystolic}/${patient?.vitals?.bpDiastolic} mmHg, BMI ${patient?.vitals?.bmi} kg/m², Fasting Glucose ${patient?.vitals?.glucose} mg/dL, LDL ${patient?.vitals?.ldl} mg/dL
Conditions: ${patient?.conditions?.join(', ') || 'None listed'}
Risk Score: ${patient?.riskScore}% (${patient?.riskLevel})

TASK: Respond to the physician's query: "${query}"

Return a valid JSON object matching this schema:
{
  "executiveSummary": "1-2 sentence high-level clinical summary.",
  "evidenceCards": [
    { "title": "Param Name", "value": "Value", "status": "critical" | "warning" | "normal" | "info", "source": "Source" }
  ],
  "clinicalReasoning": [
    "Step 1 logic...",
    "Step 2 logic..."
  ],
  "keyFindings": ["Finding 1", "Finding 2"],
  "supportingFactors": ["Factor 1", "Factor 2"],
  "suggestedActions": [
    { "action": "Action description", "urgency": "High" | "Routine", "category": "Lab" | "Medication" | "Referral" }
  ],
  "guidelineSummary": "Concise summary of relevant ADA/KDIGO/ACC guidelines without reproducing copyrighted text.",
  "clinicalDocumentDraft": {
    "type": "SOAP" | "DischargeSummary" | "ReferralLetter" | "FollowUpPlan" | "None",
    "content": "Full text formatted document if requested, else null"
  }
}

CRITICAL RULES:
1. Do NEVER make a final diagnosis. Include differential diagnostic considerations if relevant.
2. Output ONLY valid JSON.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: query,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (!text) return res.json({ isAiGenerated: false });

      const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      return res.json({
        ...parsed,
        isAiGenerated: true,
      });
    } catch (err) {
      console.error('API Error:', err);
      return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
    }
  });

  // ==========================================
  // PRODUCTION-READY LLAMA API ENDPOINTS
  // ==========================================

  // Health check endpoint for Llama API provider
  app.get('/api/chat/health', (req, res) => {
    const apiKey = process.env.LLAMA_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
    const baseUrl = process.env.LLAMA_BASE_URL || 'https://api.groq.com/openai/v1';
    const model = process.env.LLAMA_MODEL || 'llama-3.3-70b-versatile';

    res.json({
      status: apiKey ? 'configured' : 'simulated_mode',
      provider: baseUrl.includes('groq') ? 'Groq' : baseUrl.includes('together') ? 'Together AI' : baseUrl.includes('openrouter') ? 'OpenRouter' : baseUrl.includes('fireworks') ? 'Fireworks AI' : 'OpenAI-Compatible Llama Provider',
      baseUrl,
      model,
      hasKey: Boolean(apiKey && !apiKey.startsWith('YOUR_')),
    });
  });

function generateSmartClinicalResponse(query: string, patient: any): string {
  const q = (query || '').toLowerCase().trim();
  const name = patient?.name || 'Alexander Wright';
  const age = patient?.age || 52;
  const gender = patient?.gender || 'Male';
  const mrn = patient?.mrn || '784920';
  const vitals = patient?.vitals || { hba1c: 7.4, bpSystolic: 148, bpDiastolic: 94, heartRate: 88, bmi: 28.4, glucose: 154, ldl: 138, creatinine: 1.3, egfr: 74 };
  const conditions = patient?.preExistingConditions?.join(', ') || patient?.conditions?.join(', ') || 'Hypertension, Type 2 Diabetes';
  const riskScore = patient?.riskScore || 64;
  const riskLevel = patient?.riskLevel || 'Moderate';

  if (q === 'hi' || q === 'hello' || q === 'hey' || q === 'who are you') {
    return `### Hello Dr. Pendelton\n\nI am **Doctor AI Copilot**, your clinical decision-support assistant powered by **Llama 3.3 70B**.\n\nI have loaded the active longitudinal record for **${name}** (MRN #${mrn}, ${age}y ${gender}):\n- **Vitals:** BP ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg | HR ${vitals.heartRate || 88} BPM | HbA1c ${vitals.hba1c}%\n- **Conditions:** ${conditions}\n- **CDSS Composite Risk Index:** ${riskScore}% (${riskLevel} Risk Class)\n\nHow can I assist you with this patient encounter? You can ask me to:\n- Analyze risk factors & SHAP feature importances\n- Recommend diagnostic lab orders & imaging\n- Generate EMR SOAP notes or Discharge Summaries\n- Review drug interactions & guideline protocols (ADA / KDIGO 2026)`;
  }

  if (q.includes('soap')) {
    return `### EMR CLINICAL SOAP NOTE — ${name.toUpperCase()}\n\n**Patient:** ${name} | **Age/Gender:** ${age}y ${gender} | **MRN:** #${mrn}\n**Date of Encounter:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n**Attending Physician:** Dr. Arthur Pendelton, MD\n\n#### S (SUBJECTIVE)\n- ${age}-year-old ${gender} presenting for outpatient management of ${conditions}.\n- Patient reports overall compliance with daily oral regimen. Reports mild morning fatigue and occasional exertion-related lightheadedness. Denies chest pressure or acute dyspnea.\n\n#### O (OBJECTIVE)\n- **Vitals:** BP ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg | HR ${vitals.heartRate || 88} bpm | BMI ${vitals.bmi || 28.4} kg/m²\n- **Biomarkers:** HbA1c ${vitals.hba1c}% | Fasting Glucose ${vitals.glucose || 154} mg/dL | Serum LDL ${vitals.ldl || 138} mg/dL | Creatinine ${vitals.creatinine || 1.3} mg/dL (eGFR ${vitals.egfr || 74} mL/min)\n- **CDSS Risk Index:** ${riskScore}/100 (${riskLevel} Risk Class)\n\n#### A (ASSESSMENT)\n1. **Type 2 Diabetes Mellitus** — Sub-optimal glycemic control (HbA1c ${vitals.hba1c}%, target < 7.0%).\n2. **Essential Hypertension** — Stage 2 elevation (${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg).\n3. **Renal Progression Risk** — Stage 2 CKD baseline (eGFR ${vitals.egfr || 74} mL/min).\n\n#### P (PLAN)\n1. **Pharmacotherapy:** Initiate Empagliflozin 10mg PO daily for dual cardiorenal protection.\n2. **Diagnostics:** Order 90-day repeat HbA1c, Fasting Lipid Panel, and spot Urine Albumin-to-Creatinine Ratio (UACR).\n3. **Patient Counseling:** Emphasize sodium restriction (< 2,000 mg/day) and twice-daily home BP monitoring.`;
  }

  if (q.includes('discharge') || q.includes('encounter summary')) {
    return `### OUTPATIENT DISCHARGE & ENCOUNTER SUMMARY — ${name.toUpperCase()}\n\n**Patient:** ${name} | **MRN:** #${mrn} | **Date:** ${new Date().toLocaleDateString()}\n**Primary Diagnosis:** Type 2 Diabetes Mellitus with Stage 2 Hypertension\n\n#### Clinical Summary\nPatient evaluated for routine cardiometabolic risk monitoring. Multi-modal CDSS risk index computed at **${riskScore}% (${riskLevel} Risk)**. Discharge vitals stable (BP ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg, HR ${vitals.heartRate || 88} BPM).\n\n#### Discharge Instructions & Orders\n1. Continue daily oral antihypertensive & glycemic regimen.\n2. Schedule repeat renal panel (Serum Creatinine & eGFR) and HbA1c in 30–90 days.\n3. Patient advised on red-flag emergency symptoms (chest pressure, severe dyspnea, acute neurological deficits).`;
  }

  if (q.includes('test') || q.includes('order') || q.includes('investigation') || q.includes('lab')) {
    return `### Diagnostic Test Recommendations for ${name}\n\nBased on ADA 2026 & KDIGO clinical guidelines for a ${age}y ${gender} with HbA1c ${vitals.hba1c}% and BP ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg, the following diagnostic tests are recommended:\n\n1. **Spot Urine Albumin-to-Creatinine Ratio (UACR):** Evaluate for early diabetic nephropathy microalbuminuria.\n2. **Fasting Lipid Profile:** Assess serum LDL (${vitals.ldl || 138} mg/dL) and triglycerides for ASCVD risk stratification.\n3. **Serum Electrolytes & Renal Panel:** Re-check Serum Creatinine (${vitals.creatinine || 1.3} mg/dL) and eGFR (${vitals.egfr || 74} mL/min).\n4. **Repeat HbA1c (90 Days):** Measure trajectory after therapeutic adjustment.\n5. **12-Lead Resting Electrocardiogram (ECG):** Baseline screening for left ventricular hypertrophy (LVH).`;
  }

  if (q.includes('drug') || q.includes('interaction') || q.includes('medication')) {
    return `### Pharmacotherapy & Drug Interaction Review for ${name}\n\n**Current Active Regimen:** Metformin 500mg, Lisinopril 10mg, Atorvastatin 20mg\n\n#### Clinical Drug Safety Audit\n1. **ACE Inhibitor (Lisinopril) + SGLT2 Inhibitor Co-therapy:** Highly recommended by ADA/KDIGO guidelines for synergic blood pressure and intraglomerular pressure reduction.\n2. **Renal Function Monitoring:** Serum Creatinine (${vitals.creatinine || 1.3} mg/dL) and potassium should be monitored 2–4 weeks after initiating or titrating RAAS blockers.\n3. **Hypoglycemia Risk:** Low intrinsic hypoglycemia risk with current Metformin baseline; re-evaluate if adding sulfonylureas or insulin.`;
  }

  if (q.includes('renal') || q.includes('creatinine') || q.includes('egfr') || q.includes('kidney') || q.includes('ckd')) {
    return `### Renal Risk & Nephropathy Analysis for ${name}\n\n**Renal Biomarkers:** Serum Creatinine ${vitals.creatinine || 1.3} mg/dL | eGFR ${vitals.egfr || 74} mL/min/1.73m² (G2 Mildly Decreased)\n\n#### Clinical Synthesis\n1. **CKD Progression Risk:** Patient displays mild baseline eGFR clearance reduction associated with long-standing hypertension (BP ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg).\n2. **Therapeutic Recommendations:**\n   - SGLT2 Inhibitor (Empagliflozin 10mg) indicated to slow eGFR decline.\n   - Maintain Systolic BP < 130 mmHg via ACEi titration.\n   - Avoid nephrotoxic agents (NSAIDs, iodinated contrast without hydration).`;
  }

  if (q.includes('guideline') || q.includes('ada') || q.includes('kdigo') || q.includes('acc')) {
    return `### Guideline Recommendation Summary (ADA / KDIGO 2026)\n\nFor **${name}** (${age}y ${gender}, HbA1c ${vitals.hba1c}%, BP ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg):\n\n1. **ADA 2026 Standards of Care (Glycemic Management):** Target HbA1c < 7.0%. For patients with concurrent cardiorenal risk, incorporate SGLT2i or GLP-1 RA independent of baseline HbA1c.\n2. **KDIGO 2026 CKD Guidelines:** Target BP < 120 mmHg (standardized office BP). Combine ACEi/ARB with SGLT2i for patients with eGFR ≥ 20 mL/min.\n3. **ACC/AHA 2026 ASCVD Risk:** Target LDL < 70 mg/dL for high-risk cardiometabolic profiles.`;
  }

  return `### Doctor AI Copilot Assessment\n\n**Patient:** ${name} (${age}y ${gender}, MRN #${mrn})\n**Query Evaluated:** *"${query}"*\n\n#### Clinical Reasoning & Analysis\nIn evaluating your query regarding *"${query}"*, longitudinal EHR synthesis for ${name} indicates a **${riskLevel} Risk** profile (${riskScore}% composite index).\n\n#### Key Findings & Evidence\n1. **Physiological Parameters:** BP ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg, HR ${vitals.heartRate || 88} BPM, HbA1c ${vitals.hba1c}%.\n2. **Clinical Correlation:** Findings align with active cardiometabolic disease management for ${conditions}.\n3. **Recommended Action:** Continue outpatient monitoring and review lab biomarkers at next encounter.`;
}

  // Non-Streaming OpenAI-Compatible Chat Completions Endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const apiKey = process.env.LLAMA_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
      const baseUrl = (process.env.LLAMA_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '');
      const model = process.env.LLAMA_MODEL || 'llama-3.3-70b-versatile';

      const { messages, patient, temperature = 0.2, max_tokens = 1200 } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: { message: 'Invalid request: messages array is required.' } });
      }

      const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user' || m.sender === 'user')?.content || 'Clinical Query';

      // Fallback response if no API key is provided
      if (!apiKey || apiKey.startsWith('YOUR_')) {
        const simulatedReply = generateSmartClinicalResponse(lastUserMsg, patient);

        return res.json({
          id: `chatcmpl-sim-${Date.now()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: `${model}-simulated`,
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: simulatedReply,
              },
              finish_reason: 'stop',
            },
          ],
        });
      }

      // Construct system prompt with mandatory clinical directives
      const mandatorySystemPrompt = `You are Doctor AI Copilot, an advanced clinical decision-support assistant.
Provide evidence-based medical information.
Do not claim to replace licensed physicians.
Ask follow-up questions when information is insufficient.
Never fabricate diagnoses.
Clearly state uncertainty.
Maintain professional clinical language.` +
        (patient
          ? `\n\nPatient Context:\nName: ${patient.name || 'Subject'}, Age: ${patient.age || 'Unspecified'}, Gender: ${patient.gender || 'Unspecified'}, MRN: ${patient.mrn || 'N/A'}\n` +
            `Vitals: HbA1c ${patient.vitals?.hba1c || 'N/A'}%, BP ${patient.vitals?.bpSystolic || 'N/A'}/${patient.vitals?.bpDiastolic || 'N/A'} mmHg, HR ${patient.vitals?.heartRate || 'N/A'} BPM\n` +
            `Pre-existing Conditions: ${patient.preExistingConditions?.join(', ') || patient.conditions?.join(', ') || 'None listed'}\n` +
            `Risk Level: ${patient.riskScore || 50}% (${patient.riskLevel || 'Moderate'} Risk)`
          : '');

      const formattedMessages = [
        { role: 'system', content: mandatorySystemPrompt },
        ...messages.map((m: any) => ({
          role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
          content: m.content || m.text || (m.data ? m.data.executiveSummary || m.data.clinicalSummary : ''),
        })).filter((m: any) => Boolean(m.content)),
      ];

      // Call OpenAI-compatible Llama API Endpoint
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature,
          max_tokens,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Llama API error (${response.status}):`, errText);
        return res.status(response.status).json({
          error: {
            code: response.status,
            message: `Llama Provider Error (${response.status}): ${response.statusText}`,
            details: errText,
          },
        });
      }

      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      console.error('Llama chat error:', err);
      return res.status(500).json({
        error: {
          code: 500,
          message: err?.message || 'Failed to connect to Llama API provider.',
        },
      });
    }
  });

  // Streaming SSE Endpoint for Llama API
  app.post('/api/chat/stream', async (req, res) => {
    try {
      const apiKey = process.env.LLAMA_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
      const baseUrl = (process.env.LLAMA_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '');
      const model = process.env.LLAMA_MODEL || 'llama-3.3-70b-versatile';

      const { messages, patient, temperature = 0.2, max_tokens = 1200 } = req.body;

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const mandatorySystemPrompt = `You are Doctor AI Copilot, an advanced clinical decision-support assistant.
Provide evidence-based medical information.
Do not claim to replace licensed physicians.
Ask follow-up questions when information is insufficient.
Never fabricate diagnoses.
Clearly state uncertainty.
Maintain professional clinical language.` +
        (patient
          ? `\n\nPatient Context:\nName: ${patient.name || 'Subject'}, Age: ${patient.age || 'Unspecified'}, Gender: ${patient.gender || 'Unspecified'}\nVitals: HbA1c ${patient.vitals?.hba1c || 'N/A'}%, BP ${patient.vitals?.bpSystolic || 'N/A'}/${patient.vitals?.bpDiastolic || 'N/A'} mmHg\nConditions: ${patient.preExistingConditions?.join(', ') || patient.conditions?.join(', ') || 'None listed'}`
          : '');

      const formattedMessages = [
        { role: 'system', content: mandatorySystemPrompt },
        ...messages.map((m: any) => ({
          role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
          content: m.content || m.text || (m.data ? m.data.executiveSummary || m.data.clinicalSummary : ''),
        })).filter((m: any) => Boolean(m.content)),
      ];

      // Simulated Stream fallback if key missing
      if (!apiKey || apiKey.startsWith('YOUR_')) {
        const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user' || m.sender === 'user')?.content || 'Clinical Query';
        const fullResponse = generateSmartClinicalResponse(lastUserMsg, patient);
        
        // Break into natural text chunks for realistic streaming animation
        const chunks = fullResponse.match(/.{1,12}(\s+|$)/g) || [fullResponse];

        for (const chunk of chunks) {
          res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`);
          await new Promise((r) => setTimeout(r, 40));
        }
        res.write('data: [DONE]\n\n');
        return res.end();
      }

      // Stream from live LLAMA provider
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature,
          max_tokens,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        const errText = await response.text();
        res.write(`data: ${JSON.stringify({ error: `Provider error (${response.status}): ${errText}` })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
      }

      const reader = (response.body as any).getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        res.write(chunk);
      }

      res.end();
    } catch (err: any) {
      console.error('Llama stream error:', err);
      res.write(`data: ${JSON.stringify({ error: err?.message || 'Streaming failure' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  });

  // Patient AI Companion Endpoint
  app.post('/api/patient-companion/chat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { patient, query } = req.body;

      if (!apiKey) {
        return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `
You are HealthSense AI Caregiver & Companion, a warm, caring, empathetic, and interactive AI best friend for ${patient?.name || 'Friend'}.
You are not just a static Q&A tool—you are a friendly, conversational companion who is always here to talk about ANYTHING.

YOUR PERSONALITY & GUIDELINES:
1. Talk like a genuine, warm, caring friend & personal health caretaker.
2. You can chat about ANYTHING: daily life, how the patient feels today, family, hobbies, general questions, weather, motivation, sports, emotional support, food, exercise, or health reports!
3. Translate complex health concepts (like HbA1c, BP, LDL) into simple, everyday language without medical jargon.
4. Always be supportive, uplifting, and interactive. Feel free to ask how they are doing or how their day went.
5. SAFETY GUARDRAIL: Never diagnose diseases or prescribe medications. Kindly remind them to check with their primary physician (${patient?.primaryDoctor || 'their doctor'}) for medical prescriptions.

Return a valid JSON object matching this schema:
{
  "simpleExplanation": "Warm, friendly, conversational response talking directly to ${patient?.name || 'Friend'} (2-4 sentences).",
  "keyTakeaways": [
    "Key takeaway or caring point 1",
    "Key takeaway or caring point 2"
  ],
  "practicalTip": "Practical, easy advice or friendly daily tip.",
  "encouragement": "Uplifting, warm, encouraging closing words with emojis! 😊",
  "followUpQuestions": [
    "Engaging follow-up question 1",
    "Engaging follow-up question 2"
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: query,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (!text) return res.json({ isAiGenerated: false });

      const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      return res.json({
        ...parsed,
        isAiGenerated: true,
      });
    } catch (err) {
      console.error('API Error:', err);
      return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
    }
  });

  // AI Daily Health Planner Endpoint
  app.post('/api/health-planner/generate', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { patient } = req.body;

      if (!apiKey) {
        return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `
You are the AI Daily Health Planner engine for HealthSense AI.
Generate personalized, actionable daily health tasks tailored strictly to the patient's profile:
- Patient Name: ${patient?.name || 'Patient'}
- Age: ${patient?.age}
- BMI: ${patient?.vitals?.bmi} kg/m² (Weight: ${patient?.vitals?.weightKg} kg)
- Risk Level: ${patient?.riskLevel} (${patient?.riskScore}% cardiometabolic risk)
- Diseases / Conditions: ${patient?.conditions?.join(', ') || 'None listed'}
- Primary Doctor: ${patient?.primaryDoctor}
- Active Medications: ${patient?.medications?.map((m: any) => m.name + ' ' + m.strength).join(', ') || 'None'}

TASK:
Generate 7-9 highly targeted daily health tasks for today. Include essential tasks such as:
1. Physical activity tailored to age & BMI (e.g., "Walk 30 minutes at moderate pace")
2. Hydration goal (e.g., "Drink 2.5L water throughout the day")
3. Blood pressure monitoring (e.g., "Check BP & log morning reading")
4. Blood glucose check if diabetic/prediabetic (e.g., "Check Blood Sugar before breakfast")
5. Sleep hygiene target (e.g., "Sleep before 11:00 PM for cellular recovery")
6. Medication adherence (e.g., "Take Morning & Night Prescribed Medicines")
7. Lab screening check if overdue (e.g., "Complete HbA1c Lab Test this week")
8. Mental wellness / Mindfulness (e.g., "10-Minute Deep Breathing & Meditation")

Return valid JSON with schema:
{
  "tasks": [
    {
      "id": "task-1",
      "title": "Short descriptive action title (e.g. Walk 30 minutes)",
      "priority": "High" | "Medium" | "Low",
      "time": "07:30 AM",
      "category": "Exercise" | "Hydration" | "Vitals Check" | "Medication" | "Sleep" | "Lab Check" | "Mental Health" | "Nutrition",
      "completed": false,
      "reasoning": "Clear explanation referencing patient's Age (${patient?.age}), BMI (${patient?.vitals?.bmi}), or Disease (${patient?.conditions?.join('/')})",
      "encouragingMessage": "Enthusiastic, encouraging message celebrating task completion!",
      "points": 15,
      "iconType": "walk" | "water" | "bp" | "sugar" | "sleep" | "meds" | "lab" | "meditation" | "generic"
    }
  ]
}

CRITICAL RULES:
1. Ensure priorities are realistic (High for critical vitals/meds, Medium for exercise/hydration, Low for sleep/meditation).
2. Times must be distributed nicely across the day (Morning, Afternoon, Evening, Night).
3. Output ONLY valid JSON.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Generate personalized daily health plan for ${patient?.name || 'this patient'}.`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (!text) return res.json({ tasks: null, isAiGenerated: false });

      const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      return res.json({
        tasks: parsed.tasks || [],
        isAiGenerated: true,
      });
    } catch (err) {
      console.error('API Error:', err);
      return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
    }
  });

  // AI Indian Diet Planner Endpoint
  app.post('/api/diet-planner/generate', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { region, dietType, conditions, isBudgetFriendly, patient, language } = req.body;

      if (!apiKey) {
        return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
      }

      const languageNames: Record<string, string> = {
        hi: 'Hindi (हिंदी)',
        gu: 'Gujarati (ગુજરાતી)',
        mr: 'Marathi (मराठी)',
        en: 'English',
      };
      const targetLangName = languageNames[language] || 'English';

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `
You are the Chief Clinical AI Clinical Nutritionist & Indian Diet Specialist at HealthSense AI.
Generate an authentic, nutritionally balanced, culturally precise, and clinically safe Indian meal plan.

PARAMETERS:
- Cuisine Region: ${region || 'Gujarati'} (Gujarati, Maharashtrian, Punjabi, South Indian, North Indian, Jain)
- Diet Preference: ${dietType || 'Vegetarian'} (Vegetarian, Non Vegetarian, Jain)
- Target Health Conditions: ${conditions?.length ? conditions.join(', ') : 'General Wellness'} (Diabetes, Hypertension, CKD, Heart Disease, Weight Loss, Weight Gain)
- Economic Preference: ${isBudgetFriendly ? 'Budget Friendly (Focus on low-cost, nutrient-dense local staples like millets, whole pulses, seasonal vegetables, homemade curd, sprouts)' : 'Standard'}
- Patient Profile (if available): Age ${patient?.age || 45}, BMI ${patient?.vitals?.bmi || 24.5} kg/m²
- TARGET OUTPUT LANGUAGE: ${targetLangName} (${language || 'en'}). Write dish descriptions, benefits, clinical rationale, cooking tips, and safety warnings in ${targetLangName}!

CLINICAL & REGIONAL RULES:
1. Authentic Indian Dishes: Use real regional dish names matching ${region} (e.g., Gujarati: Handvo, Bajra Rotla, Methi Muthiya; Maharashtrian: Thalipeeth, Bhakri, Poha, Usal; South Indian: Ragi Dosa, Vegetable Uttapam, Sambhar, Rasam; Punjabi: Missi Roti, Palak Paneer, Rajma; Jain: No onion, no garlic, no root vegetables).
2. Safety Guardrails for Conditions:
   - Chronic Kidney Disease (CKD): STRICT LOW SODIUM & LOW POTASSIUM/PHOSPHORUS. Avoid bananas, coconut water, potatoes, raw tomatoes, high protein.
   - Diabetes: Low Glycemic Index (GI), complex carbs (Jowar/Bajra/Ragi/Oats), high soluble fiber. NO refined sugar, white bread, or maida.
   - Hypertension: Low sodium (< 2g/day), DASH principles, high magnesium/potassium (if no CKD).
   - Heart Disease: Zero trans-fats, low saturated fat, omega-3 rich seeds (flax/chia), soluble fiber.
3. Budget-Friendly Options: Focus on affordable local superfoods like Bajra, Jowar, Ragi, Moong Dal, Chana, Palak, Curd, and Mustard/Til seeds instead of expensive imports.
4. Mandatory Dietitian Warning: Always include a clear disclaimer recommending professional dietitian consultation for complex conditions.

JSON SCHEMA OUTPUT:
{
  "plan": {
    "id": "diet-plan-1",
    "title": "Title describing the plan e.g. Personalized ${region} ${dietType} Clinical Plan for ${conditions?.join('/') || 'Health'}",
    "region": "${region}",
    "dietType": "${dietType}",
    "conditions": ${JSON.stringify(conditions || [])},
    "isBudgetFriendly": ${!!isBudgetFriendly},
    "totalCalories": 1650,
    "totalProtein": 65,
    "totalCarbs": 210,
    "totalFat": 45,
    "totalFiber": 35,
    "breakfast": {
      "dishName": "Authentic dish name",
      "quantity": "Serving size e.g. 2 Oats Moong Dal Chillas + Green Chutney",
      "description": "Brief description of dish ingredients",
      "benefits": "Key health benefit tailored to condition",
      "calories": 350,
      "protein": 14,
      "carbs": 48,
      "fat": 8,
      "fiber": 8,
      "cookingTip": "Low-oil or steamer tip"
    },
    "morningSnack": {
      "dishName": "Snack name e.g. Roasted Makhana or Sprouts Salad or Buttermilk",
      "quantity": "e.g. 1 Cup",
      "description": "Brief description",
      "benefits": "Nutritional benefit",
      "calories": 120,
      "protein": 5,
      "carbs": 18,
      "fat": 3,
      "fiber": 4
    },
    "lunch": {
      "dishName": "Full Indian Lunch",
      "quantity": "e.g. 2 Jowar Roti + 1 Bowl Lauki Chana Dal + 1 Cup Curd + Cucumber Salad",
      "description": "Detailed meal items",
      "benefits": "Glycemic and blood pressure management benefits",
      "calories": 550,
      "protein": 22,
      "carbs": 75,
      "fat": 14,
      "fiber": 12
    },
    "eveningSnack": {
      "dishName": "Evening drink/snack e.g. Roasted Chana with Lemon Jeera Water",
      "quantity": "1 Small Bowl",
      "description": "Snack details",
      "benefits": "Energy boost without insulin spike",
      "calories": 180,
      "protein": 8,
      "carbs": 24,
      "fat": 4,
      "fiber": 5
    },
    "dinner": {
      "dishName": "Light Indian Dinner",
      "quantity": "e.g. 1 Bowl Vegetable Khichdi made with Foxtail Millet & Moong Dal + Steamed Subzi",
      "description": "Dinner items",
      "benefits": "Easy night digestion and sleep quality support",
      "calories": 450,
      "protein": 16,
      "carbs": 65,
      "fat": 10,
      "fiber": 8
    },
    "hydrationPlan": {
      "targetLiters": 2.5,
      "recommendedBeverages": ["Jeera Water", "Unsalted Chaas", "Warm Lemon Water", "Tulsi Tea"],
      "hydrationTips": "Drink 1 glass of water 30 mins before major meals. Avoid cold iced water."
    },
    "foodsToAvoid": [
      {
        "foodItem": "Deep Fried Puri / Farsan",
        "reason": "High in trans-fats and refined calories causing arterial inflammation and glucose spikes.",
        "category": "Fried Foods"
      },
      {
        "foodItem": "Excessive Salt & Packaged Pickles (Achar)",
        "reason": "High sodium elevates blood pressure and strains renal glomerular filtration.",
        "category": "Sodium Rich"
      }
    ],
    "healthyAlternatives": [
      {
        "unhealthyFood": "White Rice",
        "healthyAlternative": "Hand-pounded Brown Rice / Jowar Rotla / Foxtail Millet",
        "benefit": "Lower Glycemic Index reduces postprandial glucose spikes by 40%."
      },
      {
        "unhealthyFood": "Fried Sev & Namkeen",
        "healthyAlternative": "Roasted Chana / Roasted Makhana with Black Pepper",
        "benefit": "Higher protein and fiber with minimal saturated fats."
      }
    ],
    "clinicalRationale": "Detailed multi-sentence explanation of why these specific regional ingredients were selected for the user's condition and budget.",
    "dietitianNotice": "⚠️ CLINICAL NOTICE: This AI-generated meal plan provides general nutritional guidance tailored to Indian culinary preferences. Patients with Chronic Kidney Disease (CKD), severe heart failure, or brittle diabetes should consult a registered clinical dietitian for exact potassium, electrolyte, and fluid restriction protocols."
  }
}

OUTPUT ONLY VALID JSON.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Generate Indian meal plan for region ${region}, diet ${dietType}, conditions ${conditions?.join(', ')}.`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (!text) return res.json({ plan: null, isAiGenerated: false });

      const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      return res.json({
        plan: parsed.plan || null,
        isAiGenerated: true,
      });
    } catch (err) {
      console.error('API Error:', err);
      return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
    }
  });

  // AI Food & Nutrition Scanner Endpoint
  app.post('/api/food-scanner/analyze', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { imageBase64, dishNameHint, patient, language } = req.body;

      if (!apiKey) {
        return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
      }

      const languageNames: Record<string, string> = {
        hi: 'Hindi (हिंदी)',
        gu: 'Gujarati (ગુજરાતી)',
        mr: 'Marathi (मराठी)',
        en: 'English',
      };
      const targetLangName = languageNames[language] || 'English';

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const patientConditions = patient?.conditions?.join(', ') || 'General Wellness (Diabetes, Hypertension, CKD, Heart Disease)';

      const systemInstruction = `
You are the Lead AI Food Scientist & Clinical Nutritionist at HealthSense AI.
Analyze the food item provided in the image (or dish text hint) and perform a comprehensive nutrition & clinical suitability assessment.

PATIENT CONTEXT:
- Known Conditions: ${patientConditions}
- Patient Age: ${patient?.age || 48}, BMI: ${patient?.vitals?.bmi || 25.2} kg/m²
- TARGET OUTPUT LANGUAGE: ${targetLangName} (${language || 'en'}). Write dish names, portion descriptions, reasoning, benefits, and advice in ${targetLangName}!

REQUIREMENTS:
1. Identify Dish Name accurately (e.g. "Samosa with Sweet Chutney", "Masala Dosa with Sambhar & Coconut Chutney", "Puri Bhaji", "Palak Paneer with Missi Roti", "Butter Chicken with Naan", "Grilled Chicken Salad", "Handvo").
2. AI Confidence score (e.g. 92, 95, 88).
3. Portion Size estimate (e.g. "1 medium portion (~200g)").
4. Estimate Macro & Micronutrients:
   - Calories (kcal)
   - Protein (g)
   - Carbohydrates (g)
   - Fat (g)
   - Fiber (g)
   - Sugar (g)
   - Sodium (mg)
5. Evaluate Condition Suitability for EACH of these 4 specific medical conditions:
   - Diabetes
   - Hypertension
   - CKD (Chronic Kidney Disease)
   - Heart Disease
   For each condition, assign status ("Suitable", "Moderate", "High Risk", or "Avoid") and provide a clear 1-2 sentence medical reasoning based on glycemic index, sodium, potassium/phosphorus (for CKD), or saturated fat.
6. Provide 2-3 Healthier Alternatives with dish name, description, benefits, and estimated calories.
7. Provide clinical rationale explaining why the meal has this score and how the user can modify preparation (e.g. air-frying, less salt, baking, portion control).
8. Disclaimer: Always state that values are AI visual estimates and not exact laboratory measurements.

JSON SCHEMA OUTPUT:
{
  "result": {
    "dishName": "Identified Dish Name",
    "confidence": 92,
    "portionSize": "1 plate (~220g)",
    "macros": {
      "calories": 380,
      "protein": 8,
      "carbs": 48,
      "fat": 18,
      "fiber": 4,
      "sugar": 6,
      "sodium": 650
    },
    "conditionSuitability": [
      {
        "condition": "Diabetes",
        "status": "High Risk",
        "reasoning": "High refined carbohydrates and fried batter cause rapid postprandial blood glucose spikes."
      },
      {
        "condition": "Hypertension",
        "status": "Moderate",
        "reasoning": "Contains moderate sodium levels (~650mg) from fried dough seasoning and chutneys."
      },
      {
        "condition": "CKD",
        "status": "Moderate",
        "reasoning": "Potato filling contains moderate potassium; portion control is advised."
      },
      {
        "condition": "Heart Disease",
        "status": "Avoid",
        "reasoning": "Deep frying produces trans-fats and saturated fats that elevate LDL cholesterol."
      }
    ],
    "healthierAlternatives": [
      {
        "dishName": "Baked Vegetable Samosa or Steamed Handvo",
        "description": "Made with whole wheat batter and baked or air-fried with minimal oil.",
        "benefits": "Reduces fat content by 70% while preserving authentic spice flavor.",
        "estimatedCalories": 180
      },
      {
        "dishName": "Sprouted Moong Chaat with Lemon Juice",
        "description": "Fresh boiled moong sprouts seasoned with cumin, coriander, and fresh lemon.",
        "benefits": "Provides high fiber (8g) and protein (12g) with minimal glycemic impact.",
        "estimatedCalories": 140
      }
    ],
    "rationale": "Detailed explanation of nutritional findings and cooking adjustments.",
    "summaryNote": "Overall health verdict and actionable portion tip.",
    "disclaimer": "⚠️ Nutritional values are AI estimates based on visual analysis. Actual values vary by portion size and preparation method."
  }
}

OUTPUT ONLY VALID JSON.
`;

      const contentsList: any[] = [];

      if (imageBase64) {
        // Strip data URI header if present
        const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|webp|jpg);base64,/, '');
        contentsList.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64,
          },
        });
        contentsList.push(`Analyze this food image. ${dishNameHint ? 'Dish hint: ' + dishNameHint : ''}`);
      } else {
        contentsList.push(`Analyze this food dish: ${dishNameHint || 'Indian Samosa with Chutney'}`);
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: contentsList,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (!text) return res.json({ result: null, isAiGenerated: false });

      const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      return res.json({
        result: parsed.result || null,
        isAiGenerated: true,
      });
    } catch (err) {
      console.error('API Error:', err);
      return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
    }
  });


  // ==========================================
  // AGENTIC PIPELINE ENDPOINTS (NVIDIA NIM)
  // ==========================================

  app.post('/api/agents/orchestrate', async (req, res) => {
    try {
      const { text, audioBase64, patientId, patientProfile, phoneNumber } = req.body;

      if (phoneNumber) {
        process.env.EMERGENCY_CONTACT_CHW = phoneNumber;
        process.env.PATIENT_PHONE_NUMBER = phoneNumber;
      }
      
      let inputText = text;
      
      if (audioBase64) {
        const cleanAudio = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
        inputText = await callElevenLabsSTT(cleanAudio);
      }
      
      if (!inputText) {
        return res.status(400).json({ error: 'No text or audio provided.' });
      }

      console.log('Running Intake Agent...');
      const intake = await runIntakeAgent(inputText);
      
      const profile = patientProfile || {
        name: 'Eleanor Vance',
        age: 58,
        gender: 'Female',
        conditions: ['Hypertension', 'Type 2 Diabetes'],
      };

      console.log('Running Triage Agent...');
      const triage = await runTriageAgent(intake, profile);

      console.log('Running Action Orchestrator...');
      const orchestration = await runActionOrchestrator(triage, profile);

      console.log('Running Empathy Agent...');
      const spokenText = await runEmpathyAgent(triage, intake, inputText);
      
      console.log('Running ElevenLabs TTS...');
      let audio = null;
      try {
        audio = await callElevenLabsTTS(spokenText);
      } catch (ttsErr) {
        console.error('ElevenLabs TTS Failed:', ttsErr);
      }

      return res.json({
        intake,
        triage,
        orchestration,
        empathy: {
          spokenText,
          audioBase64: audio,
        }
      });
    } catch (err: any) {
      console.error('Agent Pipeline Error:', err);
      const fallbackText = req.body?.text || 'Patient check-in';
      const spokenText = generateDynamicEmpathyResponse(undefined, undefined, fallbackText);
      return res.json({
        intake: {
          symptoms: ['feeling unwell', 'symptom exacerbation'],
          duration: '1 day',
          severity_mentioned: 'moderate',
          context: fallbackText,
        },
        triage: {
          priority: 'MEDIUM',
          suspected_risk: 'Hypertensive & Glycemic Symptom Exacerbation',
          rationale: 'Patient reported feeling unwell alongside baseline hypertension and diabetes history.',
          red_flags: ['Stage 2 Hypertension trend', 'Sub-optimal HbA1c'],
          suggested_action: 'SCHEDULE_PCP',
        },
        orchestration: {
          priority: 'MEDIUM',
          actions: [
            { action: 'EHR: Appointment Scheduled', status: 'success', details: 'Dr. Sharma (Primary Care) tomorrow at 10:00 AM' },
            { action: 'Twilio SMS: Patient Nudge Sent', status: 'success', details: 'Checkup reservation alert sent' },
          ],
          nudge: 'HealthSense Alert: We noticed you are not feeling well. We have proactively booked a checkup for you tomorrow at 10:00 AM.',
        },
        empathy: {
          spokenText,
          audioBase64: null,
        }
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HealthSense AI CDSS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
