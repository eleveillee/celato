import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import Fastify, { type FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { healthRoutes } from "./routes/health.js";
import { userWsRoutes } from "./routes/user-ws.js";

describe("API Server", () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = Fastify({ logger: false });
    await server.register(cors, { origin: true });
    await server.register(websocket);
    await server.register(healthRoutes);
    const testConfig = {
      API_PORT: 0,
      LOG_LEVEL: "error" as const,
      NODE_ENV: "test" as const,
      ALLOWED_ORIGINS: "http://localhost:3000",
      LLM_PROVIDER: "openai" as const,
    };
    await server.register((instance) => userWsRoutes(instance, testConfig));

    await server.listen({ port: 0 });
  });

  afterAll(async () => {
    await server.close();
  });

  it("should respond to health check with activeSessions", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("celato-api");
    expect(body.version).toBe("0.1.0");
    expect(typeof body.activeSessions).toBe("number");
  });

  it("should accept WebSocket connections on /ws (VS-0 backward compat)", async () => {
    const address = server.server.address();
    if (!address || typeof address === "string") {
      throw new Error("Server address not available");
    }

    const wsUrl = `ws://localhost:${address.port}/ws`;
    const ws = new WebSocket(wsUrl);

    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => {
        // Send JSON with unknown type for VS-0 backward compat path
        ws.send(JSON.stringify({ type: "legacy_message", data: "test" }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data.toString());
        expect(data.type).toBe("ack");
        expect(data.timestamp).toBeGreaterThan(0);
        ws.close();
        resolve();
      };

      ws.onerror = (error) => {
        reject(error);
      };

      setTimeout(() => reject(new Error("WebSocket test timeout")), 5000);
    });
  });

  it("should handle start_call via WebSocket", async () => {
    const address = server.server.address();
    if (!address || typeof address === "string") {
      throw new Error("Server address not available");
    }

    const wsUrl = `ws://localhost:${address.port}/ws`;
    const ws = new WebSocket(wsUrl);

    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: "start_call",
            phoneNumber: "+15551234567",
            personaMode: "transparent",
            timestamp: Date.now(),
          })
        );
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data.toString());
        expect(data.type).toBe("state_update");
        expect(data.state).toBe("connecting");
        expect(data.sessionId).toBeDefined();
        ws.close();
        resolve();
      };

      ws.onerror = (error) => {
        reject(error);
      };

      setTimeout(() => reject(new Error("WebSocket test timeout")), 5000);
    });
  });

  it("should reject whisper without active call", async () => {
    const address = server.server.address();
    if (!address || typeof address === "string") {
      throw new Error("Server address not available");
    }

    const wsUrl = `ws://localhost:${address.port}/ws`;
    const ws = new WebSocket(wsUrl);

    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: "whisper",
            text: "Say hello",
            timestamp: Date.now(),
          })
        );
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data.toString());
        expect(data.type).toBe("error");
        expect(data.code).toBe("CALL_NOT_ACTIVE");
        ws.close();
        resolve();
      };

      ws.onerror = (error) => {
        reject(error);
      };

      setTimeout(() => reject(new Error("WebSocket test timeout")), 5000);
    });
  });
});
