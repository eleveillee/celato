import { describe, it, expect } from "vitest";
import type {
  AudioMode,
  CallState,
  WhisperMessage,
  AgentMessage,
  BusinessMessage,
  CallSession,
} from "./index.js";

describe("Shared Types", () => {
  it("should create a valid WhisperMessage", () => {
    const message: WhisperMessage = {
      type: "whisper",
      audioData: new ArrayBuffer(0),
      timestamp: Date.now(),
    };

    expect(message.type).toBe("whisper");
    expect(message.audioData).toBeInstanceOf(ArrayBuffer);
    expect(message.timestamp).toBeGreaterThan(0);
  });

  it("should create a valid AgentMessage", () => {
    const message: AgentMessage = {
      type: "agent",
      text: "Hello, how can I help you?",
      translatedText: "Hola, ¿cómo puedo ayudarte?",
      timestamp: Date.now(),
    };

    expect(message.type).toBe("agent");
    expect(message.text).toBe("Hello, how can I help you?");
    expect(message.translatedText).toBe("Hola, ¿cómo puedo ayudarte?");
  });

  it("should create a valid BusinessMessage", () => {
    const message: BusinessMessage = {
      type: "business",
      text: "We have a table available at 8pm",
      timestamp: Date.now(),
    };

    expect(message.type).toBe("business");
    expect(message.text).toBe("We have a table available at 8pm");
  });

  it("should create a valid CallSession", () => {
    const session: CallSession = {
      id: "session-123",
      userId: "user-456",
      businessNumber: "+1234567890",
      state: "active",
      audioMode: "standard",
      startedAt: new Date(),
      messages: [],
    };

    expect(session.id).toBe("session-123");
    expect(session.state).toBe("active");
    expect(session.audioMode).toBe("standard");
    expect(session.messages).toHaveLength(0);
  });

  it("should validate AudioMode types", () => {
    const modes: AudioMode[] = ["standard", "whisper", "passthrough"];
    expect(modes).toHaveLength(3);
  });

  it("should validate CallState types", () => {
    const states: CallState[] = ["idle", "connecting", "active", "holding", "ended"];
    expect(states).toHaveLength(5);
  });
});
