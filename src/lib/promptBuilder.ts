/**
 * Detailed prompt builder for Prompts mode.
 * Produces rich, copy-ready prompts for external AI image tools
 * (Midjourney, Leonardo, Firefly, etc.), honoring the user's
 * custom instructions from Settings.
 *
 * Every prompt is written as a professional commercial stock brief:
 * subject first, then style, composition, colour and light, detail,
 * and intended commercial use — with Adobe Stock-safe guardrails
 * baked in. Bulk batches use a deterministic variation engine, so
 * each variation is visibly different: composition, palette, mood
 * and arrangement rotate by variation index, and the variation note
 * names the concrete difference.
 */

export type PromptKind =
  | "logo"
  | "icon"
  | "infographic"
  | "tshirt"
  | "pattern"
  | "sticker"
  | "silhouette";

export interface PromptInputs {
  subject: string;
  style: string;
  extra?: string;
  extra2?: string;
  useMockup?: boolean;
}

/* ---------- deterministic variation engine ---------- */

export interface VariationPlan {
  composition: string;
  palette: string;
  mood: string;
  arrangement: string;
}

const VARIATION_COMPOSITIONS = [
  "centred, symmetrical hero composition with generous negative space",
  "dynamic diagonal composition with an off-centre focal point",
  "tight close-up crop that fills the frame with the subject",
  "wide, airy composition with the subject small against open space",
  "stacked vertical rhythm with a strong top-to-bottom flow",
  "scattered yet balanced arrangement with even breathing room",
];

const VARIATION_PALETTES = [
  "warm palette — amber, terracotta and cream",
  "cool palette — teal, slate blue and ice white",
  "earthy palette — olive, ochre and sand",
  "monochrome base with one bold accent colour",
  "soft pastel palette — blush pink, mint and lavender",
  "high-contrast black and white with one vivid accent",
];

const VARIATION_MOODS = [
  "calm, premium and understated",
  "playful, energetic and cheerful",
  "elegant, luxurious and refined",
  "bold, modern and confident",
  "soft, dreamy and gentle",
  "vintage, nostalgic and warm",
];

const VARIATION_ARRANGEMENTS = [
  "single hero subject, nothing else competing for attention",
  "hero subject with two supporting elements",
  "repeating motif trio in a clear visual rhythm",
  "minimal single element with maximum breathing room",
  "layered foreground and background with clear depth",
  "framed composition with a clean border of negative space",
];

/** Deterministic plan for one variation: the same inputs always produce
 * the same batch, and neighbouring variations differ on every axis. */
export function variationPlan(variation: number, total: number): VariationPlan {
  if (total <= 1) {
    return {
      composition: "centred, symmetrical hero composition",
      palette: "balanced, harmonious palette",
      mood: "clean and professional",
      arrangement: "single hero subject with generous negative space",
    };
  }
  const i = variation - 1;
  return {
    composition: VARIATION_COMPOSITIONS[i % VARIATION_COMPOSITIONS.length],
    palette: VARIATION_PALETTES[(i + 2) % VARIATION_PALETTES.length],
    mood: VARIATION_MOODS[(i + 4) % VARIATION_MOODS.length],
    arrangement: VARIATION_ARRANGEMENTS[(i + 1) % VARIATION_ARRANGEMENTS.length],
  };
}

function variationBlock(variation: number, total: number): string {
  if (total <= 1) return "";
  const p = variationPlan(variation, total);
  return (
    `\nVariation ${variation} of ${total} — make this one visibly different from the others: ` +
    `${p.composition}; ${p.palette}; ${p.mood}; ${p.arrangement}.`
  );
}

/** Compact variation line for short image-generation prompts. */
function variationLine(variation: number, total: number): string {
  if (total <= 1) return "";
  const p = variationPlan(variation, total);
  return `Variation ${variation} of ${total}: ${p.composition}; ${p.palette}; ${p.mood}.`;
}

