"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import JarvisOrb, { type JarvisState } from "@/components/JarvisOrb";
import ActivityLog, { type LogEntry } from "@/components/ActivityLog";
import VoicePicker from "@/components/VoicePicker";
import TaskPanel from "@/components/TaskPanel";
import {
  createConversation,
  loadConversations,
  newId,
  saveConversations,
  titleFromMessage,
} from "@/lib/storage";
import { loadTasks, saveTasks, createTask } from "@/lib/tasks";
import {
  getAvailableVoices,
  isSpeechSynthesisSupported,
  onVoicesChanged,
  speak,
  stopSpeaking,
} from "@/lib/speech";
import type { Conversation, Source, StoredBlock, StoredMessage, Task } from "@/lib/types";

function nowLocalLabel(): string {
  return new Date().toLocaleString("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeStamp(): string {
  return new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const VOICE_PREF_KEY = "jarvis:voice-enabled";
const VOICE_URI_KEY = "jarvis:voice-uri";

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [activityLog, setActivityLog] = useState<LogEntry[]>([]);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const [voicePickerOpen, setVoicePickerOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksPanelOpen, setTasksPanelOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function pushLog(text: string) {
    setActivityLog((prev) => [...prev.slice(-49), { id: newId(), text, time: timeStamp() }]);
  }

  const jarvisState: JarvisState = isListening
    ? "listening"
    : isSpeaking
    ? "speaking"
    : !isStreaming
    ? "idle"
    : statusText
    ? "thinking"
    : "speaking";

  function handleListeningChange(listening: boolean) {
    setIsListening(listening);
    if (listening) {
      stopSpeaking();
      setIsSpeaking(false);
    }
  }

  useEffect(() => {
    const loaded = loadConversations();
    setConversations(loaded);
    setActiveId(loaded[0]?.id ?? null);
    setTasks(loadTasks());
    setHydrated(true);

    setVoiceSupported(isSpeechSynthesisSupported());
    const storedVoicePref = window.localStorage.getItem(VOICE_PREF_KEY);
    if (storedVoicePref !== null) setVoiceEnabled(storedVoicePref !== "false");
    setSelectedVoiceURI(window.localStorage.getItem(VOICE_URI_KEY));

    function refreshVoices() {
      setAvailableVoices(getAvailableVoices("tr"));
    }
    refreshVoices();
    const unsubscribe = onVoicesChanged(refreshVoices);
    return unsubscribe;
  }, []);

  useEffect(() => {
    window.localStorage.setItem(VOICE_PREF_KEY, String(voiceEnabled));
    if (!voiceEnabled) stopSpeaking();
  }, [voiceEnabled]);

  useEffect(() => {
    if (selectedVoiceURI) window.localStorage.setItem(VOICE_URI_KEY, selectedVoiceURI);
    else window.localStorage.removeItem(VOICE_URI_KEY);
  }, [selectedVoiceURI]);

  useEffect(() => {
    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setInstallPrompt(e);
    }
    function onAppInstalled() {
      setInstallPrompt(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  useEffect(() => {
    if (!hydrated) return;
    saveConversations(conversations);
  }, [conversations, hydrated]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
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

  function handleAddTask(text: string, dueLabel: string | null) {
    const updated = [createTask(text, dueLabel), ...loadTasks()];
    saveTasks(updated);
    setTasks(updated);
  }

  function handleToggleTask(id: string) {
    const updated = loadTasks().map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    saveTasks(updated);
    setTasks(updated);
  }

  function handleDeleteTask(id: string) {
    const updated = loadTasks().filter((t) => t.id !== id);
    saveTasks(updated);
    setTasks(updated);
  }

  function applyTaskToolCall(input: unknown): string {
    const args = (input ?? {}) as {
      action?: string;
      text?: string;
      due_text?: string;
      task_id?: string;
    };
    const current = loadTasks();

    if (args.action === "add") {
      const text = String(args.text ?? "").trim();
      if (!text) return "Görev metni boş olduğu için eklenemedi.";
      const dueLabel = args.due_text ? String(args.due_text).trim() : null;
      const updated = [createTask(text, dueLabel || null), ...current];
      saveTasks(updated);
      setTasks(updated);
      return `Görev eklendi: "${text}"${dueLabel ? ` (${dueLabel})` : ""}.`;
    }

    if (args.action === "complete") {
      const task = current.find((t) => t.id === args.task_id);
      if (!task) return "Belirtilen id'ye sahip bir görev bulunamadı.";
      const updated = current.map((t) => (t.id === task.id ? { ...t, done: true } : t));
      saveTasks(updated);
      setTasks(updated);
      return `Görev tamamlandı olarak işaretlendi: "${task.text}".`;
    }

    if (args.action === "delete") {
      const task = current.find((t) => t.id === args.task_id);
      if (!task) return "Belirtilen id'ye sahip bir görev bulunamadı.";
      const updated = current.filter((t) => t.id !== task.id);
      saveTasks(updated);
      setTasks(updated);
      return `Görev silindi: "${task.text}".`;
    }

    return "Bilinmeyen bir işlem istendi, hiçbir şey değiştirilmedi.";
  }

  async function handleSend(text: string, attachments: StoredBlock[]) {
    setErrorText(null);
    stopSpeaking();
    setIsSpeaking(false);

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
    pushLog(`Komut alındı: "${text || "(dosya eki)"}"`.slice(0, 90));

    let accumulatedText = "";
    let respondingLogged = false;

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

    type RequestBlock = Record<string, unknown>;
    type RequestMessage = { role: "user" | "assistant"; blocks: RequestBlock[] };

    async function runChatStream(requestMessages: RequestMessage[]): Promise<{
      text: string;
      stopReason: string | null;
      toolUse: { id: string; input: unknown } | null;
    }> {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: requestMessages,
          tasks: loadTasks().map(({ id, text: t, done, dueLabel }) => ({
            id,
            text: t,
            done,
            dueLabel,
          })),
          nowLocal: nowLocalLabel(),
        }),
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? `İstek başarısız oldu (${response.status}).`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let text = "";
      let stopReason: string | null = null;
      let toolUse: { id: string; input: unknown } | null = null;

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
            pushLog(event.text);
          } else if (event.type === "text") {
            if (!respondingLogged) {
              pushLog("Yanıt oluşturuluyor...");
              respondingLogged = true;
            }
            setStatusText(null);
            text += event.text;
            applyAssistantText(text);
          } else if (event.type === "sources") {
            applyAssistantSources(event.sources);
            pushLog(`${event.sources.length} kaynak bulundu.`);
          } else if (event.type === "tool_use") {
            toolUse = { id: event.id, input: event.input };
          } else if (event.type === "done") {
            stopReason = event.stopReason;
          } else if (event.type === "error") {
            throw new Error(event.message);
          }
        }
      }

      return { text, stopReason, toolUse };
    }

    try {
      const requestMessages: RequestMessage[] = historyForRequest.map((m) => ({
        role: m.role,
        blocks: m.blocks,
      }));

      const phase1 = await runChatStream(requestMessages);

      if (phase1.stopReason === "tool_use" && phase1.toolUse) {
        pushLog("Yapılacaklar listesi güncelleniyor...");
        const resultText = applyTaskToolCall(phase1.toolUse.input);

        const assistantBlocks: RequestBlock[] = [];
        if (phase1.text.trim()) assistantBlocks.push({ type: "text", text: phase1.text });
        assistantBlocks.push({
          type: "tool_use",
          id: phase1.toolUse.id,
          name: "manage_tasks",
          input: phase1.toolUse.input,
        });

        const continuationMessages: RequestMessage[] = [
          ...requestMessages,
          { role: "assistant", blocks: assistantBlocks },
          {
            role: "user",
            blocks: [
              { type: "tool_result", tool_use_id: phase1.toolUse.id, content: resultText },
            ],
          },
        ];

        applyAssistantText("");
        const phase2 = await runChatStream(continuationMessages);
        accumulatedText = phase2.text.trim() ? phase2.text : resultText;
        applyAssistantText(accumulatedText);
      } else {
        accumulatedText = phase1.text;
      }

      pushLog("Yanıt tamamlandı.");
      if (voiceEnabled && accumulatedText) {
        speak(accumulatedText, {
          voiceURI: selectedVoiceURI,
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.";
      setErrorText(message);
      pushLog(`Hata: ${message}`.slice(0, 90));
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
        onSelect={(id) => {
          stopSpeaking();
          setIsSpeaking(false);
          setActiveId(id);
        }}
        onNew={() => {
          stopSpeaking();
          setIsSpeaking(false);
          handleNewConversation();
        }}
        onDelete={handleDeleteConversation}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-white/10 px-3 py-2.5 md:px-4">
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
          <JarvisOrb state={jarvisState} size={28} showLabel={false} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-[0.25em] text-glow">JARVIS</p>
            <h1 className="truncate text-xs text-slate-500">{active?.title ?? "Yeni sohbet"}</h1>
          </div>
          {installPrompt && (
            <button
              onClick={handleInstall}
              className="shrink-0 rounded-lg border border-glow/40 px-2.5 py-1 text-[11px] font-medium text-glow transition hover:bg-glow/10"
            >
              Yükle
            </button>
          )}
          {voiceSupported && (
            <button
              onClick={() => setVoiceEnabled((v) => !v)}
              className={`shrink-0 rounded-lg p-1.5 transition hover:bg-white/5 ${
                voiceEnabled ? "text-glow" : "text-slate-500"
              }`}
              aria-label={voiceEnabled ? "Sesli yanıtı kapat" : "Sesli yanıtı aç"}
              title={voiceEnabled ? "Sesli yanıt açık" : "Sesli yanıt kapalı"}
            >
              {voiceEnabled ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                  <path d="M16 8a5 5 0 0 1 0 8" />
                  <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                  <line x1="16" y1="9" x2="21" y2="14" />
                  <line x1="21" y1="9" x2="16" y2="14" />
                </svg>
              )}
            </button>
          )}
          {voiceSupported && (
            <button
              onClick={() => setVoicePickerOpen(true)}
              className="shrink-0 rounded-lg p-1.5 text-slate-300 hover:bg-white/5"
              aria-label="Jarvis sesini seç"
              title="Ses seç"
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
                <line x1="6" y1="20" x2="6" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="18" y1="20" x2="18" y2="14" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setTasksPanelOpen(true)}
            className="relative shrink-0 rounded-lg p-1.5 text-slate-300 hover:bg-white/5"
            aria-label="Yapılacaklar listesini aç"
            title="Yapılacaklar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="m8 12 2.5 2.5L16 9" />
            </svg>
            {tasks.some((t) => !t.done) && (
              <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-amber" />
            )}
          </button>
          <button
            onClick={() => setLogOpen(true)}
            className="shrink-0 rounded-lg p-1.5 text-slate-300 hover:bg-white/5 lg:hidden"
            aria-label="Aktivite günlüğünü aç"
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
              <path d="M4 6h16M4 12h10M4 18h7" />
            </svg>
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {!active || active.messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <JarvisOrb state={jarvisState} size={132} />
              <p className="mt-5 text-lg font-medium text-slate-300">
                Emrinizdeyim, efendim.
              </p>
            </div>
          ) : (
            active.messages.map((message, idx) => {
              const isLast = idx === active.messages.length - 1;
              const isEmptyText = message.blocks.every(
                (b) => b.type !== "text" || !b.text.trim(),
              );
              const pending =
                isLast && isStreaming && message.role === "assistant" && isEmptyText;
              return <ChatMessage key={message.id} message={message} pending={pending} />;
            })
          )}
          {statusText && (
            <p className="pl-1 text-xs italic text-[#34d399]">{statusText}</p>
          )}
        </div>

        {errorText && (
          <div className="mx-4 mb-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {errorText}
          </div>
        )}

        <ChatInput
          disabled={isStreaming}
          onSend={handleSend}
          onListeningChange={handleListeningChange}
        />
      </div>

      <div className="hidden w-72 shrink-0 border-l border-white/10 lg:block">
        <ActivityLog entries={activityLog} />
      </div>

      {logOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setLogOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-72 max-w-[85vw] transform border-l border-white/10 transition-transform duration-200 ease-out lg:hidden ${
          logOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <ActivityLog entries={activityLog} />
      </aside>

      <VoicePicker
        open={voicePickerOpen}
        onClose={() => setVoicePickerOpen(false)}
        voices={availableVoices}
        selectedURI={selectedVoiceURI}
        onSelect={(uri) => {
          setSelectedVoiceURI(uri);
          setVoicePickerOpen(false);
        }}
      />

      <TaskPanel
        open={tasksPanelOpen}
        onClose={() => setTasksPanelOpen(false)}
        tasks={tasks}
        onAdd={handleAddTask}
        onToggle={handleToggleTask}
        onDelete={handleDeleteTask}
      />
    </main>
  );
}
