/**
 * Platform-agnostic user feedback (visual, audio, haptic).
 * VS-1: Web impl (toast notifications).
 * VS-2: Mobile impl (push notifications, haptics).
 */

export type NotificationType = "info" | "success" | "warning" | "error";

export type SoundType = "whisper_sent" | "call_connected" | "call_ended" | "error";

export interface NotificationInterface {
  showVisual(message: string, type: NotificationType): void;
  playSound?(sound: SoundType): void;
  vibrate?(pattern: number[]): void;
  dismiss?(id: string): void;
}
