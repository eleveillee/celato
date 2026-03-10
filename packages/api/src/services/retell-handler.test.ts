import type { CallSession } from "@celato/shared";
import type { LLMResponse } from "@celato/shared/interfaces";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CostTracker } from "./cost-tracker.js";
import {
  handleRetellMessage,
  type RetellHandlerDeps,
  type RetellMessage,
  sendRetellConfig,
} from "./retell-handler.js";

function makeSession(overrides: Partial<CallSession> = {}): CallSession {
  return {
    id: "test-session",
    phoneNumber: "+15551234567",
    state: "idle",
    audioMode: "standard",
    personaMode: "transparent",
    targetLanguage: "en",
    targetLanguageName: "English",
    startedAt: new Date(),
    messages: [],
    conversationContext: [],
    whisperQueue: [],
    ...overrides,
  };
}

function makeMockSocket() {
  return {
    send: vi.fn(),
    on: vi.fn(),
    close: vi.fn(),
  } as unknown as import("ws").WebSocket;
}

function makeMockLLMProvider(response?: Partial<LLMResponse>) {
  return {
    name: "test-provider",
    model: "test-model",
    costPerInputToken: 0.15 / 1_000_000,
    costPerOutputToken: 0.6 / 1_000_000,
    complete: vi.fn().mockResolvedValue({
      content: "I'm calling about a reservation.",
      usage: { inputTokens: 100, outputTokens: 20 },
      model: "test-model",
      latencyMs: 150,
      ...response,
    }),
    validateKey: vi.fn().mockResolvedValue(true),
  };
}

/** Extract the JSON sent in the Nth socket.send() call (0-indexed). */
function getSentJSON(socket: import("ws").WebSocket, index = 0): unknown {
  const calls = (socket.send as ReturnType<typeof vi.fn>).mock.calls;
  const call = calls[index] as [string] | undefined;
  if (!call) throw new Error(`socket.send was not called (index ${index})`);
  return JSON.parse(call[0]);
}

/** Get all JSON messages sent via socket.send(). */
function getAllSentJSON(socket: import("ws").WebSocket): unknown[] {
  const calls = (socket.send as ReturnType<typeof vi.fn>).mock.calls;
  return calls.map((call) => JSON.parse((call as [string])[0]));
}

describe("sendRetellConfig", () => {
  it("should send config with auto_reconnect and call_details", () => {
    const socket = makeMockSocket();
    sendRetellConfig(socket);

    expect(socket.send).toHaveBeenCalledOnce();
    expect(getSentJSON(socket)).toMatchObject({
      response_type: "config",
      config: { auto_reconnect: true, call_details: true },
    });
  });
});

describe("handleRetellMessage", () => {
  let socket: ReturnType<typeof makeMockSocket>;
  let session: CallSession;
  let costTracker: CostTracker;
  let deps: RetellHandlerDeps;

  beforeEach(() => {
    socket = makeMockSocket();
    session = makeSession();
    costTracker = new CostTracker();
    deps = {
      llmProvider: makeMockLLMProvider(),
      onTranscriptUpdate: vi.fn(),
      onCostUpdate: vi.fn(),
    };
  });

  it("should handle call_details by activating session and starting cost tracking", async () => {
    const msg: RetellMessage = {
      interaction_type: "call_details",
      call: { call_id: "retell-123" },
    };

    await handleRetellMessage(msg, socket, session, costTracker, deps);

    expect(session.state).toBe("active");
  });

  it("should handle response_required by calling LLM and sending streamed response", async () => {
    const msg: RetellMessage = {
      interaction_type: "response_required",
      response_id: 1,
      transcript: [{ role: "user", content: "Hello, how can I help?" }],
    };

    await handleRetellMessage(msg, socket, session, costTracker, deps);

    expect(deps.llmProvider.complete).toHaveBeenCalledOnce();

    // Streaming sends a completion signal after the response
    const sentMessages = getAllSentJSON(socket);
    const completionMsg = sentMessages.find(
      (m) => (m as Record<string, unknown>)["content_complete"] === true
    );
    expect(completionMsg).toMatchObject({
      response_type: "response",
      response_id: 1,
      content_complete: true,
    });

    // Verify stream: true and onChunk were passed to LLM
    const completeCall = (deps.llmProvider.complete as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(completeCall.stream).toBe(true);
    expect(typeof completeCall.onChunk).toBe("function");
  });

  it("should clear whisper queue after LLM response", async () => {
    session.whisperQueue = ["Tell them about the deal"];

    const msg: RetellMessage = {
      interaction_type: "response_required",
      response_id: 2,
      transcript: [{ role: "user", content: "What do you need?" }],
    };

    await handleRetellMessage(msg, socket, session, costTracker, deps);

    expect(session.whisperQueue).toHaveLength(0);
  });

  it("should call onTranscriptUpdate callback after response", async () => {
    const msg: RetellMessage = {
      interaction_type: "response_required",
      response_id: 3,
      transcript: [{ role: "user", content: "Yes?" }],
    };

    await handleRetellMessage(msg, socket, session, costTracker, deps);

    expect(deps.onTranscriptUpdate).toHaveBeenCalledWith(
      session,
      "agent",
      "I'm calling about a reservation."
    );
  });

  it("should track LLM cost usage", async () => {
    const msg: RetellMessage = {
      interaction_type: "response_required",
      response_id: 4,
      transcript: [{ role: "user", content: "Go ahead" }],
    };

    await handleRetellMessage(msg, socket, session, costTracker, deps);

    const breakdown = costTracker.getBreakdown();
    expect(breakdown.llm).toBeGreaterThan(0);
  });

  it("should handle update_only by notifying transcript update", async () => {
    const msg: RetellMessage = {
      interaction_type: "update_only",
      transcript: [{ role: "user", content: "I'm interested in your services" }],
    };

    await handleRetellMessage(msg, socket, session, costTracker, deps);

    expect(deps.onTranscriptUpdate).toHaveBeenCalledWith(
      session,
      "business",
      "I'm interested in your services"
    );
    expect(socket.send).not.toHaveBeenCalled();
  });

  it("should handle ping_pong by echoing timestamp", async () => {
    const msg: RetellMessage = {
      interaction_type: "ping_pong",
      timestamp: 1234567890,
    };

    await handleRetellMessage(msg, socket, session, costTracker, deps);

    expect(getSentJSON(socket)).toMatchObject({
      response_type: "ping_pong",
      timestamp: 1234567890,
    });
  });

  it("should skip response_required without transcript or response_id", async () => {
    const msg: RetellMessage = {
      interaction_type: "response_required",
    };

    await handleRetellMessage(msg, socket, session, costTracker, deps);

    expect(deps.llmProvider.complete).not.toHaveBeenCalled();
    expect(socket.send).not.toHaveBeenCalled();
  });
});
