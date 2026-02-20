/**
 * /llm-websocket/:call_id — Retell Custom LLM WebSocket.
 * Text-only protocol. Retell connects here when a call starts.
 */

import type { LLMProvider } from "@celato/shared/interfaces";
import type { FastifyInstance } from "fastify";
import { pino } from "pino";
import { CostTracker } from "../services/cost-tracker.js";
import {
  handleRetellMessage,
  type RetellMessage,
  sendRetellConfig,
} from "../services/retell-handler.js";
import { getSessionByRetellCallId } from "../services/session-manager.js";

const logger = pino({ name: "retell-ws" });

export async function retellWsRoutes(
  server: FastifyInstance,
  llmProvider: LLMProvider
): Promise<void> {
  server.get<{ Params: { call_id: string } }>(
    "/llm-websocket/:call_id",
    { websocket: true },
    (socket, request) => {
      const callId = request.params.call_id;
      const session = getSessionByRetellCallId(callId);

      if (!session) {
        logger.warn({ callId }, "Retell connected for unknown call_id");
        // Still handle the connection — session may be created shortly after
      }

      logger.info({ callId }, "Retell Custom LLM WebSocket connected");

      sendRetellConfig(socket);

      const costTracker = new CostTracker();

      socket.on("message", async (rawData) => {
        try {
          const msg: RetellMessage = JSON.parse(rawData.toString());

          // Re-lookup session each message (may have been created after connect)
          const currentSession = session ?? getSessionByRetellCallId(callId);

          if (!currentSession) {
            logger.warn({ callId }, "No session found for call");

            // Still handle ping_pong to keep connection alive
            if (msg.interaction_type === "ping_pong") {
              socket.send(
                JSON.stringify({
                  response_type: "ping_pong",
                  timestamp: msg.timestamp,
                })
              );
            }
            return;
          }

          await handleRetellMessage(msg, socket, currentSession, costTracker, {
            llmProvider,
            onTranscriptUpdate: (_sess, speaker, text) => {
              logger.debug({ callId, speaker, text }, "Transcript update");
            },
            onCostUpdate: (_sess, tracker) => {
              logger.debug({ callId, cost: tracker.getBreakdown() }, "Cost update");
            },
          });
        } catch (error) {
          logger.error({ error, callId }, "Error handling Retell message");
        }
      });

      socket.on("close", () => {
        logger.info({ callId, cost: costTracker.endCall() }, "Retell WebSocket closed");

        // Re-lookup session (may have been created after initial connect)
        const closingSession = session ?? getSessionByRetellCallId(callId);
        if (closingSession) {
          closingSession.state = "ended";
          closingSession.endedAt = new Date();
        }
      });
    }
  );
}
