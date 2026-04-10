/**
 * Motifs — parametric wrought-iron decorative motifs for pilasters and railings.
 *
 * All motif components accept a `s` prop (nominal size) and an optional `w` prop
 * (stroke width, defaults vary per motif). They return SVG groups anchored at (0, 0)
 * so they can be freely translated/rotated by the parent via a <g transform="...">.
 *
 * Motifs are designed to be used inside symmetry wrappers (MirrorH, Mirror4, Rotate2)
 * from ./Symmetry — each component only draws one quadrant or half, and the wrapper
 * mirrors/duplicates it to fill the full motif.
 *
 * All geometry is defined as point arrays via the spline() builder — no raw SVG
 * path strings. Each quadratic Q segment is expressed as { to, q } where q is the
 * control point and to is the endpoint.
 *
 * Available motifs:
 *   Quatrefoil  — four-lobed compass-rose shape (Mirror4)
 *   Fleur       — fleur-de-lis style scroll (MirrorH)
 *   Heart       — heart or shield silhouette (MirrorH)
 *   SOrnament   — S-curved scroll (Rotate2)
 *   Knot        — interlocked loop knot (Mirror4)
 *   Pendant     — hanging drop ornament, no symmetry (self-contained)
 */

import { IronStroke, IronFill } from './IronStroke';
import { spline, line } from './strokeBuilder';
import { MirrorH, Mirror4, Rotate2 } from './Symmetry';
import { IRON } from '../game/palettes';

export { BUILT_IN_STROKES } from '../motif-studio/motifRegistry';

type QuatrefoilProps = { s: number; w?: number };

/**
 * Four-lobed quatrefoil ornament.
 * One quarter-lobe: starts near center, curves outward to the top-right.
 */
export function Quatrefoil({ s, w = 2.6 }: QuatrefoilProps) {
  const quarter = spline(
    [0, -s * 0.15],
    [
      { to: [s * 0.55, -s * 0.55], q: [s * 0.15, -s * 0.7]  },
      { to: [s * 0.15, 0],         q: [s * 0.7,  -s * 0.15] },
    ],
    { w },
  );
  return (
    <g>
      <Mirror4><IronStroke stroke={quarter} /></Mirror4>
      <circle cx={0} cy={0} r={s * 0.12} fill={IRON.deep} />
    </g>
  );
}

type FleurProps = { s: number; w?: number };

/**
 * Fleur-de-lis style ornament: central blade + decorative spiral,
 * mirrored horizontally.
 */
export function Fleur({ s, w = 2.5 }: FleurProps) {
  const blade = spline(
    [0, -s * 0.95],
    [
      { to: [s * 0.08, -s * 0.35], q: [s * 0.18, -s * 0.65] },
      { to: [0, 0],                q: [0, -s * 0.12]         },
    ],
    { w },
  );
  const spiral = spline(
    [0, s * 0.05],
    [
      { to: [s * 0.52, s * 0.42], q: [s * 0.45, s * 0.08] },
      { to: [s * 0.32, s * 0.78], q: [s * 0.56, s * 0.72] },
      { to: [s * 0.15, s * 0.62], q: [s * 0.14, s * 0.8]  },
      { to: [s * 0.3,  s * 0.5],  q: [s * 0.18, s * 0.48] },
    ],
    { w: w * 0.9, color: IRON.bright },
  );
  return (
    <MirrorH>
      <IronStroke stroke={blade} />
      <IronStroke stroke={spiral} />
    </MirrorH>
  );
}

type HeartProps = { s: number; w?: number };

/** Heart / shield-shaped motif; drawn as a right half and mirrored horizontally. */
export function Heart({ s, w = 2.6 }: HeartProps) {
  const half = spline(
    [0, s],
    [
      { to: [s * 0.7,  -s * 0.3],  q: [s * 0.9,  s * 0.3]   },
      { to: [s * 0.05, -s * 0.55], q: [s * 0.5,  -s * 0.85] },
      { to: [0, -s * 0.05],        q: [-s * 0.22, -s * 0.32] },
    ],
    { w },
  );
  return <MirrorH><IronStroke stroke={half} /></MirrorH>;
}

type SOrnamentProps = { s: number; w?: number };

/** S-curved double scroll ornament; drawn as a right half and rotated 180deg. */
export function SOrnament({ s, w = 2.8 }: SOrnamentProps) {
  const half = spline(
    [-s * 0.05, s * 0.15],
    [
      { to: [s * 0.45, -s * 0.5],  q: [s * 0.35, -s * 0.1]  },
      { to: [s * 0.22, -s * 0.92], q: [s * 0.52, -s * 0.85] },
      { to: [-s * 0.06, -s * 0.72], q: [-s * 0.02, -s * 0.95] },
      { to: [s * 0.1,  -s * 0.55], q: [-s * 0.08, -s * 0.55] },
    ],
    { w },
  );
  return <Rotate2><IronStroke stroke={half} /></Rotate2>;
}

type KnotProps = { s: number; w?: number };

/** Interlocked loop knot; drawn as a quarter-curve and mirrored four times. */
export function Knot({ s, w = 2.4 }: KnotProps) {
  const quarter = spline(
    [0, 0],
    [
      { to: [s * 0.45, -s * 0.45], q: [s * 0.12, -s * 0.35] },
      { to: [s * 0.65, -s * 0.2],  q: [s * 0.78, -s * 0.52] },
      { to: [s * 0.2, 0],          q: [s * 0.52,  s * 0.05]  },
    ],
    { w, color: IRON.bright },
  );
  return <Mirror4><IronStroke stroke={quarter} /></Mirror4>;
}

type PendantProps = { len?: number };

/** Hanging pendant ornament — short iron bar with a teardrop weight. */
export function Pendant({ len = 14 }: PendantProps) {
  return (
    <g>
      <IronStroke stroke={line([0, 0], [0, len], { w: 1.8 })} />
      <IronFill
        d={`M 0 ${len} Q -3.5 ${len + 4} 0 ${len + 10} Q 3.5 ${len + 4} 0 ${len} Z`}
        color={IRON.deep}
      />
    </g>
  );
}
