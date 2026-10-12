import { saveAs } from "file-saver";
import JSZip from "jszip";

/** Numbered plain-text rendering of a batch of prompts. */
export function promptsToText(prompts: string[]): string {
  return prompts.map((p, i) => `[${i + 1}]\n${p}`).join("\n\n");
}

/** Download the batch prompts as a .txt file. */
export function downloadPromptsTxt(filename: string, prompts: string[]): void {
  if (prompts.length === 0) return;
  const blob = new Blob([promptsToText(prompts)], {
    type: "text/plain;charset=utf-8",
  });
  saveAs(blob, filename);
}

/** Embed prompts.txt inside a JSZip before it is generated. */
export function addPromptsToZip(zip: JSZip, prompts: string[]): void {
  if (prompts.length === 0) return;
  zip.file("prompts.txt", promptsToText(prompts));
}

/** Download the batch prompts as a CSV file (No, Title, Prompt). */
export function downloadPromptsCsv(
  filename: string,
  prompts: string[],
  titles?: string[]
): void {
  if (prompts.length === 0) return;
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const rows = prompts.map(
    (p, i) => `${i + 1},${esc(titles?.[i] ?? "")},${esc(p)}`
  );
  const csv = `No,Title,Prompt\n${rows.join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, filename);
}
