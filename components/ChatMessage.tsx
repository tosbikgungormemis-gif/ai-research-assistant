"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { StoredMessage } from "@/lib/types";

const PaperclipIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3 w-3"
  >
    <path d="M21.44 11.05 12.25 20.24a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a3.67 3.67 0 0 1 5.19 5.19L9.66 17.65a1.83 1.83 0 0 1-2.6-2.6l8.49-8.48" />
  </svg>
);

export default function ChatMessage({
  message,
  pending = false,
}: {
  message: StoredMessage;
  pending?: boolean;
}) {
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
                  className="flex items-center gap-1 rounded-full bg-black/20 px-2 py-1 text-xs"
                >
                  <PaperclipIcon />
                  {att.title}
                </span>
              ) : null,
            )}
          </div>
        )}
        {pending ? (
          <div className="flex items-center gap-1 py-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : isUser ? (
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
