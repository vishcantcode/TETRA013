/**
 * Multi-Vendor API Client
 * 
 * NVIDIA NIM — LLM Chat Completions (Nemotron models for NLP & Clinical Reasoning)
 * ElevenLabs — Speech-to-Text (Scribe) and Text-to-Speech (v3)
 * 
 * STRICT NO FALLBACK: Throws on any failure — no mock data, no silent degradation.
 */

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

interface NvidiaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface NvidiaChatRequest {
  model: string;
  messages: NvidiaChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

interface NvidiaChatChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

interface NvidiaChatResponse {
  id: string;
  choices: NvidiaChatChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ==========================================
// API Key Helpers
// ==========================================

function getNvidiaApiKey(task: 'nlp' | 'chat'): string {
  let key;
  switch (task) {
    case 'nlp': key = process.env.NVIDIA_NLP_API_KEY; break;
    case 'chat': key = process.env.NVIDIA_CHAT_API_KEY; break;
  }
  const finalKey = key || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || '';
  if (!finalKey) throw new Error(`NVIDIA ${task.toUpperCase()} API key is not configured.`);
  return finalKey;
}

function getElevenLabsApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY || '';
  if (!key) throw new Error('ElevenLabs API key is not configured.');
  return key;
}

// ==========================================
// NVIDIA NIM — LLM Chat
// ==========================================

/**
 * Call NVIDIA NIM Chat Completions API (OpenAI-compatible).
 */
export async function callNvidiaChat(
  model: string,
  messages: NvidiaChatMessage[],
  options?: { temperature?: number; maxTokens?: number; task?: 'nlp' | 'chat' }
): Promise<string> {
  const task = options?.task || 'chat';
  const apiKey = getNvidiaApiKey(task);

  if (!apiKey) {
    throw new Error('NVIDIA/AI API key not found in env.');
  }

  const requestBody: any = {
    model,
    messages,
    temperature: options?.temperature ?? 0.2,
    max_tokens: options?.maxTokens ?? 1024,
    top_p: 0.7,
  };

  // If using the Nemotron 120b reasoning model, inject the required reasoning budget
  if (model === 'nvidia/nemotron-3-super-120b-a12b') {
    requestBody.chat_template_kwargs = { enable_thinking: true };
    requestBody.reasoning_budget = 4096;
  }

  // Automatically route to OpenRouter if an OpenRouter key is provided
  const baseUrl = apiKey.startsWith('sk-or-') 
    ? 'https://openrouter.ai/api/v1' 
    : NVIDIA_BASE_URL;

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://healthsense-ai.app',
        'X-Title': 'HealthSense Autonomous Triage',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NVIDIA NIM API Returned ${response.status}: ${errText}`);
    }

    const data: NvidiaChatResponse = await response.json();

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message?.content) {
      throw new Error('NVIDIA NIM returned empty response.');
    }

    return data.choices[0].message.content;
  } catch (err) {
    throw err;
  }
}

/**
 * Call NVIDIA NIM Chat and parse the response as JSON.
 * Strips markdown code fences if present, then parses.
 */
export async function callNvidiaChatJSON<T>(
  model: string,
  messages: NvidiaChatMessage[],
  options?: { temperature?: number; maxTokens?: number; task?: 'nlp' | 'chat' }
): Promise<T> {
  const rawContent = await callNvidiaChat(model, messages, options);

  // Strip markdown JSON fences if present
  const cleaned = rawContent
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new Error(`Failed to parse NVIDIA NIM response as JSON: ${err}. Content: ${cleaned}`);
  }
}

// ==========================================
// ElevenLabs — Speech-to-Text (Scribe)
// ==========================================

/**
 * ElevenLabs Speech-to-Text using the Scribe v2 model.
 * Accepts base64-encoded audio, returns text transcript.
 */
export async function callElevenLabsSTT(audioBase64: string): Promise<string> {
  const apiKey = getElevenLabsApiKey();

  if (!apiKey) {
    throw new Error('ElevenLabs API key is not configured.');
  }

  try {
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('file', audioBuffer, { filename: 'audio.wav', contentType: 'audio/wav' });
    form.append('model_id', 'scribe_v1');

    const response = await fetch(`${ELEVENLABS_BASE_URL}/speech-to-text`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        ...form.getHeaders(),
      },
      body: form as any,
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs STT failed with status ${response.status}`);
    }

    const data = await response.json() as any;
    return data.text || '';
  } catch (err) {
    throw err;
  }
}

// ==========================================
// ElevenLabs — Text-to-Speech
// ==========================================

/**
 * ElevenLabs Text-to-Speech.
 */
export async function callElevenLabsTTS(text: string): Promise<string> {
  const apiKey = getElevenLabsApiKey();

  if (!apiKey) {
    throw new Error('ElevenLabs API key is not configured.');
  }

  try {
    const voiceId = 'JBFqnCBsd6RMkjVDRZzb'; // "George" voice

    const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_v3',
        output_format: 'mp3_44100_128',
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS failed with status ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  } catch (err) {
    throw err;
  }
}

// Export types for use in other agents
export type { NvidiaChatMessage };
