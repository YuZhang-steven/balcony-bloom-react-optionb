/**
 * Iron Primitives — parametric ironwork shape generators.
 *
 * Each function produces structured data compatible with the stroke builder layer.
 * Stroke-based shapes return IronStrokeModel directly.
 * Fill-based shapes (acanthus, bladeLeaf) return raw SVG path strings for IronFill.
 *
 * Tick marks (twistBar) are decorative hatching and remain raw SVG strings
 * since they render as plain <path> elements, not through the IronStroke pipeline.
 */

import type { IronStrokeModel } from './strokeTypes';
import type { StrokeOpts } from './strokeBuilder';
import { polyline, spline, line } from './strokeBuilder';

type Pt = [number, number];

// ─── cScroll ─────────────────────────────────────────────────────────────────

/**
 * C-shaped spiral scroll, sampled as a polyline.
 * Returns an IronStrokeModel ready for <IronStroke stroke={...} />.
 */
export function cScroll(
  cx: number,
  cy: number,
  r: number,
  dir = 1,
  turns = 1.35,
  opts: StrokeOpts = {},
): IronStrokeModel {
  const steps = 36;
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = dir * t * turns * Math.PI * 2;
    const rr = r * (1 - 0.62 * t);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return polyline(pts, opts);
}

// ─── greekKey ────────────────────────────────────────────────────────────────

/**
 * Greek key / meander pattern as a polyline.
 * Returns an IronStrokeModel.
 */
export function greekKey(
  x: number,
  y: number,
  w: number,
  h: number,
  opts: StrokeOpts = {},
): IronStrokeModel {
  const unit = h * 1.4;
  const pts: Pt[] = [[x, y + h]];
  let px = x;
  while (px < x + w - unit) {
    pts.push(
      [px, y],
      [px + unit * 0.5, y],
      [px + unit * 0.5, y + h * 0.55],
      [px + unit * 0.25, y + h * 0.55],
      [px + unit * 0.25, y + h * 0.3],
      [px + unit * 0.75, y + h * 0.3],
      [px + unit * 0.75, y + h],
      [px + unit, y + h],
    );
    px += unit;
  }
  pts.push([x + w, y + h]);
  return polyline(pts, opts);
}

// ─── twistBar ────────────────────────────────────────────────────────────────

/**
 * Vertical twisted bar: the main stroke is an IronStrokeModel (simple line),
 * the diagonal tick marks are a raw SVG path string for plain <path> rendering.
 */
export function twistBar(
  x: number,
  y1: number,
  y2: number,
  opts: StrokeOpts = {},
): { stroke: IronStrokeModel; ticks: string } {
  const stroke = line([x, y1], [x, y2], opts);
  const tickParts: string[] = [];
  const seg = 11;
  const n = Math.floor((y2 - y1) / seg);
  for (let i = 1; i < n; i++) {
    const ty = y1 + i * seg;
    tickParts.push(`M ${x - 2.4} ${ty - 1.7} L ${x + 2.4} ${ty + 1.7}`);
  }
  return { stroke, ticks: tickParts.join(' ') };
}

// ─── sScroll ─────────────────────────────────────────────────────────────────

/**
 * S-shaped scroll: spine + top spiral + bottom spiral.
 * Returns three IronStrokeModels.
 */
export function sScroll(
  x: number,
  y: number,
  w: number,
  h: number,
  opts: StrokeOpts = {},
): { spine: IronStrokeModel; top: IronStrokeModel; bottom: IronStrokeModel } {
  const r = Math.min(w, h) * 0.26;
  const tx = x + w * 0.25, ty = y + r * 0.9;
  const bx = x + w * 0.75, by = y + h - r * 0.9;

  // Spine is a single cubic
  const spine = spline(
    [tx - r, ty],
    [{ to: [bx + r, by], c1: [tx - r * 1.2, ty + h * 0.35], c2: [bx + r * 1.2, by - h * 0.35] }],
    opts,
  );

  // Top spiral
  const topPts: Pt[] = [[tx - r, ty]];
  for (let i = 1; i <= 18; i++) {
    const t = i / 18, a = Math.PI + t * 1.4 * Math.PI * 2, rr = r * (1 - t * 0.78);
    topPts.push([tx + Math.cos(a) * rr, ty + Math.sin(a) * rr]);
  }
  const top = polyline(topPts, opts);

  // Bottom spiral
  const botPts: Pt[] = [[bx + r, by]];
  for (let i = 1; i <= 18; i++) {
    const t = i / 18, a = t * 1.4 * Math.PI * 2, rr = r * (1 - t * 0.78);
    botPts.push([bx + Math.cos(a) * rr, by + Math.sin(a) * rr]);
  }
  const bottom = polyline(botPts, opts);

  return { spine, top, bottom };
}

// ─── Fill shapes (raw SVG strings for IronFill) ──────────────────────────────

/** Acanthus leaf — closed fill shape. Returns SVG path string for IronFill. */
export function acanthus(len: number): string {
  return `M 0 0 Q ${len * 0.15} ${-len * 0.25} ${len * 0.35} ${-len * 0.18}
    Q ${len * 0.5} ${-len * 0.1} ${len * 0.55} ${-len * 0.28}
    Q ${len * 0.7} ${-len * 0.12} ${len * 0.78} ${-len * 0.3}
    Q ${len * 0.92} ${-len * 0.08} ${len} 0
    Q ${len * 0.92} ${len * 0.08} ${len * 0.78} ${len * 0.3}
    Q ${len * 0.7} ${len * 0.12} ${len * 0.55} ${len * 0.28}
    Q ${len * 0.5} ${len * 0.1} ${len * 0.35} ${len * 0.18}
    Q ${len * 0.15} ${len * 0.25} 0 0 Z`;
}

/** Blade leaf — closed fill shape. Returns SVG path string for IronFill. */
export function bladeLeaf(len: number, width: number): string {
  const w = width * 0.5;
  return `M 0 0
    Q ${len * 0.3} ${-w} ${len * 0.6} ${-w * 0.7}
    Q ${len * 0.85} ${-w * 0.3} ${len} 0
    Q ${len * 0.85} ${w * 0.3} ${len * 0.6} ${w * 0.7}
    Q ${len * 0.3} ${w} 0 0 Z`;
}
