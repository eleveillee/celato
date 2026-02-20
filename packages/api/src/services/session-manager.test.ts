import { beforeEach, describe, expect, it } from "vitest";
import {
  addWhisper,
  createSession,
  deleteSession,
  getActiveSessionCount,
  getSession,
  getSessionByRetellCallId,
} from "./session-manager.js";

describe("SessionManager", () => {
  beforeEach(() => {
    // Clear all sessions between tests by deleting known sessions
    // (no exported clear function, so we track and clean up)
  });

  it("should create a session with correct defaults", () => {
    const session = createSession({
      phoneNumber: "+15551234567",
      personaMode: "transparent",
    });

    expect(session.id).toBeDefined();
    expect(session.phoneNumber).toBe("+15551234567");
    expect(session.state).toBe("idle");
    expect(session.audioMode).toBe("standard");
    expect(session.personaMode).toBe("transparent");
    expect(session.targetLanguage).toBe("en");
    expect(session.targetLanguageName).toBe("English");
    expect(session.messages).toHaveLength(0);
    expect(session.conversationContext).toHaveLength(0);
    expect(session.whisperQueue).toHaveLength(0);

    // Cleanup
    deleteSession(session.id);
  });

  it("should resolve target language name from code", () => {
    const session = createSession({
      phoneNumber: "+15551234567",
      personaMode: "proxy",
      targetLanguage: "es",
    });

    expect(session.targetLanguage).toBe("es");
    expect(session.targetLanguageName).toBe("Spanish");

    deleteSession(session.id);
  });

  it("should default to English for unknown language code", () => {
    const session = createSession({
      phoneNumber: "+15551234567",
      personaMode: "transparent",
      targetLanguage: "xx",
    });

    expect(session.targetLanguage).toBe("xx");
    expect(session.targetLanguageName).toBe("English");

    deleteSession(session.id);
  });

  it("should store purpose and userNotes", () => {
    const session = createSession({
      phoneNumber: "+15551234567",
      personaMode: "transparent",
      purpose: "Make a reservation",
      userNotes: "Nut allergy",
    });

    expect(session.purpose).toBe("Make a reservation");
    expect(session.userNotes).toBe("Nut allergy");

    deleteSession(session.id);
  });

  it("should retrieve session by id", () => {
    const session = createSession({
      phoneNumber: "+15551234567",
      personaMode: "transparent",
    });

    const retrieved = getSession(session.id);
    expect(retrieved).toBe(session);

    deleteSession(session.id);
  });

  it("should return undefined for unknown id", () => {
    expect(getSession("nonexistent")).toBeUndefined();
  });

  it("should find session by retellCallId", () => {
    const session = createSession({
      phoneNumber: "+15551234567",
      personaMode: "transparent",
    });
    session.retellCallId = "retell-abc-123";

    const found = getSessionByRetellCallId("retell-abc-123");
    expect(found).toBe(session);

    deleteSession(session.id);
  });

  it("should return undefined for unknown retellCallId", () => {
    expect(getSessionByRetellCallId("nonexistent")).toBeUndefined();
  });

  it("should delete a session", () => {
    const session = createSession({
      phoneNumber: "+15551234567",
      personaMode: "transparent",
    });

    expect(deleteSession(session.id)).toBe(true);
    expect(getSession(session.id)).toBeUndefined();
  });

  it("should return false when deleting nonexistent session", () => {
    expect(deleteSession("nonexistent")).toBe(false);
  });

  it("should add whisper to queue and conversation context", () => {
    const session = createSession({
      phoneNumber: "+15551234567",
      personaMode: "transparent",
    });

    addWhisper(session, "Tell them I'm running late");

    expect(session.whisperQueue).toHaveLength(1);
    expect(session.whisperQueue[0]).toBe("Tell them I'm running late");

    expect(session.conversationContext).toHaveLength(1);
    expect(session.conversationContext[0]?.role).toBe("system");
    expect(session.conversationContext[0]?.content).toContain(
      "DIRECTOR INSTRUCTION: Tell them I'm running late"
    );

    expect(session.messages).toHaveLength(1);
    expect(session.messages[0]?.type).toBe("whisper");

    deleteSession(session.id);
  });

  it("should track active session count", () => {
    const before = getActiveSessionCount();

    const s1 = createSession({
      phoneNumber: "+15551111111",
      personaMode: "transparent",
    });
    const s2 = createSession({
      phoneNumber: "+15552222222",
      personaMode: "proxy",
    });

    expect(getActiveSessionCount()).toBe(before + 2);

    deleteSession(s1.id);
    expect(getActiveSessionCount()).toBe(before + 1);

    deleteSession(s2.id);
    expect(getActiveSessionCount()).toBe(before);
  });
});
