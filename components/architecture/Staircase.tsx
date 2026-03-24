import { IronStroke, IronFill, Finial } from '../ironwork/IronStroke';
import { cScroll, twistBar } from '../ironwork/primitives';
import { IRON, STONE } from '../game/palettes';
import { useRegisterAnchors } from '../game/AnchorContext';
import type { Scene, Anchor } from '../../types';

type StaircaseProps = {
  scene: Scene;
}

export function Staircase({ scene }: StaircaseProps) {
  const { nStairs, stairH, treadH, stairGrow,
          stairTopW, stairCX, porchY, porchH, railH,
          stairTreadDepths } = scene;

  const steps = [];
  for (let i = 0; i < nStairs; i++) {
    const y = porchY + porchH + i * (stairH + treadH);
    const grow = i * stairGrow;
    const w = stairTopW + grow * 2;
    const x = stairCX - w / 2;
    const last = i === nStairs - 1;
    steps.push({ x, y, w, treadY: y, riserY: y + treadH, last, i });
  }

  const railPoints = { left: [] as { x: number; y: number }[], right: [] as { x: number; y: number }[] };
  for (let i = 0; i <= nStairs; i++) {
    const grow = i * stairGrow;
    const w = stairTopW + grow * 2;
    const xL = stairCX - w / 2 + 8;
    const xR = stairCX + w / 2 - 8;
    const yBot = porchY + porchH + i * (stairH + treadH) - 2;
    railPoints.left.push({ x: xL, y: yBot });
    railPoints.right.push({ x: xR, y: yBot });
  }

  const anchors: Anchor[] = [];
  const newelL = railPoints.left[nStairs];
  const newelR = railPoints.right[nStairs];
  anchors.push({ x: newelL.x, y: newelL.y - railH * 0.55, kind: 'newel' });
  anchors.push({ x: newelR.x, y: newelR.y - railH * 0.55, kind: 'newel' });
  for (const side of ['left', 'right'] as const) {
    const mid = railPoints[side][Math.floor(nStairs / 2)];
    anchors.push({ x: mid.x, y: mid.y - railH * 0.4, kind: 'stair' });
  }
  useRegisterAnchors(anchors);

  return (
    <g className="staircase">
      {steps.map((s) => {
        const rnd = s.last ? 14 : 0;
        return (
          <g key={s.i}>
            <path d={`M ${s.x - 2} ${s.treadY} L ${s.x + s.w + 2} ${s.treadY}
                      L ${s.x + s.w + 2} ${s.treadY + treadH} L ${s.x - 2} ${s.treadY + treadH} Z`}
              fill="#e8ddc8" opacity={0.85} />
            <path d={`M ${s.x - 2} ${s.treadY} L ${s.x + s.w + 2} ${s.treadY}`}
              stroke="#8a7560" strokeWidth={0.8} opacity={0.35} fill="none" />
            {s.last ? (
              <path d={`M ${s.x + rnd} ${s.riserY}
                        L ${s.x + s.w - rnd} ${s.riserY}
                        Q ${s.x + s.w} ${s.riserY} ${s.x + s.w} ${s.riserY + rnd}
                        L ${s.x + s.w} ${s.riserY + stairH - 2}
                        Q ${s.x + s.w} ${s.riserY + stairH} ${s.x + s.w - rnd * 0.6} ${s.riserY + stairH}
                        L ${s.x + rnd * 0.6} ${s.riserY + stairH}
                        Q ${s.x} ${s.riserY + stairH} ${s.x} ${s.riserY + stairH - 2}
                        L ${s.x} ${s.riserY + rnd}
                        Q ${s.x} ${s.riserY} ${s.x + rnd} ${s.riserY} Z`}
                fill={STONE.riser} opacity={0.35 + (s.i % 2) * 0.12} />
            ) : (
              <rect x={s.x} y={s.riserY} width={s.w} height={stairH}
                fill={STONE.riser} opacity={0.35 + (s.i % 2) * 0.12} />
            )}
            <rect x={s.x + s.w * 0.08} y={s.riserY + stairH - 4} width={s.w * stairTreadDepths[s.i]} height={3}
              fill={STONE.shadow} opacity={0.15} />
            <path d={`M ${s.x} ${s.riserY} L ${s.x + s.w} ${s.riserY}`}
              stroke="#8a7560" strokeWidth={0.7} opacity={0.3} fill="none" />
          </g>
        );
      })}

      <StairRailing points={railPoints.left} side="left" railH={railH} />
      <StairRailing points={railPoints.right} side="right" railH={railH} />
    </g>
  );
}

