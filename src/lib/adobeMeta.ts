/**
 * Adobe Stock metadata helpers.
 * Builds honest, rule-aware starting metadata (title + ordered keywords)
 * from the user's own inputs. Always review and adjust before uploading,
 * and mark AI-generated assets as "Created using generative AI tools"
 * in the Adobe Stock contributor portal.
 */

export interface AdobeMeta {
  title: string;
  keywords: string[];
}

export const GENERATIVE_AI_DISCLOSURE_NOTE =
  "Adobe Stock requires AI-generated images to be submitted as 'Created using generative AI tools'. Review the title and keywords and edit them to match the actual image before uploading.";

const GENERIC_KEYWORDS: Record<string, string[]> = {
  pattern: [
    "seamless", "repeating", "repeat", "tileable", "background", "wallpaper",
    "textile", "fabric", "wrapping paper", "surface design", "decorative",
    "ornament", "geometric", "abstract", "modern", "elegant", "vibrant",
    "colorful", "design element", "digital art", "print design",
  ],
  sticker: [
    "sticker", "die-cut", "vinyl decal", "decal", "label", "badge",
    "icon", "cartoon", "cute", "fun", "trendy", "laptop sticker",
    "planner sticker", "scrapbook", "white border", "isolated",
    "colorful", "modern", "pop art", "kawaii",
  ],
  silhouette: [
    "silhouette", "black", "vector", "isolated", "icon", "symbol",
    "shape", "shadow", "profile", "outline", "graphic", "design element",
    "minimal", "flat", "clip art", "white background", "contrast",
    "dramatic", "art", "illustration",
  ],
};

const TYPE_LABEL: Record<string, string> = {
  pattern: "seamless pattern",
  sticker: "die-cut sticker",
  silhouette: "silhouette",
};

function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((w) => w.trim())
    .filter((w) => w.length > 1);
}

function dedupe(list: string[]): string[] {
  const seen = new Set<string>();
  return list.filter((w) => {
    const key = w.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildAdobeMeta(
  type: "pattern" | "sticker" | "silhouette",
  subject: string,
  style: string,
  extra: string = ""
): AdobeMeta {
  const label = TYPE_LABEL[type];
  const subjectWords = words(subject);
  const styleWords = words(style);
  const extraWords = words(extra);

  let title = `${subject} ${label}`;
  if (style) title += ` in ${style} style`;
  if (extra) title += `, ${extra}`;
  title += " — AI-generated design asset";
  if (title.length > 200) title = title.slice(0, 197) + "...";

  const keywords = dedupe([
    ...subjectWords,
    label,
    ...styleWords,
    ...extraWords,
    "ai generated",
    "generative ai",
    ...GENERIC_KEYWORDS[type],
  ]).slice(0, 35);

  return { title, keywords };
}
