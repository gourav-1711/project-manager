import type { OverlayPattern } from "@workspace/types";

/**
 * Generate a CSS `background-image` data-URL for a given overlay pattern.
 * Falls back to `none` if the pattern is not supported.
 */
export function getPatternDataUrl(
  pattern: OverlayPattern,
  scale: number,
): string {
  switch (pattern) {
    case "grid":
      return generateGridPattern(scale);
    case "dots":
      return generateDotPattern(scale);
    default:
      return "";
  }
}

/**
 * Generate a subtle grid pattern as a data-URI SVG.
 * The grid is composed of thin, semi-transparent lines.
 */
function generateGridPattern(scale: number): string {
  const s = Math.max(8, Math.round(20 * scale));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" fill="none"/>
  <path d="M ${s} 0 L 0 0 0 ${s}" fill="none" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.5"/>
</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * Generate a dot pattern as a data-URI SVG.
 * Small dots arranged in a grid.
 */
function generateDotPattern(scale: number): string {
  const spacing = Math.max(8, Math.round(16 * scale));
  const r = Math.max(1, Math.round(1.2 * scale));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${spacing}" height="${spacing}" viewBox="0 0 ${spacing} ${spacing}">
  <rect width="${spacing}" height="${spacing}" fill="none"/>
  <circle cx="${r * 1.5}" cy="${r * 1.5}" r="${r}" fill="currentColor" opacity="0.4"/>
</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * Generate a noise texture as a data-URI from a canvas element.
 * Returns a base64 PNG data URL.
 * Memoized: reuses the last generated URL if parameters haven't changed.
 */
let lastNoiseArgs: string | null = null;
let lastNoiseUrl: string = "";

export function generateNoiseDataUrl(
  intensity: number,
): string {
  const key = `${intensity}`;
  if (key === lastNoiseArgs && lastNoiseUrl) {
    return lastNoiseUrl;
  }

  // Clamp intensity between 0 and 1
  const alpha = Math.max(0, Math.min(1, intensity));

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const value = Math.floor(Math.random() * 256);
    data[i] = value;     // R
    data[i + 1] = value; // G
    data[i + 2] = value; // B
    data[i + 3] = Math.floor(alpha * 255); // A
  }

  ctx.putImageData(imageData, 0, 0);
  const url = canvas.toDataURL();

  lastNoiseArgs = key;
  lastNoiseUrl = url;

  return url;
}

/**
 * Get the human-readable label for a pattern type.
 */
export function getPatternLabel(pattern: OverlayPattern): string {
  switch (pattern) {
    case "noise":
      return "Noise";
    case "grid":
      return "Grid";
    case "dots":
      return "Dots";
    default:
      return "None";
  }
}

/** All available pattern options for select menus. */
export const PATTERN_OPTIONS: { value: OverlayPattern; label: string }[] = [
  { value: "none", label: "None" },
  { value: "noise", label: "Noise (film grain)" },
  { value: "grid", label: "Grid" },
  { value: "dots", label: "Dots" },
];
