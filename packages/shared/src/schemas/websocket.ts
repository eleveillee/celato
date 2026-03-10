/**
 * Zod schemas for WebSocket message validation.
 * VS-1: Text-based whispers, start/end call, cost/transcript/state updates.
 */

import { z } from "zod/v4";

// ============================================================================
// Client → Server Messages
// ============================================================================

export const WhisperMessageSchema = z.object({
  type: z.literal("whisper"),
  text: z.string().min(1).max(500),
  timestamp: z.number(),
});
export type WhisperSchemaMessage = z.infer<typeof WhisperMessageSchema>;

export const StartCallMessageSchema = z.object({
  type: z.literal("start_call"),
  phoneNumber: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format")
    .optional(),
  personaMode: z.enum(["transparent", "proxy"]),
  targetLanguage: z.string().default("en"),
  purpose: z.string().max(500).optional(),
  userNotes: z.string().max(1000).optional(),
  timestamp: z.number(),
});
export type StartCallMessage = z.infer<typeof StartCallMessageSchema>;

export const EndCallMessageSchema = z.object({
  type: z.literal("end_call"),
  timestamp: z.number(),
});
export type EndCallMessage = z.infer<typeof EndCallMessageSchema>;

export const ModeChangeMessageSchema = z.object({
  type: z.literal("mode_change"),
  mode: z.enum(["standard", "whisper", "passthrough"]),
});
export type ModeChangeMessage = z.infer<typeof ModeChangeMessageSchema>;

export const ClientMessageSchema = z.discriminatedUnion("type", [
  WhisperMessageSchema,
  StartCallMessageSchema,
  EndCallMessageSchema,
  ModeChangeMessageSchema,
]);
export type ClientMessage = z.infer<typeof ClientMessageSchema>;

// ============================================================================
// Server → Client Messages
// ============================================================================

export const AckMessageSchema = z.object({
  type: z.literal("ack"),
  timestamp: z.number(),
});
export type AckMessage = z.infer<typeof AckMessageSchema>;

export const TranscriptMessageSchema = z.object({
  type: z.literal("transcript"),
  speaker: z.enum(["business", "agent", "whisper", "system"]),
  text: z.string(),
  isHidden: z.boolean().default(false),
  timestamp: z.number(),
});
export type TranscriptMessage = z.infer<typeof TranscriptMessageSchema>;

export const StateUpdateMessageSchema = z.object({
  type: z.literal("state_update"),
  state: z.enum(["idle", "connecting", "active", "holding", "ended"]),
  sessionId: z.string().optional(),
  timestamp: z.number(),
});
export type StateUpdateMessage = z.infer<typeof StateUpdateMessageSchema>;

export const CostUpdateMessageSchema = z.object({
  type: z.literal("cost_update"),
  totalCost: z.number(),
  breakdown: z.object({
    retell: z.number(),
    llm: z.number(),
    transcription: z.number().optional(),
  }),
  timestamp: z.number(),
});
export type CostUpdateMessage = z.infer<typeof CostUpdateMessageSchema>;

export const ErrorMessageSchema = z.object({
  type: z.literal("error"),
  code: z.string(),
  message: z.string(),
  retryable: z.boolean(),
  timestamp: z.number(),
});
export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;

export const WebCallTokenMessageSchema = z.object({
  type: z.literal("web_call_token"),
  accessToken: z.string(),
  timestamp: z.number(),
});
export type WebCallTokenMessage = z.infer<typeof WebCallTokenMessageSchema>;

export const ServerMessageSchema = z.discriminatedUnion("type", [
  AckMessageSchema,
  TranscriptMessageSchema,
  StateUpdateMessageSchema,
  CostUpdateMessageSchema,
  ErrorMessageSchema,
  WebCallTokenMessageSchema,
]);
export type ServerMessage = z.infer<typeof ServerMessageSchema>;
