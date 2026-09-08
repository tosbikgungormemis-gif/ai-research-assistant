"use client";

import { useState } from "react";
import type { Memory } from "@/lib/types";

export default function MemoryPanel({
  open,
  onClose,
  memory,
  onAdd,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  memory: Memory[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
}) {
  const [text, setText] = useState("");

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText("");
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-80 max-w-[88vw] transform flex-col border-l border-white/10 bg-panel transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="text-xs font-bold tracking-[0.25em] text-glow">HAFIZA</p>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/5"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        <div className="border-b border-white/10 p-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Jarvis'in hatırlamasını istediğin bir şey yaz..."
            className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-accent"
          />
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="mt-2 w-full rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ekle
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {memory.length === 0 ? (
            <p className="px-1 py-4 text-sm text-slate-500">
              Jarvis henüz senin hakkında hiçbir şey hatırlamıyor. Buradan ekleyebilir ya da
              sohbet ederken ona söyleyebilirsin — kalıcı olarak hatırlaması gerektiğini
              anladığında kendisi de ekler.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {memory.map((fact) => (
                <li
                  key={fact.id}
                  className="group flex items-start gap-2 rounded-lg px-1.5 py-1.5 hover:bg-white/5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-200">{fact.text}</p>
                  </div>
                  <button
                    onClick={() => onDelete(fact.id)}
                    className="shrink-0 text-slate-500 transition hover:text-red-400 md:opacity-0 md:group-hover:opacity-100"
                    aria-label="Hafızadan sil"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
