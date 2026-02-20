/**
 * Platform-agnostic WebSocket client with reconnection logic.
 * VS-1: Web impl (native browser WebSocket).
 * VS-2: Mobile impl (react-native WebSocket).
 */

export interface WebSocketClientInterface {
  connect(url: string): Promise<void>;
  disconnect(): void;
  send(message: string | ArrayBuffer): void;
  onMessage(callback: (message: string) => void): void;
  onConnectionChange(callback: (connected: boolean) => void): void;
  isConnected(): boolean;
}
