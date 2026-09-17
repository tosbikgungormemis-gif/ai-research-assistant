import type { Metadata } from "next";
import QrShare from "@/components/QrShare";

export const metadata: Metadata = {
  title: "8-A Sınıfı | Türk Maarif Koleji",
  description: "Türk Maarif Koleji 8-A sınıfı duyuruları, ders programı ve iletişim bilgileri.",
};

const KAPTAN_ADI = "Ayşe Ceren Yanardağ";

const duyurular = [
  {
    tarih: "Örnek tarih",
    baslik: "Örnek duyuru başlığı",
    metin: "Bu bir örnek duyurudur. Bu alanı kendi duyurularınızla değiştirebilirsiniz.",
  },
];

type Ders = { ders: string; ogretmen?: string } | null;

const periods = [
  { key: "d1", label: "1. Ders", time: "07:55–08:35" },
  { key: "b1", label: "Ara", time: "08:35–08:45", isBreak: true },
  { key: "d2", label: "2. Ders", time: "08:45–09:25" },
  { key: "d3", label: "3. Ders", time: "09:25–10:05" },
  { key: "b2", label: "Ara", time: "10:05–10:15", isBreak: true },
  { key: "d4", label: "4. Ders", time: "10:15–10:55" },
  { key: "d5", label: "5. Ders", time: "10:55–11:35" },
  { key: "b3", label: "Ara", time: "11:35–11:45", isBreak: true },
  { key: "d6", label: "6. Ders", time: "11:45–12:25" },
  { key: "d7", label: "7. Ders", time: "12:25–13:05" },
  { key: "lunch", label: "Öğle Arası", time: "13:05–14:00", isBreak: true },
  { key: "d8", label: "8. Ders", time: "14:00–14:40" },
  { key: "d9", label: "9. Ders", time: "14:40–15:20" },
] as const;

const dersProgrami: { gun: string; dersler: Record<string, Ders> }[] = [
  {
    gun: "Pazartesi",
    dersler: {
      d1: { ders: "PHYSICS", ogretmen: "Dilara Dağ" },
      d2: { ders: "TÜRKÇE", ogretmen: "Çise Sönmez" },
      d3: { ders: "GEOGRAPHY", ogretmen: "Nuray Özgeçen" },
      d4: { ders: "TÜRKİYE TARİHİ", ogretmen: "Pınar Şarap" },
      d5: { ders: "BIOLOGY", ogretmen: "Sermet Benli" },
      d6: { ders: "ENGLISH", ogretmen: "Emine Sülün" },
      d7: { ders: "MÜZİK", ogretmen: "Suzan Özgü" },
      d8: { ders: "MATH", ogretmen: "Şebnem Karahanlı" },
      d9: { ders: "ENGLISH", ogretmen: "Ayşın Daher" },
    },
  },
  {
    gun: "Salı",
    dersler: {
      d1: { ders: "GERMAN", ogretmen: "Bingül Küçük" },
      d2: { ders: "PHYSICS", ogretmen: "Dilara Dağ" },
      d3: { ders: "MATH", ogretmen: "Şebnem Karahanlı" },
      d4: { ders: "MÜZİK", ogretmen: "Suzan Özgü" },
      d5: { ders: "ENGLISH", ogretmen: "Emine Sülün" },
      d6: { ders: "TÜRKÇE", ogretmen: "Çise Sönmez" },
      d7: { ders: "ENGLISH", ogretmen: "Ayşın Daher" },
      d8: null,
      d9: null,
    },
  },
  {
    gun: "Çarşamba",
    dersler: {
      d1: { ders: "GERMAN", ogretmen: "Bingül Küçük" },
      d2: { ders: "GERMAN", ogretmen: "Bingül Küçük" },
      d3: { ders: "MATH", ogretmen: "Şebnem Karahanlı" },
      d4: { ders: "BOŞ DERS :)" },
      d5: { ders: "TÜRKÇE", ogretmen: "Çise Sönmez" },
      d6: { ders: "P.E – Saha 1", ogretmen: "Salih Bittacı" },
      d7: { ders: "P.E – Saha 1", ogretmen: "Salih Bittacı" },
      d8: null,
      d9: null,
    },
  },
  {
    gun: "Perşembe",
    dersler: {
      d1: { ders: "CHEMISTRY", ogretmen: "Yasemin Toykan" },
      d2: { ders: "TÜRKÇE", ogretmen: "Çise Sönmez" },
      d3: { ders: "MATH", ogretmen: "Şebnem Karahanlı" },
      d4: { ders: "ICT – ICT 1", ogretmen: "Ali Sener" },
      d5: { ders: "TÜRKİYE TARİHİ", ogretmen: "Pınar Şarap" },
      d6: { ders: "ENGLISH", ogretmen: "Ayşın Daher" },
      d7: { ders: "ENGLISH", ogretmen: "Emine Sülün" },
      d8: { ders: "BIOLOGY", ogretmen: "Sermet Benli" },
      d9: { ders: "CHEMISTRY", ogretmen: "Yasemin Toykan" },
    },
  },
  {
    gun: "Cuma",
    dersler: {
      d1: { ders: "MATH", ogretmen: "Şebnem Karahanlı" },
      d2: { ders: "ENGLISH", ogretmen: "Ayşın Daher" },
      d3: { ders: "ENGLISH", ogretmen: "Emine Sülün" },
      d4: { ders: "TÜRKÇE", ogretmen: "Çise Sönmez" },
      d5: { ders: "Counselling", ogretmen: "Saziye Avcıkadir" },
      d6: { ders: "CYPRUS HISTORY", ogretmen: "Ülfet Kılıç" },
      d7: { ders: "HISTORY (ENG)", ogretmen: "Ceren Ataman" },
      d8: null,
      d9: null,
    },
  },
];

