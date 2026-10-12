import { useState } from "react";
import { useStore } from "@/src/store/useStore";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { PromptResults } from "@/src/components/PromptMode";
import {
  buildSalePrompt,
  SALE_CATEGORIES,
  SALE_STYLES,
  SEASONAL_EVENTS,
  COLLECTION_TYPES,
  PRESET_LABEL_WORDS,
  type SaleInputs,
} from "@/src/lib/salePrompts";
import { BadgePercent, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/src/lib/utils";

const COUNTS = [10, 20, 30, 40, 50, 100];
const ELEMENT_OPTIONS = [4, 6, 8, 12];
const SWATCHES = ["#E11D48", "#111111", "#F5C518", "#2563EB", "#059669", "#F97316", "#7C3AED", "#FFFFFF"];

function Segmented<T extends string>({ options, value, onChange }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <div
      className="grid gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-onyx-800 border border-zinc-200 dark:border-white/10"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "px-2 py-2 rounded-lg text-xs font-semibold transition-colors",
            value === o.value
              ? "bg-platinum-200 text-zinc-950 shadow-sm"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      <div className="flex items-center gap-2 flex-wrap">
        {SWATCHES.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            title={c}
            className={cn(
              "w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110",
              value.toLowerCase() === c.toLowerCase()
                ? "border-zinc-900 dark:border-platinum-200"
                : "border-zinc-200 dark:border-white/15"
            )}
            style={{ backgroundColor: c }}
          />
        ))}
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#e11d48"}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-zinc-200 dark:border-white/15"
          title="Custom color"
        />
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{value}</span>
      </div>
    </div>
  );
}

function splitList(raw: string): string[] {
  return raw.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
}

