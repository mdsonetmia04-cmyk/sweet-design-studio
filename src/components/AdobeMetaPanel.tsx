import { useState } from "react";
import { Copy, Check, Info } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import {
  GENERATIVE_AI_DISCLOSURE_NOTE,
  type AdobeMeta,
} from "@/src/lib/adobeMeta";

export function AdobeMetaPanel({ meta }: { meta: AdobeMeta }) {
  const [copied, setCopied] = useState<"title" | "keywords" | null>(null);

  const copy = (kind: "title" | "keywords", text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          Adobe Stock Metadata (starting point — review before uploading)
        </h4>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Title ({meta.title.length}/200)</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copy("title", meta.title)}
          >
            {copied === "title" ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied === "title" ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="text-sm text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
          {meta.title}
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Keywords ({meta.keywords.length} — Adobe allows up to 49)
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copy("keywords", meta.keywords.join(", "))}
          >
            {copied === "keywords" ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied === "keywords" ? "Copied" : "Copy all"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {meta.keywords.map((kw, i) => (
            <span
              key={i}
              className={`px-2 py-1 rounded-md text-xs border ${
                i < 7
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                  : "bg-white border-zinc-200 text-zinc-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400"
              }`}
              title={i < 7 ? "Weighted more heavily by Adobe search" : undefined}
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
        {GENERATIVE_AI_DISCLOSURE_NOTE}
      </p>
    </div>
  );
}
