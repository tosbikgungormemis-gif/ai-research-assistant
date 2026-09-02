import type { StoredBlock } from "./types";

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB
const TEXT_EXTENSIONS = [".txt", ".md", ".csv", ".json", ".log"];

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Dosya okunamadı"));
    reader.readAsText(file);
  });
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const base64 = result.includes(",") ? result.split(",", 2)[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Dosya okunamadı"));
    reader.readAsDataURL(file);
  });
}

export async function fileToBlock(file: File): Promise<StoredBlock> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`"${file.name}" 15 MB sınırından büyük.`);
  }

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (isPdf) {
    const data = await readAsBase64(file);
    return {
      type: "document",
      title: file.name,
      source: { type: "base64", media_type: "application/pdf", data },
    };
  }

  const isText = TEXT_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
  if (isText || file.type.startsWith("text/")) {
    const text = await readAsText(file);
    return {
      type: "text",
      text: `--- Ek dosya: ${file.name} ---\n${text}\n--- Ek dosya sonu ---`,
    };
  }

  throw new Error(`"${file.name}" desteklenmiyor. Sadece PDF, TXT, MD, CSV, JSON kabul edilir.`);
}
