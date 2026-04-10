/**
 * motifTypes.ts — shared types for the Motif Studio
 *
 * All motif geometry is stored as NormalizedSpline — coordinates are fractions
 * of the nominal size `s`. At render time, multiply by `s` to get pixel positions,
 * then pass to the spline() builder to produce an IronStrokeModel.
 *
 * Example: a coordinate [0.55, -0.55] at s=24 becomes [13.2, -13.2] in px.
 */

// ── Geometry ─────────────────────────────────────────────────────────────────

/** A 2D point stored as fractions of `s`. */
export type Pt2 = [number, number];

/**
 * One step of a normalized spline.
 *   { to }              — straight line
 *   { to, q }           — quadratic bezier (one control point)
 *   { to, c1, c2 }      — cubic bezier (two control points)
 */
export type NormalizedStep =
  | { to: Pt2 }
  | { to: Pt2; q: Pt2 }
  | { to: Pt2; c1: Pt2; c2: Pt2 };

/**
 * A parametric spline whose coordinates are fractions of `s`.
 * Fully serializable to JSON (no functions, no strings).
 */
export interface NormalizedSpline {
  start: Pt2;
  steps: NormalizedStep[];
}

// ── Symmetry / Mode ──────────────────────────────────────────────────────────

export type SymmetryMode = 'none' | 'MirrorH' | 'MirrorV' | 'Mirror4' | 'Rotate2';
export type MotifMode = 'stroke' | 'fill';

// ── Extras ───────────────────────────────────────────────────────────────────

/** An extra overlay stroke on a motif (e.g. Fleur's spiral accent). */
export interface MotifExtras {
  spline: NormalizedSpline;
  w?: number;
  color?: string;
}

// ── StrokeConfig ─────────────────────────────────────────────────────────────

/** Full configuration for a single motif in the studio. */
export interface StrokeConfig {
  name: string;
  spline: NormalizedSpline;
  w: number;
  color: string;
  symmetry: SymmetryMode;
  mode: MotifMode;
  fillColor?: string;
  extras?: MotifExtras;
  builtIn?: boolean;
}

// ── Studio state ─────────────────────────────────────────────────────────────

export interface MotifStudioState {
  active: StrokeConfig;
  strokes: StrokeConfig[];
}
