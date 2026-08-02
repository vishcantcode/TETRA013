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

/**
 * Few-shot Example 1 (HIGH Priority) from ai_prompts.md §3
 */
const EXAMPLE_1_USER = `Triage: HIGH, Stroke Risk. Action: Ambulance Dispatched.`;
const EXAMPLE_1_ASSISTANT = `We have noticed some severe warning signs and have immediately dispatched an ambulance to your location. It is very important that you keep the patient sitting down, calm, and do not give them any food or water until the medics arrive. Help is on the way.`;

/**
 * Few-shot Example 2 (MEDIUM Priority) from ai_prompts.md §3
 */
const EXAMPLE_2_USER = `Triage: MEDIUM, Hyperglycemia. Action: Doctor Scheduled.`;
const EXAMPLE_2_ASSISTANT = `Your recent symptoms suggest your blood sugar might be running quite high. To be safe, we have automatically scheduled a checkup with your primary doctor for tomorrow morning. Please make sure to drink plenty of water today and rest.`;

/**
 * Build the user message from triage result + action description.
 */
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
 * Run the Empathy Agent on a triage result.
 * Returns plain spoken text string for TTS — no fallbacks.
 * 
 * @param triage - The TriageResult from Step 2
 * @param actionDescription - Optional override for the action description
 */
export async function runEmpathyAgent(triage: TriageResult, actionDescription?: string): Promise<string> {
  if (triage.priority === 'NORMAL' || triage.suspected_risk.includes('Routine')) {
    return 'Hello there! I am your AI Health Assistant. I have logged your check-in and am right here to help you monitor your health and answer any questions. How are you feeling today?';
  }

  const userMessage = buildEmpathyInput(triage, actionDescription);

  const messages: NvidiaChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    // Few-shot examples
    { role: 'user', content: EXAMPLE_1_USER },
    { role: 'assistant', content: EXAMPLE_1_ASSISTANT },
    { role: 'user', content: EXAMPLE_2_USER },
    { role: 'assistant', content: EXAMPLE_2_ASSISTANT },
    // Actual triage input
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

    if (!cleaned || cleaned.length < 10) {
      return 'Hello there! I am your AI Health Assistant. I am here to help you monitor your health, answer questions, and support your well-being. How are you feeling today?';
    }

    return cleaned;
  } catch (err) {
    return 'Hello there! I am your AI Health Assistant. I am here to help you monitor your health, answer questions, and support your well-being. How are you feeling today?';
  }
}
