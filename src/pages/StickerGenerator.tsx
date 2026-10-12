import { useState } from "react";
import { useStore } from "@/src/store/useStore";
import { generateImage } from "@/src/lib/gemini";
import { addPromptsToZip, downloadPromptsTxt } from "@/src/lib/bulkExport";
import { buildAdobeMeta } from "@/src/lib/adobeMeta";
import { AdobeMetaPanel } from "@/src/components/AdobeMetaPanel";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Loader2, Download, Copy, Sticker, CheckCircle2, FileText } from "lucide-react";
import { motion } from "motion/react";
import { saveAs } from "file-saver";
import JSZip from "jszip";

const STYLES = ["Kawaii", "Cartoon", "Flat", "Vintage", "Y2K", "Minimal", "Graffiti", "3D"];
const COUNTS = [1, 2, 5, 10, 20, 30];

export function StickerGenerator() {
  const [keyword, setKeyword] = useState("");
  const [style, setStyle] = useState("Kawaii");
  const [count, setCount] = useState(1);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<string[]>([]);
  const [usedPrompts, setUsedPrompts] = useState<string[]>([]);

  const addHistory = useStore((state) => state.addHistory);
  const meta = keyword ? buildAdobeMeta("sticker", keyword, style) : null;

  const buildPrompt = (variation: number) =>
    `Single die-cut sticker of "${keyword}". Style: ${style}. Thick white sticker border, bold outlines, vibrant colors, centered on a plain white background, sticker sheet aesthetic, high detail. Variation ${variation}.`;

  const handleGenerate = async () => {
    if (!keyword) return;
    setIsGenerating(true);
    setResults([]);
    setUsedPrompts([]);
    setProgress({ current: 0, total: count });

    const generatedImages: string[] = [];
    const generatedPrompts: string[] = [];

    try {
      for (let i = 0; i < count; i++) {
        const currentPrompt = buildPrompt(i + 1);
        const imageUrl = await generateImage(currentPrompt);
        generatedImages.push(imageUrl);
        generatedPrompts.push(currentPrompt);
        setUsedPrompts([...generatedPrompts]);
        setResults([...generatedImages]);
        setProgress({ current: i + 1, total: count });

        if (i === 0) {
          addHistory({ type: "sticker", prompt: currentPrompt, imageUrl });
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate some stickers. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const slug = keyword.replace(/\s+/g, "_").toLowerCase();

  const handleDownloadZip = async () => {
    if (results.length === 0) return;

    if (results.length === 1) {
      saveAs(results[0], `${slug}_sticker.png`);
      return;
    }

    const zip = new JSZip();
    results.forEach((res, index) => {
      const base64Data = res.split(",")[1];
      zip.file(`${slug}_sticker_${index + 1}.png`, base64Data, { base64: true });
    });

    addPromptsToZip(zip, usedPrompts);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${slug}_stickers.zip`);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(buildPrompt(1));
  };

  const handleCopyAllPrompts = () => {
    if (usedPrompts.length === 0) return;
    navigator.clipboard.writeText(usedPrompts.map((p, i) => `[${i + 1}]\n${p}`).join("\n\n"));
  };

  const handleDownloadPromptsTxt = () => {
    downloadPromptsTxt(`${slug}_prompts.txt`, usedPrompts);
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
      <div className="xl:col-span-4 space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm h-fit">
        <div>
          <h2 className="font-display text-2xl font-bold text-zinc-900 dark:text-platinum-100 mb-2">Sticker Generator</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Die-cut stickers, one click at a time — or in bulk.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Subject / Keyword</label>
            <Input
              placeholder="e.g. Astronaut cat, Coffee cup, Mountain"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Style</label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${
                    style === s
                      ? "bg-platinum-50 border-platinum-200 text-platinum-700 dark:bg-platinum-900/20 dark:border-platinum-800 dark:text-platinum-400"
                      : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Number of Stickers</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-platinum-600 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-platinum-500"
            >
              {COUNTS.map((c) => (
                <option key={c} value={c}>{c} {c === 1 ? 'Sticker' : 'Stickers'}</option>
              ))}
            </select>
          </div>

          <Button
            className="w-full h-12 text-base mt-6"
            onClick={handleGenerate}
            disabled={!keyword || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating ({progress.current}/{progress.total})...
              </>
            ) : (
              "Generate Stickers"
            )}
          </Button>

          {meta && <AdobeMetaPanel meta={meta} />}
        </div>
      </div>

      <div className="xl:col-span-8 flex flex-col min-h-[600px] bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed p-6">
        {isGenerating && progress.current < progress.total && (
          <div className="w-full max-w-md mx-auto mb-8 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Processing Stickers</span>
              <span className="text-zinc-500">{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-platinum-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {results.length > 0 ? (
          <div className="space-y-6 w-full">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-platinum-500" />
                Generated Stickers ({results.length})
              </h3>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleCopyPrompt}>
                  <Copy className="w-4 h-4 mr-2" /> Copy Prompt
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyAllPrompts} disabled={usedPrompts.length === 0}>
                  <Copy className="w-4 h-4 mr-2" /> Copy All
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadPromptsTxt} disabled={usedPrompts.length === 0}>
                  <FileText className="w-4 h-4 mr-2" /> Prompts TXT
                </Button>
                <Button size="sm" onClick={handleDownloadZip}>
                  <Download className="w-4 h-4 mr-2" />
                  {results.length > 1 ? 'Download All (ZIP)' : 'Download PNG'}
                </Button>
              </div>
            </div>

            <div className={`grid gap-4 ${
              results.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
              results.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {results.map((res, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="aspect-square rounded-xl overflow-hidden bg-white shadow-sm border border-zinc-200 dark:border-zinc-800 relative group"
                >
                  <img src={res} alt={`Sticker ${idx + 1}`} className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" onClick={() => saveAs(res, `${slug}_sticker_${idx + 1}.png`)}>
                      <Download className="w-4 h-4 mr-2" /> Save
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : !isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 text-zinc-500 dark:text-zinc-400">
            <Sticker className="w-16 h-16 mx-auto opacity-20" />
            <p>Your generated stickers will appear here</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