function instructionsBlock(instructions: string): string {
  const trimmed = instructions.trim();
  return trimmed ? `\nCustom instructions: ${trimmed}` : "";
}

/** Adobe Stock-safe guardrails baked into vector-type prompts: clean
 * isolated artwork with no brand marks and no tiny filler clutter. */
const VECTOR_ADOBE =
  "Adobe Stock ready: isolated on a plain white background, no logos, trademarks, brand marks or watermarks, no tiny dots, spots, or star fillers; clean uncluttered composition.";

/** Same guardrails for silhouettes, which keep their user-chosen background. */
const SILHOUETTE_ADOBE =
  "Adobe Stock ready: no logos, trademarks, brand marks or watermarks, no tiny dots, spots, or star fillers; clean uncluttered composition.";

const STOCK_USE =
  "Intended use: commercial stock art — print-ready, high resolution, crisp clean edges, built to sell on Adobe Stock.";

export function buildDetailedPrompt(
  kind: PromptKind,
  inputs: PromptInputs,
  instructions: string,
  variation: number,
  total: number
): string {
  const { subject, style, extra = "", extra2 = "" } = inputs;
  const v = variationBlock(variation, total);
  const custom = instructionsBlock(instructions);

  switch (kind) {
    case "logo": {
      return (
        `Commercial stock logo brief — brand: "${subject}".\n\n` +
        `STYLE: ${style}. Flat vector mark with clean geometric construction, smooth curves, one consistent stroke weight, memorable and scalable from favicon to billboard. No gradients unless the style demands it, no photographic elements.\n\n` +
        `COMPOSITION: a single iconic mark, centred with generous negative space, instantly readable at small sizes.\n\n` +
        `COLOUR: ${extra || "a considered two-colour palette with strong contrast and a clear hierarchy"}.\n\n` +
        `TEXT: any lettering in plain, correctly spelled English only — no gibberish lettering, no extra words.\n\n` +
        `${STOCK_USE}\n${VECTOR_ADOBE}` +
        custom +
        v
      );
    }
    case "icon": {
      return (
        `Commercial stock icon brief — a cohesive set of 16 matching vector icons about "${subject}".\n\n` +
        `STYLE: ${style}. Every icon shares the same line weight, corner radius, padding and design language; simple, instantly recognisable metaphors with bold readable silhouettes.\n\n` +
        `COMPOSITION: arranged in a clean 4x4 grid with even spacing and a consistent visual rhythm across the whole set.\n\n` +
        `COLOUR: ${extra || "monochrome"} as the primary colour, with consistent fills throughout the set.\n\n` +
        `DETAIL: flat vector style, no fine detail that disappears at small sizes, no text inside the icons.\n\n` +
        `${STOCK_USE}\n${VECTOR_ADOBE}` +
        custom +
        v
      );
    }
    case "infographic": {
      return (
        `Commercial stock infographic brief — "${subject}".\n\n` +
        `STRUCTURE: a bold header title, 4 to 6 clearly defined sections with icons, charts, statistics and data callouts, logical visual flow from top to bottom.\n\n` +
        `STYLE: clean typography with clear hierarchy, generous whitespace, flat vector illustrations, one limited harmonious colour palette.\n\n` +
        `TEXT: all labels and numbers must be real, correctly spelled English words — absolutely no gibberish, fake text or invented statistics.\n\n` +
        `INTENDED USE: editorial and commercial stock, presentation-ready, high resolution, crisp clean edges.\n${VECTOR_ADOBE}` +
        custom +
        v
      );
    }
    case "tshirt": {
      // Detailed, Adobe Stock-oriented typography T-shirt prompt.
      // The user's exact custom text is embedded verbatim — never rewritten.
      const styleNotes: Record<string, string> = {
        Modern: "clean geometric sans-serif lettering, sharp and contemporary",
        Retro: "retro typography with vintage badge-like charm, warm nostalgic feel",
        Minimal: "minimalist typography, restrained letterforms, generous whitespace, quiet confidence",
        Vintage: "distressed vintage typography, classic worn-print character",
        Graphic: "bold graphic typography with strong shapes and high visual impact",
        Cartoon: "playful cartoon-style lettering, rounded and friendly",
        Typography: "pure typographic composition — letterforms as the artwork, stacked and expressive",
        Abstract: "creative abstract text arrangement, experimental layout, artistic flow",
      };
      const styleDesc = styleNotes[style] ?? `${style} typography`;
      const userText = extra
        ? `"${extra}"`
        : `Theme: "${subject}" (no fixed wording supplied — invent a short original slogan fitting this theme)`;
      const colorBit = extra2
        ? `Color palette: ${extra2}.`
        : "Color palette: high-contrast, print-friendly colors (2-4 inks maximum).";
      const mockupBit = inputs.useMockup
        ? "Present the finished graphic as a realistic t-shirt mockup on a plain white or neutral background — use a black t-shirt when the artwork is light-colored, or a white t-shirt when the artwork is dark-colored. "
        : "";
      return (
        `Professional typography-based T-shirt graphic design, commercial stock quality.\n\n` +
        `EXACT TEXT — reproduce this wording verbatim, preserving spelling, capitalization, punctuation and line breaks exactly. Do not reword, correct, translate, summarize or add any words:\n${userText}\n\n` +
        `TYPOGRAPHY & HIERARCHY: ${styleDesc}. ` +
        `Establish a clear hierarchy — the main headline lines large and dominant, supporting lines smaller. ` +
        `Use stacked, well-balanced text arrangement with intentional alignment and comfortable letter and line spacing. ` +
        `Letterforms must be clean, legible and precisely shaped.\n\n` +
        `COMPOSITION & DECORATION: centered chest-print composition with balanced negative space. ` +
        `Add tasteful supporting elements only where they elevate the design — thin rules, dividers, small geometric accents or frames that match the ${style} mood. ` +
        `Keep the layout uncluttered and readable at a glance.\n\n` +
        `${colorBit} ` +
        `Ensure strong contrast between artwork and garment so every letter stays readable.\n\n` +
        `PRESENTATION: ${mockupBit}` +
        `Deliver an isolated, clean T-shirt graphic with a professional commercial finish — flat vector look, crisp edges, no background clutter, print-ready artwork at 300 DPI.\n\n` +
        `NEGATIVE INSTRUCTIONS: no misspelled, garbled or gibberish text; no extra words, slogans or taglines beyond the exact text above; ` +
        `no logos, brand marks or watermarks; no blurry, pixelated or distorted typography; no warped or duplicated lettering; ` +
        `no unnecessary decorative elements that fight the text.` +
        custom +
        v
      );
    }
    case "pattern": {
      return (
        `Commercial stock pattern brief — seamless repeating pattern of "${subject}".\n\n` +
        `STYLE: ${style}. Flat vector style with a clear focal motif and supporting smaller elements.\n\n` +
        `COLOUR: ${extra || "a harmonious modern palette with balanced contrast and a clear colour hierarchy"}.\n\n` +
        `CONSTRUCTION: perfectly tileable with no visible seams; motifs evenly distributed at varied scales, clean edges throughout.\n\n` +
        `INTENDED USE: commercial textile, wallpaper, wrapping paper and surface-design stock, print-ready, high resolution.\n${VECTOR_ADOBE}` +
        custom +
        v
      );
    }
    case "sticker": {
      return (
        `Commercial stock sticker brief — a single die-cut sticker of "${subject}".\n\n` +
        `STYLE: ${style}. One clear focal subject with bold readable shapes.\n\n` +
        `CONSTRUCTION: thick white sticker border, bold outlines, vibrant flat colours, centred on a plain white background, sticker-sheet aesthetic.\n\n` +
        `DETAIL: no fine detail that disappears at sticker size, no background clutter, no text unless the subject itself is lettering.\n\n` +
        `${STOCK_USE}\n${VECTOR_ADOBE}` +
        custom +
        v
      );
    }
    case "silhouette": {
      return (
        `Commercial stock silhouette brief — a dramatic black silhouette of "${subject}" in a ${style} pose.\n\n` +
        `CONSTRUCTION: one solid black shape with a clean, instantly recognisable outline, high contrast, crisp clean edges, minimalist vector style, no text.\n\n` +
        `BACKGROUND: ${extra || "a clean gradient sunset sky"} — smooth and uncluttered, letting the silhouette dominate the frame.\n\n` +
        `INTENDED USE: commercial silhouette and clip-art stock, print-ready, high resolution.\n${SILHOUETTE_ADOBE}` +
        custom +
        v
      );
    }
  }
}

