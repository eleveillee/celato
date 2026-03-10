"use client";

import { useEffect, useRef } from "react";

export interface TranscriptEntry {
  speaker: "business" | "agent" | "whisper" | "system";
  text: string;
  timestamp: number;
  isHidden: boolean;
}

interface TranscriptProps {
  entries: TranscriptEntry[];
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

interface SpeakerStyle {
  label: string;
  bg: string;
  align: string;
  textColor: string;
}

const SYSTEM_STYLE: SpeakerStyle = {
  label: "System",
  bg: "bg-gray-50",
  align: "self-center",
  textColor: "text-gray-500",
};

const SPEAKER_STYLES: Record<string, SpeakerStyle> = {
  business: {
    label: "Business",
    bg: "bg-gray-100",
    align: "self-start",
    textColor: "text-gray-800",
  },
  agent: { label: "Agent", bg: "bg-blue-50", align: "self-end", textColor: "text-blue-900" },
  whisper: {
    label: "You (whisper)",
    bg: "bg-amber-50 border border-amber-200",
    align: "self-end",
    textColor: "text-amber-800",
  },
  system: SYSTEM_STYLE,
};

function getSpeakerStyle(speaker: string): SpeakerStyle {
  return SPEAKER_STYLES[speaker] ?? SYSTEM_STYLE;
}

export function Transcript({ entries }: TranscriptProps): React.JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null);

  const entryCount = entries.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom when new entries arrive
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entryCount]);

  if (entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        Waiting for conversation...
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex h-full flex-col gap-2 overflow-y-auto p-3">
      {entries.map((entry, i) => {
        const style = getSpeakerStyle(entry.speaker);
        return (
          <div
            key={`${entry.timestamp}-${i}`}
            className={`flex max-w-[85%] flex-col rounded-lg px-3 py-2 ${style.bg} ${style.align}`}
          >
            <div className="flex items-baseline gap-2">
              <span className={`text-xs font-semibold ${style.textColor}`}>{style.label}</span>
              <span className="text-xs text-gray-400">{formatTime(entry.timestamp)}</span>
            </div>
            <p
              className={`mt-0.5 text-sm ${style.textColor} ${entry.speaker === "whisper" ? "italic" : ""}`}
            >
              {entry.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
