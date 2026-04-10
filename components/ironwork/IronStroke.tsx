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
 * Ornamental end-pieces (Finial, Rosette) are exported from the sibling ornaments.tsx file.
 */

import { IRON } from '../game/palettes';

export type IronStrokeProps = {
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

export type IronFillProps = {
  d: string;      // SVG path data
  color?: string; // Fill color (default IRON.mid)
}

/** Plain filled path for flat iron shapes (centers, finial blades, rosette cores). */
export function IronFill({ d, color = IRON.mid }: IronFillProps) {
  return (
    <path d={d} fill={color} />
  );
}

