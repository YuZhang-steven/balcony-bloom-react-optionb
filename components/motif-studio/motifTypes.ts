/**
 * motifTypes.ts — shared types for the Motif Studio
 */

import type { ReactNode } from 'react';

/** How the motif is mirrored/duplicated */
export type SymmetryMode = 'none' | 'MirrorH' | 'MirrorV' | 'Mirror4' | 'Rotate2';

/** Available built-in motif names */
export type BuiltInMotifKind =
  | 'Quatrefoil'
  | 'Fleur'
  | 'Heart'
  | 'SOrnament'
  | 'Knot'
  | 'Pendant';

/** All motif names including user-defined */
export type MotifKind = BuiltInMotifKind | string;

/** Whether the motif uses IronStroke (outlined) or IronFill (solid) */
export type MotifMode = 'stroke' | 'fill';

/** Extra stroke path(s) overlaid on the main motif (e.g. Fleur's spiral accent) */
export interface MotifExtras {
  path: string;
  w?: number;
  color?: string;
}

/** Full configuration for a single stroke motif */
export interface StrokeConfig {
  /** Unique identifier — built-in name or user-assigned */
  name: MotifKind;
  /** SVG path `d` attribute — represents one quadrant/half/single unit depending on symmetry */
  path: string;
  /** Stroke width in px */
  w: number;
  /** CSS color string */
  color: string;
  /** How to mirror/duplicate the path */
  symmetry: SymmetryMode;
  /** Use IronFill instead of IronStroke */
  mode: MotifMode;
  /** Optional fill color (used when mode === 'fill') */
  fillColor?: string;
  /** Extra stroke(s) overlaid on the main path (e.g. Fleur's spiral accent).
   *  The function receives the current `s` value and returns the extra path config. */
  extras?: (props: { s: number }) => MotifExtras;
  /** Whether this is a built-in (protected from deletion) */
  builtIn?: boolean;
}

/** The complete state of the Motif Studio at any moment */
export interface MotifStudioState {
  /** Currently selected motif config */
  active: StrokeConfig;
  /** All registered motifs (built-in + user-defined) */
  strokes: StrokeConfig[];
}
