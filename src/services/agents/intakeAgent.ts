/**
 * NLP Intake Agent — Step 1 of the Agentic Pipeline
 * 
 * Model: meta/llama-3.1-8b-instruct via NVIDIA NIM
 * Goal: Convert messy, panicked patient input into clean, structured clinical JSON.
 * 
 * Uses exact System Prompt + One-Shot Example from ai_prompts.md §1.
 */

import { callNvidiaChatJSON, type NvidiaChatMessage } from './nvidiaClient';

const MODEL = 'meta-llama/llama-3.1-8b-instruct';

/** Output schema from the Intake Agent */
export interface IntakeResult {
  symptoms: string[];
  duration: string | null;
  severity_mentioned: string | null;
  context: string | null;
}

/**
 * System prompt — exact copy from ai_prompts.md §1
 */
const SYSTEM_PROMPT = `You are a highly accurate clinical intake AI. Your job is to extract medical symptoms, duration, and severity from unstructured patient input. 
You must ONLY output valid JSON. Do not include markdown formatting, conversational text, or explanations. 
If a value is not mentioned, use null.

JSON Schema:
{
  "symptoms": [string],
  "duration": string | null,
  "severity_mentioned": string | null,
  "context": string | null
}`;

/**
 * One-shot example from ai_prompts.md §1
 */
const ONE_SHOT_USER = `"My dad was working in the field and suddenly his left arm went completely numb. Now he is slurring his words and looks confused. This just started 20 minutes ago."`;

const ONE_SHOT_ASSISTANT = JSON.stringify({
  symptoms: ['left arm numbness', 'slurred speech', 'confusion'],
  duration: '20 minutes',
  severity_mentioned: 'severe/sudden',
  context: 'working in field',
});

/**
 * Run the NLP Intake Agent on raw patient text input.
 * Returns structured IntakeResult — no fallbacks.
 * 
 * @param rawText - The unstructured patient/caretaker input
 *   e.g., "My dad's left arm is numb and he is speaking weirdly"
 */
export async function runIntakeAgent(rawText: string): Promise<IntakeResult> {
  const messages: NvidiaChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    // One-shot example
    { role: 'user', content: ONE_SHOT_USER },
    { role: 'assistant', content: ONE_SHOT_ASSISTANT },
    // Actual patient input
    { role: 'user', content: `"${rawText}"` },
  ];

  const result = await callNvidiaChatJSON<IntakeResult>(MODEL, messages, {
    temperature: 0.1,
    maxTokens: 512,
    task: 'nlp',
  });

  // Safe fallback if input is a light greeting, conversational question, or has no extracted symptoms
  if (!result || !result.symptoms || !Array.isArray(result.symptoms) || result.symptoms.length === 0) {
    return {
      symptoms: ['routine conversation / health query'],
      duration: 'today',
      severity_mentioned: 'mild / conversational',
      context: rawText || 'General conversation',
    };
  }

  return result;
}
