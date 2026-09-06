export const runtime = "nodejs";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

export async function POST(req: Request) {
  if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
    return new Response(null, { status: 501 });
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) {
    return new Response(null, { status: 400 });
  }

  try {
    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.8 },
        }),
      },
    );

    if (!elevenRes.ok || !elevenRes.body) {
      return new Response(null, { status: 502 });
    }

    return new Response(elevenRes.body, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
