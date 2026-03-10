/**
 * /ws — User WebSocket connection.
 * Handles whisper messages, call control, and broadcasts transcripts/costs.
 */

import { StartCallMessageSchema, WhisperMessageSchema } from "@celato/shared";
import type { FastifyInstance } from "fastify";
import { pino } from "pino";
import type { WebSocket } from "ws";
import type { Config } from "../config.js";
import {
  registerUserSocket,
  sendToUser,
  unregisterUserSocket,
} from "../services/connection-registry.js";
import { createRetellCall, createRetellWebCall } from "../services/retell-service.js";
import {
  addWhisper,
  createSession,
  deleteSession,
  getSession,
} from "../services/session-manager.js";

const logger = pino({ name: "user-ws" });

function handleStartCall(socket: WebSocket, data: unknown, config: Config): string {
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

  registerUserSocket(session.id, socket);

  socket.send(
    JSON.stringify({
      type: "state_update",
      state: "connecting",
      sessionId: session.id,
      timestamp: Date.now(),
    })
  );

  // Initiate Retell call if configured
  if (config.RETELL_API_KEY && config.RETELL_AGENT_ID) {
    const usePhoneCall = config.RETELL_FROM_NUMBER && parsed.phoneNumber;

    if (usePhoneCall) {
      // PSTN path (production) — requires KYC + purchased phone number
      // Non-null safe: usePhoneCall is truthy only when both are defined
      createRetellCall({
        apiKey: config.RETELL_API_KEY,
        agentId: config.RETELL_AGENT_ID,
        toNumber: parsed.phoneNumber!,
        fromNumber: config.RETELL_FROM_NUMBER,
      })
        .then((result) => {
          session.retellCallId = result.callId;
          logger.info({ sessionId: session.id, callId: result.callId }, "Retell phone call initiated");
        })
        .catch((err: unknown) => {
          logger.error({ error: err, sessionId: session.id }, "Failed to create Retell phone call");
          sendToUser(session.id, {
            type: "error",
            code: "CALL_CONNECT_FAILED",
            message: "Failed to initiate phone call. Check Retell configuration.",
            retryable: true,
            timestamp: Date.now(),
          });
        });
    } else {
      // Web call path (dev/no KYC) — browser acts as the caller via Retell Web SDK
      createRetellWebCall({
        apiKey: config.RETELL_API_KEY,
        agentId: config.RETELL_AGENT_ID,
      })
        .then((result) => {
          session.retellCallId = result.callId;
          logger.info({ sessionId: session.id, callId: result.callId }, "Retell web call initiated");
          // Send access token to browser so it can connect via Retell Web SDK
          sendToUser(session.id, {
            type: "web_call_token",
            accessToken: result.accessToken,
            timestamp: Date.now(),
          });
        })
        .catch((err: unknown) => {
          logger.error({ error: err, sessionId: session.id }, "Failed to create Retell web call");
          sendToUser(session.id, {
            type: "error",
            code: "CALL_CONNECT_FAILED",
            message: "Failed to initiate web call. Check Retell configuration.",
            retryable: true,
            timestamp: Date.now(),
          });
        });
    }
  } else {
    logger.warn("Retell not configured — call stays in connecting state (dev mode)");
  }

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

  // Send ack + transcript entry for the whisper (so UI shows it)
  socket.send(JSON.stringify({ type: "ack", timestamp: Date.now() }));
  socket.send(
    JSON.stringify({
      type: "transcript",
      speaker: "whisper",
      text: parsed.text,
      isHidden: true,
      timestamp: Date.now(),
    })
  );
}

function handleEndCall(socket: WebSocket, _data: unknown, sessionId: string | null): void {
  if (sessionId) {
    const session = getSession(sessionId);
    if (session) {
      session.state = "ended";
      session.endedAt = new Date();
    }
    unregisterUserSocket(sessionId);
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

export async function userWsRoutes(server: FastifyInstance, config: Config): Promise<void> {
  server.get("/ws", { websocket: true }, (socket) => {
    let sessionId: string | null = null;

    socket.on("message", (rawData) => {
      try {
        const data = JSON.parse(rawData.toString());
        const msgType = String(data?.type ?? "");

        switch (msgType) {
          case "start_call":
            sessionId = handleStartCall(socket, data, config);
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
        unregisterUserSocket(sessionId);
        deleteSession(sessionId);
        logger.info({ sessionId }, "Client disconnected, session cleaned up");
      }
    });
  });
}
