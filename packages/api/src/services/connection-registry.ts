/**
 * Maps session IDs to user WebSocket connections.
 * Enables forwarding Retell events (transcript, cost, state) back to the user's browser.
 */

import type { WebSocket } from "ws";

const WS_OPEN = 1;

const userSockets = new Map<string, WebSocket>();

export function registerUserSocket(sessionId: string, socket: WebSocket): void {
  userSockets.set(sessionId, socket);
}

export function getUserSocket(sessionId: string): WebSocket | undefined {
  return userSockets.get(sessionId);
}

export function unregisterUserSocket(sessionId: string): void {
  userSockets.delete(sessionId);
}

export function sendToUser(sessionId: string, message: Record<string, unknown>): boolean {
  const socket = userSockets.get(sessionId);
  if (!socket || socket.readyState !== WS_OPEN) return false;
  socket.send(JSON.stringify(message));
  return true;
}
