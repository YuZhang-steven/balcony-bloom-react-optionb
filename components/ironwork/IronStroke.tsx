/**
 * Ironwork primitives — SVG components for rendering wrought-iron decorative elements.
 *
 * IronStroke renders a thick outlined stroke by layering two SVG <path> elements:
 *   1. A wider, semi-transparent path (IRON.line) acts as a dark border/cast-shadow.
 *   2. A narrower, fully-opaque path sits on top in the requested color.
 * Together this simulates a round iron bar with depth, as used on balconies and pilasters.
 *
 * IronFill is a plain filled path — suitable for flat iron shapes like finials and rosette centers.
 *
 * Finial and Rosette are pre-composed decorative end-pieces built from IronFill/IronStroke
 * and positioned at a given (x, y). They are typically placed at railing posts or pilaster tops.
 *
 * Usage example:
 *   <IronStroke d="M 0 0 L 100 100" w={4} color={IRON.deep} />
 *   <Finial x={50} y={200} />
 */

import { IRON } from '../game/palettes';

interface IronStrokeProps {
  d: string;      // SVG path data (M/L/Q/C commands)
  w?: number;     // Core stroke width in px (default 3)
  color?: string; // Stroke color key from IRON palette (default IRON.mid)
}

/**
 * Renders a round iron bar stroke with a subtle raised/beveled appearance.
 * The outer path simulates a cast-iron edge; the inner path provides the face color.
 */
export function IronStroke({ d, w = 3, color = IRON.mid }: IronStrokeProps) {
  return (
    <>
      {/* Outer "shadow" stroke — slightly wider, semi-transparent, darker color */}
      <path
        d={d}
        fill="none"
        stroke={IRON.line}
        strokeWidth={w + 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.78}
      />
      {/* Inner "face" stroke — nominal width, full color */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

interface IronFillProps {
  d: string;      // SVG path data
  color?: string; // Fill color (default IRON.mid)
}

/** Plain filled path for flat iron shapes (centers, finial blades, rosette cores). */
export function IronFill({ d, color = IRON.mid }: IronFillProps) {
  return (
    <path d={d} fill={color} />
  );
}

interface FinialProps {
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

interface RosetteProps {
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
