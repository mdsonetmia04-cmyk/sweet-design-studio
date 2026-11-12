/**
 * Adobe Stock metadata helpers.
 * Builds honest, rule-aware starting metadata (title + ordered keywords)
 * from the user's own inputs. Always review and adjust before uploading,
 * and mark AI-generated images as "Created using generative AI tools"
 * in the Adobe Stock contributor portal.
 *
 * Adobe Stock rules applied here:
 * - Title: up to 200 chars; the FIRST 70 chars must carry the most
 *   buyer-intended, SEO-friendly keywords (only the first ~70 show
 *   in Adobe search). Titles are truncated at a word boundary, never
 *   mid-word and never with "...".
 * - Keywords: max 49; the FIRST 10 carry the most weight, so subject
 *   words come first, then style, then extra, then generic words.
 * - Category: one of Adobe's 21 published categories, stored as its
 *   numeric ID (1-21) in the CSV.
 * - CSV columns: Filename, Title, Keywords, Category, Releases.
 */

export interface AdobeMeta {
  title: string;
  keywords: string[];
}

export type AdobeMetaType =
  | "logo"
  | "icon"
  | "infographic"
  | "tshirt"
  | "pattern"
  | "sticker"
  | "silhouette"
  | "typography"
  | "sale";

export const GENERATIVE_AI_DISCLOSURE_NOTE =
  "Adobe Stock requires AI-generated images to be submitted as 'Created using generative AI tools'. Review the title and keywords and edit them to match the actual image before uploading.";

const GENERIC_KEYWORDS: Record<AdobeMetaType, string[]> = {
  logo: [
    "logo", "brand identity", "logotype", "emblem", "brand mark",
    "corporate identity", "business logo", "minimal logo", "modern logo",
    "vector logo", "company logo", "branding", "symbol", "monogram",
    "flat design", "professional", "clean", "iconic", "scalable", "design",
  ],
  icon: [
    "icon", "icon set", "icons", "pictogram", "symbol", "ui icon",
    "app icon", "web icon", "flat icon", "vector icon", "line icon",
    "interface", "user interface", "minimal", "modern", "set",
    "collection", "graphic", "sign", "button",
  ],
  infographic: [
    "infographic", "infographics", "data visualization", "chart", "graph",
    "statistics", "diagram", "information graphic", "business infographic",
    "report", "presentation", "education", "flat vector", "modern",
    "clean", "professional", "template", "layout", "data", "visual",
  ],
  tshirt: [
    "t-shirt", "tshirt", "t shirt design", "tee", "tee shirt",
    "graphic tee", "typography", "slogan", "quote", "print design",
    "apparel", "fashion", "casual", "streetwear", "merch", "clothing",
    "funny", "motivational", "vintage", "retro",
  ],
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
  typography: [
    "typography", "t-shirt typography", "lettering", "type design",
    "font art", "text art", "slogan", "quote", "t-shirt", "tshirt",
    "tee", "graphic tee", "print design", "apparel", "bold type",
    "poster type", "vintage type", "modern lettering", "statement", "design",
  ],
  sale: [
    "sale", "discount", "promotion", "promo", "offer", "clearance",
    "deal", "shopping", "retail", "ecommerce", "e-commerce", "badge",
    "label", "tag", "sticker", "banner", "advertising", "marketing",
    "seasonal sale", "special offer",
  ],
};

const TYPE_LABEL: Record<AdobeMetaType, string> = {
  logo: "logo design",
  icon: "vector icon set",
  infographic: "infographic",
  tshirt: "t-shirt design",
  pattern: "seamless pattern",
  sticker: "die-cut sticker",
  silhouette: "silhouette",
  typography: "typography t-shirt design",
  sale: "sale discount graphic",
};

/** Adobe's 21 published contributor categories (helpx.adobe.com:
 * "Choose content categories in Adobe Stock"). The CSV stores the
 * numeric ID, not the name. */
export interface AdobeCategory {
  id: number;
  name: string;
}

export const ADOBE_CATEGORIES: AdobeCategory[] = [
  { id: 1, name: "Animals" },
  { id: 2, name: "Buildings and Architecture" },
  { id: 3, name: "Business" },
  { id: 4, name: "Drinks" },
  { id: 5, name: "The Environment" },
  { id: 6, name: "States of Mind" },
  { id: 7, name: "Food" },
  { id: 8, name: "Graphic Resources" },
  { id: 9, name: "Hobbies and Leisure" },
  { id: 10, name: "Industry" },
  { id: 11, name: "Landscapes" },
  { id: 12, name: "Lifestyle" },
  { id: 13, name: "People" },
  { id: 14, name: "Plants and Flowers" },
  { id: 15, name: "Culture and Religion" },
  { id: 16, name: "Science" },
  { id: 17, name: "Social Issues" },
  { id: 18, name: "Sports" },
  { id: 19, name: "Technology" },
  { id: 20, name: "Transport" },
  { id: 21, name: "Travel" },
];

export const ADOBE_RELEASE_OPTIONS = [
  "None",
  "Model release",
  "Property release",
] as const;

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

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Truncate at a word boundary — never mid-word, never with "...". */
function truncateAtWord(title: string, max = 200): string {
  if (title.length <= max) return title;
  const cut = title.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd();
}

/** The first 70 characters of a title — the part buyers see in Adobe search. */
export function first70(title: string): string {
  return title.slice(0, 70);
}

export function buildAdobeMeta(
  type: AdobeMetaType,
  subject: string,
  style: string,
  extra: string = ""
): AdobeMeta {
  const label = TYPE_LABEL[type];
  const subjectText = cleanText(subject);
  const subjectWords = words(subjectText);
  const styleWords = words(style);
  const extraWords = words(extra);

  // Subject first, so the key buyer words land inside the first 70 chars.
  let title = `${subjectText} ${label}`;
  if (style) title += ` in ${style} style`;
  if (extra) title += `, ${cleanText(extra)}`;
  title += " — AI-generated design asset";
  title = truncateAtWord(title, 200);

  // Ordered so the first 10 keywords (the ones Adobe weighs most) are the
  // subject words, then style, then extra, then generic words.
  const keywords = dedupe([
    ...subjectWords,
    label,
    ...styleWords,
    ...extraWords,
    "ai generated",
    "generative ai",
    ...GENERIC_KEYWORDS[type],
  ]).slice(0, 49);

  return { title, keywords };
}

function escCsv(value: string): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

/** One Adobe Stock CSV row: Filename,Title,Keywords,Category,Releases.
 * Category is the numeric ID ("" when not chosen); keywords are joined
 * with ", " inside a single quoted field. */
export function adobeCsvRow(
  filename: string,
  meta: AdobeMeta,
  categoryId: string,
  releases: string
): string {
  return [
    filename,
    meta.title,
    meta.keywords.join(", "),
    categoryId,
    releases,
  ]
    .map(escCsv)
    .join(",");
}
