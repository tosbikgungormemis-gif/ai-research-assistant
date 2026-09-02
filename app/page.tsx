"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import {
  createConversation,
  loadConversations,
  newId,
  saveConversations,
  titleFromMessage,
} from "@/lib/storage";
import type { Conversation, Source, StoredBlock, StoredMessage } from "@/lib/types";

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loaded = loadConversations();
    setConversations(loaded);
    setActiveId(loaded[0]?.id ?? null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveConversations(conversations);
  }, [conversations, hydrated]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [conversations, activeId, statusText]);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  function updateConversation(id: string, updater: (c: Conversation) => Conversation) {
    setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  }

  function handleNewConversation() {
    const conversation = createConversation();
    setConversations((prev) => [conversation, ...prev]);
    setActiveId(conversation.id);
  }

  function handleDeleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId((prev) => {
        const remaining = conversations.filter((c) => c.id !== id);
        return remaining[0]?.id ?? null;
      });
    }
  }

  async function handleSend(text: string, attachments: StoredBlock[]) {
    setErrorText(null);

    let conversation = active;
    if (!conversation) {
      conversation = createConversation();
      setConversations((prev) => [conversation!, ...prev]);
      setActiveId(conversation.id);
    }

    const blocks: StoredBlock[] = [...attachments];
    if (text) blocks.push({ type: "text", text });

    const userMessage: StoredMessage = {
      id: newId(),
      role: "user",
      blocks,
      createdAt: Date.now(),
    };

    const isFirstMessage = conversation.messages.length === 0;
    const conversationId = conversation.id;
    const historyForRequest = [...conversation.messages, userMessage];

    updateConversation(conversationId, (c) => ({
      ...c,
      title: isFirstMessage ? titleFromMessage(userMessage) : c.title,
      messages: [...c.messages, userMessage],
      updatedAt: Date.now(),
    }));

    const assistantId = newId();
    const assistantMessage: StoredMessage = {
      id: assistantId,
      role: "assistant",
      blocks: [{ type: "text", text: "" }],
      createdAt: Date.now(),
    };

    updateConversation(conversationId, (c) => ({
      ...c,
      messages: [...c.messages, assistantMessage],
    }));

    setIsStreaming(true);
    setStatusText(null);

    let accumulatedText = "";

    function applyAssistantText(text: string) {
      updateConversation(conversationId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === assistantId ? { ...m, blocks: [{ type: "text", text }] } : m,
        ),
      }));
    }

    function applyAssistantSources(sources: Source[]) {
      updateConversation(conversationId, (c) => ({
        ...c,
        messages: c.messages.map((m) => (m.id === assistantId ? { ...m, sources } : m)),
      }));
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForRequest.map((m) => ({ role: m.role, blocks: m.blocks })),
        }),
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? `İstek başarısız oldu (${response.status}).`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);

          if (event.type === "status") {
            setStatusText(event.text);
          } else if (event.type === "text") {
            setStatusText(null);
            accumulatedText += event.text;
            applyAssistantText(accumulatedText);
          } else if (event.type === "sources") {
            applyAssistantSources(event.sources);
          } else if (event.type === "error") {
            throw new Error(event.message);
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.";
      setErrorText(message);
      if (!accumulatedText) {
        applyAssistantText(`⚠️ ${message}`);
      }
    } finally {
      setIsStreaming(false);
      setStatusText(null);
    }
  }

  return (
    <main className="flex h-dvh bg-surface">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-white/10 px-3 py-3 md:px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="shrink-0 rounded-lg p-1.5 text-slate-300 hover:bg-white/5 md:hidden"
            aria-label="Sohbet listesini aç"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="h-5 w-5"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-200">
            {active?.title ?? "AI Araştırma Asistanı"}
          </h1>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {!active || active.messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
              <p className="text-lg font-medium text-slate-300">
                Neyi araştırmamı istersin?
              </p>
              <p className="mt-1 max-w-sm text-sm">
                Sorunu yaz, gerektiğinde web&apos;de araştırırım. PDF veya metin dosyası da
                ekleyebilirsin.
              </p>
            </div>
          ) : (
            active.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          {statusText && (
            <p className="pl-1 text-xs italic text-slate-500">{statusText}</p>
          )}
        </div>

        {errorText && (
          <div className="mx-4 mb-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {errorText}
          </div>
        )}

        <ChatInput disabled={isStreaming} onSend={handleSend} />
      </div>
    </main>
  );
}