const sinifBilgisi = {
  mevcut: "Öğrenci mevcudu buraya eklenecek",
  kaptanIletisim: "Kaptan iletişim bilgisi buraya eklenecek",
  ogretmenIletisim: "Sınıf öğretmeni iletişim bilgisi buraya eklenecek",
};

export default function SinifSayfasi() {
  return (
    <main className="min-h-screen bg-surface px-4 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="text-center">
          <p className="text-sm uppercase tracking-widest text-accent">
            Türk Maarif Koleji
          </p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">8-A Sınıfı</h1>
          <p className="mt-2 text-sm text-slate-400">Kaptan: {KAPTAN_ADI}</p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-panel p-6">
          <h2 className="mb-4 text-xl font-semibold text-glow">📢 Duyurular</h2>
          <ul className="flex flex-col gap-4">
            {duyurular.map((duyuru, i) => (
              <li key={i} className="rounded-xl bg-black/20 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">{duyuru.baslik}</span>
                  <span className="shrink-0 text-xs text-slate-500">{duyuru.tarih}</span>
                </div>
                <p className="mt-1 text-sm text-slate-300">{duyuru.metin}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-panel p-6">
          <h2 className="mb-4 text-xl font-semibold text-glow">📅 Ders Programı</h2>
          <p className="mb-3 text-xs text-slate-500">
            Tabloyu görmek için yatay kaydırın →
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-panel px-2 py-2 text-left text-slate-400">
                    Gün
                  </th>
                  {periods.map((p) => (
                    <th
                      key={p.key}
                      className={`px-2 py-2 text-center text-xs font-medium ${
                        "isBreak" in p && p.isBreak ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      <div>{p.label}</div>
                      <div className="font-normal">{p.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dersProgrami.map((gun) => (
                  <tr key={gun.gun} className="border-t border-white/5">
                    <td className="sticky left-0 z-10 bg-panel px-2 py-2 font-medium">
                      {gun.gun}
                    </td>
                    {periods.map((p) => {
                      if ("isBreak" in p && p.isBreak) {
                        return (
                          <td
                            key={p.key}
                            className="px-2 py-2 text-center text-xs text-slate-600"
                          >
                            {p.key === "lunch" ? "Yemek" : "—"}
                          </td>
                        );
                      }
                      const ders = gun.dersler[p.key];
                      return (
                        <td key={p.key} className="px-2 py-2 text-center text-slate-300">
                          {ders ? (
                            <>
                              <div className="font-medium text-slate-100">{ders.ders}</div>
                              {ders.ogretmen && (
                                <div className="text-xs text-slate-500">{ders.ogretmen}</div>
                              )}
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-panel p-6">
          <h2 className="mb-4 text-xl font-semibold text-glow">🧑‍🤝‍🧑 Sınıf Listesi / İletişim</h2>
          <ul className="flex flex-col gap-2 text-sm text-slate-300">
            <li>
              <span className="text-slate-500">Öğrenci mevcudu: </span>
              {sinifBilgisi.mevcut}
            </li>
            <li>
              <span className="text-slate-500">Kaptan: </span>
              {KAPTAN_ADI} — {sinifBilgisi.kaptanIletisim}
            </li>
            <li>
              <span className="text-slate-500">Sınıf öğretmeni: </span>
              {sinifBilgisi.ogretmenIletisim}
            </li>
          </ul>
        </section>

        <QrShare />
      </div>
    </main>
  );
}
