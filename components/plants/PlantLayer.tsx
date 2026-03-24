import { useEffect, useRef, memo, type ReactElement } from 'react';

type PlantElement = {
  type: string;
  x: number;
  y: number;
  rx?: number;
  ry?: number;
  fill?: string;
  opacity: number;
  d?: string;
  stroke?: string;
  w?: number;
  rot?: number;
  angle?: number;
  tx?: number;
  anim: { kind: string; delay: number; dur: number };
}

type PlantDesc = {
  id: number;
  layer: 'front' | 'back';
  elements: PlantElement[];
}

type PlantLayerProps = {
  plants: PlantDesc[];
  layer: 'front' | 'back';
}

export function PlantLayer({ plants, layer }: PlantLayerProps) {
  return (
    <g className={`plant-layer-${layer}`} style={{ pointerEvents: 'none' }}>
      {plants
        .filter(p => p.layer === layer)
        .map(p => <Plant key={p.id} desc={p} />)}
    </g>
  );
}

const Plant = memo(function Plant({ desc }: { desc: PlantDesc }) {
  return (
    <g filter="url(#bloom)">
      {desc.elements.map((e, i) => <Element key={i} e={e} />)}
    </g>
  );
});

function Element({ e }: { e: PlantElement }) {
  const ref = useRef<SVGPathElement | SVGGElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const { kind, delay, dur } = e.anim;

    if (kind === 'draw') {
      const len = (node as SVGPathElement).getTotalLength?.();
      if (len) {
        node.style.strokeDasharray = String(len);
        node.style.strokeDashoffset = String(len);
        node.animate(
          [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
          { duration: dur, delay, easing: 'cubic-bezier(.35,.05,.25,1)', fill: 'forwards' }
        );
      }
    } else {
      node.style.transformBox = 'fill-box';
      node.style.transformOrigin = 'center';
      const finalOp = e.opacity ?? 1;
      node.animate(
        [
          { transform: 'scale(0)', opacity: 0 },
          { transform: 'scale(1.12)', opacity: finalOp, offset: 0.68 },
          { transform: 'scale(1)', opacity: finalOp }
        ],
        { duration: dur, delay, easing: 'cubic-bezier(.3,.8,.4,1.15)', fill: 'forwards' }
      );
    }
  }, [e.anim, e.opacity]);

  if (e.type === 'path') {
    return (
      <path
        ref={ref as React.Ref<SVGPathElement>}
        d={e.d}
        fill="none"
        stroke={e.stroke}
        strokeWidth={e.w}
        strokeLinecap="round"
        opacity={e.opacity}
      />
    );
  }

  if (e.type === 'leaf') {
    return (
      <g ref={ref as React.Ref<SVGGElement>} style={{ opacity: 0 }}>
        <path
          d={e.d}
          fill={e.fill}
          opacity={e.opacity}
          transform={`translate(${e.x} ${e.y}) rotate(${e.angle})`}
        />
      </g>
    );
  }

  const tf = `rotate(${e.rot || 0} ${e.x} ${e.y})` + (e.tx ? ` translate(${e.tx} 0)` : '');
  return (
    <g ref={ref as React.Ref<SVGGElement>} style={{ opacity: 0 }}>
      <ellipse
        cx={e.x}
        cy={e.y}
        rx={e.rx}
        ry={e.ry}
        fill={e.fill}
        opacity={e.opacity}
        transform={tf}
      />
    </g>
  );
}
