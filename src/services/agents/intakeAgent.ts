/**
 * NLP Intake Agent — Step 1 of the Agentic Pipeline
 * 
 * Model: meta/llama-3.1-8b-instruct via NVIDIA NIM
 * Goal: Convert patient input into clean, structured clinical JSON.
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

const ONE_SHOT_USER = `"My dad was working in the field and suddenly his left arm went completely numb. Now he is slurring his words and looks confused. This just started 20 minutes ago."`;

const ONE_SHOT_ASSISTANT = JSON.stringify({
  symptoms: ['left arm numbness', 'slurred speech', 'confusion'],
  duration: '20 minutes',
  severity_mentioned: 'severe/sudden',
  context: 'working in field',
});

function getFallbackIntake(rawText: string): IntakeResult {
  const text = (rawText || '').toLowerCase().trim();
  
  if (text === 'hi' || text === 'hello' || text === 'hey' || text.includes('how are you') || text.includes('good morning')) {
    return {
      symptoms: ['routine conversation / health query'],
      duration: 'today',
      severity_mentioned: 'mild / conversational',
      context: rawText || 'General conversation',
    };
  }

  const symptomsExtracted: string[] = [];
  if (text.includes('not feeling well') || text.includes('unwell') || text.includes('sick') || text.includes('bad')) {
    symptomsExtracted.push('feeling unwell / malaise');
  }
  if (text.includes('headache') || text.includes('head pain')) {
    symptomsExtracted.push('headache');
  }
  if (text.includes('chest pain') || text.includes('chest pressure')) {
    symptomsExtracted.push('chest pain');
  }
  if (text.includes('dizziness') || text.includes('dizzy') || text.includes('lightheaded')) {
    symptomsExtracted.push('dizziness');
  }
  if (text.includes('fever') || text.includes('temp') || text.includes('hot')) {
    symptomsExtracted.push('elevated body temperature');
  }
  if (text.includes('numbness') || text.includes('numb') || text.includes('weak')) {
    symptomsExtracted.push('focal numbness / weakness');
  }

  if (symptomsExtracted.length === 0) {
    symptomsExtracted.push('reported symptom / health concern');
  }

  return {
    symptoms: symptomsExtracted,
    duration: text.includes('yesterday') ? '1 day' : 'recently',
    severity_mentioned: text.includes('severe') || text.includes('chest') || text.includes('numb') ? 'moderate/high' : 'moderate',
    context: rawText || 'Patient check-in',
  };
}

/**
 * Run the NLP Intake Agent on raw patient text input.
 */
export async function runIntakeAgent(rawText: string): Promise<IntakeResult> {
  try {
    const messages: NvidiaChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: ONE_SHOT_USER },
      { role: 'assistant', content: ONE_SHOT_ASSISTANT },
      { role: 'user', content: `"${rawText}"` },
    ];

    const result = await callNvidiaChatJSON<IntakeResult>(MODEL, messages, {
      temperature: 0.1,
      maxTokens: 512,
      task: 'nlp',
    });

    if (!result || !result.symptoms || !Array.isArray(result.symptoms) || result.symptoms.length === 0) {
      return getFallbackIntake(rawText);
    }

    return result;
  } catch (err) {
    console.warn('Intake Agent API call failed. Using intelligent intake parser:', err);
    return getFallbackIntake(rawText);
  }
}
