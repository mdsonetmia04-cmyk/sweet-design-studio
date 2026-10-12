import type { FontDef, PresetDef } from "./types";

/** Curated font registry. Families are loaded via Google Fonts in index.css
 *  and embedded as base64 @font-face at export time for WYSIWYG output. */
export const FONT_REGISTRY: FontDef[] = [
  { key: "anton", label: "Anton — Bold Condensed", family: "Anton", weights: [400], googleName: "Anton" },
  { key: "archivo", label: "Archivo Black — Heavy", family: "Archivo Black", weights: [400], googleName: "Archivo Black" },
  { key: "bebas", label: "Bebas Neue — Tall Condensed", family: "Bebas Neue", weights: [400], googleName: "Bebas Neue" },
  { key: "oswald", label: "Oswald — Geometric Sans", family: "Oswald", weights: [500, 600, 700], googleName: "Oswald" },
  { key: "inter", label: "Inter — Modern Sans", family: "Inter", weights: [400, 500, 600, 700, 800], googleName: "Inter" },
  { key: "grotesk", label: "Space Grotesk — Techy", family: "Space Grotesk", weights: [500, 700], googleName: "Space Grotesk" },
  { key: "playfair", label: "Playfair Display — Editorial Serif", family: "Playfair Display", weights: [500, 600, 700], googleName: "Playfair Display" },
  { key: "mono", label: "JetBrains Mono — Typewriter", family: "JetBrains Mono", weights: [400, 500, 700], googleName: "JetBrains Mono" },
];

export function fontDef(key: string): FontDef {
  return FONT_REGISTRY.find((f) => f.key === key) ?? FONT_REGISTRY[0];
}

/** The 10 design presets. Each produces a visibly different composition
 *  from the same user text. */
export const PRESETS: PresetDef[] = [
  {
    id: "bold",
    name: "Bold Typography",
    description: "Huge condensed uppercase lettering, tight and loud.",
    baseSize: 150, fontFamily: "anton", fontWeight: 400,
    letterSpacing: 0.01, lineHeight: 0.95, align: "center",
    uppercase: true, outline: false, decorative: "lines",
    sizePattern: [1, 0.85, 1.1],
  },
  {
    id: "minimal",
    name: "Modern Minimalist",
    description: "Small, widely-tracked type with generous whitespace.",
    baseSize: 64, fontFamily: "inter", fontWeight: 500,
    letterSpacing: 0.32, lineHeight: 1.7, align: "center",
    uppercase: true, outline: false, decorative: "none",
    sizePattern: [1],
  },
  {
    id: "retro",
    name: "Retro Vintage",
    description: "Badge composition with arched lettering and double frame.",
    baseSize: 92, fontFamily: "oswald", fontWeight: 600,
    letterSpacing: 0.08, lineHeight: 1.15, align: "center",
    uppercase: true, outline: false, decorative: "badge",
    sizePattern: [1, 0.8, 0.8],
  },
  {
    id: "geometric",
    name: "Geometric Typography",
    description: "Type locked to circles, triangles and bars.",
    baseSize: 110, fontFamily: "grotesk", fontWeight: 700,
    letterSpacing: 0.02, lineHeight: 1.05, align: "center",
    uppercase: true, outline: false, decorative: "shapes",
    sizePattern: [1, 0.9, 1],
  },
  {
    id: "editorial",
    name: "Editorial Typography",
    description: "Serif headlines, mixed sizes, hairline rules.",
    baseSize: 120, fontFamily: "playfair", fontWeight: 600,
    letterSpacing: 0, lineHeight: 1.1, align: "left",
    uppercase: false, outline: false, decorative: "dividers",
    sizePattern: [1.25, 0.7, 0.9],
  },
  {
    id: "streetwear",
    name: "Streetwear Typography",
    description: "Stacked heavy type, mixed fill and outline, arrows.",
    baseSize: 130, fontFamily: "archivo", fontWeight: 400,
    letterSpacing: 0, lineHeight: 0.95, align: "left",
    uppercase: true, outline: false, decorative: "arrows",
    sizePattern: [1, 1, 0.75],
  },
  {
    id: "stacked",
    name: "Creative Stacked Text",
    description: "Every line a different size, alternating alignment.",
    baseSize: 120, fontFamily: "bebas", fontWeight: 400,
    letterSpacing: 0.04, lineHeight: 0.92, align: "center",
    uppercase: true, outline: false, decorative: "none",
    sizePattern: [1.3, 0.65, 1, 0.8],
  },
  {
    id: "swiss",
    name: "Swiss-Inspired Graphic Design",
    description: "Grid-rational, left aligned, strong dividers.",
    baseSize: 104, fontFamily: "inter", fontWeight: 800,
    letterSpacing: -0.01, lineHeight: 1.0, align: "left",
    uppercase: true, outline: false, decorative: "dividers",
    sizePattern: [1, 1, 1],
  },
  {
    id: "outline",
    name: "Outline Typography",
    description: "Stroke-only lettering with hairline frames.",
    baseSize: 140, fontFamily: "anton", fontWeight: 400,
    letterSpacing: 0.03, lineHeight: 1.0, align: "center",
    uppercase: true, outline: true, decorative: "frame",
    sizePattern: [1, 0.85, 1],
  },
  {
    id: "lines",
    name: "Typography with Decorative Lines",
    description: "Rules, diamonds and frames dressing the type.",
    baseSize: 112, fontFamily: "oswald", fontWeight: 500,
    letterSpacing: 0.12, lineHeight: 1.25, align: "center",
    uppercase: true, outline: false, decorative: "lines",
    sizePattern: [1, 0.9, 1],
  },
];

export function presetDef(id: string): PresetDef {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}

/** Deterministic PRNG so variations are reproducible per seed. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
