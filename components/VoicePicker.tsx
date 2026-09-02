"use client";

import { speak } from "@/lib/speech";

export default function VoicePicker({
  open,
  onClose,
  voices,
  selectedURI,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  voices: SpeechSynthesisVoice[];
  selectedURI: string | null;
  onSelect: (voiceURI: string | null) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-sm rounded-t-2xl border border-white/10 bg-panel p-4 sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-[0.2em] text-glow">JARVIS SESİ</p>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/5"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        {voices.length === 0 ? (
          <p className="py-4 text-sm text-slate-500">
            Bu cihazda Türkçe ses bulunamadı. Sistem varsayılan sesi kullanılacak.
          </p>
        ) : (
          <ul className="max-h-72 space-y-1 overflow-y-auto">
            <li>
              <button
                onClick={() => onSelect(null)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  selectedURI === null ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"
                }`}
              >
                Varsayılan ses
              </button>
            </li>
            {voices.map((voice) => (
              <li key={voice.voiceURI} className="flex items-center gap-2">
                <button
                  onClick={() => onSelect(voice.voiceURI)}
                  className={`flex-1 truncate rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    selectedURI === voice.voiceURI
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {voice.name}
                </button>
                <button
                  onClick={() =>
                    speak("Merhaba, ben Jarvis. Emrindeyim.", {
                      voiceURI: voice.voiceURI,
                    })
                  }
                  className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-glow"
                  aria-label={`${voice.name} sesini dinle`}
                  title="Dinle"
                >
                  ▶
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
