import { IronStroke } from '../ironwork/IronStroke';
import { Quatrefoil, Fleur, Heart, SOrnament, Knot, Pendant } from '../ironwork/motifs';
import { IRON } from '../game/palettes';
import { useRegisterAnchors } from '../game/AnchorContext';
import { pick, irand } from '../game/random';
import type { Anchor } from '../../types';

/** Target vertical step (px) when splitting the pilaster height into motif rows. */
const CELL_H = 54;

/** Motif id → SVG subtree; `s` is the nominal size (some motifs scale it for balance). */
const MOTIF_LIB: Record<string, (s: number) => React.ReactNode> = {
  quatrefoil: (s) => <Quatrefoil s={s} />,
  fleur: (s) => <Fleur s={s} />,
  heart: (s) => <Heart s={s * 0.85} />,
  sornament: (s) => <SOrnament s={s * 0.9} />,
  knot: (s) => <Knot s={s * 0.8} />,
};
const MOTIF_KEYS = Object.keys(MOTIF_LIB);

/** Builds a 2- or 3-item motif name list: first two differ; third is optional for taller pilasters. */
export function pickPilasterSequence(): string[] {
  const a = pick(MOTIF_KEYS);
  let b = pick(MOTIF_KEYS);
  while (b === a) b = pick(MOTIF_KEYS);
  return irand(0, 2) === 0 ? [a, b] : [a, b, pick(MOTIF_KEYS)];
}

type PilasterProps = {
  x: number;           // Center x coordinate of the pilaster
  topY: number;        // y coordinate at the top of the pilaster
  bottomY: number;     // y coordinate at the bottom of the pilaster
  w?: number;          // Pilaster width (default 38)
  sequence: string[];  // Motif name sequence, cycled vertically
}

export function Pilaster({ x, topY, bottomY, w = 38, sequence }: PilasterProps) {
  const h = bottomY - topY;  // Total pilaster height
  const cx = x;

  // Divide the height into cells; each cell holds one motif
  const nCells = Math.max(3, Math.round(h / CELL_H));
  const cellH = h / nCells;  // Actual height of each cell
  const s = Math.min(cellH * 0.42, w * 0.45); // Motif size: smaller of cell height and column width constraints

  // Register anchor points for climbing plants (vines, etc.)
  // Place 2–3 anchors evenly along the column; t controls vertical position as a fraction of height
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
      {/* Left and right iron border lines */}
      <IronStroke d={`M ${cx - w / 2} ${topY} L ${cx - w / 2} ${bottomY}`} w={3.8} color={IRON.deep} />
      <IronStroke d={`M ${cx + w / 2} ${topY} L ${cx + w / 2} ${bottomY}`} w={3.8} color={IRON.deep} />
      {/* Center thin iron bar as a decorative column face detail */}
      <IronStroke d={`M ${cx} ${topY + 4} L ${cx} ${bottomY - 4}`} w={1.8} color={IRON.mid} />

      {/* Arrange motifs vertically along the pilaster */}
      {Array.from({ length: nCells }).map((_, i) => {
        const cy = topY + cellH * (i + 0.5);  // Center y of this cell
        const key = sequence[i % sequence.length];  // Cycle through the motif sequence
        const motif = MOTIF_LIB[key];
        // Show a pendant only at odd-indexed cells (not the bottom-most) between cells
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
