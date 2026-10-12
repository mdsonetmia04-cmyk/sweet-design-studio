/**
 * Sale & Discount Graphics prompt engine.
 * Generates detailed, bulk-ready image-generation prompts for commercial
 * promotional graphics. Every prompt has a title + complete instruction,
 * honors the user's exact values, and follows Adobe Stock-oriented
 * commercial-art direction (no approval claims — the user checks policy).
 */

import { mulberry32 } from "./typography/presets";

export interface SaleInputs {
  category: string;
  style: string;
  primaryColor: string;
  accentColor: string;
  background: "white" | "transparent";
  format: "vector" | "png" | "jpg";
  setMode: "single" | "set";
  elements: number;
  percentages: string[];
  labelWords: string[];
  priceValues: string[];
  event: string;
  eventText: boolean;
  collectionType: string;
}

export interface SalePrompt {
  title: string;
  body: string;
}

export const SALE_CATEGORIES = [
  { id: "blank-tags", name: "Blank Sale Tags", hint: "Empty labels — buyers add their own text" },
  { id: "percent-tags", name: "Percentage Discount Tags", hint: "Your exact % values, readable typography" },
  { id: "sale-labels", name: "Sale & Promotional Labels", hint: "SALE, MEGA SALE, CLEARANCE…" },
  { id: "price-tags", name: "Price Tags & Retail Labels", hint: "Exact prices preserved" },
  { id: "seasonal", name: "Seasonal & Event Sale Graphics", hint: "Black Friday, Christmas…" },
  { id: "collections", name: "Commercial Graphic Collections", hint: "Sticker sets, badges, icons…" },
];

export const SALE_STYLES = [
  "Minimalist",
  "Flat Vector",
  "Vintage Retail",
  "Luxury",
  "Playful Colorful",
  "Outline Line-Art",
  "Monochrome",
  "Bold Modern",
];

export const SEASONAL_EVENTS = [
  "Black Friday",
  "Cyber Monday",
  "Christmas Sales",
  "New Year Sales",
  "Valentine's Day Offers",
  "Easter Sales",
  "Summer Sale",
  "Winter Sale",
  "Back-to-School Sales",
  "Halloween Sales",
  "End-of-Season Clearance",
  "Mid-Year Sale",
  "Anniversary Sale",
  "Shopping Festival Promotions",
];

export const COLLECTION_TYPES = [
  "E-commerce discount sticker sets",
  "Shopping cart promotional graphics",
  "Retail packaging sale labels",
  "Minimalist geometric badges",
  "Vintage retail sale stickers",
  "Luxury shopping discount labels",
  "Colorful promotional bursts",
  "Monochrome sale badge collections",
  "Outline-style discount icons",
  "Flat vector retail promotional elements",
  "Isolated sale and discount symbols",
];

export const PRESET_LABEL_WORDS = [
  "SALE",
  "BIG SALE",
  "MEGA SALE",
  "CLEARANCE",
  "SPECIAL OFFER",
  "LIMITED OFFER",
  "HOT DEAL",
  "FLASH SALE",
  "FINAL SALE",
  "SEASONAL SALE",
];

/* ---------- variety pools (seeded per prompt) ---------- */

const SHAPE_SETS = [
  "circular badges, rectangular labels and ticket-shaped tags",
  "starburst bursts, hexagonal stickers and ribbon banners",
  "shield emblems, oval stickers and zigzag-edged labels",
  "rounded-square tags, star-shaped badges and arrow banners",
  "pill-shaped labels, scalloped-edge circles and pennant flags",
  "diamond badges, cloud bursts and bookmark ribbons",
  "tag silhouettes with string holes, price-ticket shapes and seal stamps",
  "speech-bubble badges, sunburst seals and folded-corner labels",
];

const COMPOSITIONS = [
  "arranged in a clean, evenly spaced grid",
  "laid out in a tidy linear row with generous spacing",
  "arranged in a balanced scattered layout with even breathing room",
  "grouped in a symmetrical two-row arrangement",
  "presented in a neat column flow with consistent gaps",
  "organized in a modular mosaic with uniform padding",
];

const PALETTE_WORDINGS = [
  (a: string, b: string) => `coordinated ${a}, ${b} and restrained neutrals palette`,
  (a: string, b: string) => `palette built around ${a} with ${b} accents and neutral support tones`,
  (a: string, b: string) => `balanced palette led by ${a}, accented with ${b}`,
  (a: string, b: string) => `${a} and ${b} as hero colors on a calm neutral base`,
];

const STYLE_DESC: Record<string, string> = {
  Minimalist: "minimalist flat geometry with maximum restraint",
  "Flat Vector": "clean flat vector shapes with crisp construction",
  "Vintage Retail": "vintage retail charm with authentic printed character",
  Luxury: "luxury finish with refined details and elegant restraint",
  "Playful Colorful": "cheerful, energetic and colorful presentation",
  "Outline Line-Art": "elegant outline line-art with confident strokes",
  Monochrome: "strict monochrome discipline, tonal depth only",
  "Bold Modern": "bold modern graphics with strong visual punch",
};

const QUALITY =
  "Clean, polished, professional artwork with clear silhouettes, balanced composition and readable typography wherever text appears.";

