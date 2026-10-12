import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import {
  Type, Shirt, Download, AlertTriangle, RefreshCw, CheckCircle2,
  RotateCcw, Sparkles, FileDown, Image as ImageIcon, Loader2, Ban,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { TypographyState, ShirtColor, MockupBg, CanvasRatio, TextAlign } from "@/src/lib/typography/types";
import { DEFAULT_STATE } from "@/src/lib/typography/types";
import { FONT_REGISTRY, PRESETS, presetDef, fontDef } from "@/src/lib/typography/presets";
import { buildArtwork } from "@/src/lib/typography/artwork";
import { buildMockup } from "@/src/lib/typography/mockup";
import { validateDesign, exportArtwork, exportMockup, type ValidationIssue } from "@/src/lib/typography/export";

/* ---------- small control primitives ---------- */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{title}</h4>
      {children}
    </div>
  );
}

function SliderRow({ label, value, min, max, step, onChange, format }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
        <span className="font-mono text-zinc-800 dark:text-zinc-200">{format ? format(value) : value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-zinc-900 dark:accent-platinum-200"
      />
    </div>
  );
}

function Segmented<T extends string>({ options, value, onChange }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-onyx-800 border border-zinc-200 dark:border-white/10"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
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

function ColorField({ label, value, onChange, swatches }: {
  label: string; value: string; onChange: (v: string) => void; swatches: string[];
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <div className="flex items-center gap-2 flex-wrap">
        {swatches.map((c) => (
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
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-zinc-200 dark:border-white/15"
          title="Custom color"
        />
      </div>
    </div>
  );
}

/* ---------- main page ---------- */

const BLACK_SWATCHES = ["#FFFFFF", "#F5C518", "#3B82F6", "#EF4444", "#22C55E", "#A855F7"];
const WHITE_SWATCHES = ["#111111", "#1E3A8A", "#B91C1C", "#065F46", "#7C2D12", "#4A4A4A"];

export function TypographyStudio() {
  const [cfg, setCfg] = useState<TypographyState>({ ...DEFAULT_STATE });
  const [variations, setVariations] = useState<TypographyState[]>([]);
  const [varCount, setVarCount] = useState(4);
  const [fontsReady, setFontsReady] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [accentInput, setAccentInput] = useState("");

  const set = (patch: Partial<TypographyState>) => setCfg((c) => ({ ...c, ...patch }));

  // Load display fonts up front so canvas measurement matches rendering
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all(
          FONT_REGISTRY.flatMap((f) =>
            f.weights.map((w) => document.fonts.load(`${w} 80px "${f.family}"`))
          )
        );
      } catch {
        /* offline — fall back to whatever is available */
      }
      if (!cancelled) setFontsReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const artwork = useMemo(() => (fontsReady ? buildArtwork(cfg) : null), [cfg, fontsReady]);
  const mockup = useMemo(() => (fontsReady ? buildMockup(cfg) : null), [cfg, fontsReady]);
  const issues: ValidationIssue[] = useMemo(() => validateDesign(cfg), [cfg]);
  const hasError = issues.some((i) => i.level === "error");

  const applyPreset = (id: string) => {
    const p = presetDef(id);
    set({
      presetId: id,
      fontFamily: p.fontFamily,
      fontWeight: p.fontWeight,
      letterSpacing: p.letterSpacing,
      lineHeight: p.lineHeight,
      align: p.align,
      seed: Math.floor(Math.random() * 100000),
    });
  };

  const switchShirt = (color: ShirtColor) => {
    if (color === cfg.shirtColor) return;
    // Keep artwork readable: snap the primary color to a contrasting default
    // when the user hasn't picked a custom color for the new shirt.
    const next: Partial<TypographyState> = { shirtColor: color };
    if (color === "black") {
      next.primaryColor = "#FFFFFF";
      if (cfg.accentColor.toLowerCase() === "#111111") next.accentColor = "#F5C518";
    } else {
      next.primaryColor = "#111111";
      if (cfg.accentColor.toLowerCase() === "#ffffff") next.accentColor = "#B91C1C";
    }
    set(next);
  };

  const generateVariations = () => {
    const aligns: TextAlign[] = ["center", "left", "right"];
    const baseIdx = aligns.indexOf(cfg.align);
    const list: TypographyState[] = [];
    for (let i = 0; i < varCount; i++) {
      list.push({
        ...cfg,
        seed: Math.floor(Math.random() * 1000000) + i * 7919,
        fontScale: Math.min(1.6, Math.max(0.5, cfg.fontScale * (0.92 + (i % 3) * 0.08))),
        decorative: i % 2 === 0 ? cfg.decorative : !cfg.decorative,
        align: aligns[(baseIdx + i) % 3],
      });
    }
    setVariations(list);
  };

  const pickVariation = (v: TypographyState) => {
    setCfg({ ...v });
    setVariations([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const runExport = async (label: string, fn: () => Promise<void>) => {
    setExporting(label);
    try {
      await fn();
    } catch (e) {
      console.error(e);
      alert(`Export failed: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setExporting(null);
    }
  };

  const fontWeights = fontDef(cfg.fontFamily).weights;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-900 dark:text-platinum-100 flex items-center gap-3">
            <Type className="w-9 h-9 text-platinum-400" />
            Typography Studio
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">
            Custom typography T-shirt designs with exact text rendering — flat artwork and
            realistic mockup, side by side. No AI-garbled lettering, ever.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Sparkles className="w-4 h-4" />
          1 Text &nbsp;→&nbsp; 2 Shirt &nbsp;→&nbsp; 3 Preset &nbsp;→&nbsp; 4 Customize &nbsp;→&nbsp; 5 Export
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-8 items-start">
        {/* -------- controls -------- */}
        <div className="space-y-6 bg-white dark:bg-onyx-900 p-6 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm xl:sticky xl:top-6 max-h-none xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto">
          <Section title="Step 1 — Your Text">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Enter Your T-Shirt Text</label>
            <textarea
              rows={4}
              value={cfg.text}
              onChange={(e) => set({ text: e.target.value })}
              placeholder={"CHANGE THE WORLD\nBY THE SIMPLE\nTHINK"}
              className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-base font-semibold ring-offset-background placeholder:text-zinc-400 placeholder:font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-platinum-600 focus-visible:ring-offset-2 dark:border-white/15 dark:bg-onyx-800 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-500 dark:focus-visible:ring-platinum-500"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{cfg.text.length} characters</span>
              <Button variant="ghost" size="sm" onClick={() => set({ text: "" })}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Text
              </Button>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-zinc-600 dark:text-zinc-400">Accent words (comma separated)</label>
              <Input
                placeholder="e.g. world, think"
                value={accentInput}
                onChange={(e) => {
                  setAccentInput(e.target.value);
                  set({ accentWords: e.target.value.split(",").map((w) => w.trim()).filter(Boolean) });
                }}
              />
            </div>
          </Section>

          <Section title="Step 2 — T-Shirt">
            <Segmented<ShirtColor>
              options={[{ value: "black", label: "Black T-Shirt" }, { value: "white", label: "White T-Shirt" }]}
              value={cfg.shirtColor}
              onChange={switchShirt}
            />
            <div className="space-y-1">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Mockup background</span>
              <Segmented<MockupBg>
                options={[{ value: "white", label: "White" }, { value: "gray", label: "Light Gray" }]}
                value={cfg.mockupBg}
                onChange={(v) => set({ mockupBg: v })}
              />
            </div>
          </Section>

          <Section title="Step 3 — Design Preset">
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  title={p.description}
                  className={cn(
                    "px-3 py-2.5 rounded-xl text-xs font-semibold text-left border transition-colors",
                    cfg.presetId === p.id
                      ? "bg-platinum-200 text-zinc-950 border-platinum-200"
                      : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-onyx-800 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5"
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Step 4 — Customize">
            <ColorField
              label="Primary text color"
              value={cfg.primaryColor}
              onChange={(v) => set({ primaryColor: v })}
              swatches={cfg.shirtColor === "black" ? BLACK_SWATCHES : WHITE_SWATCHES}
            />
            <ColorField
              label="Accent color"
              value={cfg.accentColor}
              onChange={(v) => set({ accentColor: v })}
              swatches={["#F5C518", "#3B82F6", "#EF4444", "#22C55E", "#A855F7", "#111111"]}
            />
            <div className="space-y-1">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Font family</span>
              <select
                value={cfg.fontFamily}
                onChange={(e) => {
                  const f = fontDef(e.target.value);
                  set({ fontFamily: f.key, fontWeight: f.weights.includes(cfg.fontWeight) ? cfg.fontWeight : f.weights[0] });
                }}
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-onyx-800"
              >
                {FONT_REGISTRY.map((f) => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Font weight</span>
              <Segmented
                options={fontWeights.map((w) => ({ value: String(w), label: String(w) }))}
                value={String(cfg.fontWeight)}
                onChange={(v) => set({ fontWeight: Number(v) })}
              />
            </div>
            <SliderRow label="Font size" value={cfg.fontScale} min={0.5} max={1.6} step={0.05}
              onChange={(v) => set({ fontScale: v })} format={(v) => `${Math.round(v * 100)}%`} />
            <SliderRow label="Letter spacing" value={cfg.letterSpacing} min={-0.05} max={0.4} step={0.01}
              onChange={(v) => set({ letterSpacing: v })} format={(v) => `${Math.round(v * 100)}%`} />
            <SliderRow label="Line spacing" value={cfg.lineHeight} min={0.85} max={1.8} step={0.05}
              onChange={(v) => set({ lineHeight: v })} format={(v) => `${v.toFixed(2)}×`} />
            <div className="space-y-1">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Text alignment</span>
              <Segmented<TextAlign>
                options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]}
                value={cfg.align}
                onChange={(v) => set({ align: v })}
              />
            </div>
            <SliderRow label="Layout density" value={cfg.density} min={0.7} max={1.4} step={0.05}
              onChange={(v) => set({ density: v })} format={(v) => `${Math.round(v * 100)}%`} />
            <SliderRow label="Artwork scale on shirt" value={cfg.artScale} min={0.5} max={1} step={0.05}
              onChange={(v) => set({ artScale: v })} format={(v) => `${Math.round(v * 100)}%`} />
            <SliderRow label="Artwork placement" value={cfg.artPlacement} min={0} max={100} step={1}
              onChange={(v) => set({ artPlacement: v })} format={(v) => `${v}%`} />
            <div className="space-y-1">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Decorative elements</span>
              <Segmented
                options={[{ value: "on", label: "On" }, { value: "off", label: "Off" }]}
                value={cfg.decorative ? "on" : "off"}
                onChange={(v) => set({ decorative: v === "on" })}
              />
            </div>
            <div className="space-y-1">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Artwork canvas</span>
              <Segmented<CanvasRatio>
                options={[{ value: "1:1", label: "1 : 1" }, { value: "4:5", label: "4 : 5" }]}
                value={cfg.canvasRatio}
                onChange={(v) => set({ canvasRatio: v })}
              />
            </div>
          </Section>

          <Section title="Variations">
            <Segmented
              options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "4", label: "4" }, { value: "6", label: "6" }]}
              value={String(varCount)}
              onChange={(v) => setVarCount(Number(v))}
            />
            <Button variant="outline" className="w-full" onClick={generateVariations}>
              <RefreshCw className="w-4 h-4 mr-2" /> Generate Variations
            </Button>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Same wording, different compositions. Click a variation to edit it.
            </p>
          </Section>
        </div>

        {/* -------- previews -------- */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-display text-xl font-semibold text-zinc-900 dark:text-platinum-100 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-platinum-400" /> Original Artwork
              </h3>
              <div
                className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden aspect-square"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #e4e4e7 25%, transparent 25%), linear-gradient(-45deg, #e4e4e7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e4e4e7 75%), linear-gradient(-45deg, transparent 75%, #e4e4e7 75%)",
                  backgroundSize: "28px 28px",
                  backgroundPosition: "0 0, 0 14px, 14px -14px, -14px 0",
                  backgroundColor: "#fafafa",
                }}
              >
                {artwork ? (
                  <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: artwork.svg }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Flat vector graphic — transparent background, print-ready.</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-xl font-semibold text-zinc-900 dark:text-platinum-100 flex items-center gap-2">
                <Shirt className="w-5 h-5 text-platinum-400" /> T-Shirt Mockup
              </h3>
              <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden aspect-[4/5] bg-white">
                {mockup ? (
                  <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: mockup.svg }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Same artwork composited on the {cfg.shirtColor} shirt — updates live with every change.
              </p>
            </div>
          </div>

          {/* variations */}
          {variations.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display text-xl font-semibold text-zinc-900 dark:text-platinum-100">
                Variations ({variations.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {variations.map((v, i) => {
                  const art = buildArtwork(v);
                  return (
                    <button
                      key={i}
                      onClick={() => pickVariation(v)}
                      className="group rounded-xl border border-zinc-200 dark:border-white/10 overflow-hidden bg-white dark:bg-onyx-800 hover:border-platinum-400 transition-colors text-left"
                    >
                      <div className="aspect-square" dangerouslySetInnerHTML={{ __html: art.svg }} />
                      <div className="px-3 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200">
                        Variation {i + 1} — use this
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* validation + export */}
          <div className="bg-white dark:bg-onyx-900 rounded-2xl border border-zinc-200 dark:border-white/10 p-6 space-y-5">
            <h3 className="font-display text-xl font-semibold text-zinc-900 dark:text-platinum-100 flex items-center gap-2">
              <FileDown className="w-5 h-5 text-platinum-400" /> Export
            </h3>

            {issues.length > 0 && (
              <div className="space-y-2">
                {issues.map((issue, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-2 text-sm rounded-xl border p-3",
                      issue.level === "error"
                        ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300"
                        : "bg-platinum-50 border-platinum-200 text-zinc-700 dark:bg-white/5 dark:border-white/10 dark:text-zinc-300"
                    )}
                  >
                    {issue.level === "error" ? (
                      <Ban className="w-4 h-4 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    )}
                    {issue.message}
                  </div>
                ))}
              </div>
            )}
            {issues.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-platinum-400" />
                All checks passed — ready to export.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">A — Original Artwork</h4>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" disabled={hasError || exporting !== null} onClick={() => runExport("svg", () => exportArtwork(cfg, "svg"))}>
                    {exporting === "svg" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    SVG (vector)
                  </Button>
                  <Button size="sm" variant="outline" disabled={hasError || exporting !== null} onClick={() => runExport("png", () => exportArtwork(cfg, "png"))}>
                    {exporting === "png" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    PNG transparent
                  </Button>
                  <Button size="sm" variant="outline" disabled={hasError || exporting !== null} onClick={() => runExport("jpg", () => exportArtwork(cfg, "jpg"))}>
                    {exporting === "jpg" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    JPG white
                  </Button>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">3000px raster · fonts embedded · 1:1 or 4:5 canvas</p>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">B — T-Shirt Mockup</h4>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={hasError || exporting !== null} onClick={() => runExport("mock-jpg", () => exportMockup(cfg, "jpg"))}>
                    {exporting === "mock-jpg" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    Mockup JPG
                  </Button>
                  <Button size="sm" variant="outline" disabled={hasError || exporting !== null} onClick={() => runExport("mock-png", () => exportMockup(cfg, "png"))}>
                    {exporting === "mock-png" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    Mockup PNG
                  </Button>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">2400px presentation · 4:5 canvas · no UI elements</p>
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-200 dark:border-white/10 pt-4">
              Note: file formats are provided for your workflow convenience. Always check Adobe Stock's
              current contributor requirements before submitting — format availability does not guarantee acceptance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
