"use client";

import { useEffect, useRef, useState } from "react";

type Food = {
  name: string;
  portion: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

type Analysis = {
  is_food: boolean;
  foods: Food[];
  confidence: "yüksek" | "orta" | "düşük";
  note: string;
};

type LogEntry = {
  id: string;
  time: string;
  foods: Food[];
};

const MAX_SIDE = 1024;
const LOG_KEY = "kalori-log";

function todayKey() {
  return new Date().toLocaleDateString("sv-SE"); // local YYYY-MM-DD
}

function sum(foods: Food[], key: keyof Omit<Food, "name" | "portion">) {
  return Math.round(foods.reduce((acc, f) => acc + f[key], 0));
}

// Downscale before upload: fewer image tokens means a cheaper request, and a smaller payload.
async function resizeImage(file: File): Promise<{ dataUrl: string; base64: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return { dataUrl, base64: dataUrl.split(",")[1] };
}

function loadLog(): Record<string, LogEntry[]> {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveLog(log: Record<string, LogEntry[]>) {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
  } catch {
    // Storage unavailable (private mode); the log just won't persist.
  }
}

export default function KaloriApp() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);
  const [log, setLog] = useState<Record<string, LogEntry[]>>({});

  useEffect(() => setLog(loadLog()), []);

  const today = log[todayKey()] ?? [];
  const todayFoods = today.flatMap((e) => e.foods);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const { dataUrl, base64 } = await resizeImage(file);
      setPreview(dataUrl);
      const res = await fetch("/api/kalori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: "image/jpeg" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function addToLog() {
    if (!result) return;
    const entry: LogEntry = {
      // crypto.randomUUID is missing on plain-http LAN testing, so build the id by hand.
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      foods: result.foods,
    };
    const next = { ...log, [todayKey()]: [...today, entry] };
    setLog(next);
    saveLog(next);
    setResult(null);
    setPreview(null);
  }

  function removeEntry(id: string) {
    const next = { ...log, [todayKey()]: today.filter((e) => e.id !== id) };
    setLog(next);
    saveLog(next);
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-8 text-slate-100">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold">📸 Kalori</h1>
          <p className="mt-1 text-sm text-slate-400">
            Yemeğinin fotoğrafını çek, kalorisini hemen öğren.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-panel p-5 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500">Bugün</p>
          <p className="mt-1 text-4xl font-bold text-glow">{sum(todayFoods, "calories")} kcal</p>
          <div className="mt-3 flex justify-center gap-4 text-sm text-slate-300">
            <span>Protein {sum(todayFoods, "protein_g")} g</span>
            <span>Karb. {sum(todayFoods, "carbs_g")} g</span>
            <span>Yağ {sum(todayFoods, "fat_g")} g</span>
          </div>
        </section>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="rounded-2xl bg-accent py-4 text-lg font-semibold text-surface transition hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Analiz ediliyor…" : "Fotoğraf çek veya seç"}
        </button>

        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Yemek fotoğrafı" className="w-full rounded-2xl object-cover" />
        )}

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {result && (
          <section className="rounded-2xl border border-white/10 bg-panel p-5">
            {result.is_food ? (
              <>
                <ul className="flex flex-col gap-3">
                  {result.foods.map((f, i) => (
                    <li key={i} className="rounded-xl bg-black/20 p-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium">{f.name}</span>
                        <span className="shrink-0 font-semibold text-glow">
                          {Math.round(f.calories)} kcal
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {f.portion} · P {Math.round(f.protein_g)} g · K {Math.round(f.carbs_g)} g ·
                        Y {Math.round(f.fat_g)} g
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-3">
                  <span className="text-slate-300">Toplam</span>
                  <span className="text-2xl font-bold">{sum(result.foods, "calories")} kcal</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">Tahmin güveni: {result.confidence}</p>
                {result.note && <p className="mt-1 text-sm text-slate-400">{result.note}</p>}
                <button
                  onClick={addToLog}
                  className="mt-4 w-full rounded-xl bg-glow/20 py-3 font-medium text-glow hover:bg-glow/30"
                >
                  Bugüne ekle
                </button>
              </>
            ) : (
              <p className="text-slate-300">🤔 {result.note || "Fotoğrafta yemek bulunamadı."}</p>
            )}
          </section>
        )}

        {today.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-panel p-5">
            <h2 className="mb-3 font-semibold">Bugün yediklerin</h2>
            <ul className="flex flex-col gap-2">
              {today.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-black/20 p-3 text-sm"
                >
                  <span className="text-slate-300">
                    <span className="text-slate-500">{e.time}</span>{" "}
                    {e.foods.map((f) => f.name).join(", ")}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="font-medium">{sum(e.foods, "calories")} kcal</span>
                    <button
                      onClick={() => removeEntry(e.id)}
                      aria-label="Sil"
                      className="text-slate-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-center text-xs text-slate-600">
          Değerler yapay zekâ tahminidir, tıbbi tavsiye yerine geçmez.
        </p>
      </div>
    </main>
  );
}
