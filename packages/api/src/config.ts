import fs from 'fs';
import path from 'path';
import { z } from 'zod';

// Parse root .env manually without external dependency
function loadEnv() {
  const envPath = path.resolve(__dirname, '../../../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        if (!process.env[key]) {
          process.env[key] = value.trim();
        }
      }
    });
  }
}

loadEnv();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.string().default('development'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GOOGLE_CLOUD_API_KEY: z.string().optional().default(''),
  OCR_API_KEY: z.string().optional().default(''),
  FHIR_SERVER_URL: z.string().optional().default('https://hapi.fhir.org/baseR4'),
  JWT_SECRET: z.string().optional().default('healthsense-jwt-secret-key-2026')
});

const parsedEnv = envSchema.parse(process.env);

export const config = {
  port: parseInt(parsedEnv.PORT, 10),
  nodeEnv: parsedEnv.NODE_ENV,
  geminiApiKey: parsedEnv.GEMINI_API_KEY,
  hasGeminiKey: Boolean(parsedEnv.GEMINI_API_KEY && parsedEnv.GEMINI_API_KEY.trim().length > 0),
  fhirServerUrl: parsedEnv.FHIR_SERVER_URL,
  jwtSecret: parsedEnv.JWT_SECRET
};
