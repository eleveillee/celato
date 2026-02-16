import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import websocket from "@fastify/websocket";

describe("API Server", () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = Fastify({ logger: false });
    await server.register(websocket);

    server.get("/health", async () => {
      return { status: "ok", service: "celato-api", version: "0.1.0" };
    });

    server.get("/ws", { websocket: true }, (socket) => {
      socket.on("message", () => {
        socket.send(JSON.stringify({ type: "ack", timestamp: Date.now() }));
      });
    });

    await server.listen({ port: 0 }); // Random port for testing
  });

  afterAll(async () => {
    await server.close();
  });

  it("should respond to health check", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      service: "celato-api",
      version: "0.1.0",
    });
  });

  it("should accept WebSocket connections", async () => {
    const address = server.server.address();
    if (!address || typeof address === "string") {
      throw new Error("Server address not available");
    }

    const wsUrl = `ws://localhost:${address.port}/ws`;
    const ws = new WebSocket(wsUrl);

    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => {
        ws.send("test message");
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
});
