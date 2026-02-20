import { describe, expect, it } from "vitest";
import type {
  AgentMessage,
  AudioMode,
  BusinessMessage,
  CallSession,
  CallState,
  CostBreakdown,
  LanguageOption,
  PersonaMode,
  WhisperMessage,
} from "./index.js";
import { SUPPORTED_LANGUAGES } from "./index.js";

describe("Shared Types", () => {
  it("should create a valid WhisperMessage with text", () => {
    const message: WhisperMessage = {
      type: "whisper",
      text: "Tell them I'm running late",
      timestamp: Date.now(),
    };

    expect(message.type).toBe("whisper");
    expect(message.text).toBe("Tell them I'm running late");
    expect(message.timestamp).toBeGreaterThan(0);
  });

  it("should create a valid AgentMessage", () => {
    const message: AgentMessage = {
      type: "agent",
      text: "Hello, how can I help you?",
      timestamp: Date.now(),
    };

    expect(message.type).toBe("agent");
    expect(message.text).toBe("Hello, how can I help you?");
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

  it("should create a valid CallSession with VS-1 fields", () => {
    const session: CallSession = {
      id: "session-123",
      phoneNumber: "+15551234567",
      state: "active",
      audioMode: "standard",
      personaMode: "transparent",
      targetLanguage: "en",
      targetLanguageName: "English",
      purpose: "Make a reservation",
      startedAt: new Date(),
      messages: [],
      conversationContext: [],
      whisperQueue: [],
    };

    expect(session.id).toBe("session-123");
    expect(session.state).toBe("active");
    expect(session.audioMode).toBe("standard");
    expect(session.personaMode).toBe("transparent");
    expect(session.targetLanguage).toBe("en");
    expect(session.messages).toHaveLength(0);
    expect(session.whisperQueue).toHaveLength(0);
  });

  it("should validate AudioMode types", () => {
    const modes: AudioMode[] = ["standard", "whisper", "passthrough"];
    expect(modes).toHaveLength(3);
  });

  it("should validate CallState types", () => {
    const states: CallState[] = ["idle", "connecting", "active", "holding", "ended"];
    expect(states).toHaveLength(5);
  });

  it("should validate PersonaMode types", () => {
    const modes: PersonaMode[] = ["transparent", "proxy"];
    expect(modes).toHaveLength(2);
  });

  it("should have 10 supported languages", () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(10);
  });

  it("should include English as first language", () => {
    const english = SUPPORTED_LANGUAGES[0] as LanguageOption;
    expect(english.code).toBe("en");
    expect(english.name).toBe("English");
    expect(english.nativeName).toBe("English");
  });

  it("should create a valid CostBreakdown", () => {
    const cost: CostBreakdown = {
      retell: 0.08,
      llm: 0.0002,
      total: 0.0802,
    };

    expect(cost.retell).toBe(0.08);
    expect(cost.llm).toBe(0.0002);
    expect(cost.total).toBe(0.0802);
    expect(cost.transcription).toBeUndefined();
  });
});
