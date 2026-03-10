"use client";

import { useEffect, useRef, useState } from "react";
import { type CostData, CostDisplay } from "./cost-display";
import { Transcript, type TranscriptEntry } from "./transcript";
import { WhisperInput } from "./whisper-input";

interface ActiveCallViewProps {
  callState: "connecting" | "active";
  transcript: TranscriptEntry[];
  cost: CostData | null;
  onWhisper: (text: string) => void;
  onEndCall: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ActiveCallView({
  callState,
  transcript,
  cost,
  onWhisper,
  onEndCall,
}: ActiveCallViewProps): React.JSX.Element {
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (callState === "active") {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col gap-3">
      {/* Header: status, timer, cost */}
      <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              callState === "active" ? "animate-pulse bg-green-500" : "animate-pulse bg-yellow-500"
            }`}
          />
          <span className="text-sm font-medium text-gray-700">
            {callState === "active" ? "Call Active" : "Connecting..."}
          </span>
          {callState === "active" && (
            <span className="font-mono text-sm text-gray-500">{formatDuration(duration)}</span>
          )}
        </div>
        <CostDisplay cost={cost} />
      </div>

      {/* Transcript */}
      <div className="min-h-0 flex-1 rounded-lg bg-white shadow-sm">
        <Transcript entries={transcript} />
      </div>

      {/* Whisper Input */}
      <WhisperInput onWhisper={onWhisper} isActive={callState === "active"} />

      {/* End Call Button */}
      <button
        type="button"
        onClick={onEndCall}
        className="rounded-lg bg-red-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-red-700"
      >
        End Call
      </button>
    </div>
  );
}
