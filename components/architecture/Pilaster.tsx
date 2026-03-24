import { IronStroke } from '../ironwork/IronStroke';
import { Quatrefoil, Fleur, Heart, SOrnament, Knot, Pendant } from '../ironwork/motifs';
import { IRON } from '../game/palettes';
import { useRegisterAnchors } from '../game/AnchorContext';
import { pick, irand } from '../game/random';
import type { Anchor } from '../../types';

const CELL_H = 54;

const MOTIF_LIB: Record<string, (s: number) => React.ReactNode> = {
  quatrefoil: (s) => <Quatrefoil s={s} />,
  fleur: (s) => <Fleur s={s} />,
  heart: (s) => <Heart s={s * 0.85} />,
  sornament: (s) => <SOrnament s={s * 0.9} />,
  knot: (s) => <Knot s={s * 0.8} />,
};
const MOTIF_KEYS = Object.keys(MOTIF_LIB);

export function pickPilasterSequence(): string[] {
  const a = pick(MOTIF_KEYS);
  let b = pick(MOTIF_KEYS);
  while (b === a) b = pick(MOTIF_KEYS);
  return irand(0, 2) === 0 ? [a, b] : [a, b, pick(MOTIF_KEYS)];
}

interface PilasterProps {
  x: number;
  topY: number;
  bottomY: number;
  w?: number;
  sequence: string[];
}

export function Pilaster({ x, topY, bottomY, w = 38, sequence }: PilasterProps) {
  const h = bottomY - topY;
  const cx = x;

  const nCells = Math.max(3, Math.round(h / CELL_H));
  const cellH = h / nCells;
  const s = Math.min(cellH * 0.42, w * 0.45);

  const anchors: Anchor[] = [];
  for (let t = 0.25; t < 0.9; t += 0.3) {
    anchors.push({
      x: cx, y: topY + h * t, kind: 'column',
      meta: { col: cx, top: topY, bottom: bottomY }
    });
  }
  useRegisterAnchors(anchors);

  return (
    <g className="pilaster">
      <IronStroke d={`M ${cx - w / 2} ${topY} L ${cx - w / 2} ${bottomY}`} w={3.8} color={IRON.deep} />
      <IronStroke d={`M ${cx + w / 2} ${topY} L ${cx + w / 2} ${bottomY}`} w={3.8} color={IRON.deep} />
      <IronStroke d={`M ${cx} ${topY + 4} L ${cx} ${bottomY - 4}`} w={1.8} color={IRON.mid} />

      {Array.from({ length: nCells }).map((_, i) => {
        const cy = topY + cellH * (i + 0.5);
        const key = sequence[i % sequence.length];
        const motif = MOTIF_LIB[key];
        const showPendant = i < nCells - 1 && i % 2 === 1;
        return (
          <g key={i}>
            <g transform={`translate(${cx} ${cy})`}>{motif(s)}</g>
            {showPendant && (
              <g transform={`translate(${cx} ${cy + cellH * 0.38})`}>
                <Pendant len={cellH * 0.16} />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}
