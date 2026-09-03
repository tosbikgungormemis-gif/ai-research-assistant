"use client";

import { useEffect, useRef, useState } from "react";
import { fileToBlock } from "@/lib/files";
import { isSpeechRecognitionSupported, startListening } from "@/lib/speech";
import type { StoredBlock } from "@/lib/types";

type PendingAttachment = { name: string; block: StoredBlock };
type RecognitionHandle = { stop: () => void };

export default function ChatInput({
  disabled,
  onSend,
  onListeningChange,
}: {
  disabled: boolean;
  onSend: (text: string, attachments: StoredBlock[]) => void;
  onListeningChange?: (listening: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [micSupported, setMicSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<RecognitionHandle | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMicSupported(isSpeechRecognitionSupported());
    return () => recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    onListeningChange?.(listening);
  }, [listening, onListeningChange]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    for (const file of Array.from(files)) {
      try {
        const block = await fileToBlock(file);
        setAttachments((prev) => [...prev, { name: file.name, block }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Dosya yüklenemedi.");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function submit(overrideText?: string) {
    const trimmed = (overrideText ?? text).trim();
    if (!trimmed && attachments.length === 0) return;
    if (disabled) return;
    onSend(trimmed, attachments.map((a) => a.block));
    setText("");
    setAttachments([]);
    setError(null);
  }

  function toggleListening() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    setError(null);
    const handle = startListening({
      onInterim: (interim) => setText(interim),
      onFinal: (finalText) => {
        setText(finalText);
        submit(finalText);
      },
      onEnd: () => setListening(false),
      onError: (message) => {
        setError(message);
        setListening(false);
      },
    });
    if (!handle) {
      setError("Bu tarayıcı sesli komutu desteklemiyor.");
      return;
    }
    recognitionRef.current = handle;
    setListening(true);
  }

  const canSend = !disabled && (text.trim().length > 0 || attachments.length > 0);

  return (
    <div className="border-t border-white/10 bg-panel px-3 pb-3 pt-2.5">
      {error && <p className="mb-1.5 px-1 text-xs text-red-400">{error}</p>}
      {attachments.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-2 px-1">
          {attachments.map((att, i) => (
            <span
              key={i}
              className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3 shrink-0"
              >
                <path d="M21.44 11.05 12.25 20.24a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a3.67 3.67 0 0 1 5.19 5.19L9.66 17.65a1.83 1.83 0 0 1-2.6-2.6l8.49-8.48" />
              </svg>
              {att.name}
              <button
                onClick={() => removeAttachment(i)}
                className="text-slate-400 hover:text-red-400"
                aria-label={`${att.name} ekini kaldır`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-end gap-1.5 rounded-3xl border border-white/10 bg-surface py-1.5 pl-2 pr-1.5 transition focus-within:border-accent/50">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/5 hover:text-slate-200 disabled:opacity-40"
          title="Dosya ekle (PDF, TXT, MD, CSV, JSON)"
          aria-label="Dosya ekle"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px]"
          >
            <path d="M21.44 11.05 12.25 20.24a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a3.67 3.67 0 0 1 5.19 5.19L9.66 17.65a1.83 1.83 0 0 1-2.6-2.6l8.49-8.48" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.md,.csv,.json,.log,text/plain,application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={disabled}
          placeholder={listening ? "Dinliyorum..." : "Jarvis'e bir şey sor..."}
          rows={1}
          className="max-h-40 min-h-[36px] flex-1 resize-none overflow-y-auto bg-transparent py-1.5 text-[15px] leading-normal text-slate-100 outline-none placeholder:text-slate-500"
        />

        {micSupported && (
          <button
            onClick={toggleListening}
            disabled={disabled}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition disabled:opacity-40 ${
              listening
                ? "bg-[#ff4d6d]/15 text-[#ff4d6d]"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
            title={listening ? "Dinleniyor... durdurmak için bas" : "Sesli komut ver"}
            aria-label={listening ? "Dinlemeyi durdur" : "Sesli komut ver"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-[18px] w-[18px] ${listening ? "animate-pulse" : ""}`}
            >
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="17" x2="12" y2="21" />
              <line x1="8" y1="21" x2="16" y2="21" />
            </svg>
          </button>
        )}

        <button
          onClick={() => submit()}
          disabled={!canSend}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
            canSend
              ? "bg-accent text-slate-950 hover:opacity-90"
              : "bg-white/5 text-slate-600"
          }`}
          aria-label="Gönder"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px]"
          >
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="6 11 12 5 18 11" />
          </svg>
        </button>
      </div>

      <p className="mt-1.5 hidden text-center text-[11px] text-slate-600 sm:block">
        Enter: gönder · Shift+Enter: yeni satır{micSupported ? " · 🎤 sesli komut" : ""}
      </p>
    </div>
  );
}
