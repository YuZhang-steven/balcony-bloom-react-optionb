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
 * Available motifs:
 *   Quatrefoil  — four-lobed compass-rose shape (Mirror4)
 *   Fleur        — fleur-de-lis style scroll (MirrorH)
 *   Heart        — heart or shield silhouette (MirrorH)
 *   SOrnament    — S-curved scroll (Rotate2)
 *   Knot         — interlocked loop knot (Mirror4)
 *   Pendant      — hanging drop ornament, no symmetry (self-contained)
 *
 * Usage example:
 *   <g transform="translate(120, 200)">
 *     <Quatrefoil s={24} />
 *   </g>
 */

import { IronStroke, IronFill } from './IronStroke';
import { MirrorH, Mirror4, Rotate2 } from './Symmetry';
import { IRON } from '../game/palettes';

// Re-export the built-in stroke registry so MotifStudio can seed from it
export { BUILT_IN_STROKES } from '../motif-studio/motifRegistry';

type QuatrefoilProps = {
  s: number;  // Nominal size (bounding-box radius)
  w?: number; // Stroke width (default 2.6)
}

/**
 * Four-lobed quatrefoil ornament, built by mirroring a single quarter-lobe
 * through four quadrants. A small center dot anchors the crossing.
 */
export function Quatrefoil({ s, w = 2.6 }: QuatrefoilProps) {
  // One quarter-lobe: starts near center, curves outward to the top-right
  const quarter = `M 0 ${-s * 0.15}
    Q ${s * 0.15} ${-s * 0.7} ${s * 0.55} ${-s * 0.55}
    Q ${s * 0.7} ${-s * 0.15} ${s * 0.15} 0`;
  return (
    <g>
      <Mirror4>
        <IronStroke d={quarter} w={w} />
      </Mirror4>
      <circle cx={0} cy={0} r={s * 0.12} fill={IRON.deep} />
    </g>
  );
}

type FleurProps = {
  s: number;  // Nominal size
  w?: number; // Stroke width (default 2.5)
}

/**
 * Fleur-de-lis style ornament: a central upward-pointing blade mirrored horizontally,
 * with a secondary lighter spiral added on the right side for contrast.
 */
export function Fleur({ s, w = 2.5 }: FleurProps) {
  // Central upward blade: starts at tip, curves back toward the center
  const tipS = `M 0 ${-s * 0.95}
    Q ${s * 0.18} ${-s * 0.65} ${s * 0.08} ${-s * 0.35}
    Q 0 ${-s * 0.12} 0 0`;
  // Decorative spiral on the right half — rendered in IRON.bright to stand out
  const spiral = `M 0 ${s * 0.05}
    Q ${s * 0.45} ${s * 0.08} ${s * 0.52} ${s * 0.42}
    Q ${s * 0.56} ${s * 0.72} ${s * 0.32} ${s * 0.78}
    Q ${s * 0.14} ${s * 0.8} ${s * 0.15} ${s * 0.62}
    Q ${s * 0.18} ${s * 0.48} ${s * 0.3} ${s * 0.5}`;
  return (
    <MirrorH>
      <IronStroke d={tipS} w={w} />
      <IronStroke d={spiral} w={w * 0.9} color={IRON.bright} />
    </MirrorH>
  );
}

type HeartProps = {
  s: number;  // Nominal size
  w?: number; // Stroke width (default 2.6)
}

/** Heart / shield-shaped motif; drawn as a right half and mirrored horizontally. */
export function Heart({ s, w = 2.6 }: HeartProps) {
  const half = `M 0 ${s}
    Q ${s * 0.9} ${s * 0.3} ${s * 0.7} ${-s * 0.3}
    Q ${s * 0.5} ${-s * 0.85} ${s * 0.05} ${-s * 0.55}
    Q ${-s * 0.22} ${-s * 0.32} 0 ${-s * 0.05}`;
  return <MirrorH><IronStroke d={half} w={w} /></MirrorH>;
}

type SOrnamentProps = {
  s: number;  // Nominal size
  w?: number; // Stroke width (default 2.8)
}

/** S-curved double scroll ornament; drawn as a right half and rotated 180° for symmetry. */
export function SOrnament({ s, w = 2.8 }: SOrnamentProps) {
  const half = `M ${-s * 0.05} ${s * 0.15}
    Q ${s * 0.35} ${-s * 0.1} ${s * 0.45} ${-s * 0.5}
    Q ${s * 0.52} ${-s * 0.85} ${s * 0.22} ${-s * 0.92}
    Q ${-s * 0.02} ${-s * 0.95} ${-s * 0.06} ${-s * 0.72}
    Q ${-s * 0.08} ${-s * 0.55} ${s * 0.1} ${-s * 0.55}`;
  return <Rotate2><IronStroke d={half} w={w} /></Rotate2>;
}

type KnotProps = {
  s: number;  // Nominal size
  w?: number; // Stroke width (default 2.4)
}

/** Interlocked loop knot; drawn as a quarter-curve and mirrored four times.
 *  Rendered in IRON.bright for a lighter, open-work appearance. */
export function Knot({ s, w = 2.4 }: KnotProps) {
  const q = `M 0 0
    Q ${s * 0.12} ${-s * 0.35} ${s * 0.45} ${-s * 0.45}
    Q ${s * 0.78} ${-s * 0.52} ${s * 0.65} ${-s * 0.2}
    Q ${s * 0.52} ${s * 0.05} ${s * 0.2} 0`;
  return <Mirror4><IronStroke d={q} w={w} color={IRON.bright} /></Mirror4>;
}

type PendantProps = {
  len?: number; // Length of the hanging bar in px (default 14)
}

/**
 * Hanging pendant ornament — a short iron bar with a teardrop-shaped weight at the end.
 * Used between motif cells in pilasters to add vertical rhythm.
 * Self-contained: does not use a symmetry wrapper.
 */
export function Pendant({ len = 14 }: PendantProps) {
  return (
    <g>
      <IronStroke d={`M 0 0 L 0 ${len}`} w={1.8} />
      <IronFill d={`M 0 ${len} Q -3.5 ${len + 4} 0 ${len + 10} Q 3.5 ${len + 4} 0 ${len} Z`}
        color={IRON.deep} />
    </g>
  );
}
