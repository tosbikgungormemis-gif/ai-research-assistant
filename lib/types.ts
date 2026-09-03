export type StoredBlock =
  | { type: "text"; text: string }
  | {
      type: "document";
      title: string;
      source: { type: "base64"; media_type: "application/pdf"; data: string };
    };

export type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  blocks: StoredBlock[];
  createdAt: number;
  sources?: Source[];
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: StoredMessage[];
};

export type Source = { title: string; url: string };

export type StreamEvent =
  | { type: "status"; text: string }
  | { type: "text"; text: string }
  | { type: "sources"; sources: Source[] }
  | { type: "tool_use"; id: string; input: unknown }
  | { type: "done"; stopReason: string | null }
  | { type: "error"; message: string };

export type Task = {
  id: string;
  text: string;
  done: boolean;
  dueLabel: string | null;
  createdAt: number;
};
