import { fontDef } from "./presets";

/** Fetches a Google Fonts woff2 and returns a base64 @font-face block so
 *  exported SVGs render identically everywhere (WYSIWYG). */

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as number[]);
  }
  return btoa(binary);
}

async function fontFaceCss(family: string, weight: number): Promise<string> {
  const googleName = family.replace(/ /g, "+");
  const cssUrl = `https://fonts.googleapis.com/css2?family=${googleName}:wght@${weight}&display=swap`;
  const css = await (await fetch(cssUrl)).text();
  const urls = [...css.matchAll(/url\((https:[^)]+\.woff2)\)/g)].map((m) => m[1]);
  const target = urls[urls.length - 1] ?? urls[0];
  if (!target) throw new Error(`No woff2 found for ${family} ${weight}`);
  const buf = await (await fetch(target)).arrayBuffer();
  const b64 = arrayBufferToBase64(buf);
  return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
}

/**
 * Inject embedded fonts into an SVG string. `families` maps font-family
 * name -> weight used.
 */
export async function embedFonts(
  svg: string,
  families: { family: string; weight: number }[]
): Promise<string> {
  const unique = new Map<string, number>();
  families.forEach((f) => {
    if (!unique.has(f.family)) unique.set(f.family, f.weight);
  });
  const blocks: string[] = [];
  for (const [family, weight] of unique) {
    try {
      blocks.push(await fontFaceCss(family, weight));
    } catch (e) {
      console.warn("Font embed failed:", family, weight, e);
    }
  }
  if (blocks.length === 0) return svg;
  const style = `<style>${blocks.join("\n")}</style>`;
  return svg.replace(/(<svg[^>]*>)/, `$1\n${style}`);
}

/** Resolve the font families used by a typography state. */
export function usedFonts(fontKey: string, weight: number): { family: string; weight: number }[] {
  const def = fontDef(fontKey);
  const w = def.weights.includes(weight) ? weight : def.weights[0];
  return [{ family: def.family, weight: w }];
}
