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
import { OpenAIProvider } from "./services/llm-service.js";

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
await server.register(userWsRoutes);

if (config.OPENAI_API_KEY) {
  const llmProvider = new OpenAIProvider(config.OPENAI_API_KEY);
  await server.register((instance) => retellWsRoutes(instance, llmProvider));
  logger.info("Retell LLM WebSocket route registered");
} else {
  logger.warn("OPENAI_API_KEY not set — Retell integration disabled");
}

const port = config.API_PORT;

try {
  await server.listen({ port, host: "0.0.0.0" });
  logger.info(`Celato API listening on http://localhost:${port}`);
} catch (err) {
  logger.error(err);
  process.exit(1);
}
