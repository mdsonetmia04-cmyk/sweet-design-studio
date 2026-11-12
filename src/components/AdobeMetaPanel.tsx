import { useState } from "react";
import { Copy, Check, Info, Download } from "lucide-react";
import { saveAs } from "file-saver";
import { Button } from "@/src/components/ui/Button";
import {
  ADOBE_CATEGORIES,
  ADOBE_RELEASE_OPTIONS,
  GENERATIVE_AI_DISCLOSURE_NOTE,
  adobeCsvRow,
  first70,
  type AdobeMeta,
} from "@/src/lib/adobeMeta";

const SELECT_CLS =
  "flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-platinum-600 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-platinum-500";

interface AdobeMetaPanelProps {
  meta: AdobeMeta;
  /** Filename of the image this metadata belongs to (used in the CSV row). */
  filename?: string;
  /** Controlled Adobe category ID ("" = not chosen). Uncontrolled by default. */
  categoryId?: string;
  onCategoryChange?: (id: string) => void;
  /** Controlled releases value. Uncontrolled by default ("None"). */
  releases?: string;
  onReleasesChange?: (releases: string) => void;
}

export function AdobeMetaPanel({
  meta,
  filename,
  categoryId,
  onCategoryChange,
  releases,
  onReleasesChange,
}: AdobeMetaPanelProps) {
  const [copied, setCopied] = useState<"title" | "keywords" | null>(null);
  const [internalCategory, setInternalCategory] = useState("");
  const [internalReleases, setInternalReleases] = useState<string>("None");

  const category = categoryId ?? internalCategory;
  const releasesValue = releases ?? internalReleases;
  const setCategory = (v: string) => {
    if (onCategoryChange) onCategoryChange(v);
    else setInternalCategory(v);
  };
  const setReleases = (v: string) => {
    if (onReleasesChange) onReleasesChange(v);
    else setInternalReleases(v);
  };

  const copy = (kind: "title" | "keywords", text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadCsv = () => {
    const file = filename ?? "image.png";
    const csv = `Filename,Title,Keywords,Category,Releases\n${adobeCsvRow(
      file,
      meta,
      category,
      releasesValue
    )}`;
    const csvName = file.replace(/\.[^.]+$/, "") + "_adobe.csv";
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8" }), csvName);
  };

  return (
    <div className="bg-platinum-100 dark:bg-onyx-800/60 border border-platinum-300 dark:border-platinum-800/50 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-platinum-500 dark:text-platinum-400" />
        <h4 className="text-sm font-semibold text-platinum-800 dark:text-platinum-300">
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
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          First 70 characters — the part buyers see in Adobe search, so it
          carries the key buyer keywords:{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            “{first70(meta.title)}”
          </span>
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
                i < 10
                  ? "bg-platinum-50 border-platinum-200 text-platinum-700 dark:bg-platinum-900/20 dark:border-platinum-800 dark:text-platinum-400"
                  : "bg-white border-zinc-200 text-zinc-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400"
              }`}
              title={
                i < 10
                  ? "Weighted more heavily by Adobe search — the first 10 keywords carry the most weight"
                  : undefined
              }
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={SELECT_CLS}
          >
            <option value="">Choose category</option>
            {ADOBE_CATEGORIES.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.id} · {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Releases
          </label>
          <select
            value={releasesValue}
            onChange={(e) => setReleases(e.target.value)}
            className={SELECT_CLS}
          >
            {ADOBE_RELEASE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={downloadCsv}>
        <Download className="w-4 h-4 mr-2" /> Download Adobe CSV
      </Button>

      <p className="text-xs text-platinum-700 dark:text-platinum-400 leading-relaxed">
        {GENERATIVE_AI_DISCLOSURE_NOTE}
      </p>
    </div>
  );
}
