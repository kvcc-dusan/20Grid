import { usePatternStore } from '../state/usePatternStore';
import { GRID_SIZE_PRESETS, MAX_NOTCH_PCT, type GridSize } from '../utils/constants';
import { ExportButton } from './ExportButton';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  displayValue?: string;
}

function SliderRow({ label, value, min, max, step, onChange, displayValue }: SliderRowProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[13px] font-medium text-neutral-400">
        <span>{label}</span>
        <span className="tabular-nums text-neutral-200">{displayValue ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider"
        style={{ '--slider-pct': `${pct}%` } as React.CSSProperties}
      />
    </label>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between text-[13px] text-neutral-300">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="toggle"
      />
    </label>
  );
}

export function Controls() {
  const params = usePatternStore((s) => s.params);
  const setParam = usePatternStore((s) => s.setParam);
  const setGridSize = usePatternStore((s) => s.setGridSize);
  const randomizeSeed = usePatternStore((s) => s.randomizeSeed);
  const clearOverrides = usePatternStore((s) => s.clearOverrides);
  const clearAll = usePatternStore((s) => s.clearAll);

  return (
    <div className="flex w-[300px] flex-col gap-6 rounded-2xl border border-white/[0.06] bg-neutral-900 p-5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_20px_50px_-20px_rgba(0,0,0,0.6)]">
      <div className="flex flex-col gap-2">
        <SectionLabel>Grid</SectionLabel>
        <div className="flex gap-1 rounded-lg bg-black/30 p-1">
          {GRID_SIZE_PRESETS.map((size) => (
            <button
              key={size}
              onClick={() => setGridSize(size as GridSize)}
              className={`flex-1 rounded-md py-1.5 text-[13px] font-medium transition-colors ${
                params.gridSize === size
                  ? 'bg-brand text-neutral-950'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {size}×{size}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionLabel>Seed</SectionLabel>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={params.seed}
            onChange={(e) => setParam('seed', Number(e.target.value))}
            className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-brand/60"
          />
          <button
            onClick={randomizeSeed}
            title="Randomize seed"
            className="shrink-0 rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm hover:border-brand/50 hover:text-brand"
          >
            ⟲
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SectionLabel>Shape</SectionLabel>
        <SliderRow
          label="Density"
          value={params.density}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setParam('density', v)}
          displayValue={`${Math.round(params.density * 100)}%`}
        />
        <SliderRow
          label="Clumpiness"
          value={params.clumpiness}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setParam('clumpiness', v)}
        />
        <SliderRow
          label="Smoothing"
          value={params.smoothing}
          min={0}
          max={4}
          step={1}
          onChange={(v) => setParam('smoothing', v)}
        />
        <SliderRow
          label="Notch"
          value={params.notchPct}
          min={0}
          max={MAX_NOTCH_PCT}
          step={1}
          onChange={(v) => setParam('notchPct', v)}
          displayValue={`${params.notchPct}%`}
        />
      </div>

      <div className="flex flex-col gap-3">
        <SectionLabel>Style</SectionLabel>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={params.color}
            onChange={(e) => setParam('color', e.target.value)}
            className="color-swatch h-9 w-9 cursor-pointer rounded-lg border border-white/[0.08]"
          />
          <span className="text-[13px] text-neutral-400">Fill color</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={params.bgColor}
            onChange={(e) => setParam('bgColor', e.target.value)}
            className="color-swatch h-9 w-9 cursor-pointer rounded-lg border border-white/[0.08]"
          />
          <span className="text-[13px] text-neutral-400">Background color</span>
        </div>
        <ToggleRow
          label="Remove crumbs"
          checked={params.removeCrumbs}
          onChange={(v) => setParam('removeCrumbs', v)}
        />
        <ToggleRow label="Invert" checked={params.invert} onChange={(v) => setParam('invert', v)} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={clearOverrides}
          className="flex-1 rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-[13px] font-medium text-neutral-300 hover:border-white/20"
        >
          Clear edits
        </button>
        <button
          onClick={clearAll}
          className="flex-1 rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-[13px] font-medium text-neutral-300 hover:border-white/20"
        >
          Clear all
        </button>
      </div>

      <ExportButton />
    </div>
  );
}
