/**
 * Handles Retell Custom LLM WebSocket messages.
 * Text-only protocol: receives transcripts, sends agent responses.
 */

import type { CallSession } from "@celato/shared";
import type { LLMProvider } from "@celato/shared/interfaces";
import { pino } from "pino";
import type { WebSocket } from "ws";
import type { CostTracker } from "./cost-tracker.js";
import { buildLLMMessages } from "./prompt-builder.js";

const logger = pino({ name: "retell-handler" });

export interface RetellMessage {
  interaction_type:
    | "call_details"
    | "response_required"
    | "reminder_required"
    | "update_only"
    | "ping_pong";
  response_id?: number;
  transcript?: Array<{ role: "agent" | "user"; content: string }>;
  call?: Record<string, unknown>;
  timestamp?: number;
}

export interface RetellHandlerDeps {
  llmProvider: LLMProvider;
  onTranscriptUpdate?: (session: CallSession, speaker: "business" | "agent", text: string) => void;
  onCostUpdate?: (session: CallSession, costTracker: CostTracker) => void;
}

export function sendRetellConfig(socket: WebSocket): void {
  socket.send(
    JSON.stringify({
      response_type: "config",
      config: {
        auto_reconnect: true,
        call_details: true,
      },
    })
  );
}

export async function handleRetellMessage(
  msg: RetellMessage,
  socket: WebSocket,
  session: CallSession,
  costTracker: CostTracker,
  deps: RetellHandlerDeps
): Promise<void> {
  switch (msg.interaction_type) {
    case "call_details": {
      logger.info({ callDetails: msg.call }, "Received call details");
      session.state = "active";
      costTracker.startCall();
      break;
    }

    case "response_required":
    case "reminder_required": {
      if (!msg.transcript || msg.response_id === undefined) {
        logger.warn("response_required without transcript or response_id");
        return;
      }

      const messages = buildLLMMessages(session, msg.transcript);
      const llmResponse = await deps.llmProvider.complete({ messages });

      costTracker.addLLMUsage(llmResponse.usage.inputTokens, llmResponse.usage.outputTokens);

      logger.info(
        {
          responseId: msg.response_id,
          latencyMs: llmResponse.latencyMs,
          tokens: llmResponse.usage,
        },
        "Sending agent response"
      );

      socket.send(
        JSON.stringify({
          response_type: "response",
          response_id: msg.response_id,
          content: llmResponse.content,
          content_complete: true,
        })
      );

      // Clear whisper queue after incorporated
      session.whisperQueue = [];

      deps.onTranscriptUpdate?.(session, "agent", llmResponse.content);
      deps.onCostUpdate?.(session, costTracker);
      break;
    }

    case "update_only": {
      if (msg.transcript && msg.transcript.length > 0) {
        const latest = msg.transcript[msg.transcript.length - 1];
        if (latest) {
          const speaker = latest.role === "user" ? "business" : "agent";
          deps.onTranscriptUpdate?.(session, speaker, latest.content);
        }
      }
      break;
    }

    case "ping_pong": {
      socket.send(
        JSON.stringify({
          response_type: "ping_pong",
          timestamp: msg.timestamp,
        })
      );
      break;
    }
  }
}
