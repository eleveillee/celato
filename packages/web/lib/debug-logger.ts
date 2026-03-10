/**
 * Lightweight debug logger for browser console.
 * Groups related logs by tag. Enable/disable via NEXT_PUBLIC_DEBUG env var.
 * In dev mode, always enabled.
 */

// biome-ignore lint/complexity/useLiteralKeys: env vars are index-accessed
const IS_DEBUG = process.env["NODE_ENV"] === "development" || process.env["NEXT_PUBLIC_DEBUG"] === "true";

type LogLevel = "info" | "warn" | "error";

const LEVEL_STYLES: Record<LogLevel, string> = {
  info: "color: #3b82f6; font-weight: bold",
  warn: "color: #f59e0b; font-weight: bold",
  error: "color: #ef4444; font-weight: bold",
};

const TAG_STYLES: Record<string, string> = {
  ws: "color: #10b981; font-weight: bold",
  retell: "color: #8b5cf6; font-weight: bold",
  call: "color: #f97316; font-weight: bold",
  msg: "color: #6366f1; font-weight: bold",
};

function log(tag: string, level: LogLevel, message: string, data?: unknown): void {
  if (!IS_DEBUG) return;

  const tagStyle = TAG_STYLES[tag] ?? "color: #6b7280; font-weight: bold";
  const prefix = `%c[${tag}]%c %c${level.toUpperCase()}%c`;

  if (data !== undefined) {
    console[level](prefix, tagStyle, "", LEVEL_STYLES[level], "", message, data);
  } else {
    console[level](prefix, tagStyle, "", LEVEL_STYLES[level], "", message);
  }
}

export const debug = {
  ws: {
    info: (msg: string, data?: unknown) => log("ws", "info", msg, data),
    warn: (msg: string, data?: unknown) => log("ws", "warn", msg, data),
    error: (msg: string, data?: unknown) => log("ws", "error", msg, data),
  },
  retell: {
    info: (msg: string, data?: unknown) => log("retell", "info", msg, data),
    warn: (msg: string, data?: unknown) => log("retell", "warn", msg, data),
    error: (msg: string, data?: unknown) => log("retell", "error", msg, data),
  },
  call: {
    info: (msg: string, data?: unknown) => log("call", "info", msg, data),
    warn: (msg: string, data?: unknown) => log("call", "warn", msg, data),
    error: (msg: string, data?: unknown) => log("call", "error", msg, data),
  },
  msg: {
    info: (msg: string, data?: unknown) => log("msg", "info", msg, data),
    warn: (msg: string, data?: unknown) => log("msg", "warn", msg, data),
    error: (msg: string, data?: unknown) => log("msg", "error", msg, data),
  },
};
