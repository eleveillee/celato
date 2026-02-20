/**
 * Core types and contracts shared across Celato packages.
 * VS-1: Text-based whispers, persona modes, multi-language.
 */

export type AudioMode = "standard" | "whisper" | "passthrough";

export type CallState = "idle" | "connecting" | "active" | "holding" | "ended";

export type PersonaMode = "transparent" | "proxy";

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: readonly LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "zh", name: "Mandarin", nativeName: "中文" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
] as const;

export interface WhisperMessage {
  type: "whisper";
  text: string;
  timestamp: number;
}

export interface AgentMessage {
  type: "agent";
  text: string;
  timestamp: number;
}

export interface BusinessMessage {
  type: "business";
  text: string;
  timestamp: number;
}

export type ConversationMessage = WhisperMessage | AgentMessage | BusinessMessage;

export interface CallSession {
  id: string;
  retellCallId?: string | undefined;
  phoneNumber: string;
  state: CallState;
  audioMode: AudioMode;
  personaMode: PersonaMode;
  targetLanguage: string;
  targetLanguageName: string;
  purpose?: string | undefined;
  userNotes?: string | undefined;
  startedAt: Date;
  endedAt?: Date | undefined;
  messages: ConversationMessage[];
  conversationContext: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  whisperQueue: string[];
}

export interface CostBreakdown {
  retell: number;
  llm: number;
  transcription?: number | undefined;
  total: number;
}
