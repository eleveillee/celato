/**
 * Platform-agnostic input methods.
 * VS-1: Web impl (keyboard/spacebar for whisper).
 * VS-2: Mobile impl (voice commands, touch gestures).
 */

export type GestureType = "tap" | "double_tap" | "swipe_left" | "swipe_right" | "long_press";

export interface InputInterface {
  onTextInput(callback: (text: string) => void): void;
  onVoiceCommand?(callback: (command: string) => void): void;
  onGesture?(gesture: GestureType, callback: () => void): void;
  onHardwareButton?(button: string, callback: () => void): void;
  dispose(): void;
}
