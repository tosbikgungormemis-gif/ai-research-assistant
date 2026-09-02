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
}: {
  disabled: boolean;
  onSend: (text: string, attachments: StoredBlock[]) => void;
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
    <div className="border-t border-white/10 bg-panel p-3">
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
        {micSupported && (
          <button
            onClick={toggleListening}
            disabled={disabled}
            className={`shrink-0 rounded-lg border px-3 py-2 text-sm transition disabled:opacity-50 ${
              listening
                ? "border-red-400/50 bg-red-500/20 text-red-300"
                : "border-white/10 text-slate-300 hover:bg-white/5"
            }`}
            title={listening ? "Dinleniyor... durdurmak için bas" : "Sesli komut ver"}
          >
            {listening ? "🔴" : "🎤"}
          </button>
        )}
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
        Enter: gönder · Shift+Enter: yeni satır{micSupported ? " · 🎤 sesli komut" : ""}
      </p>
    </div>
  );
}
