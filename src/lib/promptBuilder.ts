/**
 * Detailed prompt builder for Prompts mode.
 * Produces rich, copy-ready prompts for external AI image tools
 * (Midjourney, Leonardo, Firefly, etc.), honoring the user's
 * custom instructions from Settings.
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

const QUALITY =
  "ultra-detailed, professional quality, crisp clean edges, high resolution, balanced composition";

function instructionsBlock(instructions: string): string {
  const trimmed = instructions.trim();
  return trimmed ? `\nCustom instructions: ${trimmed}` : "";
}

function variationBlock(variation: number, total: number): string {
  if (total <= 1) return "";
  return `\nVariation note: this is variation ${variation} of ${total} — create a distinctly different composition from the other variations while keeping the same subject and style.`;
}

const AVOID_TEXT =
  "Avoid: blurry details, low resolution, watermarks, garbled or misspelled text, distorted proportions.";

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
        `Professional logo design for a brand named "${subject}". ` +
        `Style: ${style}. ` +
        `Color palette: ${extra || "designer's choice"}. ` +
        `Composition: a single iconic mark, centered with generous negative space, flat vector aesthetic, clean geometric shapes, memorable and scalable. ` +
        `Details: smooth curves, consistent stroke weight, no gradients unless the style demands it, no photographic elements. ` +
        `All text spelled correctly in plain English — no gibberish lettering. ` +
        `Quality: ${QUALITY}, white background, no watermark.` +
        `\n${AVOID_TEXT}` +
        custom +
        v
      );
    }
    case "icon": {
      return (
        `A cohesive set of 16 matching vector icons about "${subject}", arranged in a clean 4x4 grid. ` +
        `Style: ${style}. ` +
        `Primary color: ${extra || "monochrome"}. ` +
        `Every icon shares the same line weight, corner radius, padding and design language. ` +
        `Details: simple instantly-recognizable metaphors, flat vector style, consistent visual rhythm across the set. ` +
        `Quality: ${QUALITY}, white background, no watermark.` +
        `\n${AVOID_TEXT}` +
        custom +
        v
      );
    }
    case "infographic": {
      return (
        `Modern professional infographic layout about "${subject}". ` +
        `Structure: a bold header title, 4 to 6 clearly defined sections with icons, charts, statistics and data callouts, logical visual flow from top to bottom. ` +
        `Style: clean typography with clear hierarchy, generous whitespace, flat vector illustrations, one limited harmonious color palette. ` +
        `All labels and numbers must be real, correctly spelled English words — absolutely no gibberish or fake text. ` +
        `Quality: ${QUALITY}, white background, no watermark.` +
        `\n${AVOID_TEXT}` +
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
        `Deliver an isolated, clean T-shirt graphic with a professional commercial finish — flat vector look, crisp edges, no background clutter, print-ready artwork.\n\n` +
        `NEGATIVE INSTRUCTIONS: no misspelled, garbled or gibberish text; no extra words, slogans or taglines beyond the exact text above; ` +
        `no logos, brand marks or watermarks; no blurry, pixelated or distorted typography; no warped or duplicated lettering; ` +
        `no unnecessary decorative elements that fight the text.` +
        custom +
        v
      );
    }
    case "pattern": {
      return (
        `Seamless repeating pattern of "${subject}". ` +
        `Style: ${style}. ` +
        `Color palette: ${extra || "harmonious modern colors"}. ` +
        `Perfectly tileable with no visible seams, motifs evenly distributed at varied scales, flat vector style. ` +
        `Quality: ${QUALITY}, clean background, no watermark.` +
        `\n${AVOID_TEXT}` +
        custom +
        v
      );
    }
    case "sticker": {
      return (
        `Single die-cut sticker of "${subject}". ` +
        `Style: ${style}. ` +
        `Thick white sticker border, bold outlines, vibrant flat colors, centered on a plain white background, sticker-sheet aesthetic. ` +
        `Quality: ${QUALITY}, no watermark.` +
        `\n${AVOID_TEXT}` +
        custom +
        v
      );
    }
    case "silhouette": {
      return (
        `Dramatic black silhouette of "${subject}" in a ${style} pose. ` +
        `Solid black shape on a ${extra || "clean gradient sunset sky"} background, high contrast, crisp clean edges, minimalist vector style, no text. ` +
        `Quality: ${QUALITY}, no watermark.` +
        `\n${AVOID_TEXT}` +
        custom +
        v
      );
    }
  }
}
