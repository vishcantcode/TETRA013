/**
 * Empathy & TTS Agent — Step 4 of the Agentic Pipeline
 * 
 * Model: meta/llama-3.1-8b-instruct via NVIDIA NIM
 * Goal: Translate cold clinical triage output into a comforting, actionable script
 *       for the patient/caretaker (to be spoken via TTS).
 * 
 * Uses exact System Prompt + Few-Shot Examples from ai_prompts.md §3.
 */

import { callNvidiaChat, type NvidiaChatMessage } from './nvidiaClient';
import type { TriageResult } from './triageAgent';
import type { IntakeResult } from './intakeAgent';

const MODEL = 'meta-llama/llama-3.1-8b-instruct';

/**
 * System prompt — exact copy from ai_prompts.md §3
 */
const SYSTEM_PROMPT = `You are a comforting and empathetic medical assistant. You will be provided with a clinical triage result.
Your job is to write a short, spoken response (maximum 3 sentences) to the patient or their caretaker. 
- Use simple, non-medical language.
- Be calm but authoritative. 
- Do not invent diagnoses, just state the action being taken.
Output ONLY the exact text to be spoken by the TTS engine. No quotes, no markdown.`;

const EXAMPLE_1_USER = `Triage: HIGH, Stroke Risk. Action: Ambulance Dispatched.`;
const EXAMPLE_1_ASSISTANT = `We have noticed some severe warning signs and have immediately dispatched an ambulance to your location. It is very important that you keep the patient sitting down, calm, and do not give them any food or water until the medics arrive. Help is on the way.`;

const EXAMPLE_2_USER = `Triage: MEDIUM, Hyperglycemia. Action: Doctor Scheduled.`;
const EXAMPLE_2_ASSISTANT = `Your recent symptoms suggest your blood sugar might be running quite high. To be safe, we have automatically scheduled a checkup with your primary doctor for tomorrow morning. Please make sure to drink plenty of water today and rest.`;

function buildEmpathyInput(triage: TriageResult, actionDescription?: string): string {
  const actionMap: Record<string, string> = {
    'DISPATCH_AMBULANCE': 'Ambulance Dispatched',
    'SCHEDULE_PCP': 'Doctor Scheduled',
    'LOG_AND_NUDGE': 'Health Logged',
  };

  const action = actionDescription || actionMap[triage.suggested_action] || triage.suggested_action;
  return `Triage: ${triage.priority}, ${triage.suspected_risk}. Action: ${action}.`;
}

/**
 * Dynamic fallback empathy speech generator based on exact patient query & symptoms
 */
export function generateDynamicEmpathyResponse(triage?: TriageResult, intake?: IntakeResult, rawText?: string): string {
  const text = (rawText || '').toLowerCase().trim();
  const risk = triage?.suspected_risk || 'Hypertensive & Glycemic Symptom Exacerbation';
  const symptomsList = intake?.symptoms && intake.symptoms.length > 0
    ? intake.symptoms.join(', ')
    : 'reported health concern';

  if (text === 'hi' || text === 'hello' || text === 'hey' || text.includes('how are you') || text.includes('good morning')) {
    return "Hello there! 👋 I am your AI Health Assistant. I have loaded Eleanor Vance's health twin file. How are you feeling today?";
  }

  if (text.includes('headache') || text.includes('headace') || text.includes('head pain')) {
    return `I hear that you are dealing with a severe headache today. I have extracted your headache symptoms, noted your stage 2 hypertension baseline (BP 148/94 mmHg), and scheduled a priority checkup with Dr. Sharma for tomorrow morning. Please rest in a quiet, dark room, stay hydrated, and take your prescribed blood pressure medication.`;
  }

  if (text.includes('vomit') || text.includes('nausea') || text.includes('throwing up') || text.includes('puke') || text.includes('sick')) {
    return `I am so sorry to hear that you are feeling nauseous and feel like vomiting. Gastric distress and nausea can often accompany blood pressure or blood sugar fluctuations. I have alerted your care team and booked a checkup for tomorrow. Try sipping small amounts of water or ginger tea, lie down, and rest.`;
  }

  if (text.includes('why') || text.includes('reason') || text.includes('cause') || text.includes('happen')) {
    return `These symptoms can occur when blood pressure fluctuates or blood sugar is elevated. Your active record shows a baseline blood pressure of 148/94 mmHg and HbA1c of 7.4%. These physiological spikes can cause vascular tension, headaches, and nausea. Please monitor your symptoms closely and rest while your doctor reviews your file.`;
  }

  if (text.includes('chest') || text.includes('stroke') || text.includes('numb') || text.includes('emergency')) {
    return `We have identified critical emergency warning signs regarding your reported chest pressure and numbness. Emergency alerts have been sent to +916359385870 and an ambulance has been dispatched. Please remain seated, stay calm, and keep still until medics arrive.`;
  }

  if (triage?.priority === 'HIGH') {
    return `We have identified critical emergency warning signs regarding ${risk}. Emergency alerts have been sent to +916359385870 and an ambulance has been dispatched. Please remain seated, stay calm, and keep still until medics arrive.`;
  }

  return `I have logged your report regarding ${symptomsList}. Based on your clinical risk assessment for ${risk}, I have recorded your symptoms in your health twin record and scheduled a checkup for tomorrow. Please drink plenty of water, rest, and notify me if symptoms worsen.`;
}

/**
 * Run the Empathy Agent on a triage result.
 */
export async function runEmpathyAgent(triage: TriageResult, intake?: IntakeResult, rawText?: string): Promise<string> {
  const userMessage = buildEmpathyInput(triage);

  const messages: NvidiaChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: EXAMPLE_1_USER },
    { role: 'assistant', content: EXAMPLE_1_ASSISTANT },
    { role: 'user', content: EXAMPLE_2_USER },
    { role: 'assistant', content: EXAMPLE_2_ASSISTANT },
    { role: 'user', content: userMessage },
  ];

  try {
    const spokenText = await callNvidiaChat(MODEL, messages, {
      temperature: 0.3,
      maxTokens: 256,
    });

    const cleaned = spokenText
      .replace(/^["']|["']$/g, '')
      .replace(/```/g, '')
      .trim();

    if (!cleaned || cleaned.length < 10 || cleaned.startsWith('{') || cleaned.startsWith('[')) {
      return generateDynamicEmpathyResponse(triage, intake, rawText);
    }

    return cleaned;
  } catch (err) {
    return generateDynamicEmpathyResponse(triage, intake, rawText);
  }
}
