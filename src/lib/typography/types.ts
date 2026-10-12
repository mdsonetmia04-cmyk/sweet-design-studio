/** Core types for the Typography Studio engine. */

export type ShirtColor = "black" | "white";
export type MockupBg = "white" | "gray";
export type CanvasRatio = "1:1" | "4:5";
export type TextAlign = "left" | "center" | "right";

export interface TypographyState {
  text: string;
  shirtColor: ShirtColor;
  presetId: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string; // key into FONT_REGISTRY
  fontWeight: number;
  fontScale: number; // 0.5 - 1.6
  letterSpacing: number; // em, -0.05 - 0.4
  lineHeight: number; // 0.85 - 1.8
  align: TextAlign;
  density: number; // 0.7 - 1.4 vertical rhythm multiplier
  artScale: number; // 0.5 - 1.0 chest artwork scale
  artPlacement: number; // 0 - 100 vertical placement on chest
  decorative: boolean;
  mockupBg: MockupBg;
  canvasRatio: CanvasRatio;
  accentWords: string[];
  seed: number;
}

export interface PresetDef {
  id: string;
  name: string;
  description: string;
  baseSize: number; // starting font size at 1000-wide canvas
  fontFamily: string;
  fontWeight: number;
  letterSpacing: number; // em
  lineHeight: number;
  align: TextAlign;
  uppercase: boolean;
  outline: boolean;
  decorative: "lines" | "frame" | "shapes" | "badge" | "arrows" | "dividers" | "none";
  /** per-line size multiplier pattern, e.g. [1, 0.7, 1.3] cycles across lines */
  sizePattern: number[];
}

export interface FontDef {
  key: string;
  label: string;
  family: string; // CSS font-family name
  weights: number[];
  googleName: string; // name for Google Fonts css2 API
}

export const DEFAULT_STATE: TypographyState = {
  text: "CHANGE THE WORLD\nBY THE SIMPLE\nTHINK",
  shirtColor: "black",
  presetId: "bold",
  primaryColor: "#FFFFFF",
  accentColor: "#F5C518",
  fontFamily: "anton",
  fontWeight: 400,
  fontScale: 1,
  letterSpacing: 0.02,
  lineHeight: 1.05,
  align: "center",
  density: 1,
  artScale: 0.85,
  artPlacement: 42,
  decorative: true,
  mockupBg: "white",
  canvasRatio: "1:1",
  accentWords: [],
  seed: 7,
};
