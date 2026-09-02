"use client";

import type { Conversation } from "@/lib/types";

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  open,
  onClose,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  open: boolean;
  onClose: () => void;
}) {
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 shrink-0 transform flex-col border-r border-white/10 bg-panel transition-transform duration-200 ease-out md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-3">
          <button
            onClick={() => {
              onNew();
              onClose();
            }}
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
                    onClick={() => {
                      onSelect(conversation.id);
                      onClose();
                    }}
                    className="min-w-0 flex-1 truncate text-left"
                    title={conversation.title}
                  >
                    {conversation.title}
                  </button>
                  <button
                    onClick={() => onDelete(conversation.id)}
                    className="ml-2 shrink-0 text-slate-500 hover:text-red-400 md:opacity-0 md:group-hover:opacity-100"
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
    </>
  );
}
