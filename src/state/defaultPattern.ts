import { DEFAULT_GRID_SIZE } from '../utils/constants';

/**
 * The "20" splash shown on first load / reload. Authored on the 16×16 grid
 * ('#' = filled cell). The "0" uses a diagonal-touch pair to get the metaball
 * pinch slash. Any generation-control interaction dismisses it (see the store's
 * showDefaultPattern flag) and hands rendering back to generateGrid.
 */
const ROWS = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '..####..####....',
  '.#....##....#...',
  '...###.#..#.#...',
  '..#....#.#..#...',
  '.#.....#....#...',
  '.######.####....',
  '................',
  '................',
  '................',
  '................',
  '................',
];

/** The default pattern only lines up on the 16×16 grid it was authored for. */
export const DEFAULT_PATTERN_GRID_SIZE = DEFAULT_GRID_SIZE;

export function buildDefaultPatternGrid(): boolean[][] {
  return ROWS.map((row) => Array.from(row, (ch) => ch === '#'));
}
