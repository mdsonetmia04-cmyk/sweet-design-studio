import { useState } from "react";
import { Copy, Check, FileText, FileText as PromptIcon } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { downloadPromptsTxt } from "@/src/lib/bulkExport";
import { cn } from "@/src/lib/utils";

export type GeneratorMode = "prompts" | "images";

/** Segmented Images/Prompts switch shown at the top of every generator form. */
export function ModeToggle({
  mode,
  onChange,
}: {
  mode: GeneratorMode;
  onChange: (mode: GeneratorMode) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-onyx-800 border border-zinc-200 dark:border-white/10">
      {(["prompts", "images"] as GeneratorMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={cn(
            "px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
            mode === m
              ? "bg-platinum-200 text-zinc-950 shadow-sm"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          )}
        >
          {m === "prompts" ? "Generate Prompts" : "Generate Images"}
        </button>
      ))}
    </div>
  );
}

/** Readable, copy-friendly rendering of a batch of generated prompts. */
export function PromptResults({
  prompts,
  filePrefix,
}: {
  prompts: string[];
  filePrefix: string;
}) {
  const [copiedIndex, setCopiedIndex] = useState<number | "all" | null>(null);

  if (prompts.length === 0) return null;

  const copyText = async (text: string, index: number | "all") => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyOne = (i: number) => copyText(prompts[i], i);
  const copyAll = () =>
    copyText(prompts.map((p, i) => `[${i + 1}]\n${p}`).join("\n\n"), "all");

  return (
    <div className="space-y-5 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-platinum-100 flex items-center gap-2">
          <PromptIcon className="w-5 h-5 text-platinum-400" />
          Generated Prompts ({prompts.length})
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={copyAll}>
            {copiedIndex === "all" ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copiedIndex === "all" ? "Copied" : "Copy All"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadPromptsTxt(`${filePrefix}_prompts.txt`, prompts)}
          >
            <FileText className="w-4 h-4 mr-2" /> Download TXT
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {prompts.map((prompt, i) => (
          <div
            key={i}
            className="bg-white dark:bg-onyx-800 rounded-2xl border border-zinc-200 dark:border-white/10 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-platinum-200 text-zinc-950 text-xs font-bold">
                {i + 1}
              </span>
              <Button variant="ghost" size="sm" onClick={() => copyOne(i)}>
                {copiedIndex === i ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <Copy className="w-4 h-4 mr-1" />
                )}
                {copiedIndex === i ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-100 whitespace-pre-wrap">
              {prompt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
