import React, { useState, useRef } from "react";
import { useStore } from "@/src/store/useStore";
import { generateImage } from "@/src/lib/gemini";
import { buildDetailedPrompt } from "@/src/lib/promptBuilder";
import { ModeToggle, PromptResults, type GeneratorMode } from "@/src/components/PromptMode";
import { addPromptsToZip, downloadPromptsTxt } from "@/src/lib/bulkExport";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Loader2, Download, Copy, Shirt, Upload, X, CheckCircle2, FileText } from "lucide-react";
import { motion } from "motion/react";
import { saveAs } from "file-saver";
import JSZip from "jszip";

const STYLES = ["Modern", "Retro", "Minimal", "Vintage", "Graphic", "Cartoon", "Typography", "Abstract"];
const THEMES = ["Sports", "Music", "Motivational", "Funny", "Anime", "Pop Culture", "Nature", "Gaming"];
const COUNTS = [1, 2, 5, 10, 20, 30];

export function TShirtGenerator() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState("Modern");
  const [theme, setTheme] = useState("Pop Culture");
  const [colors, setColors] = useState("");
  const [count, setCount] = useState(1);
  const [useMockup, setUseMockup] = useState(false);
  const [referenceImage, setReferenceImage] = useState<{ url: string; file: File } | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<GeneratorMode>("prompts");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<string[]>([]);
  const [usedPrompts, setUsedPrompts] = useState<string[]>([]);
  
  const addHistory = useStore((state) => state.addHistory);
  const promptInstructions = useStore((state) => state.promptInstructions);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setReferenceImage({ url, file });
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResults([]);
    setUsedPrompts([]);
    setProgress({ current: 0, total: count });
    
    const generatedImages: string[] = [];
    const generatedPrompts: string[] = [];
    
    try {
      let basePromptText = `A creative T-Shirt design. Theme: ${theme}. Style: ${style}. `;
      if (text) basePromptText += `Must include the text/slogan: "${text}". `;
      if (colors) basePromptText += `Color palette: ${colors}. `;
      
      if (useMockup) {
        basePromptText += `The design should be presented realistically on a blank t-shirt mockup.`;
      } else {
        basePromptText += `The design should be a flat vector graphic on a solid white background, optimized for print (300 DPI style), isolated design.`;
      }

      let prompt: any = basePromptText;
      
      if (referenceImage) {
        const buffer = await referenceImage.file.arrayBuffer();
        const base64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        
        prompt = {
          parts: [
            { text: basePromptText },
            {
              inlineData: {
                data: base64,
                mimeType: referenceImage.file.type
              }
            }
          ]
        };
      }

      // Generate sequentially to avoid rate limits and update progress
      for (let i = 0; i < count; i++) {
        // Slight variation in prompt to ensure different results if no reference image
        const currentPrompt = referenceImage ? prompt : `${basePromptText} Variation ${i + 1}.`;
        
        const imageUrl = await generateImage(currentPrompt);
        generatedImages.push(imageUrl);
        generatedPrompts.push(typeof currentPrompt === 'string' ? currentPrompt : currentPrompt.parts[0].text + " [reference image attached]");
        setUsedPrompts([...generatedPrompts]);
        setResults([...generatedImages]);
        setProgress({ current: i + 1, total: count });
        
        // Save first one to history to avoid spamming history
        if (i === 0) {
          addHistory({ 
            type: "tshirt", 
            prompt: typeof currentPrompt === 'string' ? currentPrompt : currentPrompt.parts[0].text, 
            imageUrl 
          });
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate some designs. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePrompts = () => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(buildDetailedPrompt("tshirt", { subject: theme, style, extra: text, extra2: colors, useMockup }, promptInstructions, i + 1, count));
    }
    setUsedPrompts(list);
    setResults([]);
  };

  const handleDownloadZip = async () => {
    if (results.length === 0) return;
    
    if (results.length === 1) {
      saveAs(results[0], `tshirt_design.png`);
      return;
    }

    const zip = new JSZip();
    results.forEach((res, index) => {
      const base64Data = res.split(",")[1];
      zip.file(`tshirt_design_${index + 1}.png`, base64Data, { base64: true });
    });
    
    addPromptsToZip(zip, usedPrompts);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `tshirt_designs.zip`);
  };

  const handleCopyPrompt = () => {
    let basePromptText = `A creative T-Shirt design. Theme: ${theme}. Style: ${style}. `;
    if (text) basePromptText += `Must include the text/slogan: "${text}". `;
    if (colors) basePromptText += `Color palette: ${colors}. `;
    if (useMockup) {
      basePromptText += `The design should be presented realistically on a blank t-shirt mockup.`;
    } else {
      basePromptText += `The design should be a flat vector graphic on a solid white background, optimized for print (300 DPI style), isolated design.`;
    }
    navigator.clipboard.writeText(basePromptText);
  };

  const handleCopyAllPrompts = () => {
    if (usedPrompts.length === 0) return;
    navigator.clipboard.writeText(usedPrompts.map((p, i) => `[${i + 1}]\n${p}`).join("\n\n"));
  };

  const handleDownloadPromptsTxt = () => {
    downloadPromptsTxt(`tshirt_designs_prompts.txt`, usedPrompts);
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
      <div className="xl:col-span-4 space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm h-fit">
        <div>
          <h2 className="font-display text-2xl font-bold text-zinc-900 dark:text-platinum-100 mb-2">T-Shirt Generator</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Design custom apparel instantly.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Text / Slogan (Optional)</label>
            <Input
              placeholder="e.g. Stay Wild"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-platinum-600 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-platinum-500"
            >
              {THEMES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Style</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Color Palette (Optional)</label>
            <Input
              placeholder="e.g. Neon colors, Black and White"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Reference Image (Optional)</label>
            {!referenceImage ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
              >
                <Upload className="w-6 h-6 mb-2 opacity-50" />
                <span className="text-xs font-medium">Click to upload reference</span>
              </div>
            ) : (
              <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 p-2 flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50">
                <img src={referenceImage.url} alt="Reference" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50 truncate">{referenceImage.file.name}</p>
                </div>
                <button 
                  onClick={() => setReferenceImage(null)}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Number of Designs</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-platinum-600 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-platinum-500"
              >
                {COUNTS.map((c) => (
                  <option key={c} value={c}>{c} {c === 1 ? 'Design' : 'Designs'}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Presentation</label>
              <div className="flex items-center h-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={useMockup}
                    onChange={(e) => setUseMockup(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-platinum-600 focus:ring-platinum-600 dark:border-zinc-700 dark:bg-zinc-900 dark:checked:bg-platinum-600"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">On Mockup</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <ModeToggle mode={mode} onChange={setMode} />
          </div>

          <Button
            className="w-full h-12 text-base mt-4"
            onClick={mode === "prompts" ? handleGeneratePrompts : handleGenerate}
            disabled={isGenerating}
          >
            {mode === "prompts" ? (
              "Generate Prompts"
            ) : isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating ({progress.current}/{progress.total})...
              </>
            ) : (
              "Generate Designs"
            )}
          </Button>
        </div>
      </div>

      <div className="xl:col-span-8 flex flex-col min-h-[600px] bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed p-6">
        {mode === "prompts" ? (
          usedPrompts.length > 0 ? (
            <PromptResults prompts={usedPrompts} filePrefix="tshirt_design" />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 text-zinc-500 dark:text-zinc-400">
              <FileText className="w-16 h-16 mx-auto opacity-20" />
              <p className="max-w-sm">Your detailed prompts will appear here — readable, copy-ready, and built from your Settings instructions.</p>
            </div>
          )
        ) : (
          <>

        {isGenerating && progress.current < progress.total && (
          <div className="w-full max-w-md mx-auto mb-8 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Processing Designs</span>
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
                Generated Designs ({results.length})
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
                  <img src={res} alt={`Design ${idx + 1}`} className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="sm" onClick={() => saveAs(res, `tshirt_design_${idx + 1}.png`)}>
                      <Download className="w-4 h-4 mr-2" /> Save
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : !isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 text-zinc-500 dark:text-zinc-400">
            <Shirt className="w-16 h-16 mx-auto opacity-20" />
            <p>Your generated T-Shirt designs will appear here</p>
          </div>
        ) : null}
                </>
        )}
      </div>
    </div>
  );
}
