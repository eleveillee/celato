/**
 * Connection quality monitoring and offline resilience.
 * VS-1: Web impl (navigator.onLine).
 * VS-2: Mobile impl (@react-native-community/netinfo).
 */

export type ConnectionQuality = "excellent" | "good" | "poor" | "offline";

export interface NetworkInterface {
  isOnline(): boolean;
  getConnectionQuality(): ConnectionQuality;
  onConnectionChange(callback: (quality: ConnectionQuality) => void): void;
  dispose(): void;
}
