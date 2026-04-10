/**
 * IronStroke Model Builders
 *
 * Ergonomic factory functions that produce IronStrokeModel objects.
 * Use these at call sites instead of constructing models by hand.
 *
 * Builder hierarchy (simple → complex):
 *   line()      — two-point straight segment
 *   polyline()  — multi-point connected line segments
 *   curve()     — single cubic bezier
 *   svgPath()   — parse arbitrary SVG path string into a model
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

// ─── svgPath ─────────────────────────────────────────────────────────────────

/**
 * Parse an SVG path string into an IronStrokeModel.
 *
 * Handles M/m, L/l, Q/q, C/c, Z/z commands.
 * Quadratics are subdivided into short line segments for the ribbon compiler.
 * This is the bridge from existing raw-path code to the new model layer.
 */
export function svgPath(d: string, opts: StrokeOpts = {}): IronStrokeModel {
  const w = opts.w ?? DEFAULT_W;
  const nodes: StrokeNode[] = [];
  const segments: StrokeSegment[] = [];
  let idCounter = 0;

  const tokens = d.trim().match(/[MLQTCZAmlqtcza][^MLQTCZAmlqtcza]*/g) ?? [];

  let curX = 0, curY = 0;
  let startX = 0, startY = 0;
  const SUBDIV = 6;

  for (const token of tokens) {
    const cmd = token[0];
    const nums = token.slice(1).trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);

    switch (cmd) {
      case 'M': {
        curX = nums[0] ?? curX; curY = nums[1] ?? curY;
        startX = curX; startY = curY;
        const id = `n${idCounter++}`;
        nodes.push({ id, x: curX, y: curY, width: w });
        break;
      }
      case 'm': {
        curX += nums[0] ?? 0; curY += nums[1] ?? 0;
        startX = curX; startY = curY;
        const id = `n${idCounter++}`;
        nodes.push({ id, x: curX, y: curY, width: w });
        break;
      }
      case 'L': {
        const nx = nums[0] ?? curX, ny = nums[1] ?? curY;
        const fromId = nodes[nodes.length - 1]?.id ?? `n${idCounter - 1}`;
        const toId = `n${idCounter++}`;
        nodes.push({ id: toId, x: nx, y: ny, width: w });
        segments.push({ from: fromId, to: toId, kind: 'line' });
        curX = nx; curY = ny;
        break;
      }
      case 'l': {
        const nx = curX + (nums[0] ?? 0), ny = curY + (nums[1] ?? 0);
        const fromId = nodes[nodes.length - 1]?.id ?? `n${idCounter - 1}`;
        const toId = `n${idCounter++}`;
        nodes.push({ id: toId, x: nx, y: ny, width: w });
        segments.push({ from: fromId, to: toId, kind: 'line' });
        curX = nx; curY = ny;
        break;
      }
      case 'Q': {
        const cx = nums[0] ?? curX, cy = nums[1] ?? curY;
        const ex = nums[2] ?? curX, ey = nums[3] ?? curY;
        const fromId = nodes[nodes.length - 1]?.id ?? `n${idCounter - 1}`;
        for (let i = 1; i <= SUBDIV; i++) {
          const t = i / SUBDIV;
          const mt = 1 - t;
          const bx = mt * mt * curX + 2 * mt * t * cx + t * t * ex;
          const by = mt * mt * curY + 2 * mt * t * cy + t * t * ey;
          const toId = `n${idCounter++}`;
          if (i === 1) nodes.push({ id: fromId, x: curX, y: curY, width: w });
          nodes.push({ id: toId, x: bx, y: by, width: w });
          segments.push({ from: i === 1 ? fromId : `n${idCounter - 2}`, to: toId, kind: 'line' });
        }
        curX = ex; curY = ey;
        break;
      }
      case 'q': {
        const cx = curX + (nums[0] ?? 0), cy = curY + (nums[1] ?? 0);
        const ex = curX + (nums[2] ?? 0), ey = curY + (nums[3] ?? 0);
        const fromId = nodes[nodes.length - 1]?.id ?? `n${idCounter - 1}`;
        for (let i = 1; i <= SUBDIV; i++) {
          const t = i / SUBDIV;
          const mt = 1 - t;
          const bx = mt * mt * curX + 2 * mt * t * cx + t * t * ex;
          const by = mt * mt * curY + 2 * mt * t * cy + t * t * ey;
          const toId = `n${idCounter++}`;
          if (i === 1) nodes.push({ id: fromId, x: curX, y: curY, width: w });
          nodes.push({ id: toId, x: bx, y: by, width: w });
          segments.push({ from: i === 1 ? fromId : `n${idCounter - 2}`, to: toId, kind: 'line' });
        }
        curX = ex; curY = ey;
        break;
      }
      case 'C': {
        const c1x = nums[0] ?? curX, c1y = nums[1] ?? curY;
        const c2x = nums[2] ?? curX, c2y = nums[3] ?? curY;
        const ex  = nums[4] ?? curX, ey  = nums[5] ?? curY;
        const fromId = nodes[nodes.length - 1]?.id ?? `n${idCounter - 1}`;
        const toId = `n${idCounter++}`;
        nodes.push({ id: fromId, x: curX, y: curY, out: { x: c1x, y: c1y }, width: w });
        nodes.push({ id: toId,   x: ex,   y: ey,   in:  { x: c2x, y: c2y }, width: w });
        segments.push({ from: fromId, to: toId, kind: 'cubic' });
        curX = ex; curY = ey;
        break;
      }
      case 'c': {
        const c1x = curX + (nums[0] ?? 0), c1y = curY + (nums[1] ?? 0);
        const c2x = curX + (nums[2] ?? 0), c2y = curY + (nums[3] ?? 0);
        const ex  = curX + (nums[4] ?? 0), ey  = curY + (nums[5] ?? 0);
        const fromId = nodes[nodes.length - 1]?.id ?? `n${idCounter - 1}`;
        const toId = `n${idCounter++}`;
        nodes.push({ id: fromId, x: curX, y: curY, out: { x: c1x, y: c1y }, width: w });
        nodes.push({ id: toId,   x: ex,   y: ey,   in:  { x: c2x, y: c2y }, width: w });
        segments.push({ from: fromId, to: toId, kind: 'cubic' });
        curX = ex; curY = ey;
        break;
      }
      case 'Z':
      case 'z': {
        const firstId = nodes[0]?.id;
        const lastId  = nodes[nodes.length - 1]?.id;
        if (firstId && lastId && firstId !== lastId) {
          segments.push({ from: lastId, to: firstId, kind: 'line' });
        }
        curX = startX; curY = startY;
        break;
      }
      default:
        break;
    }
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
