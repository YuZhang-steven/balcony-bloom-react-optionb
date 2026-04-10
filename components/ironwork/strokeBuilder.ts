/**
 * IronStroke Model Builders
 *
 * Ergonomic factory functions that produce IronStrokeModel objects.
 * Use these at call sites instead of constructing models by hand.
 *
 * Builder hierarchy (simple → complex):
 *   line()            — two-point straight segment
 *   polyline()        — multi-point connected line segments
 *   curve()           — single cubic bezier
 *   spline()          — multi-segment path (line / quad / cubic steps)
 *   fromNormalized()  — scale a NormalizedSpline by `s` into an IronStrokeModel
 */

import type { IronStrokeModel, JoinStyle, StrokeNode, StrokeSegment, StrokePaint } from './strokeTypes';
import { IRON } from '../game/palettes';

// ─── Shared options ──────────────────────────────────────────────────────────

export type StrokeOpts = {
  w?: number;
  color?: string;
  cap?: 'round' | 'butt' | 'square';
  join?: JoinStyle;
  id?: string;
  closed?: boolean;
};

type Pt = [number, number];

const DEFAULT_W = 3;

function paint(color?: string): StrokePaint {
  return { kind: 'solid', color: color ?? IRON.mid };
}

let _uid = 0;
function uid(prefix = 'b'): string {
  return `${prefix}${_uid++}`;
}

// ─── line ────────────────────────────────────────────────────────────────────

/** Straight line between two points. */
export function line(from: Pt, to: Pt, opts: StrokeOpts = {}): IronStrokeModel {
  const w = opts.w ?? DEFAULT_W;
  const a: StrokeNode = { id: 'a', x: from[0], y: from[1], width: w };
  const b: StrokeNode = { id: 'b', x: to[0],   y: to[1],   width: w };
  return {
    id: opts.id ?? uid('ln'),
    nodes: [a, b],
    segments: [{ from: 'a', to: 'b', kind: 'line' }],
    paint: paint(opts.color),
    cap: opts.cap ?? 'round',
    defaultJoin: opts.join ?? 'round',
    closed: opts.closed,
  };
}

// ─── polyline ────────────────────────────────────────────────────────────────

/** Connected straight segments through N points. */
export function polyline(points: Pt[], opts: StrokeOpts = {}): IronStrokeModel {
  const w = opts.w ?? DEFAULT_W;
  const nodes: StrokeNode[] = points.map((p, i) => ({
    id: `p${i}`,
    x: p[0],
    y: p[1],
    width: w,
  }));
  const segments: StrokeSegment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    segments.push({ from: `p${i}`, to: `p${i + 1}`, kind: 'line' });
  }
  if (opts.closed && points.length > 2) {
    segments.push({ from: `p${points.length - 1}`, to: 'p0', kind: 'line' });
  }
  return {
    id: opts.id ?? uid('pl'),
    nodes,
    segments,
    paint: paint(opts.color),
    cap: opts.cap ?? 'round',
    defaultJoin: opts.join ?? 'round',
    closed: opts.closed,
  };
}

// ─── curve ───────────────────────────────────────────────────────────────────

/** Single cubic bezier between two points with explicit control handles. */
export function curve(
  from: Pt,
  to: Pt,
  c1: Pt,
  c2: Pt,
  opts: StrokeOpts = {},
): IronStrokeModel {
  const w = opts.w ?? DEFAULT_W;
  const a: StrokeNode = { id: 'a', x: from[0], y: from[1], out: { x: c1[0], y: c1[1] }, width: w };
  const b: StrokeNode = { id: 'b', x: to[0],   y: to[1],   in:  { x: c2[0], y: c2[1] }, width: w };
  return {
    id: opts.id ?? uid('cv'),
    nodes: [a, b],
    segments: [{ from: 'a', to: 'b', kind: 'cubic' }],
    paint: paint(opts.color),
    cap: opts.cap ?? 'round',
    defaultJoin: opts.join ?? 'round',
  };
}

// ─── spline ──────────────────────────────────────────────────────────────────

/**
 * Describes one segment of a spline.
 *   { to }              — straight line
 *   { to, q }           — quadratic bezier (one control point)
 *   { to, c1, c2 }      — cubic bezier (two control points)
 */
export type SplineStep =
  | { to: Pt }
  | { to: Pt; q: Pt }
  | { to: Pt; c1: Pt; c2: Pt };

