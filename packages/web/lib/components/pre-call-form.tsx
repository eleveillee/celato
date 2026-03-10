"use client";

import type { PersonaMode } from "@celato/shared";
import { SUPPORTED_LANGUAGES } from "@celato/shared";
import { useState } from "react";

export interface CallFormData {
  phoneNumber?: string;
  personaMode: PersonaMode;
  targetLanguage: string;
  purpose: string;
  userNotes: string;
}

interface PreCallFormProps {
  onStartCall: (data: CallFormData) => void;
  isConnected: boolean;
}

const PHONE_PLACEHOLDER = "+15551234567";

export function PreCallForm({ onStartCall, isConnected }: PreCallFormProps): React.JSX.Element {
  const [isWebCall, setIsWebCall] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [personaMode, setPersonaMode] = useState<PersonaMode>("transparent");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [purpose, setPurpose] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [phoneError, setPhoneError] = useState("");

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setPhoneError("");

    if (!isWebCall) {
      const trimmedPhone = phoneNumber.trim();
      if (!/^\+[1-9]\d{1,14}$/.test(trimmedPhone)) {
        setPhoneError("Enter a valid E.164 phone number (e.g. +15551234567)");
        return;
      }

      onStartCall({
        phoneNumber: trimmedPhone,
        personaMode,
        targetLanguage,
        purpose: purpose.trim(),
        userNotes: userNotes.trim(),
      });
      return;
    }

    // Web call — no phone number needed
    onStartCall({
      personaMode,
      targetLanguage,
      purpose: purpose.trim(),
      userNotes: userNotes.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5">
      {/* Call Mode Toggle */}
      <div>
        <span className="mb-1 block text-sm font-medium text-gray-700">Call Mode</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsWebCall(false)}
            className={`flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
              !isWebCall
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            <div className="font-semibold">Phone Call</div>
            <div className="mt-0.5 text-xs opacity-70">Dial a real number</div>
          </button>
          <button
            type="button"
            onClick={() => setIsWebCall(true)}
            className={`flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
              isWebCall
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            <div className="font-semibold">Web Call</div>
            <div className="mt-0.5 text-xs opacity-70">Talk via browser mic</div>
          </button>
        </div>
      </div>

      {/* Phone Number (only for phone call mode) */}
      {!isWebCall && (
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder={PHONE_PLACEHOLDER}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            required
          />
          {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
        </div>
      )}

      {/* Persona Mode */}
      <div>
        <span className="mb-1 block text-sm font-medium text-gray-700">Agent Mode</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPersonaMode("transparent")}
            className={`flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
              personaMode === "transparent"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            <div className="font-semibold">Transparent</div>
            <div className="mt-0.5 text-xs opacity-70">Agent identifies as AI</div>
          </button>
          <button
            type="button"
            onClick={() => setPersonaMode("proxy")}
            className={`flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
              personaMode === "proxy"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            <div className="font-semibold">Proxy</div>
            <div className="mt-0.5 text-xs opacity-70">Agent speaks as you</div>
          </button>
        </div>
      </div>

      {/* Language */}
      <div>
        <label htmlFor="language" className="mb-1 block text-sm font-medium text-gray-700">
          Agent Language
        </label>
        <select
          id="language"
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name} ({lang.nativeName})
            </option>
          ))}
        </select>
      </div>

      {/* Purpose */}
      <div>
        <label htmlFor="purpose" className="mb-1 block text-sm font-medium text-gray-700">
          Call Purpose <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="e.g. Make a dinner reservation for 2 at 7pm Friday"
          rows={2}
          maxLength={500}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
      </div>

      {/* User Notes */}
      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700">
          Notes for Agent <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="notes"
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder="e.g. Mention I have nut allergies"
          rows={2}
          maxLength={1000}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
      </div>

      {/* Start Call Button */}
      <button
        type="submit"
        disabled={!isConnected}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {!isConnected ? "Connecting to server..." : isWebCall ? "Start Web Call" : "Start Call"}
      </button>
    </form>
  );
}
