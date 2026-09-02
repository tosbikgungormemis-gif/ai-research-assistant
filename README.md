# AI Araştırma Asistanı

Claude API ile çalışan, web araması yapabilen ve genel sorulara cevap veren bir AI araştırma
asistanı. Next.js (App Router) + TypeScript ile yazılmıştır.

## Özellikler

- 💬 Streaming sohbet arayüzü (Claude yanıtları anlık akar)
- 🔎 Web araması — güncel bilgi gerektiren sorularda Claude otomatik olarak internette arama yapar
  ve kaynakları yanıtın altında listeler
- 📎 Dosya ekleme — PDF, TXT, MD, CSV, JSON dosyaları yükleyip içerikleri hakkında soru sorabilirsin
- 🗂️ Sohbet geçmişi — konuşmalar tarayıcının `localStorage`'ında saklanır, sekme/tarayıcı
  kapatılıp açılsa da kaybolmaz; sol menüden eski sohbetlere dönebilirsin

## Kurulum

```bash
npm install
cp .env.example .env.local
```

`.env.local` dosyasını açıp Anthropic API anahtarını gir:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

Anahtarı [console.anthropic.com](https://console.anthropic.com/) üzerinden alabilirsin.

## Çalıştırma

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini aç.

Üretim derlemesi için:

```bash
npm run build
npm start
```

## Yapılandırma (opsiyonel)

`.env.local` içinde şu değişkenler de ayarlanabilir:

| Değişken               | Varsayılan       | Açıklama                                   |
| ----------------------- | ---------------- | ------------------------------------------- |
| `ANTHROPIC_MODEL`       | `claude-opus-5`  | Kullanılacak Claude modeli                  |
| `ANTHROPIC_MAX_TOKENS`  | `16000`          | Yanıt başına maksimum token sayısı          |

## Proje yapısı

```
app/
  page.tsx            Sohbet arayüzü (istemci bileşeni)
  api/chat/route.ts    Claude API'ye istek atan, sonucu stream eden sunucu rotası
components/
  Sidebar.tsx          Sohbet listesi
  ChatMessage.tsx       Tek bir mesaj balonu (markdown render + kaynaklar)
  ChatInput.tsx         Mesaj yazma + dosya ekleme
lib/
  types.ts             Paylaşılan tipler
  storage.ts           localStorage okuma/yazma yardımcıları
  files.ts             Yüklenen dosyaları Claude'un anlayacağı bloklara çevirir
```

## Notlar

- Sohbet geçmişi ve eklenen dosyalar yalnızca kullandığın tarayıcıda saklanır; başka bir cihaz veya
  tarayıcıdan erişilemez, sunucuya kaydedilmez.
- PDF dosyaları Claude'a doğrudan (base64) gönderilir; ayrıca bir metin çıkarma adımına gerek yoktur.
- Web araması Anthropic'in sunucu tarafı `web_search` aracıyla yapılır; ek bir arama API anahtarı
  gerekmez.
