/**
 * Platform-agnostic data persistence.
 * VS-1: Web impl (localStorage/IndexedDB).
 * VS-2: Mobile impl (AsyncStorage).
 */

export interface StorageInterface {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
