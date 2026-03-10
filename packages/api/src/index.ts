/**
 * Celato API Orchestrator — Entry Point
 *
 * Registers routes, WebSocket handlers, and wires LLM provider.
 * Retell integration is only enabled when OPENAI_API_KEY is set.
 */

import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import Fastify from "fastify";
import { pino } from "pino";
import { loadConfig } from "./config.js";
import { healthRoutes } from "./routes/health.js";
import { retellWsRoutes } from "./routes/retell-ws.js";
import { userWsRoutes } from "./routes/user-ws.js";
import type { LLMProvider } from "@celato/shared/interfaces";
import { AnthropicProvider, OpenAIProvider } from "./services/llm-service.js";

const config = loadConfig();
const logger = pino({ level: config.LOG_LEVEL });

const server = Fastify({
  logger: { level: config.LOG_LEVEL },
});

await server.register(cors, {
  origin: config.ALLOWED_ORIGINS.split(","),
  credentials: true,
});
await server.register(websocket);

await server.register(healthRoutes);
await server.register((instance) => userWsRoutes(instance, config));

const modelOptions = config.LLM_MODEL ? { model: config.LLM_MODEL } : undefined;

function createLLMProvider(): LLMProvider | null {
  if (config.LLM_PROVIDER === "anthropic" && config.ANTHROPIC_API_KEY) {
    return new AnthropicProvider(config.ANTHROPIC_API_KEY, modelOptions);
  }
  if (config.OPENAI_API_KEY) {
    return new OpenAIProvider(config.OPENAI_API_KEY, modelOptions);
  }
  // Fallback: try whichever key is available
  if (config.ANTHROPIC_API_KEY) {
    return new AnthropicProvider(config.ANTHROPIC_API_KEY, modelOptions);
  }
  return null;
}

const llmProvider = createLLMProvider();

if (llmProvider) {
  // QoL 4: Validate API key on startup (non-blocking)
  llmProvider.validateKey().then((isValid) => {
    if (isValid) {
      logger.info({ provider: llmProvider.name, model: llmProvider.model }, "LLM API key validated");
    } else {
      logger.warn({ provider: llmProvider.name }, "LLM API key validation failed — calls may error");
    }
  });

  await server.register((instance) => retellWsRoutes(instance, llmProvider));
  logger.info({ provider: llmProvider.name, model: llmProvider.model }, "Retell LLM WebSocket route registered");
} else {
  logger.warn("No LLM API key set (OPENAI_API_KEY or ANTHROPIC_API_KEY) — Retell integration disabled");
}

// Log 404s with full URL — critical for debugging Retell connection path issues
server.setNotFoundHandler((request, reply) => {
  logger.warn(
    { method: request.method, url: request.url, headers: { upgrade: request.headers.upgrade } },
    "404 Not Found — is Retell hitting the wrong path?",
  );
  reply.status(404).send({ error: "Not Found", url: request.url });
});

const port = config.API_PORT;

try {
  await server.listen({ port, host: "0.0.0.0" });
  logger.info(`Celato API listening on http://localhost:${port}`);
} catch (err) {
  logger.error(err);
  process.exit(1);
}
