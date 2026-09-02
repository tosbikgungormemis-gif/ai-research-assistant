"use client";

import { useEffect, useRef } from "react";

export type LogEntry = { id: string; text: string; time: string };

export default function ActivityLog({ entries }: { entries: LogEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries]);

  return (
    <div className="flex h-full flex-col bg-panel">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-amber">
          AKTİVİTE GÜNLÜĞÜ
        </p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {entries.length === 0 ? (
          <p className="text-xs text-slate-600">Henüz bir etkinlik yok.</p>
        ) : (
          <ul className="space-y-2 font-mono text-xs">
            {entries.map((entry) => (
              <li key={entry.id} className="text-slate-400">
                <span className="text-glow">[{entry.time}]</span>{" "}
                <span className="text-slate-300">{entry.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
