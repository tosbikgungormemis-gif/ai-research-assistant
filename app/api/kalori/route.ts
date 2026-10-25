import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const client = new Anthropic();

// Haiku is the cheapest model with vision; override with KALORI_MODEL if accuracy isn't enough.
const MODEL = process.env.KALORI_MODEL || "claude-haiku-5-5";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type ImageType = (typeof ALLOWED_TYPES)[number];

// ~5 MB of base64 — the client already downsizes photos, this only guards against abuse.
const MAX_BASE64_LENGTH = 7_000_000;

const SYSTEM_PROMPT = `Sen bir beslenme uzmanısın. Kullanıcının gönderdiği yemek fotoğrafındaki
yiyecekleri tanı ve her biri için porsiyonu, kalorisini ve makro besin değerlerini tahmin et.

- Türk mutfağını iyi tanı (mantı, lahmacun, kuru fasulye, pilav, börek, simit vb.).
- Porsiyonu tabak, çatal, el gibi görünen nesnelere göre tahmin et; gramajı yaz.
- Tüm metinleri Türkçe yaz.
- Fotoğrafta yiyecek yoksa is_food alanını false yap, foods listesini boş bırak ve note alanında
  kısaca nedenini söyle.
- Emin olmadığın durumlarda confidence alanını "düşük" yap ve note alanında nedenini açıkla
  (ör. yağ miktarı görünmüyor, sos içeriği belirsiz).`;

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    is_food: { type: "boolean" },
    foods: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          portion: { type: "string" },
          calories: { type: "number" },
          protein_g: { type: "number" },
          carbs_g: { type: "number" },
          fat_g: { type: "number" },
        },
        required: ["name", "portion", "calories", "protein_g", "carbs_g", "fat_g"],
        additionalProperties: false,
      },
    },
    confidence: { type: "string", enum: ["yüksek", "orta", "düşük"] },
    note: { type: "string" },
  },
  required: ["is_food", "foods", "confidence", "note"],
  additionalProperties: false,
};

export async function POST(req: Request) {
  let body: { image?: unknown; mediaType?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const { image, mediaType } = body;
  if (typeof image !== "string" || image.length === 0) {
    return Response.json({ error: "Fotoğraf bulunamadı." }, { status: 400 });
  }
  if (image.length > MAX_BASE64_LENGTH) {
    return Response.json({ error: "Fotoğraf çok büyük." }, { status: 413 });
  }
  if (!ALLOWED_TYPES.includes(mediaType as ImageType)) {
    return Response.json({ error: "Desteklenmeyen dosya türü." }, { status: 400 });
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: RESULT_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType as ImageType, data: image },
            },
            { type: "text", text: "Bu fotoğraftaki yemeklerin kalorisini hesapla." },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return Response.json({ error: "Bu fotoğraf analiz edilemedi." }, { status: 422 });
    }
    if (response.stop_reason === "max_tokens") {
      return Response.json({ error: "Analiz yarıda kesildi, tekrar dene." }, { status: 502 });
    }

    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      return Response.json({ error: "Boş yanıt döndü." }, { status: 502 });
    }
    return Response.json(JSON.parse(text.text));
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "Çok fazla istek, biraz bekle." }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error("Kalori API error", error.status, error.message);
      return Response.json({ error: "Yapay zekâ servisine ulaşılamadı." }, { status: 502 });
    }
    console.error("Kalori error", error);
    return Response.json({ error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
