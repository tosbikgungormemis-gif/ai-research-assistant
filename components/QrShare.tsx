"use client";

import { useEffect, useState } from "react";

export default function QrShare() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  if (!url) return null;

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(
    url
  )}`;

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-panel p-6 text-center">
      <img
        src={qrSrc}
        alt="Bu sayfaya git QR kodu"
        width={220}
        height={220}
        className="rounded-lg bg-white p-2"
      />
      <p className="text-sm text-slate-300">
        Bu QR kodu okutarak sınıf sayfasına ulaşabilirsin.
      </p>
      <p className="max-w-full break-all text-xs text-slate-500">{url}</p>
    </div>
  );
}
