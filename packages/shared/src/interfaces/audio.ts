/**
 * Platform-agnostic audio capture and playback.
 * VS-1: Types only (Retell handles all audio). Web impl deferred.
 * VS-2: Mobile impl via expo-audio.
 */

export interface AudioBuffer {
  data: ArrayBuffer;
  sampleRate: number;
  channels: number;
  duration: number;
}

export interface AudioInputInterface {
  startRecording(): Promise<void>;
  stopRecording(): Promise<AudioBuffer>;
  isRecording(): boolean;
}

export interface AudioOutputInterface {
  play(buffer: AudioBuffer): Promise<void>;
  pause(): void;
  stop(): void;
  getVolume(): number;
  setVolume(level: number): void;
}
