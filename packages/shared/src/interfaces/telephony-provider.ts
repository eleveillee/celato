/**
 * Abstract telephony layer (D-020-TEL).
 * Protects against Retell vendor lock-in.
 * VS-1: RetellProvider implementation.
 * Future: TwilioProvider if Retell issues arise.
 */

export type TelephonyCallState = "connecting" | "active" | "holding" | "ended" | "error";

export interface TranscriptEvent {
  role: "agent" | "user";
  content: string;
  words?: Array<{ word: string; start: number; end: number }>;
}

export interface ResponseContext {
  responseId: number;
  transcript: TranscriptEvent[];
  interactionType: "response_required" | "reminder_required";
}

export interface AgentResponse {
  responseId: number;
  content: string;
  contentComplete: boolean;
  endCall?: boolean;
}

export interface CreateCallParams {
  phoneNumber: string;
  systemPrompt: string;
  agentId?: string;
  metadata?: Record<string, string>;
}

export interface TelephonyProvider {
  readonly name: string;

  createCall(params: CreateCallParams): Promise<{ callId: string }>;
  endCall(callId: string): Promise<void>;

  onTranscript(callId: string, callback: (event: TranscriptEvent) => void): void;
  onResponseRequired(callId: string, callback: (context: ResponseContext) => void): void;
  onCallStateChange(callId: string, callback: (state: TelephonyCallState) => void): void;

  sendResponse(callId: string, response: AgentResponse): void;
  sendDTMF?(callId: string, digits: string): void;
}
