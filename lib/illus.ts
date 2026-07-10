import type { ArtKey } from "./types";

/**
 * Monoline product illustrations, kept as raw SVG strings so they can be
 * rendered with dangerouslySetInnerHTML. Stroke color comes from CSS
 * (`.ph { color }` / `stroke: currentColor`). These are neutral placeholders —
 * swap for real product photography when it's available.
 */
export const ILLUS: Record<ArtKey, string> = {
  range: `<svg viewBox="0 0 120 96" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="30" width="88" height="54" rx="3"/><path d="M16 42h88"/><circle cx="40" cy="60" r="10"/><circle cx="80" cy="60" r="10"/><path d="M24 84v6M96 84v6"/></svg>`,
  fridge: `<svg viewBox="0 0 120 96" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="30" y="10" width="60" height="80" rx="4"/><path d="M60 10v80M40 22v10M80 22v10"/></svg>`,
  fryer: `<svg viewBox="0 0 120 96" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M28 36h64v40a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6z"/><path d="M28 48h64"/><rect x="40" y="24" width="40" height="12" rx="2"/></svg>`,
  table: `<svg viewBox="0 0 120 96" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="34" width="84" height="9" rx="2"/><path d="M26 43v42M94 43v42M26 65h68"/></svg>`,
  rice: `<svg viewBox="0 0 120 96" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M28 44a32 22 0 0 1 64 0v20a12 12 0 0 1-12 12H40a12 12 0 0 1-12-12z"/><path d="M24 44h72"/></svg>`,
  wok: `<svg viewBox="0 0 120 96" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 42h76a38 30 0 0 1-76 0z"/><path d="M98 46l16-4M6 42l16 2"/></svg>`,
  lamp: `<svg viewBox="0 0 120 96" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M60 8v14"/><path d="M34 40a26 18 0 0 1 52 0z"/><path d="M34 40h52"/></svg>`,
  sink: `<svg viewBox="0 0 120 96" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="40" width="88" height="34" rx="3"/><path d="M44 40v34M72 40v34M30 16v14c0 6 8 6 8 12"/></svg>`,
  oven: `<svg viewBox="0 0 120 96" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="22" y="18" width="76" height="60" rx="4"/><rect x="34" y="30" width="52" height="30" rx="2"/><path d="M34 70h52"/></svg>`,
  rack: `<svg viewBox="0 0 120 96" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M32 12v78M88 12v78M32 26h56M32 42h56M32 58h56M32 74h56"/></svg>`,
};

/** Large spec-drawing used in the hero (with a dimension line). */
export const HERO_DRAW = `<svg viewBox="0 0 200 150" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="30" y="44" width="140" height="76" rx="3"/><path d="M30 64h140"/><circle cx="70" cy="92" r="15"/><circle cx="130" cy="92" r="15"/><path d="M70 84c0-5 4-5 4-10M130 84c0-5 4-5 4-10"/><path d="M44 120v14M156 120v14M46 52h16M138 52h16"/><g stroke-width="1" opacity=".5"><path d="M30 32h140M30 28v8M170 28v8"/></g><text x="100" y="26" text-anchor="middle" font-size="8" fill="currentColor" font-family="Inter" opacity=".6">24 in</text></svg>`;
