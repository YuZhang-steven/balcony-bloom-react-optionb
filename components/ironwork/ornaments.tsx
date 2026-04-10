/**
 * Ornamental ironwork end-pieces — pre-composed decorative elements built on top of
 * IronStroke and IronFill primitives.
 *
 * Exports:
 *   Finial  — decorative cap for pilasters and railing posts
 *   Rosette — circular ornamental plate for joints and bracket ends
 *
 * Usage example:
 *   <Finial x={50} y={200} />
 *   <Rosette x={100} y={100} r={12} />
 */

import { IRON } from '../game/palettes';
import { IronFill } from './IronStroke';

type FinialProps = {
  x: number; // Tip x coordinate
  y: number; // Tip y coordinate
}

/**
 * Decorative finial cap for the top of a pilaster or railing post.
 *
 * Composed of four stacked layers (bottom to top in render order):
 *   1. Flat diamond-shaped bar at the base
 *   2. Dome-shaped cap in IRON.mid
 *   3. Highlight ellipse on the dome face for a 3-D sheen
 *   4. Curled top finial blade in IRON.deep
 */
export function Finial({ x, y }: FinialProps) {
  return (
    <g>
      <IronFill
        d={`M ${x - 8} ${y} L ${x + 8} ${y} L ${x + 6} ${y - 5} L ${x - 6} ${y - 5} Z`}
        color={IRON.deep}
      />
      <IronFill
        d={`M ${x} ${y - 18} A 9 9 0 1 0 ${x + 0.01} ${y - 18} Z`}
        color={IRON.mid}
      />
      <ellipse
        cx={x - 2}
        cy={y - 16}
        rx={3.2}
        ry={4}
        fill={IRON.bright}
        opacity={0.65}
      />
      <IronFill
        d={`M ${x - 3} ${y - 25} Q ${x} ${y - 31} ${x + 3} ${y - 25} L ${x + 2} ${y - 22} L ${x - 2} ${y - 22} Z`}
        color={IRON.deep}
      />
    </g>
  );
}

type RosetteProps = {
  x: number; // Center x
  y: number; // Center y
  r: number; // Outer radius
}

/**
 * Circular ornamental rosette plate, typical of iron railing joints and bracket ends.
 *
 * Structure:
 *   1. Outer circle in IRON.mid
 *   2. Six petal ellipses arranged radially around the center, filled with IRON.bright
 *   3. Solid center dot in IRON.deep
 *
 * The petals are rotated to align with their radial angle so the ellipse long-axis
 * follows the radius from the center.
 */
export function Rosette({ x, y, r }: RosetteProps) {
  return (
    <g>
      <IronFill
        d={`M ${x - r} ${y} A ${r} ${r} 0 1 0 ${x + r} ${y} A ${r} ${r} 0 1 0 ${x - r} ${y} Z`}
      />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i * Math.PI) / 3;
        const px = x + Math.cos(a) * r * 0.55;
        const py = y + Math.sin(a) * r * 0.55;
        return (
          <ellipse
            key={i}
            cx={px}
            cy={py}
            rx={r * 0.32}
            ry={r * 0.2}
            fill={IRON.bright}
            transform={`rotate(${(a * 180) / Math.PI} ${px} ${py})`}
          />
        );
      })}
      <circle cx={x} cy={y} r={r * 0.22} fill={IRON.deep} />
    </g>
  );
}
