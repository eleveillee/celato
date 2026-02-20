import { randomUUID } from "node:crypto";
import type { CallSession, PersonaMode } from "@celato/shared";
import { SUPPORTED_LANGUAGES } from "@celato/shared";

export interface CreateSessionParams {
  phoneNumber: string;
  personaMode: PersonaMode;
  targetLanguage?: string | undefined;
  purpose?: string | undefined;
  userNotes?: string | undefined;
}

const activeSessions = new Map<string, CallSession>();

export function createSession(params: CreateSessionParams): CallSession {
  const id = randomUUID();
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === params.targetLanguage);

  const session: CallSession = {
    id,
    phoneNumber: params.phoneNumber,
    state: "idle",
    audioMode: "standard",
    personaMode: params.personaMode,
    targetLanguage: params.targetLanguage ?? "en",
    targetLanguageName: lang?.name ?? "English",
    purpose: params.purpose,
    userNotes: params.userNotes,
    startedAt: new Date(),
    messages: [],
    conversationContext: [],
    whisperQueue: [],
  };

  activeSessions.set(id, session);
  return session;
}

export function getSession(id: string): CallSession | undefined {
  return activeSessions.get(id);
}

export function getSessionByRetellCallId(callId: string): CallSession | undefined {
  for (const session of activeSessions.values()) {
    if (session.retellCallId === callId) {
      return session;
    }
  }
  return undefined;
}

export function deleteSession(id: string): boolean {
  return activeSessions.delete(id);
}

export function addWhisper(session: CallSession, text: string): void {
  session.whisperQueue.push(text);
  session.conversationContext.push({
    role: "system",
    content: `[DIRECTOR INSTRUCTION: ${text}]`,
  });
  session.messages.push({ type: "whisper", text, timestamp: Date.now() });
}

export function getActiveSessionCount(): number {
  return activeSessions.size;
}
