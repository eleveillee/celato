/**
 * /llm-websocket/:call_id — Retell Custom LLM WebSocket.
 * Text-only protocol. Retell connects here when a call starts.
 * Forwards transcript/cost/state events to user's browser via connection registry.
 */

import type { LLMProvider } from "@celato/shared/interfaces";
import type { FastifyInstance } from "fastify";
import { pino } from "pino";
import { sendToUser } from "../services/connection-registry.js";
import { CostTracker } from "../services/cost-tracker.js";
import {
  handleRetellMessage,
  type RetellMessage,
  sendRetellConfig,
} from "../services/retell-handler.js";
import { getSessionByRetellCallId } from "../services/session-manager.js";

const logger = pino({ name: "retell-ws" });

const COST_UPDATE_INTERVAL_MS = 10_000;

export async function retellWsRoutes(
  server: FastifyInstance,
  llmProvider: LLMProvider
): Promise<void> {
  server.get<{ Params: { call_id: string } }>(
    "/llm-websocket/:call_id",
    { websocket: true },
    (socket, request) => {
      const callId = request.params.call_id;
      logger.info({ callId, url: request.url }, "Retell WebSocket upgrade accepted");
      const session = getSessionByRetellCallId(callId);

      if (!session) {
        logger.warn({ callId }, "Retell connected for unknown call_id");
      }

      logger.info({ callId }, "Retell Custom LLM WebSocket connected");

      sendRetellConfig(socket);

      const costTracker = new CostTracker();
      let costInterval: ReturnType<typeof setInterval> | null = null;

      function startCostUpdates(sessionId: string): void {
        if (costInterval) return;
        costInterval = setInterval(() => {
          const breakdown = costTracker.getBreakdown();
          sendToUser(sessionId, {
            type: "cost_update",
            totalCost: breakdown.total,
            breakdown: { retell: breakdown.retell, llm: breakdown.llm },
            timestamp: Date.now(),
          });
        }, COST_UPDATE_INTERVAL_MS);
      }

      function stopCostUpdates(): void {
        if (costInterval) {
          clearInterval(costInterval);
          costInterval = null;
        }
      }

      socket.on("message", async (rawData) => {
        try {
          const msg: RetellMessage = JSON.parse(rawData.toString());

          const currentSession = session ?? getSessionByRetellCallId(callId);

          if (!currentSession) {
            logger.warn({ callId }, "No session found for call");

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
            onTranscriptUpdate: (sess, speaker, text) => {
              logger.debug({ callId, speaker, text }, "Transcript update");
              sendToUser(sess.id, {
                type: "transcript",
                speaker,
                text,
                isHidden: false,
                timestamp: Date.now(),
              });
            },
            onCostUpdate: (sess, tracker) => {
              const breakdown = tracker.getBreakdown();
              logger.debug({ callId, cost: breakdown }, "Cost update");
              sendToUser(sess.id, {
                type: "cost_update",
                totalCost: breakdown.total,
                breakdown: { retell: breakdown.retell, llm: breakdown.llm },
                timestamp: Date.now(),
              });
            },
          });

          // When call becomes active, notify user and start cost timer
          if (msg.interaction_type === "call_details" && currentSession) {
            sendToUser(currentSession.id, {
              type: "state_update",
              state: "active",
              sessionId: currentSession.id,
              timestamp: Date.now(),
            });
            startCostUpdates(currentSession.id);
          }
        } catch (error) {
          logger.error({ error, callId }, "Error handling Retell message");
        }
      });

      socket.on("close", () => {
        stopCostUpdates();
        const finalCost = costTracker.endCall();
        logger.info({ callId, cost: finalCost }, "Retell WebSocket closed");

        const closingSession = session ?? getSessionByRetellCallId(callId);
        if (closingSession) {
          closingSession.state = "ended";
          closingSession.endedAt = new Date();
          sendToUser(closingSession.id, {
            type: "state_update",
            state: "ended",
            timestamp: Date.now(),
          });
          sendToUser(closingSession.id, {
            type: "cost_update",
            totalCost: finalCost.total,
            breakdown: { retell: finalCost.retell, llm: finalCost.llm },
            timestamp: Date.now(),
          });
        }
      });
    }
  );
}
