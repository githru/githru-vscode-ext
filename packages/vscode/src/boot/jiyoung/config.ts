import * as dotenv from "dotenv";

dotenv.config();

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Environment variable ${key} is not set.`);
  }
  return value;
}


export const LLM_API_URL = getEnvOrThrow("LLM_API_URL");
export const LLM_API_TOKEN = getEnvOrThrow("LLM_API_TOKEN");