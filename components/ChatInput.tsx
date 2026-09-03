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

  useEffect(() => {
    setMicSupported(isSpeechRecognitionSupported());
    return () => recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    onListeningChange?.(listening);
  }, [listening, onListeningChange]);

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

  return (
    <div className="relative border-t border-white/10 bg-panel p-3 pt-9">
      {micSupported && (
        <div className="absolute -top-8 left-1/2 flex -translate-x-1/2 flex-col items-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            {listening && (
              <>
                <span className="talk-ring absolute inset-0 rounded-full border-2 border-[#ff4d6d]" />
                <span
                  className="talk-ring absolute inset-0 rounded-full border-2 border-[#ff4d6d]"
                  style={{ animationDelay: "0.5s" }}
                />
              </>
            )}
            <button
              onClick={toggleListening}
              disabled={disabled}
              className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${
                listening
                  ? "border-[#ff4d6d]/70 bg-[#2a121a] shadow-[0_0_32px_8px_rgba(255,77,109,0.5)]"
                  : "border-glow/60 bg-surface shadow-[0_0_18px_4px_rgba(79,195,255,0.3)] hover:shadow-[0_0_26px_6px_rgba(79,195,255,0.45)]"
              }`}
              title={listening ? "Dinleniyor... durdurmak için bas" : "Sesli komut ver"}
              aria-label={listening ? "Dinlemeyi durdur" : "Sesli komut ver"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke={listening ? "#ff4d6d" : "#4fc3ff"}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7"
              >
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <line x1="8" y1="21" x2="16" y2="21" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((att, i) => (
            <span
              key={i}
              className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs"
            >
              📎 {att.name}
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
      <div className="flex items-end gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
          title="Dosya ekle (PDF, TXT, MD, CSV, JSON)"
        >
          📎
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
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={disabled}
          placeholder={listening ? "Dinliyorum..." : "Bir soru sor..."}
          rows={1}
          className="max-h-40 min-h-[42px] flex-1 resize-none overflow-hidden rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-accent"
        />
        <button
          onClick={() => submit()}
          disabled={disabled || (!text.trim() && attachments.length === 0)}
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Gönder
        </button>
      </div>
      <p className="mt-1.5 hidden text-center text-[11px] text-slate-600 sm:block">
        Enter: gönder · Shift+Enter: yeni satır{micSupported ? " · büyük düğme: sesli komut" : ""}
      </p>
    </div>
  );
}
