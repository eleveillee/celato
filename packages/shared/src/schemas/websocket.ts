/**
 * Zod schemas for WebSocket message validation
 */

import { z } from "zod";

// ============================================================================
// VS-0: Current Implementation
// ============================================================================

/**
 * Acknowledgment response sent by server after receiving a message
 */
export const AckMessageSchema = z.object({
	type: z.literal("ack"),
	timestamp: z.number(),
});

export type AckMessage = z.infer<typeof AckMessageSchema>;

// ============================================================================
// Future Message Types (VS-1+)
// ============================================================================

/**
 * Whisper message sent by client (audio instruction to agent)
 */
export const WhisperMessageSchema = z.object({
	type: z.literal("whisper"),
	audioData: z.instanceof(ArrayBuffer),
	timestamp: z.number(),
});

// Type is already exported from types/index.ts
// Use: import type { WhisperMessage } from "@celato/shared"

/**
 * Mode change request from client
 */
export const ModeChangeMessageSchema = z.object({
	type: z.literal("mode_change"),
	mode: z.enum(["standard", "whisper", "passthrough"]),
});

export type ModeChangeMessage = z.infer<typeof ModeChangeMessageSchema>;

/**
 * Transcript message sent by server
 */
export const TranscriptMessageSchema = z.object({
	type: z.literal("transcript"),
	speaker: z.enum(["business", "agent"]),
	text: z.string(),
	translatedText: z.string().optional(),
	timestamp: z.number(),
});

export type TranscriptMessage = z.infer<typeof TranscriptMessageSchema>;

/**
 * State update message sent by server
 */
export const StateUpdateMessageSchema = z.object({
	type: z.literal("state_update"),
	state: z.enum(["idle", "connecting", "active", "holding", "ended"]),
	timestamp: z.number(),
});

export type StateUpdateMessage = z.infer<typeof StateUpdateMessageSchema>;

// ============================================================================
// Union Types
// ============================================================================

/**
 * All possible server → client messages
 */
export const ServerMessageSchema = z.discriminatedUnion("type", [
	AckMessageSchema,
	TranscriptMessageSchema,
	StateUpdateMessageSchema,
]);

export type ServerMessage = z.infer<typeof ServerMessageSchema>;

/**
 * All possible client → server messages
 */
export const ClientMessageSchema = z.discriminatedUnion("type", [
	WhisperMessageSchema,
	ModeChangeMessageSchema,
]);

export type ClientMessage = z.infer<typeof ClientMessageSchema>;
