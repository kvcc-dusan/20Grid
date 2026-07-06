import { PatternCanvas } from './components/PatternCanvas';
import { Controls } from './components/Controls';
import { usePatternStore } from './state/usePatternStore';

function App() {
  const bgColor = usePatternStore((s) => s.params.bgColor);

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
