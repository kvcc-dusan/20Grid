import { useMemo } from 'react';
import { traceLoops } from '../geometry/trace';
import { buildPath } from '../geometry/path';
import { applyOverrides } from './compositeGrid';
import { generateGrid } from '../generation/generate';
import { usePatternStore } from './usePatternStore';
import { FIXED_BLEED_PCT, PITCH } from '../utils/constants';

export const CANVAS_MARGIN = (PITCH * FIXED_BLEED_PCT) / 100;

export function usePatternGeometry() {
  const params = usePatternStore((s) => s.params);
  const overrides = usePatternStore((s) => s.overrides);

  const rows = params.gridSize;
  const cols = params.gridSize;

  const baseGrid = useMemo(
    () =>
      generateGrid({
        rows,
        cols,
        seed: params.seed,
        density: params.density,
        clumpiness: params.clumpiness,
        smoothing: params.smoothing,
        removeCrumbs: params.removeCrumbs,
        invert: params.invert,
      }),
    [
      rows,
      cols,
      params.seed,
      params.density,
      params.clumpiness,
      params.smoothing,
      params.removeCrumbs,
      params.invert,
    ],
  );

  const grid = useMemo(() => applyOverrides(baseGrid, overrides), [baseGrid, overrides]);

  const bleed = (PITCH * FIXED_BLEED_PCT) / 100;
  const rOuter = bleed;
  const rInner = (PITCH * params.notchPct) / 100;

  const pathD = useMemo(() => {
    const loops = traceLoops(grid, PITCH, bleed);
    return buildPath(loops, { rOuter, rInner });
  }, [grid, bleed, rOuter, rInner]);

  const viewWidth = cols * PITCH + 2 * CANVAS_MARGIN;
  const viewHeight = rows * PITCH + 2 * CANVAS_MARGIN;

  return { grid, rows, cols, pathD, viewWidth, viewHeight, color: params.color, seed: params.seed };
}
