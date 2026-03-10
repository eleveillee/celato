"use client";

import type {
  CostUpdateMessage,
  ErrorMessage,
  StateUpdateMessage,
  TranscriptMessage,
  WebCallTokenMessage,
} from "@celato/shared";
import { ServerMessageSchema } from "@celato/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { debug } from "../debug-logger";
import { useWebSocket } from "../hooks/use-websocket";
import { ActiveCallView } from "./active-call-view";
import { CallSummary } from "./call-summary";
import type { CostData } from "./cost-display";
import { type CallFormData, PreCallForm } from "./pre-call-form";
import type { TranscriptEntry } from "./transcript";

type AppPhase = "idle" | "connecting" | "active" | "ended";

// biome-ignore lint/complexity/useLiteralKeys: env vars are index-accessed
const WS_URL = process.env["NEXT_PUBLIC_WS_URL"] ?? "ws://localhost:4000/ws";

interface MessageHandlers {
  setPhase: (phase: AppPhase) => void;
  setTranscript: React.Dispatch<React.SetStateAction<TranscriptEntry[]>>;
  setCost: (cost: CostData | null) => void;
  setError: (error: string | null) => void;
  setCallDuration: (duration: number) => void;
  sessionIdRef: { current: string | null };
  callStartRef: { current: number };
  startRetellWebCall: (accessToken: string) => void;
}

function onStateUpdate(msg: StateUpdateMessage, h: MessageHandlers): void {
  debug.call.info(`State: ${msg.state}`, { sessionId: msg.sessionId });
  if (msg.state === "connecting") {
    h.sessionIdRef.current = msg.sessionId ?? null;
    h.setPhase("connecting");
  } else if (msg.state === "active") {
    h.setPhase("active");
    h.callStartRef.current = Date.now();
  } else if (msg.state === "ended") {
    // Only calculate duration for server-initiated endings (Retell hangup).
    // User-initiated endings already set duration in handleEndCall.
    if (h.callStartRef.current > 0) {
      h.setCallDuration(Math.floor((Date.now() - h.callStartRef.current) / 1000));
      h.callStartRef.current = 0;
    }
    h.setPhase("ended");
  }
}

function onTranscript(msg: TranscriptMessage, h: MessageHandlers): void {
  h.setTranscript((prev) => [
    ...prev,
    { speaker: msg.speaker, text: msg.text, timestamp: msg.timestamp, isHidden: msg.isHidden },
  ]);
}

function onCostUpdate(msg: CostUpdateMessage, h: MessageHandlers): void {
  h.setCost({ totalCost: msg.totalCost, breakdown: msg.breakdown });
}

function onError(msg: ErrorMessage, h: MessageHandlers): void {
  debug.call.error(`Error: ${msg.code}`, { message: msg.message, retryable: msg.retryable });
  h.setError(`${msg.code}: ${msg.message}`);
  if (msg.retryable) {
    setTimeout(() => h.setError(null), 5000);
  }
}

function onWebCallToken(msg: WebCallTokenMessage, h: MessageHandlers): void {
  debug.retell.info("Received web_call_token, starting Retell Web SDK", { tokenPrefix: msg.accessToken.slice(0, 20) + "..." });
  h.startRetellWebCall(msg.accessToken);
}

