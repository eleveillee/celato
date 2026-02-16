import { useEffect, useState, useRef } from "react";
import { ServerMessageSchema } from "@celato/shared";
import { z } from "zod";
import { logger } from "../utils/logger";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface UseWebSocketReturn {
	status: ConnectionStatus;
	send: (message: string) => void;
	lastMessage: string | null;
	reconnect: () => void;
}

const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 30000; // 30 seconds
const BACKOFF_MULTIPLIER = 2;

export function useWebSocket(url: string): UseWebSocketReturn {
	const [status, setStatus] = useState<ConnectionStatus>("disconnected");
	const [lastMessage, setLastMessage] = useState<string | null>(null);
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const retryDelayRef = useRef(INITIAL_RETRY_DELAY);
	const shouldReconnectRef = useRef(true);

	const connect = () => {
		// Clean up existing connection
		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}

		setStatus("connecting");

		const ws = new WebSocket(url);
		wsRef.current = ws;

		ws.onopen = () => {
			setStatus("connected");
			// Reset retry delay on successful connection
			retryDelayRef.current = INITIAL_RETRY_DELAY;
			logger.info("WebSocket connected", { url });
		};

		ws.onmessage = (event) => {
			try {
				// Parse and validate message from server
				const parsed = JSON.parse(event.data);
				const validated = ServerMessageSchema.parse(parsed);

				// Store the validated message as JSON string for display
				setLastMessage(JSON.stringify(validated, null, 2));
				logger.info("Received valid message", { message: validated });
			} catch (error) {
				if (error instanceof z.ZodError) {
					logger.error("Invalid message format", { errors: error.errors });
					setLastMessage(`Error: Invalid message format`);
				} else if (error instanceof SyntaxError) {
					logger.error("Invalid JSON", { error: String(error) });
					setLastMessage(`Error: Invalid JSON`);
				} else {
					logger.error("Message processing error", { error: String(error) });
					setLastMessage(`Error: ${error}`);
				}
			}
		};

		ws.onerror = (error) => {
			setStatus("error");
			logger.error("WebSocket error", { error: String(error) });
		};

		ws.onclose = () => {
			setStatus("disconnected");
			logger.info("WebSocket disconnected");

			// Attempt reconnection with exponential backoff
			if (shouldReconnectRef.current) {
				const delay = retryDelayRef.current;
				logger.info("Reconnecting with backoff", { delayMs: delay });

				reconnectTimeoutRef.current = setTimeout(() => {
					// Increase delay for next retry (exponential backoff)
					retryDelayRef.current = Math.min(
						delay * BACKOFF_MULTIPLIER,
						MAX_RETRY_DELAY,
					);
					connect();
				}, delay);
			}
		};
	};

	useEffect(() => {
		shouldReconnectRef.current = true;
		connect();

		return () => {
			// Disable reconnection on unmount
			shouldReconnectRef.current = false;

			// Clear any pending reconnection timeout
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}

			// Close WebSocket
			if (wsRef.current) {
				wsRef.current.close();
			}
		};
	}, [url]);

	const send = (message: string) => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			wsRef.current.send(message);
		} else {
			logger.warn("Attempted to send message while disconnected");
		}
	};

	const reconnect = () => {
		// Cancel any pending reconnection
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
		}

		// Reset retry delay and reconnect immediately
		retryDelayRef.current = INITIAL_RETRY_DELAY;
		connect();
	};

	return { status, send, lastMessage, reconnect };
}
