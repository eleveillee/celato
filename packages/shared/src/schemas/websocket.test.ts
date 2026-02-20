import { describe, expect, it } from "vitest";
import {
  AckMessageSchema,
  ClientMessageSchema,
  CostUpdateMessageSchema,
  EndCallMessageSchema,
  ErrorMessageSchema,
  ModeChangeMessageSchema,
  ServerMessageSchema,
  StartCallMessageSchema,
  StateUpdateMessageSchema,
  TranscriptMessageSchema,
  WhisperMessageSchema,
} from "./websocket.js";

describe("Client → Server Schemas", () => {
  describe("WhisperMessageSchema", () => {
    it("should validate a valid whisper message", () => {
      const result = WhisperMessageSchema.safeParse({
        type: "whisper",
        text: "Tell them I'm running late",
        timestamp: Date.now(),
      });

      expect(result.success).toBe(true);
    });

    it("should reject empty text", () => {
      const result = WhisperMessageSchema.safeParse({
        type: "whisper",
        text: "",
        timestamp: Date.now(),
      });

      expect(result.success).toBe(false);
    });

    it("should reject text over 500 characters", () => {
      const result = WhisperMessageSchema.safeParse({
        type: "whisper",
        text: "a".repeat(501),
        timestamp: Date.now(),
      });

      expect(result.success).toBe(false);
    });
  });

  describe("StartCallMessageSchema", () => {
    it("should validate a full start_call message", () => {
      const result = StartCallMessageSchema.safeParse({
        type: "start_call",
        phoneNumber: "+15551234567",
        personaMode: "transparent",
        targetLanguage: "es",
        purpose: "Make a reservation",
        userNotes: "Mention nut allergies",
        timestamp: Date.now(),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.targetLanguage).toBe("es");
      }
    });

    it("should default targetLanguage to 'en'", () => {
      const result = StartCallMessageSchema.safeParse({
        type: "start_call",
        phoneNumber: "+15551234567",
        personaMode: "proxy",
        timestamp: Date.now(),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.targetLanguage).toBe("en");
      }
    });

    it("should reject invalid personaMode", () => {
      const result = StartCallMessageSchema.safeParse({
        type: "start_call",
        phoneNumber: "+15551234567",
        personaMode: "stealth",
        timestamp: Date.now(),
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-E.164 phone numbers", () => {
      const badNumbers = ["5551234567", "+1", "abc", "+0123456789"];
      for (const phone of badNumbers) {
        const result = StartCallMessageSchema.safeParse({
          type: "start_call",
          phoneNumber: phone,
          personaMode: "transparent",
          timestamp: Date.now(),
        });

        expect(result.success).toBe(false);
      }
    });

    it("should reject purpose over 500 characters", () => {
      const result = StartCallMessageSchema.safeParse({
        type: "start_call",
        phoneNumber: "+15551234567",
        personaMode: "transparent",
        purpose: "x".repeat(501),
        timestamp: Date.now(),
      });

      expect(result.success).toBe(false);
    });
  });

  describe("EndCallMessageSchema", () => {
    it("should validate end_call", () => {
      const result = EndCallMessageSchema.safeParse({
        type: "end_call",
        timestamp: Date.now(),
      });

      expect(result.success).toBe(true);
    });
  });

  describe("ModeChangeMessageSchema", () => {
    it("should validate mode_change", () => {
      const result = ModeChangeMessageSchema.safeParse({
        type: "mode_change",
        mode: "whisper",
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid mode", () => {
      const result = ModeChangeMessageSchema.safeParse({
        type: "mode_change",
        mode: "silent",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("ClientMessageSchema (discriminated union)", () => {
    it("should accept whisper messages", () => {
      const result = ClientMessageSchema.safeParse({
        type: "whisper",
        text: "Ask about hours",
        timestamp: Date.now(),
      });

      expect(result.success).toBe(true);
    });

    it("should accept start_call messages", () => {
      const result = ClientMessageSchema.safeParse({
        type: "start_call",
        phoneNumber: "+15551234567",
        personaMode: "transparent",
        timestamp: Date.now(),
      });

      expect(result.success).toBe(true);
    });

    it("should reject unknown message types", () => {
      const result = ClientMessageSchema.safeParse({
        type: "unknown_type",
        timestamp: Date.now(),
      });

      expect(result.success).toBe(false);
    });
  });
});

describe("Server → Client Schemas", () => {
  describe("AckMessageSchema", () => {
    it("should validate ack", () => {
      const result = AckMessageSchema.safeParse({
        type: "ack",
        timestamp: Date.now(),
      });

      expect(result.success).toBe(true);
    });
  });

  describe("TranscriptMessageSchema", () => {
    it("should validate transcript with isHidden default", () => {
      const result = TranscriptMessageSchema.safeParse({
        type: "transcript",
        speaker: "agent",
        text: "Hello, how can I help?",
        timestamp: Date.now(),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isHidden).toBe(false);
      }
    });

    it("should accept whisper speaker with isHidden true", () => {
      const result = TranscriptMessageSchema.safeParse({
        type: "transcript",
        speaker: "whisper",
        text: "Tell them about the allergies",
        isHidden: true,
        timestamp: Date.now(),
      });

      expect(result.success).toBe(true);
    });
  });

  describe("StateUpdateMessageSchema", () => {
    it("should validate all states", () => {
      for (const state of ["idle", "connecting", "active", "holding", "ended"]) {
        const result = StateUpdateMessageSchema.safeParse({
          type: "state_update",
          state,
          timestamp: Date.now(),
        });

        expect(result.success).toBe(true);
      }
    });

    it("should accept optional sessionId", () => {
      const result = StateUpdateMessageSchema.safeParse({
        type: "state_update",
        state: "connecting",
        sessionId: "abc-123",
        timestamp: Date.now(),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sessionId).toBe("abc-123");
      }
    });
  });

  describe("CostUpdateMessageSchema", () => {
    it("should validate cost update", () => {
      const result = CostUpdateMessageSchema.safeParse({
        type: "cost_update",
        totalCost: 0.08,
        breakdown: { retell: 0.07, llm: 0.01 },
        timestamp: Date.now(),
      });

      expect(result.success).toBe(true);
    });

    it("should accept optional transcription cost", () => {
      const result = CostUpdateMessageSchema.safeParse({
        type: "cost_update",
        totalCost: 0.09,
        breakdown: { retell: 0.07, llm: 0.01, transcription: 0.01 },
        timestamp: Date.now(),
      });

      expect(result.success).toBe(true);
    });
  });

  describe("ErrorMessageSchema", () => {
    it("should validate error message", () => {
      const result = ErrorMessageSchema.safeParse({
        type: "error",
        code: "CALL_NOT_ACTIVE",
        message: "No active call session",
        retryable: false,
        timestamp: Date.now(),
      });

      expect(result.success).toBe(true);
    });
  });

  describe("ServerMessageSchema (discriminated union)", () => {
    it("should accept all valid server message types", () => {
      const messages = [
        { type: "ack", timestamp: Date.now() },
        { type: "transcript", speaker: "agent", text: "Hello", timestamp: Date.now() },
        { type: "state_update", state: "active", timestamp: Date.now() },
        {
          type: "cost_update",
          totalCost: 0.08,
          breakdown: { retell: 0.07, llm: 0.01 },
          timestamp: Date.now(),
        },
        {
          type: "error",
          code: "INTERNAL_ERROR",
          message: "Something went wrong",
          retryable: true,
          timestamp: Date.now(),
        },
      ];

      for (const msg of messages) {
        const result = ServerMessageSchema.safeParse(msg);
        expect(result.success).toBe(true);
      }
    });
  });
});
