/**
 * Traces the outline of a boolean grid where each ON cell is treated as a
 * (pitch + 2*bleed) square (bleeding into every neighbor, including diagonals).
 *
 * Two diagonally-touching ON cells therefore overlap in a bleed x bleed corner
 * square, turning the degenerate point-touch into two ordinary concave corners.
 * That overlap *is* the "fluid pinch" — no special-casing of diagonals needed
 * beyond the corner classification below.
 *
 * Implementation is a directed-edge walk over grid vertices. At each vertex the
 * surrounding 2x2 cell pattern (TL,TR,BL,BR) determines zero, one, or two
 * corner transitions; see the lookup table for the full derivation. Each
 * transition pairs an incoming boundary edge with an outgoing one and gives the
 * corner's offset (in units of `bleed`) and radius kind. Straight-through
 * (2-on-orthogonal) patterns pair incoming/outgoing with no corner emitted.
 */

export interface Corner {
  x: number;
  y: number;
  /**
   * outer: convex corner of an isolated edge, rounds outward with rOuter.
   * innerSmall: ordinary concave corner where two orthogonally-joined cells
   *   meet (a plain "L" turn) — rounds inward with the *same* rOuter radius,
   *   a simple circular arc, no notch bulge.
   * innerPinch: the diagonal-touch pinch — the big rInner metaball blend.
   */
  radiusKind: 'outer' | 'innerSmall' | 'innerPinch';
}

export type Loop = Corner[];

type Role = 'TL' | 'TR' | 'BL' | 'BR';
type RadiusKind = Corner['radiusKind'];

interface Transition {
  inRole: Role;
  outRole: Role;
  offset: [number, number] | null;
  radiusKind: RadiusKind | null;
}

/** Indexed by (TL<<3 | TR<<2 | BL<<1 | BR). */
const TRANSITIONS: Record<number, Transition[]> = {
  0: [],
  15: [],
  // 1-on (convex)
  8: [{ inRole: 'TL', outRole: 'TL', offset: [1, 1], radiusKind: 'outer' }],
  4: [{ inRole: 'TR', outRole: 'TR', offset: [-1, 1], radiusKind: 'outer' }],
  2: [{ inRole: 'BL', outRole: 'BL', offset: [1, -1], radiusKind: 'outer' }],
  1: [{ inRole: 'BR', outRole: 'BR', offset: [-1, -1], radiusKind: 'outer' }],
  // 3-on (ordinary concave L-corner, small radius, no notch)
  7: [{ inRole: 'BL', outRole: 'TR', offset: [-1, -1], radiusKind: 'innerSmall' }], // TL off
  11: [{ inRole: 'TL', outRole: 'BR', offset: [1, -1], radiusKind: 'innerSmall' }], // TR off
  13: [{ inRole: 'BR', outRole: 'TL', offset: [-1, 1], radiusKind: 'innerSmall' }], // BL off
  14: [{ inRole: 'TR', outRole: 'BL', offset: [1, 1], radiusKind: 'innerSmall' }], // BR off
  // 2-on orthogonal (straight, no corner)
  12: [{ inRole: 'TR', outRole: 'TL', offset: null, radiusKind: null }], // TL+TR
  3: [{ inRole: 'BL', outRole: 'BR', offset: null, radiusKind: null }], // BL+BR
  10: [{ inRole: 'TL', outRole: 'BL', offset: null, radiusKind: null }], // TL+BL
  5: [{ inRole: 'BR', outRole: 'TR', offset: null, radiusKind: null }], // TR+BR
  // 2-on diagonal (pinch: two concave corners, metaball notch)
  9: [
    { inRole: 'TL', outRole: 'BR', offset: [1, -1], radiusKind: 'innerPinch' },
    { inRole: 'BR', outRole: 'TL', offset: [-1, 1], radiusKind: 'innerPinch' },
  ],
  6: [
    { inRole: 'TR', outRole: 'BL', offset: [1, 1], radiusKind: 'innerPinch' },
    { inRole: 'BL', outRole: 'TR', offset: [-1, -1], radiusKind: 'innerPinch' },
  ],
};

/** Following an outgoing role leads to a fixed adjacent vertex + incoming role. */
const NEXT_VERTEX: Record<Role, { dr: number; dc: number; inRole: Role }> = {
  TL: { dr: 0, dc: -1, inRole: 'TR' },
  TR: { dr: -1, dc: 0, inRole: 'BR' },
  BL: { dr: 1, dc: 0, inRole: 'TL' },
  BR: { dr: 0, dc: 1, inRole: 'BL' },
};

function cellOn(grid: boolean[][], r: number, c: number): boolean {
  if (r < 0 || c < 0 || r >= grid.length || c >= (grid[0]?.length ?? 0)) return false;
  return grid[r][c];
}

function patternIndex(grid: boolean[][], r: number, c: number): number {
  const tl = cellOn(grid, r - 1, c - 1) ? 8 : 0;
  const tr = cellOn(grid, r - 1, c) ? 4 : 0;
  const bl = cellOn(grid, r, c - 1) ? 2 : 0;
  const br = cellOn(grid, r, c) ? 1 : 0;
  return tl | tr | bl | br;
}

export function traceLoops(grid: boolean[][], pitch: number, bleed: number): Loop[] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return [];

  const visited = new Set<string>();
  const loops: Loop[] = [];

  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const transitions = TRANSITIONS[patternIndex(grid, r, c)];
      for (const t of transitions) {
        const startKey = `${r},${c},${t.inRole}`;
        if (visited.has(startKey)) continue;

        const loop: Loop = [];
        let vr = r;
        let vc = c;
        let inRole = t.inRole;

        for (;;) {
          const key = `${vr},${vc},${inRole}`;
          if (visited.has(key)) break;
          visited.add(key);

          const trans = TRANSITIONS[patternIndex(grid, vr, vc)].find((x) => x.inRole === inRole);
          if (!trans) break;

          if (trans.offset && trans.radiusKind) {
            loop.push({
              x: vc * pitch + trans.offset[0] * bleed,
              y: vr * pitch + trans.offset[1] * bleed,
              radiusKind: trans.radiusKind,
            });
          }

          const next = NEXT_VERTEX[trans.outRole];
          vr += next.dr;
          vc += next.dc;
          inRole = next.inRole;

          if (vr === r && vc === c && inRole === t.inRole) break;
        }

        if (loop.length >= 3) loops.push(loop);
      }
    }
  }

  return loops;
}
