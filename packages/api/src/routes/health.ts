import type { FastifyInstance } from "fastify";
import { getActiveSessionCount } from "../services/session-manager.js";

export async function healthRoutes(server: FastifyInstance): Promise<void> {
  server.get("/health", async () => ({
    status: "ok",
    service: "celato-api",
    version: "0.1.0",
    activeSessions: getActiveSessionCount(),
  }));
}
