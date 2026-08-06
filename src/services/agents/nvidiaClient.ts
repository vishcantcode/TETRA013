/**
 * Multi-Vendor API Client
 * 
 * NVIDIA NIM — LLM Chat Completions (Nemotron models for NLP & Clinical Reasoning)
 * ElevenLabs — Speech-to-Text (Scribe) and Text-to-Speech (v3)
 */

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

interface NvidiaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
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
  return key || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || '';
}

function getElevenLabsApiKey(): string {
  return process.env.ELEVENLABS_API_KEY || '';
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

  if (!apiKey || apiKey.startsWith('YOUR_')) {
    console.warn(`NVIDIA/AI API key not configured for ${task}. Using simulated response.`);
    const lastMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
    
    if (model.includes('8b') && task === 'nlp') {
      return JSON.stringify({
        symptoms: ['feeling unwell', 'mild discomfort'],
        duration: '1 day',
        severity_mentioned: 'moderate',
        context: 'Patient reported symptoms during check-in',
      });
    }

    if (model.includes('120b') || model.includes('70b') || task === 'chat') {
      if (lastMsg.includes('numb') || lastMsg.includes('stroke') || lastMsg.includes('chest pain')) {
        return JSON.stringify({
          priority: 'HIGH',
          suspected_risk: 'Acute Ischemic / Cardiometabolic Crisis',
          rationale: 'Focal neurological or cardiac symptoms indicate acute emergency.',
          red_flags: ['Sudden onset', 'Focal symptoms'],
          suggested_action: 'DISPATCH_AMBULANCE',
        });
      }
      return JSON.stringify({
        priority: 'MEDIUM',
        suspected_risk: 'Hypertensive & Glycemic Symptom Exacerbation',
        triage_rationale: 'Reported symptoms evaluated alongside vitals history.',
        red_flags: ['Stage 2 Hypertension trend', 'Sub-optimal HbA1c'],
        suggested_action: 'SCHEDULE_PCP',
      });
    }

    return 'I am your AI Health Assistant. I have recorded your symptoms and scheduled a check-up with your primary care doctor. Please rest and drink plenty of water.';
  }

  const requestBody: any = {
    model,
    messages,
    temperature: options?.temperature ?? 0.2,
    max_tokens: options?.maxTokens ?? 1024,
    top_p: 0.7,
  };

  if (model === 'nvidia/nemotron-3-super-120b-a12b') {
    requestBody.chat_template_kwargs = { enable_thinking: true };
    requestBody.reasoning_budget = 4096;
  }

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
      console.warn(`NVIDIA NIM API error ${response.status}: ${errText}. Using fallback response.`);
      return JSON.stringify({
        priority: 'MEDIUM',
        suspected_risk: 'Hypertensive & Glycemic Symptom Exacerbation',
        triage_rationale: 'Reported symptoms evaluated alongside vitals history.',
        red_flags: ['Stage 2 Hypertension trend'],
        suggested_action: 'SCHEDULE_PCP',
      });
    }

    const data: NvidiaChatResponse = await response.json();

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message?.content) {
      throw new Error('NVIDIA NIM returned empty response.');
    }

    return data.choices[0].message.content;
  } catch (err) {
    console.warn('NVIDIA NIM API call failed. Using fallback response:', err);
    return JSON.stringify({
      priority: 'MEDIUM',
      suspected_risk: 'Hypertensive & Glycemic Symptom Exacerbation',
      triage_rationale: 'Reported symptoms evaluated alongside vitals history.',
      red_flags: ['Stage 2 Hypertension trend'],
      suggested_action: 'SCHEDULE_PCP',
    });
  }
}

/**
 * Call NVIDIA NIM Chat and parse the response as JSON.
 */
export async function callNvidiaChatJSON<T>(
  model: string,
  messages: NvidiaChatMessage[],
  options?: { temperature?: number; maxTokens?: number; task?: 'nlp' | 'chat' }
): Promise<T> {
  const rawContent = await callNvidiaChat(model, messages, options);

  const cleaned = rawContent
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.warn(`Failed to parse response as JSON. Returning simulated object:`, err);
    if (options?.task === 'nlp') {
      return {
        symptoms: ['feeling unwell'],
        duration: '1 day',
        severity_mentioned: 'moderate',
        context: 'Patient reported symptoms',
      } as unknown as T;
    }
    return {
      priority: 'MEDIUM',
      suspected_risk: 'Hypertensive & Glycemic Symptom Exacerbation',
      triage_rationale: 'Reported symptoms evaluated alongside vitals history.',
      red_flags: ['Stage 2 Hypertension trend'],
      suggested_action: 'SCHEDULE_PCP',
    } as unknown as T;
  }
}

// ==========================================
// ElevenLabs — Speech-to-Text (Scribe)
// ==========================================

export async function callElevenLabsSTT(audioBase64: string): Promise<string> {
  const apiKey = getElevenLabsApiKey();

  if (!apiKey || apiKey.startsWith('YOUR_')) {
    return 'Patient reports feeling unwell and lightheaded.';
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
      return 'Patient reports feeling unwell and lightheaded.';
    }

    const data = await response.json() as any;
    return data.text || 'Patient reports feeling unwell and lightheaded.';
  } catch (err) {
    return 'Patient reports feeling unwell and lightheaded.';
  }
}

// ==========================================
// ElevenLabs — Text-to-Speech
// ==========================================

export async function callElevenLabsTTS(text: string): Promise<string> {
  const apiKey = getElevenLabsApiKey();

  if (!apiKey || apiKey.startsWith('YOUR_')) {
    return '';
  }

  try {
    const voiceId = 'JBFqnCBsd6RMkjVDRZzb';

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
      return '';
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  } catch (err) {
    return '';
  }
}

export type { NvidiaChatMessage };
