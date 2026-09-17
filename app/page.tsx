import type { Metadata } from "next";
import QrShare from "@/components/QrShare";

export const metadata: Metadata = {
  title: "8-A Sınıfı | Türk Maarif Koleji",
  description: "Türk Maarif Koleji 8-A sınıfı duyuruları ve iletişim bilgileri.",
};

const KAPTAN_ADI = "Ayşe Ceren Yanardağ";

const duyurular = [
  {
    tarih: "Örnek tarih",
    baslik: "Örnek duyuru başlığı",
    metin: "Bu bir örnek duyurudur. Bu alanı kendi duyurularınızla değiştirebilirsiniz.",
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
