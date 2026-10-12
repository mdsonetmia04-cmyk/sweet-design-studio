import type { TypographyState } from "./types";
import { fontDef, presetDef, mulberry32, escapeXml } from "./presets";

/* ---------- text measurement (canvas, uses loaded page fonts) ---------- */

let measureCtx: CanvasRenderingContext2D | null = null;

export function measureTextWidth(
  text: string,
  family: string,
  weight: number,
  size: number,
  letterSpacingEm: number
): number {
  try {
    if (!measureCtx) {
      const c = document.createElement("canvas");
      measureCtx = c.getContext("2d");
    }
    if (measureCtx) {
      measureCtx.font = `${weight} ${size}px "${family}"`;
      const w = measureCtx.measureText(text).width;
      return w + letterSpacingEm * size * Math.max(0, text.length - 1);
    }
  } catch {
    /* fall through to estimate */
  }
  return text.length * size * 0.58;
}

/* ---------- artwork builder ---------- */

export interface ArtworkResult {
  svg: string;
  width: number;
  height: number;
  maxLineWidth: number;
  block: { x: number; y: number; w: number; h: number };
}

interface LineLayout {
  text: string;
  size: number;
  baselineY: number;
  width: number;
  empty: boolean;
}

function accentSet(words: string[]): Set<string> {
  return new Set(words.map((w) => w.toLowerCase().trim()).filter(Boolean));
}

function renderLineText(
  line: string,
  primary: string,
  accent: string,
  accents: Set<string>
): string {
  if (accents.size === 0) return escapeXml(line);
  const parts = line.split(/(\s+)/);
  return parts
    .map((part) => {
      if (/^\s*$/.test(part)) return escapeXml(part);
      const key = part.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, "");
      if (key && accents.has(key)) {
        return `<tspan fill="${accent}">${escapeXml(part)}</tspan>`;
      }
      return escapeXml(part);
    })
    .join("");
}