/**
 * Short image-generation prompt for the Images mode of each generator.
 * Same Adobe-safe guardrails and the same deterministic variation plan
 * as the detailed prompts, in a compact form the image model can act on.
 * `inputs` use the same mapping as buildDetailedPrompt.
 */
export function buildImagePrompt(
  kind: PromptKind,
  inputs: PromptInputs,
  variation: number,
  total: number
): string {
  const { subject, style, extra = "", extra2 = "" } = inputs;
  const vl = variationLine(variation, total);
  const line = vl ? ` ${vl}` : "";

  switch (kind) {
    case "logo":
      return (
        `Professional logo for the brand "${subject}", ${style} style` +
        `${extra ? `, colours: ${extra}` : ""}. ` +
        `Single iconic mark, centred with generous negative space, flat vector, clean geometric shapes, memorable and scalable, correctly spelled English lettering only.${line} ${VECTOR_ADOBE}`
      );
    case "icon":
      return (
        `A set of 16 matching vector icons about "${subject}", ${style} style, primary colour ${extra || "monochrome"}. ` +
        `Clean 4x4 grid, consistent line weight and design language, bold readable silhouettes, white background.${line} ${VECTOR_ADOBE}`
      );
    case "infographic":
      return (
        `Modern professional infographic about "${subject}": bold header title, 4 to 6 sections with icons, charts and data callouts, ` +
        `clean typography, flat vector, one limited harmonious palette, white background.${line} ` +
        `All labels real, correctly spelled English words. ${VECTOR_ADOBE}`
      );
    case "tshirt": {
      const textBit = extra
        ? `Exact text: "${extra}". `
        : `Theme: "${subject}". `;
      const mockupBit = inputs.useMockup
        ? "Presented as a realistic t-shirt mockup on a plain white or neutral background. "
        : "Flat vector graphic on a solid white background, print-ready at 300 DPI. ";
      return (
        `Professional typography T-shirt graphic, commercial stock quality. ${textBit}` +
        `${style} typography with a clear headline hierarchy. ` +
        `${extra2 ? `Colours: ${extra2}. ` : "High-contrast, print-friendly colours (2-4 inks maximum). "}` +
        `${mockupBit}${line} No misspelled or gibberish text, no extra words, no logos, brand marks or watermarks.`
      );
    }
    case "pattern":
      return (
        `Seamless repeating pattern of "${subject}", ${style} style` +
        `${extra ? `, colours: ${extra}` : ""}. ` +
        `Perfectly tileable with no visible seams, motifs evenly distributed at varied scales, flat vector, clean edges.${line} ${VECTOR_ADOBE}`
      );
    case "sticker":
      return (
        `Single die-cut sticker of "${subject}", ${style} style. ` +
        `Thick white sticker border, bold outlines, vibrant flat colours, centred on a plain white background.${line} ${VECTOR_ADOBE}`
      );
    case "silhouette":
      return (
        `Dramatic black silhouette of "${subject}" in a ${style} pose. ` +
        `Solid black shape on a ${extra || "clean gradient sunset sky"} background, high contrast, crisp clean edges, minimalist vector, no text.${line} ${SILHOUETTE_ADOBE}`
      );
  }
}
