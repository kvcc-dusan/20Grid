import { useEffect } from 'react';
import { PatternCanvas } from './components/PatternCanvas';
import { Controls } from './components/Controls';
import { usePatternStore } from './state/usePatternStore';

function App() {
  const bgColor = usePatternStore((s) => s.params.bgColor);
  const randomizeSeed = usePatternStore((s) => s.randomizeSeed);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code !== 'Space' || e.repeat) return;
      // Don't hijack Space while typing in a field or when a control is focused.
      const el = document.activeElement;
      const isEditable =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (isEditable) return;
      e.preventDefault();
      randomizeSeed();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [randomizeSeed]);

  return (
    <div
      className="relative flex h-screen w-screen items-center justify-center overflow-hidden pr-[324px] text-neutral-100"
      style={{ backgroundColor: bgColor }}
    >
      <PatternCanvas />

      <div className="absolute right-6 top-1/2 -translate-y-1/2">
        <Controls />
      </div>
    </div>
  );
}

export default App;
