"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";

export default function TaskPanel({
  open,
  onClose,
  tasks,
  onAdd,
  onToggle,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  onAdd: (text: string, dueLabel: string | null) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [text, setText] = useState("");
  const [due, setDue] = useState("");

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    let dueLabel: string | null = null;
    if (due) {
      const d = new Date(due);
      if (!Number.isNaN(d.getTime())) {
        dueLabel = d.toLocaleString("tr-TR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }
    onAdd(trimmed, dueLabel);
    setText("");
    setDue("");
  }

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-80 max-w-[88vw] transform flex-col border-l border-white/10 bg-panel transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="text-xs font-bold tracking-[0.25em] text-glow">YAPILACAKLAR</p>
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
            placeholder="Yeni görev ekle..."
            className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-accent"
          />
          <div className="mt-2 flex gap-2">
            <input
              type="datetime-local"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-surface px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-accent"
            />
            <button
              onClick={submit}
              disabled={!text.trim()}
              className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Ekle
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {tasks.length === 0 && (
            <p className="px-1 py-4 text-sm text-slate-500">
              Henüz görev yok. Buradan ekleyebilir ya da Jarvis'e söyleyebilirsin.
            </p>
          )}

          {pending.length > 0 && (
            <ul className="space-y-1.5">
              {pending.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
              ))}
            </ul>
          )}

          {done.length > 0 && (
            <>
              <p className="mb-1.5 mt-4 px-1 text-[11px] font-semibold tracking-wider text-slate-600">
                TAMAMLANDI
              </p>
              <ul className="space-y-1.5">
                {done.map((task) => (
                  <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
                ))}
              </ul>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <li className="group flex items-start gap-2 rounded-lg px-1.5 py-1.5 hover:bg-white/5">
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
          task.done ? "border-glow bg-glow/20 text-glow" : "border-slate-500 text-transparent"
        }`}
        aria-label={task.done ? "Tamamlanmadı olarak işaretle" : "Tamamlandı olarak işaretle"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-2.5 w-2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${task.done ? "text-slate-500 line-through" : "text-slate-200"}`}>
          {task.text}
        </p>
        {task.dueLabel && (
          <p className="mt-0.5 text-[11px] text-amber">{task.dueLabel}</p>
        )}
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="shrink-0 text-slate-500 transition hover:text-red-400 md:opacity-0 md:group-hover:opacity-100"
        aria-label="Görevi sil"
      >
        ✕
      </button>
    </li>
  );
}
