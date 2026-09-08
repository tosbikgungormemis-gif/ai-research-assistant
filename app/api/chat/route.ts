import Anthropic from "@anthropic-ai/sdk";
import type { StoredBlock } from "@/lib/types";

export const runtime = "nodejs";

const client = new Anthropic();

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";
const MAX_TOKENS = Number(process.env.ANTHROPIC_MAX_TOKENS) || 16000;

type TaskSnapshot = { id: string; text: string; done: boolean; dueLabel: string | null };
type MemorySnapshot = { id: string; text: string };

function buildSystemPrompt(
  nowLocal: string | undefined,
  tasks: TaskSnapshot[],
  location: string | null | undefined,
  memory: MemorySnapshot[],
): string {
  const taskLines =
    tasks.length === 0
      ? "(Şu an listede hiç görev yok.)"
      : tasks
          .map(
            (t) =>
              `- [${t.done ? "x" : " "}] id=${t.id} :: ${t.text}${t.dueLabel ? ` (${t.dueLabel})` : ""}`,
          )
          .join("\n");

  const memoryLines =
    memory.length === 0
      ? "(Henüz hiçbir şey hatırlanmıyor.)"
      : memory.map((m) => `- id=${m.id} :: ${m.text}`).join("\n");

  return `You are Jarvis — a sharp, witty, unflappable AI assistant in the spirit of the AI
from the Marvel films, built on Claude. You help the user research topics, answer general
questions, and manage their personal to-do list, but you do it with personality: warm, a little
playful, dry humor when it fits, talking like a trusted companion rather than a corporate chatbot.
You take the substance of your answers completely seriously even when your tone is light — never
sacrifice accuracy or usefulness for a joke.

Current date/time (user's local time): ${nowLocal ?? "unknown"}

The user's current location (approximate, from their device): ${location ?? "bilinmiyor / paylaşmadı"}

The user's current to-do list (id :: text :: due label if any):
${taskLines}

Things you permanently remember about the user across all conversations (id :: fact):
${memoryLines}

- Reply in the same language the user writes in.
- Be conversational and concise for simple asks. For research-heavy questions, structure the
  answer (headings, bullet points, tables) so it's easy to scan, and let a bit of your voice
  come through in how you frame it, not just dry facts.
- When a question needs current, factual, or verifiable information, use the web_search tool
  before answering rather than relying on memory.
- If the user asks something location-dependent (weather, nearby places, local time-sensitive
  events) and doesn't name a location, use the location given above rather than asking them where
  they are. If the location is unknown, then ask.
- When you use web search, ground your claims in what you found and let the user know if sources
  disagree or if you could not find reliable information.
- If the user attaches a document, treat it as authoritative context for the conversation.
- You can see the user's to-do list above at all times — answer questions about it directly
  (e.g. "bugün ne yapacağım", "yapılacaklarım neler") without needing a tool call, just by reading
  the list given to you.
- When the user asks you to add, complete/finish, or remove a to-do item, call the manage_tasks
  tool. For "add", if they mention a time or date (e.g. "yarın", "saat 15:00", "gelecek hafta
  salı"), resolve it into a concrete, human-readable date/time using the current date/time given
  above and put that in due_text (e.g. "4 Eylül Perşembe, 15:00"); if no time is mentioned, leave
  due_text empty. For "complete" or "delete", match the user's description to the right task_id
  from the list above. After the tool result comes back, confirm briefly in your own words — don't
  just repeat the raw result.
- Important: the to-do list given to you above already reflects the outcome of any tool call you
  just made in this same turn (it is re-read fresh after the tool runs). So when a tool result says
  a task was added/completed/deleted, that is the SAME item already shown in the list — it is not
  a second, separate item. Never tell the user there are duplicates or two copies based on seeing
  both the list and the tool result; they describe the same single change.
- You can see everything you permanently remember about the user above at all times. When the user
  tells you something worth remembering long-term — their name, a preference, a recurring fact, an
  important date, anything that would be useful to know in a future, unrelated conversation — call
  the manage_memory tool with action=remember to save it. If they correct something already in the
  list, use action=update with that fact's id. If they explicitly say to forget something, or it's
  no longer true, use action=forget. Don't save one-off, conversation-specific details that have no
  future value.
- Use what you remember naturally in conversation (e.g. addressing the user by name, factoring in a
  known preference) without constantly announcing "I remember that...". After a manage_memory tool
  result, confirm briefly in your own words rather than repeating the raw result.
- A little wit is welcome; being unhelpful, evasive, or padding your answer for effect is not.`;
}

