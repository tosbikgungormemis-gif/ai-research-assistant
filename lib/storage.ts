import type { Conversation, StoredMessage } from "./types";

const STORAGE_KEY = "ai-research-assistant:conversations";

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Conversation[];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // localStorage full or unavailable (private mode, large PDFs) - fail silently,
    // the conversation still exists in memory for this session.
  }
}

export function createConversation(): Conversation {
  const now = Date.now();
  return {
    id: newId(),
    title: "Yeni sohbet",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function titleFromMessage(message: StoredMessage): string {
  const textBlock = message.blocks.find((b) => b.type === "text");
  const text = textBlock && textBlock.type === "text" ? textBlock.text.trim() : "";
  if (!text) return "Yeni sohbet";
  return text.length > 48 ? `${text.slice(0, 48)}…` : text;
}
