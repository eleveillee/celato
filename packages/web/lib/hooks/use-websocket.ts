"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { debug } from "../debug-logger";

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY_MS = 1000;

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting";

export interface UseWebSocketReturn {
  status: ConnectionStatus;
  send: (data: Record<string, unknown>) => void;
  lastMessage: Record<string, unknown> | null;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(
  url: string,
  onMessage?: (msg: Record<string, unknown>) => void
): UseWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<Record<string, unknown> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const cleanup = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      if (wsRef.current.readyState < 2) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    cleanup();
    setStatus("connecting");

    debug.ws.info(`Connecting to ${url}`);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      debug.ws.info("Connected");
      setStatus("connected");
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as Record<string, unknown>;
        debug.msg.info(`recv: ${String(data["type"])}`, data);
        setLastMessage(data);
        onMessageRef.current?.(data);
      } catch {
        debug.ws.warn("Non-JSON message received", event.data);
      }
    };

    ws.onclose = (event) => {
      debug.ws.warn(`Closed (code=${event.code}, reason=${event.reason || "none"}, clean=${event.wasClean})`);
      wsRef.current = null;

      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = BASE_RECONNECT_DELAY_MS * 2 ** reconnectAttempts.current;
        debug.ws.info(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);
        setStatus("reconnecting");
        reconnectAttempts.current += 1;
        reconnectTimer.current = setTimeout(connect, delay);
      } else {
        debug.ws.error("Max reconnect attempts reached — giving up");
        setStatus("disconnected");
      }
    };

    ws.onerror = (event) => {
      debug.ws.error("WebSocket error", event);
      // onclose will fire after onerror — reconnection handled there
    };
  }, [url, cleanup]);

  const disconnect = useCallback(() => {
    reconnectAttempts.current = MAX_RECONNECT_ATTEMPTS; // Prevent auto-reconnect
    cleanup();
    setStatus("disconnected");
  }, [cleanup]);

  const send = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      debug.msg.info(`send: ${String(data["type"])}`, data);
      wsRef.current.send(JSON.stringify(data));
    } else {
      debug.ws.warn(`Cannot send — readyState=${wsRef.current?.readyState ?? "null"}`, data);
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { status, send, lastMessage, connect, disconnect };
}
