import { saveAs } from "file-saver";
import type { TypographyState } from "./types";
import { buildArtwork, measureTextWidth } from "./artwork";
import { buildMockup } from "./mockup";
import { embedFonts, usedFonts } from "./fonts";
import { fontDef } from "./presets";

/* ---------- rasterization ---------- */

function loadImage(svgString: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

async function rasterize(
  svg: string,
  width: number,
  height: number,
  outW: number,
  mime: "image/png" | "image/jpeg",
  quality = 0.92,
  background?: string
): Promise<Blob> {
  const img = await loadImage(svg);
  const scale = outW / width;
  const outH = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D not available");
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, outW, outH);
  }
  ctx.drawImage(img, 0, 0, outW, outH);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, quality)
  );
  if (!blob) throw new Error("Rasterization failed");
  return blob;
}

/* ---------- validation ---------- */

export interface ValidationIssue {
  level: "error" | "warning";
  message: string;
}

function luminance(hex: string): number {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export function validateDesign(state: TypographyState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const text = state.text;

  if (!text || text.trim().length === 0) {
    issues.push({ level: "error", message: "Text is empty — enter your T-shirt text first." });
    return issues;
  }

  // Unsupported characters (outside Latin-1 + common punctuation)
  if (/[^\u0020-\u007E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2026\u20AC\n\r\t]/.test(text)) {
    issues.push({
      level: "warning",
      message: "Some characters are outside the Latin set — a compatible fallback font will be used for them.",
    });
  }

  // Overflow risk: measure the longest line at a large size
  const font = fontDef(state.fontFamily);
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const longest = lines.reduce((a, b) => (a.length >= b.length ? a : b), "");
  if (longest) {
    const w = measureTextWidth(longest, font.family, state.fontWeight, 150 * state.fontScale, state.letterSpacing);
    if (w > 880) {
      issues.push({
        level: "warning",
        message: "A text line is very long — it will auto-shrink to fit, which may look small. Consider shorter lines.",
      });
    }
  }

  // Contrast: primary text vs shirt fabric
  const fabric = state.shirtColor === "black" ? "#17171b" : "#ffffff";
  try {
    const ratio = contrastRatio(state.primaryColor, fabric);
    if (ratio < 3) {
      issues.push({
        level: "warning",
        message: `Low contrast (${ratio.toFixed(1)}:1) between text color and the ${state.shirtColor} shirt — the design may be hard to read.`,
      });
    }
  } catch {
    /* invalid color string — ignore */
  }

  // SVG validity is structural (builder-generated); nothing to check at runtime.

  return issues;
}

/* ---------- exports ---------- */

export type ArtworkFormat = "svg" | "png" | "jpg";
export type MockupFormat = "png" | "jpg";

async function preparedArtworkSvg(state: TypographyState): Promise<{ svg: string; width: number; height: number }> {
  const art = buildArtwork(state, { forExport: true });
  const withFonts = await embedFonts(art.svg, usedFonts(state.fontFamily, state.fontWeight));
  return { svg: withFonts, width: art.width, height: art.height };
}

export async function exportArtwork(state: TypographyState, format: ArtworkFormat): Promise<void> {
  const { svg, width, height } = await preparedArtworkSvg(state);
  const slug = "typography-artwork";
  if (format === "svg") {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    saveAs(blob, `${slug}.svg`);
    return;
  }
  if (format === "png") {
    const blob = await rasterize(svg, width, height, 3000, "image/png");
    saveAs(blob, `${slug}-3000px.png`);
    return;
  }
  const blob = await rasterize(svg, width, height, 3000, "image/jpeg", 0.92, "#ffffff");
  saveAs(blob, `${slug}-3000px.jpg`);
}

export async function exportMockup(state: TypographyState, format: MockupFormat): Promise<void> {
  const { svg: artworkSvg } = await preparedArtworkSvg(state);
  const mock = buildMockup(state, artworkSvg);
  const mime = format === "png" ? "image/png" : "image/jpeg";
  const blob = await rasterize(mock.svg, mock.width, mock.height, 2400, mime, 0.92,
    format === "jpg" ? "#ffffff" : undefined);
  saveAs(blob, `tshirt-mockup-2400px.${format}`);
}
