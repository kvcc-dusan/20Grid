import { create } from 'zustand';
import {
  BRAND_COLOR,
  DEFAULT_GRID_SIZE,
  DEFAULT_NOTCH_PCT,
  MAX_GRID_DIM,
  MIN_GRID_DIM,
} from '../utils/constants';

export interface PatternParams {
  seed: number;
  rows: number;
  cols: number;
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
  /** true until the user touches a generation control; shows the "20" splash. */
  showDefaultPattern: boolean;
  setParam: <K extends keyof PatternParams>(key: K, value: PatternParams[K]) => void;
  /** Set grid dimensions (clamped to [MIN_GRID_DIM, MAX_GRID_DIM]); resets edits. */
  setDimensions: (rows: number, cols: number) => void;
  randomizeSeed: () => void;
  toggleCell: (r: number, c: number, forceValue?: boolean) => void;
  clearOverrides: () => void;
  clearAll: () => void;
}

const DEFAULT_PARAMS: PatternParams = {
  seed: 20260706,
  rows: DEFAULT_GRID_SIZE,
  cols: DEFAULT_GRID_SIZE,
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
  showDefaultPattern: true,

  setParam: (key, value) =>
    set((state) => ({ params: { ...state.params, [key]: value }, showDefaultPattern: false })),

  setDimensions: (rows, cols) => {
    const clamp = (n: number) =>
      Math.min(MAX_GRID_DIM, Math.max(MIN_GRID_DIM, Math.round(Number.isFinite(n) ? n : MIN_GRID_DIM)));
    set((state) => ({
      params: { ...state.params, rows: clamp(rows), cols: clamp(cols) },
      overrides: new Map(),
      showDefaultPattern: false,
    }));
  },

  randomizeSeed: () =>
    set((state) => ({
      params: { ...state.params, seed: Math.floor(Math.random() * 1e9) },
      overrides: new Map(),
      showDefaultPattern: false,
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
      const { rows, cols } = state.params;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) next.set(`${r},${c}`, false);
      }
      return { overrides: next, showDefaultPattern: false };
    }),
}));
