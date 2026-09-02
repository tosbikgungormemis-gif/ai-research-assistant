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

export function speak(
  text: string,
  opts: { lang?: string; onStart?: () => void; onEnd?: () => void } = {},
): void {
  if (!isSpeechSynthesisSupported()) return;
  const clean = stripMarkdownForSpeech(text);
  if (!clean) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = opts.lang ?? "tr-TR";
  utterance.rate = 1.02;
  utterance.onstart = () => opts.onStart?.();
  utterance.onend = () => opts.onEnd?.();
  utterance.onerror = () => opts.onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}
