export function applyOverrides(baseGrid: boolean[][], overrides: Map<string, boolean>): boolean[][] {
  if (overrides.size === 0) return baseGrid;
  return baseGrid.map((row, r) =>
    row.map((value, c) => overrides.get(`${r},${c}`) ?? value),
  );
}
