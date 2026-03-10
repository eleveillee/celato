"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface WhisperInputProps {
  onWhisper: (text: string) => void;
  isActive: boolean;
}

export function WhisperInput({ onWhisper, isActive }: WhisperInputProps): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (trimmed.length === 0 || trimmed.length > 500) return;

    onWhisper(trimmed);
    setText("");
    setIsOpen(false);
  }, [text, onWhisper]);

  // Spacebar opens whisper input, Escape closes it
  useEffect(() => {
    if (!isActive) return;

    function handleKeyDown(e: KeyboardEvent): void {
      // Don't trigger if already typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Escape") {
          setIsOpen(false);
          setText("");
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setIsOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isActive) return null;

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm text-amber-700 transition-colors hover:border-amber-400 hover:bg-amber-100"
      >
        Press <kbd className="rounded bg-amber-200 px-1.5 py-0.5 font-mono text-xs">Space</kbd> to
        whisper an instruction
      </button>
    );
  }

  return (
    <div className="rounded-lg border-2 border-amber-400 bg-amber-50 p-3">
      <div className="mb-1 text-xs font-semibold text-amber-700">
        Whisper (business won't hear this)
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
            if (e.key === "Escape") {
              setIsOpen(false);
              setText("");
            }
          }}
          placeholder='e.g. "Ask about their delivery radius"'
          maxLength={500}
          className="flex-1 rounded border border-amber-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-300 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={text.trim().length === 0}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:bg-gray-300"
        >
          Send
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setText("");
          }}
          className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
      <div className="mt-1 text-right text-xs text-gray-400">{text.length}/500</div>
    </div>
  );
}
