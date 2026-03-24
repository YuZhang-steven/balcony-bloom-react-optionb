import { useEffect, useState } from 'react';
import { useAnchors } from '../game/AnchorContext';

export function DebugAnchors({ enabled }: { enabled: boolean }) {
  const [anchors, setAnchors] = useState<ReturnType<ReturnType<typeof useAnchors>['all']>>([]);
  const { all: getAnchors, subscribe } = useAnchors();

  useEffect(() => {
    if (!enabled) return;
    setAnchors(getAnchors());
    return subscribe(() => setAnchors(getAnchors()));
  }, [enabled, getAnchors, subscribe]);

  if (!enabled) return null;

  return (
    <>
      {anchors.map((a, i) => (
        <circle
          key={i}
          cx={a.x}
          cy={a.y}
          r={5}
          fill="none"
          stroke={a.kind === 'rooftop' ? '#ff6b6b' : a.kind === 'canopy' ? '#74b9ff' : '#ffeaa7'}
          strokeWidth={1.5}
          style={{ pointerEvents: 'none' }}
        />
      ))}
    </>
  );
}

