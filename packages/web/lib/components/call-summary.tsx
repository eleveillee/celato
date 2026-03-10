"use client";

import { useState } from "react";
import type { CostData } from "./cost-display";
import type { TranscriptEntry } from "./transcript";

interface CallSummaryProps {
  transcript: TranscriptEntry[];
  cost: CostData | null;
  duration: number;
  whisperCount: number;
  onNewCall: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatUSD(value: number): string {
  return `$${value.toFixed(4)}`;
}

function transcriptToMarkdown(entries: TranscriptEntry[]): string {
  const lines = entries.map((entry) => {
    const time = new Date(entry.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const label =
      entry.speaker === "whisper"
        ? "You (whisper)"
        : entry.speaker.charAt(0).toUpperCase() + entry.speaker.slice(1);
    return `**${label}** [${time}]: ${entry.text}`;
  });
  return lines.join("\n\n");
}

function transcriptToJSON(entries: TranscriptEntry[]): string {
  return JSON.stringify(
    entries.map((e) => ({
      speaker: e.speaker,
      text: e.text,
      timestamp: e.timestamp,
      isHidden: e.isHidden,
    })),
    null,
    2
  );
}

export function CallSummary({
  transcript,
  cost,
  duration,
  whisperCount,
  onNewCall,
}: CallSummaryProps): React.JSX.Element {
  const [copied, setCopied] = useState<"md" | "json" | null>(null);

  async function copyTranscript(format: "md" | "json"): Promise<void> {
    const text = format === "md" ? transcriptToMarkdown(transcript) : transcriptToJSON(transcript);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(format);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard API unavailable (non-secure context or permission denied)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h2 className="text-center text-2xl font-bold text-gray-800">Call Ended</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-800">{formatDuration(duration)}</div>
          <div className="text-xs text-gray-500">Duration</div>
        </div>
        <div className="rounded-lg bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-800">
            {cost ? formatUSD(cost.totalCost) : "$0.00"}
          </div>
          <div className="text-xs text-gray-500">Total Cost</div>
          {cost && (
            <div className="mt-1 text-xs text-gray-400">
              Tel: {formatUSD(cost.breakdown.retell)} | LLM: {formatUSD(cost.breakdown.llm)}
            </div>
          )}
        </div>
        <div className="rounded-lg bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-800">{whisperCount}</div>
          <div className="text-xs text-gray-500">Whispers</div>
        </div>
      </div>

      {/* Transcript preview */}
      {transcript.length > 0 && (
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-gray-700">Transcript</div>
          <div className="max-h-60 overflow-y-auto text-sm text-gray-600">
            {transcript.map((entry, i) => (
              <div key={`${entry.timestamp}-${i}`} className="mb-1">
                <span className="font-medium">
                  {entry.speaker === "whisper"
                    ? "You (whisper)"
                    : entry.speaker.charAt(0).toUpperCase() + entry.speaker.slice(1)}
                  :
                </span>{" "}
                <span className={entry.speaker === "whisper" ? "italic text-amber-700" : ""}>
                  {entry.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => copyTranscript("md")}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          {copied === "md" ? "Copied!" : "Copy as Markdown"}
        </button>
        <button
          type="button"
          onClick={() => copyTranscript("json")}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          {copied === "json" ? "Copied!" : "Copy as JSON"}
        </button>
      </div>

      {/* New Call */}
      <button
        type="button"
        onClick={onNewCall}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
      >
        New Call
      </button>
    </div>
  );
}