export function SaleDiscountGenerator() {
  const [category, setCategory] = useState("blank-tags");
  const [style, setStyle] = useState("Flat Vector");
  const [primaryColor, setPrimaryColor] = useState("#E11D48");
  const [accentColor, setAccentColor] = useState("#111111");
  const [background, setBackground] = useState<"white" | "transparent">("white");
  const [format, setFormat] = useState<"vector" | "png" | "jpg">("vector");
  const [setMode, setSetMode] = useState<"single" | "set">("set");
  const [elements, setElements] = useState(8);
  const [percentages, setPercentages] = useState("20%, 30%, 50%");
  const [labelWords, setLabelWords] = useState("SALE, MEGA SALE, CLEARANCE");
  const [priceValues, setPriceValues] = useState("");
  const [event, setEvent] = useState(SEASONAL_EVENTS[0]);
  const [eventText, setEventText] = useState(false);
  const [collectionType, setCollectionType] = useState(COLLECTION_TYPES[0]);
  const [count, setCount] = useState(20);

  const [isGenerating, setIsGenerating] = useState(false);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [titles, setTitles] = useState<string[]>([]);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000000));

  const promptInstructions = useStore((state) => state.promptInstructions);

  const collectInputs = (): SaleInputs => ({
    category,
    style,
    primaryColor,
    accentColor,
    background,
    format,
    setMode,
    elements,
    percentages: splitList(percentages),
    labelWords: splitList(labelWords),
    priceValues: splitList(priceValues),
    event,
    eventText,
    collectionType,
  });

  const handleGenerate = async (newSeed?: number) => {
    setIsGenerating(true);
    // let the spinner paint before the (fast) synchronous build
    await new Promise((r) => setTimeout(r, 30));
    try {
      const s = newSeed ?? Math.floor(Math.random() * 1000000);
      setSeed(s);
      const inputs = collectInputs();
      const bodies: string[] = [];
      const heads: string[] = [];
      for (let i = 0; i < count; i++) {
        const p = buildSalePrompt(inputs, promptInstructions, i + 1, s);
        heads.push(p.title);
        bodies.push(p.body);
      }
      setTitles(heads);
      setPrompts(bodies);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectCls =
    "flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-platinum-600 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-platinum-500";

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* form */}
      <div className="xl:col-span-4 space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm h-fit">
        <div>
          <h2 className="font-display text-2xl font-bold text-zinc-900 dark:text-platinum-100 mb-2 flex items-center gap-2">
            <BadgePercent className="w-6 h-6 text-platinum-400" />
            Sale & Discount Graphics
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">Bulk commercial promo prompts for Adobe Stock.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Graphic Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
              {SALE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {SALE_CATEGORIES.find((c) => c.id === category)?.hint}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Design Style</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)} className={selectCls}>
              {["Minimalist", "Flat Vector", "Vintage Retail", "Luxury", "Playful Colorful", "Outline Line-Art", "Monochrome", "Bold Modern"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <ColorRow label="Primary Color" value={primaryColor} onChange={setPrimaryColor} />
          <ColorRow label="Accent Color" value={accentColor} onChange={setAccentColor} />

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Background</label>
            <Segmented
              options={[{ value: "white", label: "White" }, { value: "transparent", label: "Transparent" }]}
              value={background}
              onChange={setBackground}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Output Format</label>
            <Segmented
              options={[
                { value: "vector", label: "Vector-style" },
                { value: "png", label: "PNG-style" },
                { value: "jpg", label: "JPG-style" },
              ]}
              value={format}
              onChange={setFormat}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Single Design or Set</label>
            <Segmented
              options={[{ value: "single", label: "Single" }, { value: "set", label: "Coordinated Set" }]}
              value={setMode}
              onChange={setSetMode}
            />
          </div>

          {setMode === "set" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Elements per Graphic</label>
              <select value={elements} onChange={(e) => setElements(Number(e.target.value))} className={selectCls}>
                {ELEMENT_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n} elements</option>
                ))}
              </select>
            </div>
          )}

          {category === "percent-tags" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Percentage Values</label>
              <Input
                placeholder="20%, 30%, 50%"
                value={percentages}
                onChange={(e) => setPercentages(e.target.value)}
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Comma separated — preserved exactly.</p>
            </div>
          )}

          {category === "sale-labels" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Label Words</label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_LABEL_WORDS.map((w) => {
                  const active = splitList(labelWords).includes(w);
                  return (
                    <button
                      key={w}
                      onClick={() => {
                        const cur = splitList(labelWords);
                        setLabelWords(
                          active ? cur.filter((x) => x !== w).join(", ") : [...cur, w].join(", ")
                        );
                      }}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                        active
                          ? "bg-platinum-200 text-zinc-950 border-platinum-200"
                          : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400"
                      )}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
              <Input
                placeholder="Or type custom words, comma separated"
                value={labelWords}
                onChange={(e) => setLabelWords(e.target.value)}
              />
            </div>
          )}

          {category === "price-tags" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Price Values (optional)</label>
              <Input
                placeholder="$9.99, $19.99 — leave empty for blank tags"
                value={priceValues}
                onChange={(e) => setPriceValues(e.target.value)}
              />
            </div>
          )}

          {category === "seasonal" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Event</label>
              <select value={event} onChange={(e) => setEvent(e.target.value)} className={selectCls}>
                {SEASONAL_EVENTS.map((ev) => (
                  <option key={ev} value={ev}>{ev}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eventText}
                  onChange={(e) => setEventText(e.target.checked)}
                  className="w-4 h-4 accent-zinc-900 dark:accent-platinum-200"
                />
                Allow event wording in the graphics
              </label>
            </div>
          )}

          {category === "collections" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Collection Type</label>
              <select value={collectionType} onChange={(e) => setCollectionType(e.target.value)} className={selectCls}>
                {COLLECTION_TYPES.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Number of Prompts</label>
            <select value={count} onChange={(e) => setCount(Number(e.target.value))} className={selectCls}>
              {COUNTS.map((c) => (
                <option key={c} value={c}>{c} prompts</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 mt-6">
            <Button className="flex-1 h-12 text-base" onClick={() => handleGenerate()} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" /> Generate Prompts
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="h-12 px-4"
              title="Regenerate with new variations"
              onClick={() => handleGenerate()}
              disabled={isGenerating || prompts.length === 0}
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-200 dark:border-zinc-800 pt-4">
            Prompts follow Adobe Stock-oriented commercial direction. Generated artwork is not
            automatically approved — always check originality, IP rights and current submission policies.
          </p>
        </div>
      </div>

      {/* results */}
      <div className="xl:col-span-8 flex flex-col min-h-[600px] bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed p-6">
        {prompts.length > 0 ? (
          <PromptResults prompts={prompts} titles={titles} filePrefix="sale-discount" />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 text-zinc-500 dark:text-zinc-400">
            <BadgePercent className="w-16 h-16 mx-auto opacity-20" />
            <p className="max-w-sm">
              Choose a category and settings, then generate up to 100 detailed commercial prompts —
              each with its own title, ready for any AI image tool.
            </p>
          </div>
        )}
        {seed > 0 && prompts.length > 0 && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-6 font-mono">batch seed: {seed}</p>
        )}
      </div>
    </div>
  );
}