const NEGATIVE =
  "Avoid mockup scenes, third-party logos or trademarks, copyrighted characters, watermarks, signatures, cropped or overlapping elements, photorealistic shadows, and any text beyond what is specified.";

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function formatBackground(background: "white" | "transparent", format: "vector" | "png" | "jpg"): string {
  if (format === "png" || background === "transparent") {
    return "isolated on a transparent background (note: actual transparency must be supported by your generation and export pipeline)";
  }
  if (format === "jpg") {
    return "on a clean, solid white background";
  }
  return "on a plain white background";
}

function formatNote(format: "vector" | "png" | "jpg"): string {
  if (format === "vector") {
    return "Vector-style artwork: clean, scalable shapes, well-defined edges and clearly separated elements.";
  }
  if (format === "png") {
    return "PNG-style artwork: genuinely transparent background with isolated elements.";
  }
  return "JPG-style artwork: clean solid background, no transparency.";
}

function textRule(inputs: SaleInputs): string {
  switch (inputs.category) {
    case "blank-tags":
      return "Keep every central text area completely blank — no letters, numbers, prices or symbols inside the shapes, so buyers can add their own text later.";
    case "percent-tags":
      if (inputs.percentages.length > 0) {
        return (
          `Display exactly these discount values, one value per badge: ${inputs.percentages.join(", ")}. ` +
          `Render each percentage in large, clear, correctly spelled typography. Do not invent, change or duplicate any value.`
        );
      }
      return "Leave the percentage areas blank and editable for the buyer.";
    case "sale-labels":
      if (inputs.labelWords.length > 0) {
        return (
          `Use only these words, distributed across the designs: ${inputs.labelWords.join(", ")}. ` +
          `No additional text, slogans or invented wording anywhere.`
        );
      }
      return "Use simple generic sale wording only — no invented slogans.";
    case "price-tags":
      if (inputs.priceValues.length > 0) {
        return (
          `Show exactly these prices: ${inputs.priceValues.join(", ")} — preserve every value and currency symbol precisely. ` +
          `Do not invent prices.`
        );
      }
      return "Keep price areas blank and editable, with clean placeholder zones for the buyer.";
    case "seasonal":
      return inputs.eventText
        ? `You may include short ${inputs.event} wording where it fits naturally; keep it minimal and correctly spelled.`
        : `Do not add event names, dates, logos or any other text — let the seasonal motifs carry the theme.`;
    default:
      return "Keep text minimal and purposeful; no invented slogans or filler words.";
  }
}

function categorySubject(inputs: SaleInputs): string {
  const n = inputs.elements;
  const setWord = inputs.setMode === "set";
  switch (inputs.category) {
    case "blank-tags":
      return setWord
        ? `an original collection of ${n} blank promotional sale tags`
        : `an original blank promotional sale tag`;
    case "percent-tags":
      return setWord
        ? `an original coordinated set of ${n} percentage discount badges`
        : `an original percentage discount badge`;
    case "sale-labels":
      return setWord
        ? `an original set of ${n} sale and promotional labels`
        : `an original sale / promotional label`;
    case "price-tags":
      return setWord
        ? `an original collection of ${n} price tags and retail labels`
        : `an original price tag / retail label`;
    case "seasonal":
      return setWord
        ? `an original collection of ${n} ${inputs.event.toLowerCase()} sale graphics`
        : `an original ${inputs.event.toLowerCase()} sale graphic`;
    case "collections":
      return setWord
        ? `an original collection of ${n} ${inputs.collectionType.toLowerCase()}`
        : `an original ${inputs.collectionType.toLowerCase().replace(/s$/, "")}`;
    default:
      return `an original promotional graphic`;
  }
}

function titleFor(inputs: SaleInputs, variation: number): string {
  const style = inputs.style;
  const catName =
    inputs.category === "blank-tags"
      ? "Blank Retail Sale Tag"
      : inputs.category === "percent-tags"
        ? "Discount Badge"
        : inputs.category === "sale-labels"
          ? "Sale Label"
          : inputs.category === "price-tags"
            ? "Price Tag"
            : inputs.category === "seasonal"
              ? `${inputs.event} Sale Graphic`
              : "Promo Graphic";
  const setWord = inputs.setMode === "set" ? "Collection" : "Design";
  return `${style} ${catName} ${setWord} ${String(variation).padStart(2, "0")}`;
}

export function buildSalePrompt(
  inputs: SaleInputs,
  instructions: string,
  variation: number,
  seed: number
): SalePrompt {
  const rand = mulberry32(seed + variation * 1013);
  const shapes = pick(rand, SHAPE_SETS);
  const composition = pick(rand, COMPOSITIONS);
  const palette = pick(rand, PALETTE_WORDINGS)(inputs.primaryColor, inputs.accentColor);
  const styleDesc = STYLE_DESC[inputs.style] ?? inputs.style.toLowerCase();

  const body =
    `Create ${categorySubject(inputs)} featuring ${shapes}. ` +
    `${textRule(inputs)} ` +
    `Use a ${palette}, ${styleDesc}, consistent line weight, balanced spacing, and isolated elements ${formatBackground(inputs.background, inputs.format)}. ` +
    `${composition.charAt(0).toUpperCase() + composition.slice(1)}. ` +
    `${formatNote(inputs.format)} ` +
    `${QUALITY} ` +
    `${NEGATIVE}` +
    (instructions.trim() ? `\nCustom instructions: ${instructions.trim()}` : "");

  return { title: titleFor(inputs, variation), body };
}
