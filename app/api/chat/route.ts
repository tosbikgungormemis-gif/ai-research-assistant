import Anthropic from "@anthropic-ai/sdk";
import type { StoredBlock } from "@/lib/types";

export const runtime = "nodejs";

const client = new Anthropic();

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";
const MAX_TOKENS = Number(process.env.ANTHROPIC_MAX_TOKENS) || 16000;

const SYSTEM_PROMPT = `You are an AI research assistant. You help the user research topics and answer
general questions accurately and clearly.

- Reply in the same language the user writes in.
- When a question needs current, factual, or verifiable information, use the web_search tool
  before answering rather than relying on memory.
- Structure longer answers with headings, bullet points, or numbered lists when that improves
  readability. Keep simple answers short and direct.
- When you use web search, ground your claims in what you found and let the user know if sources
  disagree or if you could not find reliable information.
- If the user attaches a document, treat it as authoritative context for the conversation.`;

type ChatRequestBody = {
  messages: { role: "user" | "assistant"; blocks: StoredBlock[] }[];
};

function toAnthropicMessages(
  messages: ChatRequestBody["messages"],
): Anthropic.MessageParam[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.blocks.map((block) => {
      if (block.type === "document") {
        return {
          type: "document" as const,
          source: block.source,
        };
      }
      return { type: "text" as const, text: block.text };
    }),
  }));
}

export async function POST(req: Request) {
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Geçersiz JSON gövdesi." }), {
      status: 400,
    });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages alanı gerekli." }), {
      status: 400,
    });
  }

  const anthropicMessages = toAnthropicMessages(body.messages);

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const send = (obj: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
      };

      try {
        const stream = client.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: SYSTEM_PROMPT,
          tools: [
            {
              type: "web_search_20260209",
              name: "web_search",
              max_uses: 5,
            },
          ],
          messages: anthropicMessages,
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_start" &&
            event.content_block.type === "server_tool_use" &&
            event.content_block.name === "web_search"
          ) {
            send({ type: "status", text: "Web'de araştırılıyor..." });
          } else if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            send({ type: "text", text: event.delta.text });
          }
        }

        const finalMessage = await stream.finalMessage();

        const sources: { title: string; url: string }[] = [];
        for (const block of finalMessage.content) {
          if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
            for (const result of block.content) {
              if (result.type === "web_search_result") {
                sources.push({ title: result.title, url: result.url });
              }
            }
          }
        }

        if (sources.length > 0) {
          send({ type: "sources", sources });
        }

        send({ type: "done", stopReason: finalMessage.stop_reason });
      } catch (err) {
        let message = "Beklenmeyen bir hata oluştu.";
        if (err instanceof Anthropic.AuthenticationError) {
          message = "API anahtarı geçersiz veya eksik. Sunucu ortam değişkenlerini kontrol edin.";
        } else if (err instanceof Anthropic.RateLimitError) {
          message = "Hız sınırına takıldı, lütfen biraz sonra tekrar deneyin.";
        } else if (err instanceof Anthropic.BadRequestError) {
          message = `Geçersiz istek: ${err.message}`;
        } else if (err instanceof Anthropic.APIError) {
          message = `API hatası (${err.status}): ${err.message}`;
        } else if (err instanceof Error) {
          message = err.message;
        }
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
