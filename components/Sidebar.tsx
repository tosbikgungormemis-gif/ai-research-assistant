"use client";

import type { Conversation } from "@/lib/types";

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-white/10 bg-panel">
      <div className="p-3">
        <button
          onClick={onNew}
          className="w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-slate-950 transition hover:opacity-90"
        >
          + Yeni Sohbet
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        {sorted.length === 0 && (
          <p className="px-2 py-4 text-sm text-slate-500">Henüz sohbet yok.</p>
        )}
        <ul className="space-y-1">
          {sorted.map((conversation) => (
            <li key={conversation.id}>
              <div
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                  conversation.id === activeId
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <button
                  onClick={() => onSelect(conversation.id)}
                  className="min-w-0 flex-1 truncate text-left"
                  title={conversation.title}
                >
                  {conversation.title}
                </button>
                <button
                  onClick={() => onDelete(conversation.id)}
                  className="ml-2 hidden shrink-0 text-slate-500 hover:text-red-400 group-hover:block"
                  aria-label="Sohbeti sil"
                  title="Sohbeti sil"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
