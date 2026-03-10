import { z } from "zod/v4";

const ConfigSchema = z.object({
  RETELL_API_KEY: z.string().min(1).optional(),
  RETELL_AGENT_ID: z.string().min(1).optional(),
  RETELL_FROM_NUMBER: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  LLM_PROVIDER: z.enum(["openai", "anthropic"]).default("openai"),
  // Override the default model for the selected LLM_PROVIDER.
  // OpenAI:    gpt-4o-mini (default) | gpt-4o | gpt-4.1-nano | gpt-4.1-mini
  // Anthropic: claude-haiku-4-5-20251001 (default) | claude-sonnet-4-6 | claude-opus-4-6
  LLM_MODEL: z.string().min(1).optional(),
  API_PORT: z.coerce.number().default(4000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse(process.env);
}
