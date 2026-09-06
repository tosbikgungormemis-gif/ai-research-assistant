export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition,
  );
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

type RecognitionHandle = { stop: () => void };

export function startListening(opts: {
  lang?: string;
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onEnd: () => void;
  onError: (message: string) => void;
}): RecognitionHandle | null {
  const win = window as unknown as Record<string, unknown>;
  const SpeechRecognitionCtor = (win.SpeechRecognition || win.webkitSpeechRecognition) as
    | (new () => any) // eslint-disable-line @typescript-eslint/no-explicit-any
    | undefined;
  if (!SpeechRecognitionCtor) return null;

  const recognition = new SpeechRecognitionCtor();
  recognition.lang = opts.lang ?? "tr-TR";
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  let finalTranscript = "";

  recognition.onresult = (event: any) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript as string;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interim += transcript;
      }
    }
    if (finalTranscript) {
      opts.onFinal(finalTranscript.trim());
    } else if (interim) {
      opts.onInterim(interim);
    }
  };

  recognition.onerror = (event: any) => {
    opts.onError(
      event.error === "not-allowed" || event.error === "permission-denied"
        ? "Mikrofon izni verilmedi."
        : "Ses tanıma hatası.",
    );
  };

  recognition.onend = () => opts.onEnd();

  recognition.start();

  return { stop: () => recognition.stop() };
}

const MARKDOWN_STRIP_PATTERNS: [RegExp, string][] = [
  [/```[\s\S]*?```/g, ""],
  [/`([^`]+)`/g, "$1"],
  [/^#{1,6}\s+/gm, ""],
  [/\*\*([^*]+)\*\*/g, "$1"],
  [/\*([^*]+)\*/g, "$1"],
  [/\[([^\]]+)\]\([^)]+\)/g, "$1"],
  [/^[-*]\s+/gm, ""],
  [/\|/g, " "],
];

export function stripMarkdownForSpeech(text: string): string {
  return MARKDOWN_STRIP_PATTERNS.reduce(
    (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
    text,
  ).trim();
}

export function getAvailableVoices(lang = "tr"): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(lang));
}

export function onVoicesChanged(callback: () => void): () => void {
  if (!isSpeechSynthesisSupported()) return () => {};
  window.speechSynthesis.addEventListener("voiceschanged", callback);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", callback);
}

export function speak(
  text: string,
  opts: {
    lang?: string;
    voiceURI?: string | null;
    pitch?: number;
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
  } = {},
): void {
  if (!isSpeechSynthesisSupported()) return;
  const clean = stripMarkdownForSpeech(text);
  if (!clean) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = opts.lang ?? "tr-TR";
  utterance.rate = opts.rate ?? 0.97;
  utterance.pitch = opts.pitch ?? 0.88;

  if (opts.voiceURI) {
    const match = window.speechSynthesis.getVoices().find((v) => v.voiceURI === opts.voiceURI);
    if (match) utterance.voice = match;
  }

  utterance.onstart = () => opts.onStart?.();
  utterance.onend = () => opts.onEnd?.();
  utterance.onerror = () => opts.onEnd?.();
  window.speechSynthesis.speak(utterance);
}

let currentClonedAudio: HTMLAudioElement | null = null;

async function speakWithClonedVoice(text: string, onStart?: () => void): Promise<boolean> {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return false;

    const blob = await res.blob();
    if (blob.size === 0) return false;

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentClonedAudio = audio;

    await new Promise<void>((resolve) => {
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      onStart?.();
      audio.play().catch(() => resolve());
    });

    URL.revokeObjectURL(url);
    if (currentClonedAudio === audio) currentClonedAudio = null;
    return true;
  } catch {
    return false;
  }
}

export async function speakJarvis(
  text: string,
  opts: {
    voiceURI?: string | null;
    onStart?: () => void;
    onEnd?: () => void;
  } = {},
): Promise<void> {
  const clean = stripMarkdownForSpeech(text);
  if (!clean) {
    opts.onEnd?.();
    return;
  }

  const usedClonedVoice = await speakWithClonedVoice(clean, opts.onStart);
  if (usedClonedVoice) {
    opts.onEnd?.();
    return;
  }

  await new Promise<void>((resolve) => {
    speak(clean, {
      voiceURI: opts.voiceURI,
      onStart: opts.onStart,
      onEnd: () => resolve(),
    });
  });
  opts.onEnd?.();
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
  if (currentClonedAudio) {
    currentClonedAudio.pause();
    currentClonedAudio.currentTime = 0;
    currentClonedAudio = null;
  }
}
