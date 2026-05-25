import * as dotenv from 'dotenv';
import * as path from 'path';

// Pre-load if not already loaded
dotenv.config();

export interface EnvironmentConfig {
  baseUrl: string;
  ollamaHost: string;
  ollamaModel: string;
  mockLlm: boolean;
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
}

export const env: EnvironmentConfig = {
  baseUrl: process.env.BASE_URL || 'https://api.mock-pharmacy.example',
  ollamaHost: process.env.OLLAMA_HOST || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3',
  mockLlm: process.env.MOCK_LLM === 'true',
  logLevel: (process.env.LOG_LEVEL as any) || 'INFO',
};

export default env;
