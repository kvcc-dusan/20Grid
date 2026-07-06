import { create } from 'zustand';
import {
  BRAND_COLOR,
  DEFAULT_GRID_SIZE,
  DEFAULT_NOTCH_PCT,
  type GridSize,
} from '../utils/constants';

export interface PatternParams {
  seed: number;
  gridSize: GridSize;
  density: number;
  clumpiness: number;
  smoothing: number;
  removeCrumbs: boolean;
  invert: boolean;
  notchPct: number;
  color: string;
  bgColor: string;
}

interface PatternStore {
  params: PatternParams;
  overrides: Map<string, boolean>;
  setParam: <K extends keyof PatternParams>(key: K, value: PatternParams[K]) => void;
  setGridSize: (size: GridSize) => void;
  randomizeSeed: () => void;
  toggleCell: (r: number, c: number, forceValue?: boolean) => void;
  clearOverrides: () => void;
  clearAll: () => void;
}

const DEFAULT_PARAMS: PatternParams = {
  seed: 20260706,
  gridSize: DEFAULT_GRID_SIZE,
  density: 0.42,
  clumpiness: 0.55,
  smoothing: 2,
  removeCrumbs: true,
  invert: false,
  notchPct: DEFAULT_NOTCH_PCT,
  color: BRAND_COLOR,
  bgColor: '#0a0a0a',
};

export const usePatternStore = create<PatternStore>((set) => ({
  params: DEFAULT_PARAMS,
  overrides: new Map(),

  setParam: (key, value) =>
    set((state) => ({ params: { ...state.params, [key]: value } })),

  setGridSize: (size) =>
    set((state) => ({ params: { ...state.params, gridSize: size }, overrides: new Map() })),

  randomizeSeed: () =>
    set((state) => ({
      params: { ...state.params, seed: Math.floor(Math.random() * 1e9) },
      overrides: new Map(),
    })),

  toggleCell: (r, c, forceValue) =>
    set((state) => {
      const key = `${r},${c}`;
      const next = new Map(state.overrides);
      const current = next.get(key);
      const newValue = forceValue !== undefined ? forceValue : !(current ?? false);
      next.set(key, newValue);
      return { overrides: next };
    }),

  clearOverrides: () => set({ overrides: new Map() }),

  clearAll: () =>
    set((state) => {
      const next = new Map<string, boolean>();
      const size = state.params.gridSize;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) next.set(`${r},${c}`, false);
      }
      return { overrides: next };
    }),
}));
