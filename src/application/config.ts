import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export interface EnvConfig {
  OPENROUTER_API_KEY: string;
  MODEL: string;
}

function loadEnvFile() {
  const envFile = resolve(process.cwd(), '.env');

  if (existsSync(envFile)) {
    process.loadEnvFile(envFile);
  } else {
    throw new Error(`.env file not found at ${envFile}`);
  }
}

export function loadEnvConfig(): EnvConfig {
  loadEnvFile();
  const mandatoryEnvVars = ['OPENROUTER_API_KEY', 'MODEL'];

  const errors: string[] = [];
  for (const varName of mandatoryEnvVars) {
    if (!process.env[varName]) {
      errors.push(`${varName}`);
    }
  }

  if (errors.length) {
    throw new Error(`Missing mandatory environment variable: ${errors}`);
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
  const MODEL = process.env.MODEL!;

  return {
    OPENROUTER_API_KEY,
    MODEL,
  };
}
