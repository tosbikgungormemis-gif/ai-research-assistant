"use client";

import JarvisOrb, { type JarvisState } from "@/components/JarvisOrb";

export default function VoiceCallOverlay({
  active,
  jarvisState,
  hint,
  onEnd,
}: {
  active: boolean;
  jarvisState: JarvisState;
  hint: string;
  onEnd: () => void;
}) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-surface px-6">
      <p className="mb-2 text-xs font-bold tracking-[0.3em] text-glow">SESLİ GÖRÜŞME</p>
      <JarvisOrb state={jarvisState} size={200} />
      <p className="mt-6 max-w-xs text-center text-sm text-slate-400">{hint}</p>
      <button
        onClick={onEnd}
        className="mt-12 flex items-center gap-2 rounded-full bg-red-500/90 px-6 py-3 text-sm font-medium text-white transition hover:bg-red-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path d="M3.62 6.5c1.4-2.1 3.6-3.6 6.13-4.13a1 1 0 0 1 1.1.55l1.4 2.98a1 1 0 0 1-.23 1.17l-1.7 1.53a12.1 12.1 0 0 0 5.05 5.05l1.53-1.7a1 1 0 0 1 1.17-.23l2.98 1.4a1 1 0 0 1 .55 1.1c-.53 2.53-2.03 4.73-4.13 6.13a1 1 0 0 1-.86.13C8.8 18.9 5.1 15.2 3.5 7.36a1 1 0 0 1 .12-.86Z" />
        </svg>
        Görüşmeyi Bitir
      </button>
    </div>
  );
}
