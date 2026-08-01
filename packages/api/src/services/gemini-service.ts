import { config } from '../config';

export class GeminiService {
  private static GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  /**
   * Generates content using Google Gemini API or returns null if unavailable/unconfigured.
   */
  public static async generate(prompt: string, systemInstruction?: string): Promise<string | null> {
    if (!config.hasGeminiKey) {
      console.log('[GeminiService] GEMINI_API_KEY is not configured. Falling back to deterministic engine.');
      return null;
    }

    try {
      const url = `${this.GEMINI_ENDPOINT}?key=${config.geminiApiKey}`;
      const payload: any = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1500,
        }
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[GeminiService] API Error (${response.status}): ${errText}`);
        return null;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || null;
    } catch (err: any) {
      console.error('[GeminiService] Network/Execution Error:', err?.message || err);
      return null;
    }
  }

  /**
   * Structured JSON generator via Gemini
   */
  public static async generateJSON<T = any>(prompt: string, systemInstruction?: string): Promise<T | null> {
    const raw = await this.generate(
      `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON object. Do not include markdown code block formatting like \`\`\`json.`,
      systemInstruction
    );

    if (!raw) return null;

    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (e) {
      console.warn('[GeminiService] JSON Parse Error on output:', raw);
      return null;
    }
  }
}
