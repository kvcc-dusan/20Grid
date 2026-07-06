import { usePatternGeometry, CANVAS_MARGIN } from '../state/usePatternGeometry';

export function ExportButton() {
  const { pathD, viewWidth, viewHeight, color, seed } = usePatternGeometry();

  function handleExport() {
    const svg = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-CANVAS_MARGIN} ${-CANVAS_MARGIN} ${viewWidth} ${viewHeight}">`,
      `  <path fill="${color}" fill-rule="evenodd" d="${pathD}"/>`,
      '</svg>',
    ].join('\n');

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inova20-pattern-${seed}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="w-full rounded-xl bg-brand py-3 text-[13px] font-semibold tracking-wide text-neutral-950 shadow-[0_10px_30px_-10px_rgba(152,134,98,0.6)] transition-opacity hover:opacity-90"
    >
      Export SVG
    </button>
  );
}
