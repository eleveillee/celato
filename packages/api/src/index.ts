import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { pino } from "pino";
import { AckMessageSchema, type AckMessage } from "@celato/shared";

const logger = pino({
  level: process.env["LOG_LEVEL"] ?? "info",
});

const server = Fastify({
  logger: {
    level: process.env["LOG_LEVEL"] ?? "info",
  },
});

await server.register(websocket);

server.get("/health", async () => {
  return { status: "ok", service: "celato-api", version: "0.1.0" };
});

server.get("/ws", { websocket: true }, (socket) => {
	socket.on("message", (message) => {
		logger.info({ message: message.toString() }, "Received WebSocket message");

		// Create and validate ack response
		const ackMessage: AckMessage = {
			type: "ack",
			timestamp: Date.now(),
		};

		// Validate before sending (catches type errors at runtime)
		const validated = AckMessageSchema.parse(ackMessage);
		socket.send(JSON.stringify(validated));
	});
});

const port = Number(process.env["API_PORT"]) || 4000;

try {
  await server.listen({ port, host: "0.0.0.0" });
  logger.info(`🚀 Celato API listening on http://localhost:${port}`);
} catch (err) {
  logger.error(err);
  process.exit(1);
}