function isQuad(s: SplineStep): s is { to: Pt; q: Pt } {
  return 'q' in s;
}
function isCubic(s: SplineStep): s is { to: Pt; c1: Pt; c2: Pt } {
  return 'c1' in s;
}

/**
 * Promote a quadratic bezier to an equivalent cubic.
 * Identity: C1 = P0 + 2/3·(CP − P0),  C2 = P1 + 2/3·(CP − P1)
 */
function quadToCubicHandles(
  from: Pt,
  cp: Pt,
  to: Pt,
): { c1: Pt; c2: Pt } {
  return {
    c1: [from[0] + (2 / 3) * (cp[0] - from[0]), from[1] + (2 / 3) * (cp[1] - from[1])],
    c2: [to[0]   + (2 / 3) * (cp[0] - to[0]),   to[1]   + (2 / 3) * (cp[1] - to[1])],
  };
}

/**
 * Build a multi-segment spline from a start point and an array of steps.
 *
 * Example — Quatrefoil quarter-lobe:
 * ```
 * spline(
 *   [0, -s * 0.15],
 *   [
 *     { to: [s*0.55, -s*0.55], q: [s*0.15, -s*0.7]  },
 *     { to: [s*0.15, 0],       q: [s*0.7,  -s*0.15] },
 *   ],
 *   { w: 2.6 },
 * )
 * ```
 */
export function spline(start: Pt, steps: SplineStep[], opts: StrokeOpts = {}): IronStrokeModel {
  const w = opts.w ?? DEFAULT_W;
  const nodes: StrokeNode[] = [];
  const segments: StrokeSegment[] = [];

  nodes.push({ id: 'n0', x: start[0], y: start[1], width: w });

  let prev: Pt = start;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const fromId = `n${i}`;
    const toId = `n${i + 1}`;

    if (isCubic(step)) {
      nodes[nodes.length - 1].out = { x: step.c1[0], y: step.c1[1] };
      nodes.push({ id: toId, x: step.to[0], y: step.to[1], in: { x: step.c2[0], y: step.c2[1] }, width: w });
      segments.push({ from: fromId, to: toId, kind: 'cubic' });
    } else if (isQuad(step)) {
      const { c1, c2 } = quadToCubicHandles(prev, step.q, step.to);
      nodes[nodes.length - 1].out = { x: c1[0], y: c1[1] };
      nodes.push({ id: toId, x: step.to[0], y: step.to[1], in: { x: c2[0], y: c2[1] }, width: w });
      segments.push({ from: fromId, to: toId, kind: 'cubic' });
    } else {
      nodes.push({ id: toId, x: step.to[0], y: step.to[1], width: w });
      segments.push({ from: fromId, to: toId, kind: 'line' });
    }

    prev = step.to;
  }

  if (opts.closed && nodes.length > 2) {
    segments.push({ from: `n${steps.length}`, to: 'n0', kind: 'line' });
  }

  return {
    id: opts.id ?? uid('sp'),
    nodes,
    segments,
    paint: paint(opts.color),
    cap: opts.cap ?? 'round',
    defaultJoin: opts.join ?? 'round',
    closed: opts.closed,
  };
}

// ─── fromNormalized ──────────────────────────────────────────────────────────

import type { NormalizedSpline, NormalizedStep, Pt2 } from '../motif-studio/motifTypes';

/** Scale a Pt2 (fractions of `s`) to pixel coordinates. */
function scalePt(p: Pt2, s: number): Pt {
  return [p[0] * s, p[1] * s];
}

/** Scale a NormalizedStep by `s`. */
function scaleStep(step: NormalizedStep, s: number): SplineStep {
  if ('c1' in step) {
    return { to: scalePt(step.to, s), c1: scalePt(step.c1, s), c2: scalePt(step.c2, s) };
  }
  if ('q' in step) {
    return { to: scalePt(step.to, s), q: scalePt(step.q, s) };
  }
  return { to: scalePt(step.to, s) };
}

/**
 * Build an IronStrokeModel from a NormalizedSpline at a given size `s`.
 *
 * This is the primary bridge between the Motif Studio's parametric data
 * and the rendering pipeline. All coordinates in the spline are fractions of `s`.
 *
 * Usage:
 *   const model = fromNormalized(config.spline, s, { w: config.w, color: config.color });
 *   <IronStroke stroke={model} />
 */
export function fromNormalized(
  ns: NormalizedSpline,
  s: number,
  opts: StrokeOpts = {},
): IronStrokeModel {
  return spline(
    scalePt(ns.start, s),
    ns.steps.map(step => scaleStep(step, s)),
    opts,
  );
}
