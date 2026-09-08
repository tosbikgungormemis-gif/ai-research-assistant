import type { Memory } from "./types";
import { newId } from "./storage";

const MEMORY_KEY = "jarvis:memory";

export function loadMemory(): Memory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MEMORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Memory[];
  } catch {
    return [];
  }
}

export function saveMemory(memory: Memory[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  } catch {
    // localStorage unavailable - memory stays in-memory for this session only.
  }
}

export function createMemoryFact(text: string): Memory {
  return {
    id: newId(),
    text,
    createdAt: Date.now(),
  };
}