export function CallApp(): React.JSX.Element {
  const [phase, setPhase] = useState<AppPhase>("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [cost, setCost] = useState<CostData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [whisperCount, setWhisperCount] = useState(0);
  const sessionIdRef = useRef<string | null>(null);
  const callStartRef = useRef<number>(0);
  const [callDuration, setCallDuration] = useState(0);
  // biome-ignore lint/suspicious/noExplicitAny: RetellWebClient type from external SDK
  const retellWebClientRef = useRef<any>(null);

  const startRetellWebCall = useCallback(async (accessToken: string) => {
    try {
      // Dynamic import — retell-client-js-sdk is only needed for web calls
      const { RetellWebClient } = await import("retell-client-js-sdk");
      const client = new RetellWebClient();
      retellWebClientRef.current = client;

      client.on("call_started", () => {
        debug.retell.info("call_started — Retell Web SDK connected to agent");
        setPhase("active");
        callStartRef.current = Date.now();
      });

      client.on("call_ended", () => {
        debug.retell.info("call_ended — Retell Web SDK disconnected");
        if (callStartRef.current > 0) {
          const dur = Math.floor((Date.now() - callStartRef.current) / 1000);
          debug.retell.info(`Call lasted ${dur}s`);
          setCallDuration(dur);
          callStartRef.current = 0;
        }
        setPhase("ended");
        retellWebClientRef.current = null;
      });

      client.on("error", (err: unknown) => {
        const message = err instanceof Error ? err.message : "Web call error";
        debug.retell.error("Retell SDK error", err);
        setError(`RETELL_WEB_ERROR: ${message}`);
      });

      // Log any additional events for debugging
      client.on("update", (update: unknown) => {
        debug.retell.info("update", update);
      });

      debug.retell.info("Calling client.startCall()...");
      await client.startCall({ accessToken });
      debug.retell.info("startCall() resolved — waiting for call_started event");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start web call";
      setError(`RETELL_WEB_ERROR: ${message}`);
    }
  }, [setPhase, setCallDuration, setError]);

  const handlersRef = useRef<MessageHandlers>({
    setPhase,
    setTranscript,
    setCost,
    setError,
    setCallDuration,
    sessionIdRef,
    callStartRef,
    startRetellWebCall,
  });
  handlersRef.current = {
    setPhase,
    setTranscript,
    setCost,
    setError,
    setCallDuration,
    sessionIdRef,
    callStartRef,
    startRetellWebCall,
  };

  const handleMessage = useCallback((raw: Record<string, unknown>) => {
    const result = ServerMessageSchema.safeParse(raw);
    if (!result.success) return;
    const msg = result.data;
    const h = handlersRef.current;

    switch (msg.type) {
      case "state_update":
        onStateUpdate(msg, h);
        break;
      case "transcript":
        onTranscript(msg, h);
        break;
      case "cost_update":
        onCostUpdate(msg, h);
        break;
      case "error":
        onError(msg, h);
        break;
      case "web_call_token":
        onWebCallToken(msg, h);
        break;
    }
  }, []);

  const { status, send, connect } = useWebSocket(WS_URL, handleMessage);

  // biome-ignore lint/correctness/useExhaustiveDependencies: connect is stable, fire once on mount
  useEffect(() => {
    connect();
  }, []);

  // Detect connection loss during an active call — session is gone server-side
  useEffect(() => {
    const isInCall = phase === "active" || phase === "connecting";
    if (status === "disconnected" && isInCall) {
      setError("Connection lost. Unable to reconnect.");
      setPhase("ended");
    } else if (status === "reconnecting" && isInCall) {
      setError("Connection interrupted — call session may be lost.");
    }
  }, [status, phase]);

  function handleStartCall(data: CallFormData): void {
    setPhase("connecting"); // Set immediately to prevent double-click
    setTranscript([]);
    setCost(null);
    setError(null);
    setWhisperCount(0);

    send({
      type: "start_call",
      phoneNumber: data.phoneNumber,
      personaMode: data.personaMode,
      targetLanguage: data.targetLanguage,
      purpose: data.purpose || undefined,
      userNotes: data.userNotes || undefined,
      timestamp: Date.now(),
    });
  }

  function handleWhisper(text: string): void {
    send({ type: "whisper", text, timestamp: Date.now() });
    setWhisperCount((c) => c + 1);
  }

  function handleEndCall(): void {
    if (callStartRef.current > 0) {
      setCallDuration(Math.floor((Date.now() - callStartRef.current) / 1000));
      callStartRef.current = 0; // Prevent server-side onStateUpdate from recalculating
    }
    // Stop Retell web call if active
    if (retellWebClientRef.current) {
      retellWebClientRef.current.stopCall();
      retellWebClientRef.current = null;
    }
    send({ type: "end_call", timestamp: Date.now() });
    setPhase("ended");
  }

  function handleNewCall(): void {
    // Defensive: stop web call if somehow still active
    if (retellWebClientRef.current) {
      retellWebClientRef.current.stopCall();
      retellWebClientRef.current = null;
    }
    setPhase("idle");
    setTranscript([]);
    setCost(null);
    setError(null);
    setWhisperCount(0);
    setCallDuration(0);
    sessionIdRef.current = null;
    callStartRef.current = 0;
  }

  const statusLabel =
    status === "connected"
      ? "Connected"
      : status === "reconnecting"
        ? "Reconnecting..."
        : status === "connecting"
          ? "Connecting..."
          : "Disconnected";
  const statusColor =
    status === "connected"
      ? "bg-green-500"
      : status === "reconnecting"
        ? "animate-pulse bg-yellow-500"
        : "bg-red-400";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Celato</h1>
        <p className="mt-1 text-sm text-gray-500">Your Bionic Director</p>
        <div className="mt-2 flex items-center justify-center gap-1.5">
          <span className={`inline-block h-2 w-2 rounded-full ${statusColor}`} />
          <span className="text-xs text-gray-400">{statusLabel}</span>
        </div>
      </header>

      {error && (
        <div className="mx-auto mb-4 max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {phase === "idle" && (
        <PreCallForm onStartCall={handleStartCall} isConnected={status === "connected"} />
      )}

      {(phase === "connecting" || phase === "active") && (
        <ActiveCallView
          callState={phase}
          transcript={transcript}
          cost={cost}
          onWhisper={handleWhisper}
          onEndCall={handleEndCall}
        />
      )}

      {phase === "ended" && (
        <CallSummary
          transcript={transcript}
          cost={cost}
          duration={callDuration}
          whisperCount={whisperCount}
          onNewCall={handleNewCall}
        />
      )}
    </div>
  );
}
