import type { Loop } from './trace';

export interface PathParams {
  rOuter: number;
  rInner: number;
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(bx - ax, by - ay);
}

const EPS = 0.01;

/** Outer boundary loops are traced clockwise (verified against traceLoops'
 * winding). For a clockwise contour a convex ("outer") corner must round with a
 * clockwise arc (sweep 1) to bulge outward, and a concave ("innerSmall") corner
 * must fillet with the opposite, counter-clockwise arc (sweep 0) to scoop inward.
 * The diagonal "innerPinch" corner never reaches this branch (it uses the
 * metaball bezier), so its value here is irrelevant. */
function sweepFor(radiusKind: Loop[number]['radiusKind']): 0 | 1 {
  return radiusKind === 'outer' ? 1 : 0;
}

/**
 * Handle length (as a fraction of the fillet radius) for the concave "pinch"
 * bezier. A circular arc has constant curvature and reads as a stamped-out
 * circle; pulling the handles out further than the circular kappa (0.5523)
 * flattens the curve near its tangent points and pushes curvature into the
 * middle, so it blends into the two rounded squares like a metaball merge
 * instead of reading as an independent geometric primitive.
 */
const METABALL_HANDLE_RATIO = 1.0;

function loopToPath(loop: Loop, params: PathParams): string {
  const n = loop.length;
  if (n < 3) return '';

  // Outer convex corners and ordinary concave "L" turns both round smoothly
  // with the same small radius (a plain circular arc) — only the diagonal
  // touch gets the bigger notch radius and the metaball blend below.
  const desired = loop.map((c) => (c.radiusKind === 'innerPinch' ? params.rInner : params.rOuter));
  const segLen = loop.map((c, i) => {
    const next = loop[(i + 1) % n];
    return dist(c.x, c.y, next.x, next.y);
  });

  const radius = loop.map((_, i) => {
    const prevSeg = segLen[(i - 1 + n) % n];
    const nextSeg = segLen[i];
    return Math.min(desired[i], prevSeg / 2, nextSeg / 2);
  });

  const arcStart: { x: number; y: number }[] = [];
  const arcEnd: { x: number; y: number }[] = [];
  const dirIn: { x: number; y: number }[] = [];
  const dirOut: { x: number; y: number }[] = [];

  for (let i = 0; i < n; i++) {
    const prev = loop[(i - 1 + n) % n];
    const curr = loop[i];
    const next = loop[(i + 1) % n];
    const r = radius[i];

    const inLen = segLen[(i - 1 + n) % n];
    const outLen = segLen[i];
    const dirInX = inLen > 0 ? (curr.x - prev.x) / inLen : 0;
    const dirInY = inLen > 0 ? (curr.y - prev.y) / inLen : 0;
    const dirOutX = outLen > 0 ? (next.x - curr.x) / outLen : 0;
    const dirOutY = outLen > 0 ? (next.y - curr.y) / outLen : 0;

    dirIn.push({ x: dirInX, y: dirInY });
    dirOut.push({ x: dirOutX, y: dirOutY });
    arcStart.push({ x: curr.x - dirInX * r, y: curr.y - dirInY * r });
    arcEnd.push({ x: curr.x + dirOutX * r, y: curr.y + dirOutY * r });
  }

  const fmt = (v: number) => (Math.round(v * 100) / 100).toString();

  let d = `M ${fmt(arcStart[0].x)} ${fmt(arcStart[0].y)}`;
  for (let i = 0; i < n; i++) {
    if (i > 0) d += ` L ${fmt(arcStart[i].x)} ${fmt(arcStart[i].y)}`;
    const r = radius[i];
    if (r < EPS) {
      d += ` L ${fmt(loop[i].x)} ${fmt(loop[i].y)}`;
    } else if (loop[i].radiusKind === 'innerPinch') {
      const handle = r * METABALL_HANDLE_RATIO;
      const c1x = arcStart[i].x + dirIn[i].x * handle;
      const c1y = arcStart[i].y + dirIn[i].y * handle;
      const c2x = arcEnd[i].x - dirOut[i].x * handle;
      const c2y = arcEnd[i].y - dirOut[i].y * handle;
      d += ` C ${fmt(c1x)} ${fmt(c1y)} ${fmt(c2x)} ${fmt(c2y)} ${fmt(arcEnd[i].x)} ${fmt(arcEnd[i].y)}`;
    } else {
      const sweep = sweepFor(loop[i].radiusKind);
      d += ` A ${fmt(r)} ${fmt(r)} 0 0 ${sweep} ${fmt(arcEnd[i].x)} ${fmt(arcEnd[i].y)}`;
    }
  }
  d += ' Z';
  return d;
}

export function buildPath(loops: Loop[], params: PathParams): string {
  return loops
    .map((loop) => loopToPath(loop, params))
    .filter(Boolean)
    .join(' ');
}
