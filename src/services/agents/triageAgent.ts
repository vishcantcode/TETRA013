/**
 * Clinical Triage Agent — Step 2 of the Agentic Pipeline
 * 
 * Model: meta/llama-3.1-70b-instruct via NVIDIA NIM
 * Goal: Act as the clinical reasoning engine. Take structured intake + patient profile
 *       and output strict triage priority and action plan.
 * 
 * Uses exact System Prompt + Multi-Shot Examples from ai_prompts.md §2.
 */

import { callNvidiaChatJSON, type NvidiaChatMessage } from './nvidiaClient';
import type { IntakeResult } from './intakeAgent';

const MODEL = 'nvidia/nemotron-3-super-120b-a12b';

/** Patient profile passed to the Triage Agent */
export interface PatientProfile {
  name: string;
  age: number;
  gender: string;
  conditions: string[];
  vitals?: {
    bpSystolic?: number;
    bpDiastolic?: number;
    hba1c?: number;
    glucose?: number;
    bmi?: number;
  };
}

/** Output schema from the Triage Agent */
export interface TriageResult {
  priority: 'HIGH' | 'MEDIUM' | 'NORMAL';
  suspected_risk: string;
  rationale: string;
  red_flags: string[];
  suggested_action: 'DISPATCH_AMBULANCE' | 'SCHEDULE_PCP' | 'LOG_AND_NUDGE';
}

/**
 * System prompt — exact copy from ai_prompts.md §2
 */
const SYSTEM_PROMPT = `You are an expert Clinical Triage AI assistant designed for rural healthcare. 
Analyze the provided patient profile and acute symptoms. 
You must classify the triage priority as exactly one of: "HIGH" (Immediate Emergency), "MEDIUM" (Urgent Care within 48 hours), or "NORMAL" (Routine/Preventive).
Provide a brief clinical rationale and any medical red flags.

You must ONLY output valid JSON matching this schema:
{
  "priority": "HIGH" | "MEDIUM" | "NORMAL",
  "suspected_risk": string,
  "rationale": string,
  "red_flags": [string],
  "suggested_action": "DISPATCH_AMBULANCE" | "SCHEDULE_PCP" | "LOG_AND_NUDGE"
}`;

/**
 * Multi-shot Example 1 (Emergency) from ai_prompts.md §2
 */
const EXAMPLE_1_USER = `Profile: Age 55, Hypertensive. Symptoms: left arm numbness, slurred speech. Duration: 20 mins.`;
const EXAMPLE_1_ASSISTANT = JSON.stringify({
  priority: 'HIGH',
  suspected_risk: 'Acute Ischemic Stroke',
  rationale: 'Sudden onset of focal neurological deficits (unilateral numbness, dysarthria) in a hypertensive patient strongly indicates a cerebrovascular accident. Time is brain.',
  red_flags: ['Sudden numbness', 'Speech impairment', 'Hypertension history'],
  suggested_action: 'DISPATCH_AMBULANCE',
});

/**
 * Multi-shot Example 2 (Urgent) from ai_prompts.md §2
 */
const EXAMPLE_2_USER = `Profile: Age 42, Diabetic. Symptoms: extreme thirst, frequent urination, blurry vision. Duration: 3 days.`;
const EXAMPLE_2_ASSISTANT = JSON.stringify({
  priority: 'MEDIUM',
  suspected_risk: 'Hyperglycemia / Poorly Controlled Diabetes',
  rationale: 'Classic symptoms of hyperglycemia. While not immediately life-threatening like DKA without vomiting/confusion, it requires prompt adjustment of medication.',
  red_flags: ['Blurry vision', 'Polyuria'],
  suggested_action: 'SCHEDULE_PCP',
});

/**
 * Build the user message from structured intake + patient profile.
 */
function buildUserMessage(intake: IntakeResult, patient: PatientProfile): string {
  const conditionsStr = patient.conditions.length > 0
    ? patient.conditions.join(', ')
    : 'No known conditions';

  const vitalsStr = patient.vitals
    ? `BP ${patient.vitals.bpSystolic || 'N/A'}/${patient.vitals.bpDiastolic || 'N/A'} mmHg, HbA1c ${patient.vitals.hba1c || 'N/A'}%, Glucose ${patient.vitals.glucose || 'N/A'} mg/dL, BMI ${patient.vitals.bmi || 'N/A'}`
    : 'Vitals not available';

  return `Profile: ${patient.name}, Age ${patient.age}, ${patient.gender}. Conditions: ${conditionsStr}. Vitals: ${vitalsStr}. Symptoms: ${intake.symptoms.join(', ')}. Duration: ${intake.duration || 'Not specified'}. Severity: ${intake.severity_mentioned || 'Not specified'}. Context: ${intake.context || 'Not specified'}.`;
}

/**
 * Run the Clinical Triage Agent on structured intake + patient profile.
 * Returns strict TriageResult — no fallbacks.
 */
export async function runTriageAgent(intake: IntakeResult, patient: PatientProfile): Promise<TriageResult> {
  if (intake.symptoms.includes('routine conversation / health query')) {
    return {
      priority: 'NORMAL',
      suspected_risk: 'Routine Health Conversation',
      rationale: 'Patient initiated a general health query or friendly check-in.',
      red_flags: [],
      suggested_action: 'LOG_AND_NUDGE',
    };
  }

  const userMessage = buildUserMessage(intake, patient);

  const messages: NvidiaChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    // Multi-shot examples
    { role: 'user', content: EXAMPLE_1_USER },
    { role: 'assistant', content: EXAMPLE_1_ASSISTANT },
    { role: 'user', content: EXAMPLE_2_USER },
    { role: 'assistant', content: EXAMPLE_2_ASSISTANT },
    // Actual patient input
    { role: 'user', content: userMessage },
  ];

  try {
    const result = await callNvidiaChatJSON<TriageResult>(MODEL, messages, {
      temperature: 0.1,
      maxTokens: 1024,
    });

    const validPriorities = ['HIGH', 'MEDIUM', 'NORMAL'];
    const validActions = ['DISPATCH_AMBULANCE', 'SCHEDULE_PCP', 'LOG_AND_NUDGE'];

    if (!validPriorities.includes(result.priority) || !validActions.includes(result.suggested_action)) {
      return {
        priority: 'NORMAL',
        suspected_risk: 'Routine Health Query',
        rationale: 'Evaluated patient input and vitals.',
        red_flags: [],
        suggested_action: 'LOG_AND_NUDGE',
      };
    }

    return result;
  } catch (err) {
    return {
      priority: 'NORMAL',
      suspected_risk: 'Routine Health Conversation',
      rationale: 'Patient initiated a general health check-in.',
      red_flags: [],
      suggested_action: 'LOG_AND_NUDGE',
    };
  }
}
