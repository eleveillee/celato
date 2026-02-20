import type { CallSession } from "@celato/shared";
import { describe, expect, it } from "vitest";
import { buildLLMMessages, buildSystemPrompt } from "./prompt-builder.js";

function makeSession(overrides: Partial<CallSession> = {}): CallSession {
  return {
    id: "test-session",
    phoneNumber: "+15551234567",
    state: "active",
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

describe("buildSystemPrompt", () => {
  it("should include AI identification for transparent mode", () => {
    const session = makeSession({ personaMode: "transparent" });
    const prompt = buildSystemPrompt(session);

    expect(prompt).toContain("AI assistant");
    expect(prompt).toContain("DIRECTOR INSTRUCTION");
  });

  it("should use first person for proxy mode", () => {
    const session = makeSession({ personaMode: "proxy" });
    const prompt = buildSystemPrompt(session);

    expect(prompt).toContain("first person");
    expect(prompt).toContain("Do NOT mention that you are an AI");
  });

  it("should include language directive for non-English target", () => {
    const session = makeSession({
      targetLanguage: "es",
      targetLanguageName: "Spanish",
    });
    const prompt = buildSystemPrompt(session);

    expect(prompt).toContain("Spanish");
    expect(prompt).toContain("ALWAYS speak to the business in Spanish");
  });

  it("should not include language directive for English", () => {
    const session = makeSession({ targetLanguage: "en" });
    const prompt = buildSystemPrompt(session);

    expect(prompt).not.toContain("ALWAYS speak to the business in");
  });

  it("should include purpose when provided", () => {
    const session = makeSession({ purpose: "Make a dinner reservation" });
    const prompt = buildSystemPrompt(session);

    expect(prompt).toContain("Make a dinner reservation");
  });

  it("should include user notes when provided", () => {
    const session = makeSession({ userNotes: "Mention nut allergies" });
    const prompt = buildSystemPrompt(session);

    expect(prompt).toContain("Mention nut allergies");
  });

  it("should not include purpose section when not provided", () => {
    const session = makeSession({ purpose: undefined });
    const prompt = buildSystemPrompt(session);

    expect(prompt).not.toContain("Call purpose:");
  });
});

describe("buildLLMMessages", () => {
  it("should start with system prompt as first message", () => {
    const session = makeSession();
    const messages = buildLLMMessages(session, []);

    expect(messages[0]?.role).toBe("system");
    expect(messages[0]?.content).toContain("AI assistant");
  });

  it("should include conversation context (whisper instructions)", () => {
    const session = makeSession({
      conversationContext: [
        { role: "system", content: "[DIRECTOR INSTRUCTION: Ask about prices]" },
      ],
    });

    const messages = buildLLMMessages(session, []);

    expect(messages).toHaveLength(2);
    expect(messages[1]?.role).toBe("system");
    expect(messages[1]?.content).toContain("DIRECTOR INSTRUCTION");
  });

  it("should map Retell transcript roles correctly", () => {
    const session = makeSession();
    const transcript = [
      { role: "user" as const, content: "Hello, how can I help you?" },
      { role: "agent" as const, content: "I'm calling about a reservation" },
    ];

    const messages = buildLLMMessages(session, transcript);

    // System prompt + 2 transcript turns
    expect(messages).toHaveLength(3);
    expect(messages[1]?.role).toBe("user"); // Retell "user" = business
    expect(messages[2]?.role).toBe("assistant"); // Retell "agent" = our assistant
  });

  it("should limit transcript to last 10 turns (D-014-LAT context windowing)", () => {
    const session = makeSession();
    const transcript = Array.from({ length: 15 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "agent") as "user" | "agent",
      content: `Turn ${i + 1}`,
    }));

    const messages = buildLLMMessages(session, transcript);

    // System prompt + 10 transcript turns (not 15)
    expect(messages).toHaveLength(11);
    expect(messages[1]?.content).toBe("Turn 6"); // Starts from 6th (last 10 of 15)
  });

  it("should order messages: system prompt, whispers, then transcript", () => {
    const session = makeSession({
      conversationContext: [{ role: "system", content: "[DIRECTOR INSTRUCTION: Be firm]" }],
    });
    const transcript = [{ role: "user" as const, content: "What's your offer?" }];

    const messages = buildLLMMessages(session, transcript);

    expect(messages[0]?.role).toBe("system"); // System prompt
    expect(messages[1]?.role).toBe("system"); // Whisper instruction
    expect(messages[2]?.role).toBe("user"); // Business transcript
  });
});
