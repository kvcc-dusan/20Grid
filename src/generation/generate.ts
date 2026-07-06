import { mulberry32 } from './random';

export interface GenerateParams {
  rows: number;
  cols: number;
  seed: number;
  /** 0..1 — fraction of cells that end up ON. */
  density: number;
  /** 0..1 — 0 = fine confetti noise, 1 = large coarse blobs. */
  clumpiness: number;
  /** integer 0..4 — cellular-automata smoothing passes; higher = more organic/blobby. */
  smoothing: number;
  /** strip ON cells with no ON neighbor (incl. diagonals) after generation. */
  removeCrumbs: boolean;
  invert: boolean;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function buildCoarseNoise(size: number, rng: () => number): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let c = 0; c < size; c++) row.push(rng());
    grid.push(row);
  }
  return grid;
}

function sampleBilinear(coarse: number[][], size: number, u: number, v: number): number {
  const fx = u * (size - 1);
  const fy = v * (size - 1);
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = Math.min(x0 + 1, size - 1);
  const y1 = Math.min(y0 + 1, size - 1);
  const tx = fx - x0;
  const ty = fy - y0;

  const top = lerp(coarse[y0][x0], coarse[y0][x1], tx);
  const bottom = lerp(coarse[y1][x0], coarse[y1][x1], tx);
  return lerp(top, bottom, ty);
}

function countNeighbors(grid: boolean[][], r: number, c: number): number {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= grid.length || nc >= grid[0].length) continue;
      if (grid[nr][nc]) count++;
    }
  }
  return count;
}

function smoothPass(grid: boolean[][]): boolean[][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const next: boolean[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < cols; c++) {
      const neighbors = countNeighbors(grid, r, c);
      const self = grid[r][c] ? 1 : 0;
      row.push(neighbors + self >= 5);
    }
    next.push(row);
  }
  return next;
}

function removeCrumbs(grid: boolean[][]): boolean[][] {
  return grid.map((row, r) =>
    row.map((on, c) => (on ? countNeighbors(grid, r, c) > 0 : false)),
  );
}

export function generateGrid(params: GenerateParams): boolean[][] {
  const { rows, cols, seed, density, clumpiness, smoothing, invert } = params;
  const rng = mulberry32(seed);

  const coarseSize = Math.max(2, Math.round(lerp(Math.max(rows, cols), 3, clumpiness)));
  const coarse = buildCoarseNoise(coarseSize, rng);

  let grid: boolean[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < cols; c++) {
      const noise = sampleBilinear(coarse, coarseSize, cols > 1 ? c / (cols - 1) : 0, rows > 1 ? r / (rows - 1) : 0);
      row.push(noise < density);
    }
    grid.push(row);
  }

  const passes = Math.max(0, Math.round(smoothing));
  for (let i = 0; i < passes; i++) grid = smoothPass(grid);

  if (params.removeCrumbs) grid = removeCrumbs(grid);

  if (invert) grid = grid.map((row) => row.map((v) => !v));

  return grid;
}
