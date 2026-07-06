export const GRID_SIZE_PRESETS = [8, 16, 32] as const;
export type GridSize = (typeof GRID_SIZE_PRESETS)[number];
export const DEFAULT_GRID_SIZE: GridSize = 16;

/** Custom grid dimensions clamp here — small enough to paint, big enough to matter. */
export const MIN_GRID_DIM = 2;
export const MAX_GRID_DIM = 64;

/** World units per grid cell. Arbitrary — only ratios to this matter. */
export const PITCH = 100;

/**
 * Fixed corner radius / bleed, as % of PITCH — matches the reference SVG's
 * ratio and is intentionally not user-tunable. Outer convex corners and
 * ordinary concave "L" turns both round smoothly with this same radius as a
 * plain circular arc. Bleed and the corner radius are the same value by
 * design: bleed is what physically pushes an isolated pixel's corner out, so
 * rounding it with a different radius would leave a visible flat nub or overshoot it.
 */
export const FIXED_BLEED_PCT = 8;

/** Notch radius (as % of PITCH) for the diagonal-touch metaball pinch. */
export const DEFAULT_NOTCH_PCT = 30;
export const MAX_NOTCH_PCT = 50;

export const BRAND_COLOR = '#988662';
