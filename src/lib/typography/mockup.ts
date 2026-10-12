import type { TypographyState } from "./types";
import { buildArtwork } from "./artwork";

/**
 * Vector T-shirt mockup compositor.
 * Draws a clean flat-lay tee (black or white variant) and composites the
 * SAME master artwork SVG into the chest print region — never regenerated.
 */

const MW = 1200;
const MH = 1500;

function shirtPaths(shirtColor: "black" | "white"): {
  body: string;
  collar: string;
  sleeveL: string;
  sleeveR: string;
} {
  // Front-facing tee, centered at x=600. Shoulders y=380, hem y=1150.
  const full =
    "M 300 430 L 140 560 L 210 660 L 300 600 L 300 1150 L 700 1150 L 700 600 L 790 660 L 860 560 L 700 430 " +
    "C 640 470, 560 480, 500 480 C 440 480, 360 470, 300 430 Z";
  const collar =
    "M 430 398 C 470 452, 530 452, 570 398 C 540 428, 460 428, 430 398 Z";
  const sleeveL = "M 300 430 L 140 560 L 210 660 L 300 600 Z";
  const sleeveR = "M 700 430 L 860 560 L 790 660 L 700 600 Z";
  return { body: full, collar, sleeveL, sleeveR };
}

function foldShading(shirtColor: "black" | "white"): string {
  const dark = shirtColor === "black";
  const shade = dark ? "#ffffff" : "#000000";
  const op = dark ? 0.05 : 0.06;
  return `
    <path d="M 380 620 C 420 800, 400 950, 430 1120" stroke="${shade}" stroke-width="46" fill="none" opacity="${op}" stroke-linecap="round"/>
    <path d="M 620 620 C 580 800, 600 950, 570 1120" stroke="${shade}" stroke-width="46" fill="none" opacity="${op}" stroke-linecap="round"/>
    <path d="M 500 700 C 500 850, 500 1000, 500 1120" stroke="${shade}" stroke-width="30" fill="none" opacity="${op * 0.8}" stroke-linecap="round"/>
    <path d="M 250 600 C 270 620, 280 640, 290 660" stroke="${shade}" stroke-width="22" fill="none" opacity="${op}" stroke-linecap="round"/>
    <path d="M 750 600 C 730 620, 720 640, 710 660" stroke="${shade}" stroke-width="22" fill="none" opacity="${op}" stroke-linecap="round"/>
    <ellipse cx="500" cy="1140" rx="200" ry="14" fill="${shade}" opacity="${op * 0.7}"/>
  `;
}

export interface MockupResult {
  svg: string;
  width: number;
  height: number;
}

export function buildMockup(state: TypographyState, artworkSvg?: string): MockupResult {
  const dark = state.shirtColor === "black";
  const art = buildArtwork(state);

  const bg = state.mockupBg === "gray" ? "#f1f1f3" : "#ffffff";
  const fabric = dark ? "#17171b" : "#ffffff";
  const edge = dark ? "#2c2c33" : "#d7d7dc";
  const ribShade = dark ? "#0c0c0f" : "#e4e4e8";

  const { body, collar } = shirtPaths(state.shirtColor);

  // Chest print region: centered at x=600, width ~ 380 * artScale
  const chestW = 400 * state.artScale;
  const chestH = (chestW * art.height) / art.width;
  // artPlacement 0..100 maps to y center between 640 and 900
  const chestCY = 640 + (state.artPlacement / 100) * 260;
  const chestX = 600 - chestW / 2;
  const chestY = chestCY - chestH / 2;

  // Extract inner content of artwork svg (strip outer <svg> tags) for nesting.
  // When fonts are pre-embedded, pass the full artwork SVG string in.
  const source = artworkSvg ?? art.svg;
  const inner = source
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "");

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MW} ${MH}" width="100%" height="100%" role="img">\n` +
    `<rect x="0" y="0" width="${MW}" height="${MH}" fill="${bg}"/>\n` +
    // soft floor shadow
    `<ellipse cx="600" cy="1210" rx="330" ry="34" fill="#000000" opacity="0.10"/>\n` +
    // shirt body
    `<path d="${body}" fill="${fabric}" stroke="${edge}" stroke-width="${dark ? 3 : 5}"/>\n` +
    // collar ribbing
    `<path d="${collar}" fill="${ribShade}" stroke="${edge}" stroke-width="3"/>\n` +
    `<path d="M 445 404 C 478 444, 522 444, 555 404" fill="none" stroke="${edge}" stroke-width="2.5"/>\n` +
    // sleeve hem stitching
    `<path d="M 156 566 L 216 648" stroke="${edge}" stroke-width="2.5" fill="none" stroke-dasharray="7 5"/>\n` +
    `<path d="M 844 566 L 784 648" stroke="${edge}" stroke-width="2.5" fill="none" stroke-dasharray="7 5"/>\n` +
    `<path d="M 320 1130 L 680 1130" stroke="${edge}" stroke-width="2.5" stroke-dasharray="7 5" fill="none"/>\n` +
    // fabric folds (under artwork so text stays readable)
    `${foldShading(state.shirtColor)}\n` +
    // artwork composite — same master artwork, clipped to chest region
    `<g>\n` +
    `<svg x="${chestX.toFixed(1)}" y="${chestY.toFixed(1)}" width="${chestW.toFixed(1)}" height="${chestH.toFixed(1)}" viewBox="0 0 ${art.width} ${art.height}">\n${inner}</svg>\n` +
    `</g>\n` +
    `</svg>`;

  return { svg, width: MW, height: MH };
}
