/**
 * Core types and contracts shared across Celato packages
 */

export type AudioMode = "standard" | "whisper" | "passthrough";

export type CallState = "idle" | "connecting" | "active" | "holding" | "ended";

export interface WhisperMessage {
  type: "whisper";
  audioData: ArrayBuffer;
  timestamp: number;
}

export interface AgentMessage {
  type: "agent";
  text: string;
  translatedText?: string;
  timestamp: number;
}

export interface BusinessMessage {
  type: "business";
  text: string;
  translatedText?: string;
  timestamp: number;
}

export type ConversationMessage = WhisperMessage | AgentMessage | BusinessMessage;

export interface CallSession {
  id: string;
  userId: string;
  businessNumber: string;
  state: CallState;
  audioMode: AudioMode;
  startedAt: Date;
  endedAt?: Date;
  messages: ConversationMessage[];
}
