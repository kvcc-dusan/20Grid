import { useEffect, useState } from 'react';
import { usePatternStore } from '../state/usePatternStore';
import { GRID_SIZE_PRESETS, MAX_NOTCH_PCT } from '../utils/constants';
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
    <label className="flex flex-col gap-1.5">
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
    <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
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

interface DimInputProps {
  label: string;
  value: number;
  onCommit: (value: number) => void;
}

/** Number field for a grid dimension. Edits a local buffer, commits on blur/Enter
 * so clamping doesn't fight the user mid-type. */
function DimInput({ label, value, onCommit }: DimInputProps) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  const commit = () => {
    const parsed = Number.parseInt(text, 10);
    if (Number.isFinite(parsed)) onCommit(parsed);
    else setText(String(value));
  };

  return (
    <label className="flex flex-1 items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2 transition-colors focus-within:bg-white/[0.07]">
      <span className="text-[13px] font-medium text-neutral-500">{label}</span>
      <input
        type="number"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
        className="w-full min-w-0 bg-transparent text-sm text-neutral-100 outline-none"
      />
    </label>
  );
}

export function Controls() {
  const params = usePatternStore((s) => s.params);
  const setParam = usePatternStore((s) => s.setParam);
  const setDimensions = usePatternStore((s) => s.setDimensions);
  const randomizeSeed = usePatternStore((s) => s.randomizeSeed);
  const clearOverrides = usePatternStore((s) => s.clearOverrides);
  const clearAll = usePatternStore((s) => s.clearAll);

  return (
    <div className="panel-in flex w-[300px] flex-col gap-6 rounded-[28px] bg-neutral-900/95 p-6 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.75)] backdrop-blur-xl">
      <div className="flex flex-col gap-2">
        <SectionLabel>Grid</SectionLabel>
        <div className="flex gap-1 rounded-xl bg-white/[0.03] p-1">
          {GRID_SIZE_PRESETS.map((size) => {
            const active = params.rows === size && params.cols === size;
            return (
              <button
                key={size}
                onClick={() => setDimensions(size, size)}
                className={`flex-1 rounded-md py-1.5 text-[13px] font-medium transition-colors ${
                  active ? 'bg-brand text-neutral-950' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {size}×{size}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <DimInput label="W" value={params.cols} onCommit={(v) => setDimensions(params.rows, v)} />
          <DimInput label="H" value={params.rows} onCommit={(v) => setDimensions(v, params.cols)} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionLabel>Seed</SectionLabel>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={params.seed}
            onChange={(e) => setParam('seed', Number(e.target.value))}
            className="w-full rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-neutral-100 outline-none transition-colors focus:bg-white/[0.07]"
          />
          <button
            onClick={randomizeSeed}
            title="Randomize seed (Space)"
            aria-label="Randomize seed"
            className="flex shrink-0 items-center justify-center rounded-lg bg-brand px-6 py-2 text-neutral-950 shadow-[0_8px_20px_-10px_rgba(152,134,98,0.6)] transition-opacity hover:opacity-90"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15.1667 0.999756L15.7646 2.11753C16.1689 2.87322 16.371 3.25107 16.2374 3.41289C16.1037 3.57471 15.6635 3.44402 14.7831 3.18264C13.9029 2.92131 12.9684 2.78071 12 2.78071C6.75329 2.78071 2.5 6.90822 2.5 11.9998C2.5 13.6789 2.96262 15.2533 3.77093 16.6093M8.83333 22.9998L8.23536 21.882C7.83108 21.1263 7.62894 20.7484 7.7626 20.5866C7.89627 20.4248 8.33649 20.5555 9.21689 20.8169C10.0971 21.0782 11.0316 21.2188 12 21.2188C17.2467 21.2188 21.5 17.0913 21.5 11.9998C21.5 10.3206 21.0374 8.74623 20.2291 7.39023" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
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
            className="color-swatch h-9 w-9 cursor-pointer rounded-lg"
          />
          <span className="text-[13px] text-neutral-400">Fill color</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={params.bgColor}
            onChange={(e) => setParam('bgColor', e.target.value)}
            className="color-swatch h-9 w-9 cursor-pointer rounded-lg"
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
          className="flex-1 rounded-lg bg-white/[0.04] px-3 py-2 text-[13px] font-medium text-neutral-300 transition-colors hover:bg-white/[0.08]"
        >
          Clear edits
        </button>
        <button
          onClick={clearAll}
          className="flex-1 rounded-lg bg-white/[0.04] px-3 py-2 text-[13px] font-medium text-neutral-300 transition-colors hover:bg-white/[0.08]"
        >
          Clear all
        </button>
      </div>

      <ExportButton />
    </div>
  );
}
