import { useRef, useState } from 'react';
import { usePatternStore } from '../state/usePatternStore';
import { usePatternGeometry, CANVAS_MARGIN } from '../state/usePatternGeometry';
import { PITCH } from '../utils/constants';

interface PaintState {
  value: boolean;
}

export function PatternCanvas() {
  const toggleCell = usePatternStore((s) => s.toggleCell);
  const { grid, rows, cols, pathD, viewWidth, viewHeight, color } = usePatternGeometry();

  const svgRef = useRef<SVGSVGElement>(null);
  const [painting, setPainting] = useState<PaintState | null>(null);

  function cellFromClientPoint(clientX: number, clientY: number): { r: number; c: number } | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width;
    const py = (clientY - rect.top) / rect.height;
    const worldX = px * viewWidth - CANVAS_MARGIN;
    const worldY = py * viewHeight - CANVAS_MARGIN;
    const c = Math.floor(worldX / PITCH);
    const r = Math.floor(worldY / PITCH);
    if (r < 0 || c < 0 || r >= rows || c >= cols) return null;
    return { r, c };
  }

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    const cell = cellFromClientPoint(e.clientX, e.clientY);
    if (!cell) return;
    const paintValue = !grid[cell.r][cell.c];
    toggleCell(cell.r, cell.c, paintValue);
    setPainting({ value: paintValue });
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!painting) return;
    const cell = cellFromClientPoint(e.clientX, e.clientY);
    if (!cell) return;
    toggleCell(cell.r, cell.c, painting.value);
  }

  function handlePointerUp() {
    setPainting(null);
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`${-CANVAS_MARGIN} ${-CANVAS_MARGIN} ${viewWidth} ${viewHeight}`}
      className="touch-none select-none"
      style={{
        // Fit within 90vh tall and the available width, preserving the grid's
        // aspect ratio — element box always equals the drawn box, so pointer
        // hit-testing (which assumes a 1:1 viewBox↔rect map) stays exact.
        aspectRatio: `${viewWidth} / ${viewHeight}`,
        width: `min(90vh * ${viewWidth / viewHeight}, 100%)`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <g stroke="#282828" style={{ mixBlendMode: 'difference' }}>
        {Array.from({ length: cols + 1 }, (_, c) => (
          <line
            key={`v${c}`}
            x1={c * PITCH}
            y1={0}
            x2={c * PITCH}
            y2={rows * PITCH}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {Array.from({ length: rows + 1 }, (_, r) => (
          <line
            key={`h${r}`}
            x1={0}
            y1={r * PITCH}
            x2={cols * PITCH}
            y2={r * PITCH}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
      <path d={pathD} fill={color} fillRule="evenodd" />
    </svg>
  );
}
