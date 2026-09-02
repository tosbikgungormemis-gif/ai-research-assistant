"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { StoredMessage } from "@/lib/types";

export default function ChatMessage({ message }: { message: StoredMessage }) {
  const isUser = message.role === "user";
  const sources = message.sources;
  const text = message.blocks
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("\n\n");
  const attachments = message.blocks.filter((b) => b.type === "document");

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser ? "bg-accent text-slate-950" : "bg-panel text-slate-100"
        }`}
      >
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((att, i) =>
              att.type === "document" ? (
                <span
                  key={i}
                  className="rounded-full bg-black/20 px-2 py-1 text-xs"
                >
                  📎 {att.title}
                </span>
              ) : null,
            )}
          </div>
        )}
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        )}
        {sources && sources.length > 0 && (
          <div className="mt-3 border-t border-white/10 pt-2">
            <p className="mb-1 text-xs font-medium text-slate-400">Kaynaklar</p>
            <ul className="space-y-1">
              {sources.map((source, i) => (
                <li key={i} className="truncate text-xs">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline underline-offset-2"
                  >
                    {source.title || source.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
