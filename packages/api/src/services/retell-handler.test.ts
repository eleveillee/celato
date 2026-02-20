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
    costPerInputToken: 0.15 / 1_000_000,
    costPerOutputToken: 0.6 / 1_000_000,
    complete: vi.fn().mockResolvedValue({
      content: "I'm calling about a reservation.",
      usage: { inputTokens: 100, outputTokens: 20 },
      model: "test-model",
      latencyMs: 150,
      ...response,
    }),
  };
}

/** Extract the JSON sent in the first socket.send() call. */
function getSentJSON(socket: import("ws").WebSocket): unknown {
  const calls = (socket.send as ReturnType<typeof vi.fn>).mock.calls;
  const firstCall = calls[0] as [string] | undefined;
  if (!firstCall) throw new Error("socket.send was not called");
  return JSON.parse(firstCall[0]);
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

  it("should handle response_required by calling LLM and sending response", async () => {
    const msg: RetellMessage = {
      interaction_type: "response_required",
      response_id: 1,
      transcript: [{ role: "user", content: "Hello, how can I help?" }],
    };

    await handleRetellMessage(msg, socket, session, costTracker, deps);

    expect(deps.llmProvider.complete).toHaveBeenCalledOnce();
    expect(socket.send).toHaveBeenCalledOnce();
    expect(getSentJSON(socket)).toMatchObject({
      response_type: "response",
      response_id: 1,
      content: "I'm calling about a reservation.",
      content_complete: true,
    });
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