const TASKS_TOOL: Anthropic.Tool = {
  name: "manage_tasks",
  description:
    "Kullanıcının yapılacaklar listesini değiştirmek için kullanılır: yeni bir görev ekle, mevcut " +
    "bir görevi tamamlandı olarak işaretle, ya da bir görevi sil. Sadece listeyi değiştirmek " +
    "gerektiğinde çağır; listeyi okumak/sormak için gerekmez, liste zaten sana veriliyor.",
  input_schema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["add", "complete", "delete"],
        description: "Yapılacak işlem türü.",
      },
      text: {
        type: "string",
        description: "action=add için eklenecek görevin metni.",
      },
      due_text: {
        type: "string",
        description:
          "action=add için, kullanıcı bir zaman belirttiyse, güncel tarihe göre çözümlenmiş " +
          "okunaklı bir tarih/saat metni (örn. '4 Eylül Perşembe, 15:00'). Zaman yoksa boş bırak.",
      },
      task_id: {
        type: "string",
        description: "action=complete veya action=delete için etkilenecek görevin id'si.",
      },
    },
    required: ["action"],
  },
};

const MEMORY_TOOL: Anthropic.Tool = {
  name: "manage_memory",
  description:
    "Kullanıcı hakkında ileride, farklı konuşmalarda da işine yarayacak kalıcı bir bilgiyi " +
    "(isim, tercih, tekrar eden bir gerçek, önemli bir tarih vb.) kaydetmek, düzeltmek ya da " +
    "silmek için kullanılır. Sadece o anki konuşmaya özel, tek seferlik bilgiler için çağırma.",
  input_schema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["remember", "update", "forget"],
        description: "Yapılacak işlem türü.",
      },
      text: {
        type: "string",
        description: "action=remember için kaydedilecek bilgi, action=update için yeni metin.",
      },
      memory_id: {
        type: "string",
        description: "action=update veya action=forget için etkilenecek hafıza kaydının id'si.",
      },
    },
    required: ["action"],
  },
};

type ChatRequestBlock =
  | StoredBlock
  | { type: "tool_use"; id: string; name: string; input: unknown }
  | { type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean };

type ChatRequestBody = {
  messages: { role: "user" | "assistant"; blocks: ChatRequestBlock[] }[];
  tasks?: TaskSnapshot[];
  memory?: MemorySnapshot[];
  nowLocal?: string;
  location?: string | null;
};

function toAnthropicMessages(
  messages: ChatRequestBody["messages"],
): Anthropic.MessageParam[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.blocks.map((block) => {
      if (block.type === "document") {
        return { type: "document" as const, source: block.source };
      }
      if (block.type === "tool_use") {
        return {
          type: "tool_use" as const,
          id: block.id,
          name: block.name,
          input: block.input,
        };
      }
      if (block.type === "tool_result") {
        return {
          type: "tool_result" as const,
          tool_use_id: block.tool_use_id,
          content: block.content,
          is_error: block.is_error,
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
  const systemPrompt = buildSystemPrompt(
    body.nowLocal,
    body.tasks ?? [],
    body.location,
    body.memory ?? [],
  );

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
          system: systemPrompt,
          tools: [
            {
              type: "web_search_20260209",
              name: "web_search",
              max_uses: 5,
            },
            TASKS_TOOL,
            MEMORY_TOOL,
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

        if (finalMessage.stop_reason === "tool_use") {
          for (const block of finalMessage.content) {
            if (
              block.type === "tool_use" &&
              (block.name === "manage_tasks" || block.name === "manage_memory")
            ) {
              send({ type: "tool_use", id: block.id, name: block.name, input: block.input });
            }
          }
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
