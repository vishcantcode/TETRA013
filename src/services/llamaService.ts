// Reusable Llama API Service Layer for HealthSense Doctor AI Copilot

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  max_tokens?: number;
}

export interface HealthCheckResult {
  status: string;
  provider: string;
  baseUrl: string;
  model: string;
  hasKey: boolean;
}

export async function healthCheck(): Promise<HealthCheckResult> {
  try {
    const res = await fetch('/api/chat/health');
    if (!res.ok) {
      throw new Error(`Health check failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Llama service health check fallback:', err);
    return {
      status: 'simulated_mode',
      provider: 'Groq / Llama 3.3',
      baseUrl: 'https://api.groq.com/openai/v1',
      model: 'llama-3.3-70b-versatile',
      hasKey: false,
    };
  }
}

export async function sendMessage(
  messages: ChatMessage[],
  patientContext?: any,
  options?: ChatOptions
): Promise<string> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        patient: patientContext,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.max_tokens ?? 1200,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData?.error?.message || `Server HTTP Error ${res.status}`;
      throw new Error(msg);
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error('Empty response received from LLM backend.');
    }
    return reply;
  } catch (err: any) {
    console.error('sendMessage failed:', err);
    throw err;
  }
}

export async function streamMessage(
  messages: ChatMessage[],
  patientContext: any,
  onChunk: (chunkText: string) => void,
  options?: ChatOptions
): Promise<string> {
  try {
    const res = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        patient: patientContext,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.max_tokens ?? 1200,
      }),
    });

    if (!res.ok || !res.body) {
      // Fallback to non-streaming endpoint if streaming fails
      return await sendMessage(messages, patientContext, options);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed === 'data: [DONE]') break;

        if (trimmed.startsWith('data: ')) {
          try {
            const jsonStr = trimmed.slice(6);
            const parsed = JSON.parse(jsonStr);
            if (parsed.error) {
              console.warn('Stream chunk error:', parsed.error);
            }
            const token = parsed?.choices?.[0]?.delta?.content;
            if (token) {
              fullText += token;
              onChunk(fullText);
            }
          } catch (e) {
            // Ignore partial SSE JSON parse errors
          }
        }
      }
    }

    if (!fullText) {
      // Fallback if stream was empty
      return await sendMessage(messages, patientContext, options);
    }

    return fullText;
  } catch (err: any) {
    console.warn('Streaming error, retrying non-stream:', err);
    const result = await sendMessage(messages, patientContext, options);
    onChunk(result);
    return result;
  }
}

export async function retryRequest(
  messages: ChatMessage[],
  patientContext: any,
  onChunk?: (text: string) => void
): Promise<string> {
  if (onChunk) {
    return await streamMessage(messages, patientContext, onChunk);
  }
  return await sendMessage(messages, patientContext);
}