type StairRailingProps = {
  points: { x: number; y: number }[];
  side: 'left' | 'right';
  railH: number;
}

function StairRailing({ points, side, railH }: StairRailingProps) {
  const n = points.length;
  const newel = points[n - 1];
  const top = points[0];
  const dir = side === 'left' ? -1 : 1;

  const topY = top.y - railH * 0.6;
  const newelTopY = newel.y - railH * 0.62;
  let rail = `M ${top.x} ${topY}`;
  for (let i = 1; i < n; i++) {
    const p = points[i];
    rail += ` L ${p.x} ${p.y - railH * 0.6 - (i === n - 1 ? 2 : 0)}`;
  }

  const scrollSpots = [];
  for (let i = 1; i < n - 1; i += Math.max(2, Math.floor(n / 3))) {
    const p = points[i];
    scrollSpots.push({ x: p.x, y: p.y - railH * 0.3 });
  }

  return (
    <g className={`stair-rail-${side}`}>
      <IronStroke d={rail} w={5} color={IRON.deep} />

      {points.slice(0, n - 1).map((p, i) => {
        const { main, ticks } = twistBar(p.x, p.y - railH * 0.6 + 3, p.y);
        return (
          <g key={i}>
            <IronStroke d={main} w={2.6} />
            <path d={ticks} stroke={IRON.line} strokeWidth={1.1}
              opacity={0.48} fill="none" strokeLinecap="round" />
          </g>
        );
      })}

      {scrollSpots.map((s, i) => (
        <g key={i}>
          <IronStroke d={cScroll(s.x, s.y - railH * 0.08, 11, dir, 1.2)} w={2.2} color={IRON.bright} />
          <IronStroke d={cScroll(s.x, s.y + railH * 0.08, 11, -dir, 1.2)} w={2.2} color={IRON.bright} />
          <IronStroke d={`M ${s.x} ${s.y - railH * 0.08} L ${s.x} ${s.y + railH * 0.08}`} w={1.8} />
        </g>
      ))}

      <DrumNewel x={newel.x} y={newel.y} h={railH * 0.68} dir={dir} />
    </g>
  );
}

type DrumNewelProps = {
  x: number;
  y: number;
  h: number;
  dir: number;
}

function DrumNewel({ x, y, h, dir }: DrumNewelProps) {
  const rx = 15, ry = 5;
  const topY = y - h;

  return (
    <g className="newel">
      <IronFill d={`M ${x - rx - 3} ${y} A ${rx + 3} ${ry + 2} 0 1 0 ${x + rx + 3} ${y}
                    A ${rx + 3} ${ry + 2} 0 1 0 ${x - rx - 3} ${y} Z`} color={IRON.deep} />
      <path d={`M ${x - rx - 3} ${y} L ${x - rx - 3} ${y + 8} A ${rx + 3} ${ry + 2} 0 1 0 ${x + rx + 3} ${y + 8} L ${x + rx + 3} ${y}`}
        fill={IRON.deep} opacity={0.85} />
      <path d={`M ${x - rx - 3} ${y + 8} A ${rx + 3} ${ry + 2} 0 1 0 ${x + rx + 3} ${y + 8}`}
        fill="none" stroke={IRON.line} strokeWidth={1.5} opacity={0.6} />

      {[-0.7, -0.35, 0, 0.35, 0.7].map((t, i) => {
        const bx = x + t * rx * 1.4;
        const { main, ticks } = twistBar(bx, topY + 4, y - 2);
        return (
          <g key={i}>
            <IronStroke d={main} w={i === 2 ? 3.8 : 2.6} color={i === 2 ? IRON.deep : IRON.mid} />
            <path d={ticks} stroke={IRON.line} strokeWidth={1} opacity={0.42} fill="none" />
          </g>
        );
      })}

      <IronFill d={`M ${x - rx} ${topY} A ${rx} ${ry} 0 1 0 ${x + rx} ${topY}
                    A ${rx} ${ry} 0 1 0 ${x - rx} ${topY} Z`} color={IRON.mid} />
      <ellipse cx={x} cy={topY} rx={rx * 0.6} ry={ry * 0.6} fill={IRON.bright} opacity={0.4} />

      <Finial x={x} y={topY - 2} />
    </g>
  );
}
