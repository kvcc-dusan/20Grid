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
      className="aspect-square h-[90vh] max-h-[90vw] w-[90vh] max-w-[90vw] touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <path d={pathD} fill={color} fillRule="evenodd" />
    </svg>
  );
}
