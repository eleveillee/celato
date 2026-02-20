/**
 * /ws — User WebSocket connection.
 * Handles whisper messages, call control, and broadcasts transcripts/costs.
 */

import { EndCallMessageSchema, StartCallMessageSchema, WhisperMessageSchema } from "@celato/shared";
import type { FastifyInstance } from "fastify";
import { pino } from "pino";
import type { WebSocket } from "ws";
import {
  addWhisper,
  createSession,
  deleteSession,
  getSession,
} from "../services/session-manager.js";

const logger = pino({ name: "user-ws" });

function handleStartCall(socket: WebSocket, data: unknown): string {
  const parsed = StartCallMessageSchema.parse(data);
  const session = createSession({
    phoneNumber: parsed.phoneNumber,
    personaMode: parsed.personaMode,
    targetLanguage: parsed.targetLanguage,
    purpose: parsed.purpose,
    userNotes: parsed.userNotes,
  });

  logger.info(
    { sessionId: session.id, phone: parsed.phoneNumber, persona: parsed.personaMode },
    "Session created"
  );

  socket.send(
    JSON.stringify({
      type: "state_update",
      state: "connecting",
      sessionId: session.id,
      timestamp: Date.now(),
    })
  );

  return session.id;
}

function handleWhisper(socket: WebSocket, data: unknown, sessionId: string | null): void {
  const parsed = WhisperMessageSchema.parse(data);
  if (!sessionId) {
    socket.send(
      JSON.stringify({
        type: "error",
        code: "CALL_NOT_ACTIVE",
        message: "No active call session",
        retryable: false,
        timestamp: Date.now(),
      })
    );
    return;
  }

  const session = getSession(sessionId);
  if (!session) return;

  addWhisper(session, parsed.text);
  logger.info({ sessionId, whisperLength: parsed.text.length }, "Whisper received");

  socket.send(JSON.stringify({ type: "ack", timestamp: Date.now() }));
}

function handleEndCall(socket: WebSocket, data: unknown, sessionId: string | null): void {
  EndCallMessageSchema.parse(data);
  if (sessionId) {
    const session = getSession(sessionId);
    if (session) {
      session.state = "ended";
      session.endedAt = new Date();
    }
    deleteSession(sessionId);
    logger.info({ sessionId }, "Session ended");
  }

  socket.send(
    JSON.stringify({
      type: "state_update",
      state: "ended",
      timestamp: Date.now(),
    })
  );
}

export async function userWsRoutes(server: FastifyInstance): Promise<void> {
  server.get("/ws", { websocket: true }, (socket) => {
    let sessionId: string | null = null;

    socket.on("message", (rawData) => {
      try {
        const data = JSON.parse(rawData.toString());
        const msgType = String(data?.type ?? "");

        switch (msgType) {
          case "start_call":
            sessionId = handleStartCall(socket, data);
            break;

          case "whisper":
            handleWhisper(socket, data, sessionId);
            break;

          case "end_call":
            handleEndCall(socket, data, sessionId);
            sessionId = null;
            break;

          default:
            logger.info({ message: rawData.toString() }, "Received message");
            socket.send(JSON.stringify({ type: "ack", timestamp: Date.now() }));
        }
      } catch (error) {
        logger.error({ error }, "Failed to process message");
        socket.send(
          JSON.stringify({
            type: "error",
            code: "VALIDATION_ERROR",
            message: "Invalid message format",
            retryable: false,
            timestamp: Date.now(),
          })
        );
      }
    });

    socket.on("close", () => {
      if (sessionId) {
        deleteSession(sessionId);
        logger.info({ sessionId }, "Client disconnected, session cleaned up");
      }
    });
  });
}