export function buildArtwork(
  state: TypographyState,
  opts: { forExport?: boolean } = {}
): ArtworkResult {
  const preset = presetDef(state.presetId);
  const font = fontDef(state.fontFamily);
  const W = 1000;
  const H = state.canvasRatio === "4:5" ? 1250 : 1000;
  const MARGIN = 70;
  const maxW = W - MARGIN * 2;
  const accents = accentSet(state.accentWords);
  const rand = mulberry32(state.seed * 1000 + 17);

  const rawLines = state.text.split("\n");
  const lines: string[] = rawLines.length > 0 ? rawLines : [""];

  const badgeMode = preset.decorative === "badge" && state.decorative;

  // ---- size each line (auto-fit) ----
  const layouts: LineLayout[] = [];
  lines.forEach((line, i) => {
    const empty = line.trim().length === 0;
    const pattern = preset.sizePattern[i % preset.sizePattern.length];
    if (badgeMode && i === 0 && !empty) {
      // arched headline handled separately; placeholder size for spacing
      layouts.push({ text: line, size: preset.baseSize * pattern * state.fontScale, baselineY: 0, width: 0, empty });
      return;
    }
    let size = Math.min(
      preset.baseSize * pattern * state.fontScale,
      preset.baseSize * 1.7 * state.fontScale
    );
    if (!empty) {
      let w = measureTextWidth(line, font.family, state.fontWeight, size, state.letterSpacing);
      let guard = 0;
      while (w > maxW && size > 14 && guard < 60) {
        size *= 0.94;
        w = measureTextWidth(line, font.family, state.fontWeight, size, state.letterSpacing);
        guard++;
      }
    }
    const width = empty
      ? 0
      : measureTextWidth(line, font.family, state.fontWeight, size, state.letterSpacing);
    layouts.push({ text: line, size, baselineY: 0, width, empty });
  });

  // ---- vertical rhythm ----
  const lh = state.lineHeight;
  const density = state.density;
  let totalH = 0;
  for (let i = 0; i < layouts.length; i++) {
    const cur = layouts[i];
    if (i === 0) {
      totalH += cur.size * 0.85;
    } else {
      const prev = layouts[i - 1];
      const gap = ((prev.size + cur.size) / 2) * lh * density;
      totalH += cur.empty ? gap * 0.5 : gap;
      if (!cur.empty) totalH += 0; // baseline advance accounted in gap of next
    }
  }
  // Recompute with baseline advances: simpler two-pass
  let y = (H - totalH) / 2;
  layouts.forEach((L, i) => {
    if (i === 0) {
      y += L.size * 0.85;
    } else {
      const prev = layouts[i - 1];
      y += ((prev.size + L.size) / 2) * lh * density * (L.empty ? 0.5 : 1);
    }
    L.baselineY = y;
  });
  const lastNonEmpty = [...layouts].reverse().find((L) => !L.empty);
  const firstNonEmpty = layouts.find((L) => !L.empty);
  const blockTop = firstNonEmpty ? firstNonEmpty.baselineY - firstNonEmpty.size * 0.85 : H / 2 - 50;
  const blockBottom = lastNonEmpty ? lastNonEmpty.baselineY + lastNonEmpty.size * 0.25 : H / 2 + 50;
  const maxLineWidth = Math.max(0, ...layouts.map((L) => L.width));
  const cx = W / 2;
  const blockX =
    state.align === "left" ? MARGIN + 20 : state.align === "right" ? W - MARGIN - 20 - maxLineWidth : cx - maxLineWidth / 2;
  const block = {
    x: Math.max(10, blockX - 20),
    y: Math.max(10, blockTop - 30),
    w: Math.min(W - 20, maxLineWidth + 40),
    h: Math.max(60, blockBottom - blockTop + 60),
  };

  // ---- text elements ----
  const anchor = state.align === "left" ? "start" : state.align === "right" ? "end" : "middle";
  const tx = state.align === "left" ? MARGIN + 20 : state.align === "right" ? W - MARGIN - 20 : cx;
  const firstSize = layouts.length > 0 ? layouts[0].size : 120;
  const strokeAttrs = preset.outline
    ? ` fill="none" stroke="${state.primaryColor}" stroke-width="${Math.max(2, firstSize * 0.028)}" paint-order="stroke"`
    : ` fill="${state.primaryColor}"`;

  let textSvg = "";
  layouts.forEach((L, i) => {
    if (L.empty) return;
    if (badgeMode && i === 0) return; // arched separately
    const inner = renderLineText(L.text, state.primaryColor, state.accentColor, accents);
    textSvg +=
      `<text x="${tx}" y="${L.baselineY.toFixed(1)}" text-anchor="${anchor}"` +
      ` font-family="'${font.family}', sans-serif" font-weight="${state.fontWeight}"` +
      ` font-size="${L.size.toFixed(1)}" letter-spacing="${(state.letterSpacing * L.size).toFixed(1)}"${strokeAttrs}>${inner}</text>\n`;
  });

  // ---- badge arched headline ----
  let defs = "";
  if (badgeMode && layouts[0] && !layouts[0].empty) {
    const L = layouts[0];
    const R = 300;
    const arcId = `arc-${state.seed}`;
    // shrink headline to fit arc length (~60% of half circle)
    let size = L.size;
    let w = measureTextWidth(L.text, font.family, state.fontWeight, size, state.letterSpacing);
    let guard = 0;
    while (w > 880 && size > 14 && guard < 60) {
      size *= 0.94;
      w = measureTextWidth(L.text, font.family, state.fontWeight, size, state.letterSpacing);
      guard++;
    }
    const arcY = blockTop - 150;
    defs += `<path id="${arcId}" d="M ${cx - R},${arcY} A ${R},${R} 0 0 1 ${cx + R},${arcY}" fill="none"/>`;
    textSvg =
      `<text font-family="'${font.family}', sans-serif" font-weight="${state.fontWeight}"` +
      ` font-size="${size.toFixed(1)}" letter-spacing="${(state.letterSpacing * size).toFixed(1)}"${strokeAttrs}>` +
      `<textPath href="#${arcId}" startOffset="50%" text-anchor="middle">${escapeXml(L.text)}</textPath></text>\n` +
      textSvg;
    // shift the straight block down to make room
    // (block metrics already include line 0; visually acceptable)
  }

  // ---- decorative elements ----
  let deco = "";
  if (state.decorative && preset.decorative !== "none") {
    const P = state.primaryColor;
    const A = state.accentColor;
    const bx = block.x, by = block.y, bw = block.w, bh = block.h;
    const bcx = bx + bw / 2, bcy = by + bh / 2;
    const j = () => (rand() - 0.5) * 40;

    switch (preset.decorative) {
      case "lines": {
        const lw = Math.min(520, bw * 0.7);
        deco +=
          `<line x1="${bcx - lw / 2}" y1="${by - 46 + j()}" x2="${bcx + lw / 2}" y2="${by - 46 + j()}" stroke="${P}" stroke-width="7"/>\n` +
          `<line x1="${bcx - lw / 2}" y1="${by + bh + 46 + j()}" x2="${bcx + lw / 2}" y2="${by + bh + 46 + j()}" stroke="${P}" stroke-width="7"/>\n` +
          `<line x1="${bcx - lw / 2}" y1="${by - 28}" x2="${bcx + lw / 2}" y2="${by - 28}" stroke="${A}" stroke-width="2.5"/>\n` +
          `<line x1="${bcx - lw / 2}" y1="${by + bh + 28}" x2="${bcx + lw / 2}" y2="${by + bh + 28}" stroke="${A}" stroke-width="2.5"/>\n`;
        break;
      }
      case "frame": {
        deco +=
          `<rect x="${bx - 34}" y="${by - 44}" width="${bw + 68}" height="${bh + 88}" fill="none" stroke="${P}" stroke-width="6"/>\n` +
          `<rect x="${bx - 20}" y="${by - 30}" width="${bw + 40}" height="${bh + 60}" fill="none" stroke="${A}" stroke-width="2"/>\n`;
        break;
      }
      case "shapes": {
        deco +=
          `<circle cx="${bx - 70 + j()}" cy="${by + 60}" r="34" fill="${A}"/>\n` +
          `<path d="M ${bx + bw + 70} ${by + 40} l 40 70 l -80 0 z" fill="${P}"/>\n` +
          `<rect x="${bx - 40}" y="${by + bh - 30}" width="120" height="14" fill="${P}"/>\n` +
          `<circle cx="${bx + bw + 40}" cy="${by + bh - 60}" r="12" fill="none" stroke="${A}" stroke-width="5"/>\n`;
        break;
      }
      case "badge": {
        const R = Math.max(bw, bh) / 2 + 110;
        deco +=
          `<circle cx="${bcx}" cy="${bcy - 40}" r="${R}" fill="none" stroke="${P}" stroke-width="7"/>\n` +
          `<circle cx="${bcx}" cy="${bcy - 40}" r="${R - 26}" fill="none" stroke="${A}" stroke-width="2.5"/>\n` +
          `<path d="M ${bcx - 14} ${bcy + R - 74} l 14 24 l -28 0 z" fill="${A}"/>\n` +
          `<path d="M ${bcx + 14} ${bcy + R - 74} l 14 24 l -28 0 z" fill="${A}"/>\n`;
        break;
      }
      case "arrows": {
        const ay = bcy;
        const arrow = (x: number, dir: 1 | -1) =>
          `<path d="M ${x} ${ay} l ${44 * dir} -20 M ${x} ${ay} l ${44 * dir} 20 M ${x} ${ay} h ${76 * dir}" stroke="${A}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>\n`;
        deco += arrow(bx - 130, -1) + arrow(bx + bw + 54, 1);
        deco += `<line x1="${bx - 40}" y1="${by - 34}" x2="${bx + bw + 40}" y2="${by - 34}" stroke="${P}" stroke-width="4"/>\n`;
        break;
      }
      case "dividers": {
        const dw = Math.min(420, bw * 0.55);
        const motif = (yy: number) =>
          `<line x1="${bcx - dw / 2}" y1="${yy}" x2="${bcx - 26}" y2="${yy}" stroke="${P}" stroke-width="3"/>\n` +
          `<line x1="${bcx + 26}" y1="${yy}" x2="${bcx + dw / 2}" y2="${yy}" stroke="${P}" stroke-width="3"/>\n` +
          `<path d="M ${bcx} ${yy - 11} l 11 11 l -11 11 l -11 -11 z" fill="${A}"/>\n`;
        deco += motif(by - 40) + motif(by + bh + 40);
        break;
      }
    }
  }

  const sizeAttrs = opts.forExport
    ? `width="${W}" height="${H}"`
    : `width="100%" height="100%"`;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" ${sizeAttrs} role="img">\n` +
    `<defs>${defs}<clipPath id="artclip"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath></defs>\n` +
    `<g clip-path="url(#artclip)">\n${deco}${textSvg}</g>\n</svg>`;

  return { svg, width: W, height: H, maxLineWidth, block };
}
