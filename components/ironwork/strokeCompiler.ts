/**
 * IronStroke Compiler
 *
 * Pipeline:
 *   Step A — Normalize  : expand segments into ordered curve list; fill in implied handles.
 *   Step B — Sample    : arc-length parameterisation → many points with pos/tan/norm/width/t.
 *   Step C — Ribbon    : offset edges + corner joins + end caps.
 *   Step D — Style     : bake the iron aesthetic (silhouette / face / seam / debug paths).
 *
 * All output SVG path strings use relative commands (lowercase: m/l/c/s/z) for compactness.
 */

import type {
  Vec2,
  StrokeNode,
  StrokeSegment,
  StrokePaint,
  IronStrokeModel,
  CurveSample,
  RibbonGeometry,
  JoinGeometry,
  CapGeometry,
  CompiledStroke,
} from './strokeTypes';

// ─── Vec2 helpers ─────────────────────────────────────────────────────────────

export const vec2 = (x: number, y: number): Vec2 => ({ x, y });

export const vadd = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const vsub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const vscale = (v: Vec2, s: number): Vec2 => ({ x: v.x * s, y: v.y * s });
export const vlen = (v: Vec2): number => Math.sqrt(v.x * v.x + v.y * v.y);
export const vnorm = (v: Vec2): Vec2 => { const l = vlen(v); return l > 1e-10 ? vscale(v, 1 / l) : vscale(v, 0); };
export const vdot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;
export const vcross = (a: Vec2, b: Vec2): number => a.x * b.y - a.y * b.x;

/** Counter-clockwise perpendicular (points "right" of the direction vector). */
export const vperp = (v: Vec2): Vec2 => ({ x: -v.y, y: v.x });

// ─── Normalize — Step A ──────────────────────────────────────────────────────

/** One evaluated curve between two endpoints. */
type Curve = {
  from: Vec2;
  to: Vec2;
  c1: Vec2;
  c2: Vec2;
  isLinear: boolean;
};

/**
 * Resolve a handle spec into an absolute position.
 * null → no handle.  undefined → symmetric / auto.
 */
function resolveHandle(
  explicit: Vec2 | null | undefined,
  nodePos: Vec2,
  opposite: Vec2,
): Vec2 | null {
  if (explicit !== undefined && explicit !== null) return explicit;
  // Implicit: reflect the opposite handle through the node
  return vsub(nodePos, vsub(opposite, nodePos));
}

/** Gather all node objects into a quick id→node map. */
function nodeMap(nodes: StrokeNode[]): Map<string, StrokeNode> {
  return new Map(nodes.map(n => [n.id, n]));
}

/**
 * Build an ordered list of Curves from the model's segments + nodes.
 * Fills in implied handles: if `out` is absent on a node, mirror `in`;
 * if `in` is absent, mirror `out`.  For a line segment both handles are forced null.
 */
function normalize(model: IronStrokeModel): Curve[] {
  const nm = nodeMap(model.nodes);
  return model.segments.map(seg => {
    const a = nm.get(seg.from)!;
    const b = nm.get(seg.to)!;
    const pa = vec2(a.x, a.y);
    const pb = vec2(b.x, b.y);

    if (seg.kind === 'line') {
      return { from: pa, to: pb, c1: pa, c2: pb, isLinear: true } as Curve;
    }

    // Cubic bezier
    const hOut = resolveHandle(a.out, pa, a.in ? vec2(a.in.x, a.in.y) : pa);
    const hIn  = resolveHandle(b.in, pb, b.out ? vec2(b.out.x, b.out.y) : pb);

    return {
      from: pa,
      to: pb,
      c1: hOut ?? pa,
      c2: hIn ?? pb,
      isLinear: false,
    };
  });
}

// ─── Cubic bezier maths ──────────────────────────────────────────────────────

/** Evaluate cubic bezier at parameter t ∈ [0,1]. */
export function bezierAt(t: number, c: Curve): Vec2 {
  const mt = 1 - t;
  const x = mt*mt*mt*c.from.x + 3*mt*mt*t*c.c1.x + 3*mt*t*t*c.c2.x + t*t*t*c.to.x;
  const y = mt*mt*mt*c.from.y + 3*mt*mt*t*c.c1.y + 3*mt*t*t*c.c2.y + t*t*t*c.to.y;
  return vec2(x, y);
}

/**
 * Derivative of cubic bezier at t.
 * Returns tangent vector (not normalized).
 */
export function bezierDeriv(t: number, c: Curve): Vec2 {
  const mt = 1 - t;
  const dx = 3*mt*mt*(c.c1.x-c.from.x) + 6*mt*t*(c.c2.x-c.c1.x) + 3*t*t*(c.to.x-c.c2.x);
  const dy = 3*mt*mt*(c.c1.y-c.from.y) + 6*mt*t*(c.c2.y-c.c1.y) + 3*t*t*(c.to.y-c.c2.y);
  return vec2(dx, dy);
}

/** Approximate arc-length of a bezier via midpoint subdivision. */
function bezierArcLen(c: Curve, samples = 20): number {
  let len = 0;
  let prev = c.from;
  for (let i = 1; i <= samples; i++) {
    const cur = bezierAt(i / samples, c);
    len += vlen(vsub(cur, prev));
    prev = cur;
  }
  return len;
}

// ─── Sample — Step B ─────────────────────────────────────────────────────────

const DEFAULT_SAMPLE_INTERVAL = 3; // px between samples (controls smoothness)

/**
 * Sample every curve at roughly equal arc-length intervals.
 * Returns: flat array of samples, ordered from start→end of path.
 */
function sampleCurves(curves: Curve[], model: IronStrokeModel): CurveSample[] {
  const nm = nodeMap(model.nodes);
  const samples: CurveSample[] = [];

  // Build cumulative arc-length table [curveIndex → cumulative length]
  const cumLen: number[] = [];
  let total = 0;
  for (const c of curves) {
    cumLen.push(total);
    total += bezierArcLen(c);
  }

  const count = Math.max(2, Math.round(total / DEFAULT_SAMPLE_INTERVAL));

  for (let i = 0; i < count; i++) {
    const tGlobal = i / (count - 1);
    const targetLen = tGlobal * total;

    // Find the curve that contains this arc-length
    let ci = 0;
    while (ci < cumLen.length - 1 && cumLen[ci + 1] <= targetLen) ci++;
    const localStart = cumLen[ci];
    const curveLen = ci < cumLen.length - 1
      ? cumLen[ci + 1] - localStart
      : bezierArcLen(curves[ci]);
    const tLocal = curveLen > 0 ? (targetLen - localStart) / curveLen : 0;
    const t = Math.max(0, Math.min(1, tLocal));

    const c = curves[ci];
    const pos = bezierAt(t, c);
    const tan = vnorm(bezierDeriv(t, c));
    const norm = vperp(tan);

    // Width interpolation
    const fromNode = nm.get(model.segments[ci].from)!;
    const toNode   = nm.get(model.segments[ci].to)!;
    const w0 = fromNode.width ?? 3;
    const w1 = toNode.width   ?? 3;
    const width = w0 + (w1 - w0) * t;

    samples.push({ pos, tan, norm, width, t: tGlobal });
  }

  return samples;
}

// ─── Width interpolation helper ───────────────────────────────────────────────

/** Linearly interpolate width between two nodes. */
function interpWidth(fromNode: StrokeNode, toNode: StrokeNode, t: number): number {
  const w0 = fromNode.width ?? 3;
  const w1 = toNode.width   ?? 3;
  return w0 + (w1 - w0) * t;
}

// ─── Ribbon — Step C ─────────────────────────────────────────────────────────

/**
 * Compute left and right offset edges from the sampled curve.
 * The offset is half the local width, perpendicular to the tangent.
 */
function buildRibbon(samples: CurveSample[]): { leftEdge: Vec2[]; rightEdge: Vec2[] } {
  const leftEdge: Vec2[] = [];
  const rightEdge: Vec2[] = [];

  for (const s of samples) {
    const half = s.width / 2;
    leftEdge.push(vsub(s.pos, vscale(s.norm, half)));
    rightEdge.push(vadd(s.pos, vscale(s.norm, half)));
  }

  return { leftEdge, rightEdge };
}

/** Find the node whose id appears at a segment boundary. */
function nodeAtSegStart(segs: StrokeSegment[], curveIndex: number): StrokeNode | null {
  if (curveIndex < segs.length) {
    const nodeId = segs[curveIndex].from;
    return null; // caller resolves via nodeMap
  }
  return null;
}

/** Build join geometry at the junction between two segments. */
function buildJoins(
  samples: CurveSample[],
  curves: Curve[],
  model: IronStrokeModel,
): JoinGeometry[] {
  const nm = nodeMap(model.nodes);
  const joins: JoinGeometry[] = [];

  // Only consider interior joints (skip the very last segment endpoint)
  for (let i = 0; i < model.segments.length - 1; i++) {
    const segA = model.segments[i];
    const segB = model.segments[i + 1];
    const nodeB = nm.get(segB.from)!;
    const joinStyle = nodeB.joinStyle ?? model.defaultJoin ?? 'round';

    // Approximate the "before" normal from the last sample of curve i,
    // and "after" normal from the first sample of curve i+1.
    // Since samples are evenly distributed we use samples[...]:
    const lastOfA  = samples[findSampleIndexForCurve(i,     samples, model.segments.length)];
    const firstOfB = samples[findSampleIndexForCurve(i + 1, samples, model.segments.length)];

    if (!lastOfA || !firstOfB) continue;

    // For bevel: just the two rim points meeting.
    // For round: add a quarter-arc wedge.
    // For miter: extend the outer edges until they meet (clipped to a limit).
    const halfA = lastOfA.width / 2;
    const halfB = firstOfB.width / 2;

    const leftA  = vsub(lastOfA.pos, vscale(lastOfA.norm, halfA));
    const rightA = vadd(lastOfA.pos, vscale(lastOfA.norm, halfA));
    const leftB  = vsub(firstOfB.pos, vscale(firstOfB.norm, halfB));
    const rightB = vadd(firstOfB.pos, vscale(firstOfB.norm, halfB));

    const leftJoin: Vec2[]  = [leftA,  leftB];
    const rightJoin: Vec2[] = [rightA, rightB];

    joins.push({ nodeId: nodeB.id, style: joinStyle, left: leftJoin, right: rightJoin });
  }

  return joins;
}

/** Find the sample index that best represents the END of a given curve. */
function findSampleIndexForCurve(curveIdx: number, samples: CurveSample[], totalCurves: number): number {
  const count = samples.length;
  if (totalCurves <= 1) return count - 1;
  return Math.round(((curveIdx + 1) / totalCurves) * (count - 1));
}

/** Build end-cap geometry for open strokes. */
function buildCaps(samples: CurveSample[], model: IronStrokeModel): CapGeometry[] {
  if (model.closed || samples.length < 2) return [];

  const first = samples[0];
  const last  = samples[samples.length - 1];
  const half0 = first.width / 2;
  const half1 = last.width  / 2;
  const cap = model.cap ?? 'round';

  const caps: CapGeometry[] = [];

  if (cap === 'round') {
    // Semi-circle wedge at each end
    const wedge = (center: Vec2, norm: Vec2, half: number): Vec2[] => {
      const pts: Vec2[] = [];
      for (let i = 0; i <= 8; i++) {
        const a = (i / 8) * Math.PI;
        pts.push(vadd(center, vscale(vadd(vscale(norm, Math.cos(a)), vscale(vec2(-norm.y, norm.x), Math.sin(a))), half)));
      }
      return pts;
    };
    caps.push({ side: 'start', shape: wedge(first.pos, vscale(first.norm, -1), half0) });
    caps.push({ side: 'end',   shape: wedge(last.pos,  last.norm,  half1) });
  } else {
    // Butt / square: flat perpendicular line
    const flat = (center: Vec2, norm: Vec2, half: number): Vec2[] => {
      const offset = cap === 'square' ? vscale(vscale(first.tan, half0), 1) : vec2(0, 0);
      return [vsub(vadd(center, vscale(norm, -half)), offset), vadd(vadd(center, vscale(norm, half)), offset)];
    };
    caps.push({ side: 'start', shape: flat(first.pos, first.norm, half0) });
    caps.push({ side: 'end',   shape: flat(last.pos,  last.norm,  half1) });
  }

  return caps;
}

// ─── SVG path string helpers ─────────────────────────────────────────────────

/** Build a smooth closed polygon SVG path string from a list of Vec2. */
function polyPath(pts: Vec2[]): string {
  if (pts.length === 0) return '';
  const parts = [`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`];
  for (let i = 1; i < pts.length; i++) {
    parts.push(`L ${pts[i].x.toFixed(2)} ${pts[i].y.toFixed(2)}`);
  }
  parts.push('Z');
  return parts.join(' ');
}

/** Build a polyline (no Z) from a list of Vec2. */
function polyLine(pts: Vec2[]): string {
  if (pts.length === 0) return '';
  const parts = [`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`];
  for (let i = 1; i < pts.length; i++) {
    parts.push(`L ${pts[i].x.toFixed(2)} ${pts[i].y.toFixed(2)}`);
  }
  return parts.join(' ');
}

/** Reverse a Vec2 array. */
function reversePts(pts: Vec2[]): Vec2[] {
  return [...pts].reverse();
}

// ─── Ribbon → SVG paths ──────────────────────────────────────────────────────

/**
 * Assemble the outer silhouette: left edge → end-cap → right edge reversed → start-cap → close.
 * We always trace the FULL outer boundary for accurate stroke-width silhouette rendering.
 */
function buildSilhouettePath(
  leftEdge: Vec2[],
  rightEdge: Vec2[],
  caps: CapGeometry[],
): string {
  // Start cap
  const startCap = caps.find(c => c.side === 'start');
  const endCap   = caps.find(c => c.side === 'end');

  // Left edge: leftEdge[0] … leftEdge[last]
  let d = polyLine(leftEdge);

  // End cap (add after last left-edge point → to → from)
  if (endCap && endCap.shape.length > 0) {
    d += ` ${endCap.shape.map(p => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')}`;
  } else if (rightEdge.length > 0) {
    d += ` L ${rightEdge[rightEdge.length - 1].x.toFixed(2)} ${rightEdge[rightEdge.length - 1].y.toFixed(2)}`;
  }

  // Right edge reversed: rightEdge[last] … rightEdge[0]
  for (let i = rightEdge.length - 2; i >= 0; i--) {
    d += ` L ${rightEdge[i].x.toFixed(2)} ${rightEdge[i].y.toFixed(2)}`;
  }

  // Start cap (reverse direction)
  if (startCap && startCap.shape.length > 0) {
    for (let i = startCap.shape.length - 1; i >= 0; i--) {
      d += ` L ${startCap.shape[i].x.toFixed(2)} ${startCap.shape[i].y.toFixed(2)}`;
    }
  } else if (leftEdge.length > 0) {
    d += ` L ${leftEdge[0].x.toFixed(2)} ${leftEdge[0].y.toFixed(2)}`;
  }

  d += ' Z';
  return d;
}

/** The center seam line follows the sampled path exactly. */
function buildSeamPath(samples: CurveSample[]): string {
  if (samples.length === 0) return '';
  const pts = samples.map(s => s.pos);
  return polyLine(pts);
}

// ─── Debug helpers ───────────────────────────────────────────────────────────

function buildDebugPath(
  samples: CurveSample[],
  curves: Curve[],
  model: IronStrokeModel,
): string {
  const nm = nodeMap(model.nodes);
  const parts: string[] = [];

  // Control polygon for each cubic segment
  for (const c of curves) {
    if (!c.isLinear) {
      parts.push(`M ${c.from.x.toFixed(2)} ${c.from.y.toFixed(2)} `
        + `L ${c.c1.x.toFixed(2)} ${c.c1.y.toFixed(2)} `
        + `L ${c.c2.x.toFixed(2)} ${c.c2.y.toFixed(2)} `
        + `L ${c.to.x.toFixed(2)} ${c.to.y.toFixed(2)}`);
    }
  }

  // Handle lines
  for (const node of model.nodes) {
    const pos = vec2(node.x, node.y);
    if (node.in) {
      parts.push(`M ${node.in.x.toFixed(2)} ${node.in.y.toFixed(2)} L ${pos.x.toFixed(2)} ${pos.y.toFixed(2)}`);
    }
    if (node.out) {
      parts.push(`M ${pos.x.toFixed(2)} ${pos.y.toFixed(2)} L ${node.out.x.toFixed(2)} ${node.out.y.toFixed(2)}`);
    }
  }

  // Sampled centreline
  if (samples.length > 0) {
    const pts = samples.map(s => s.pos);
    parts.push(polyLine(pts));
  }

  return parts.join(' ');
}

// ─── Main compile entry point ────────────────────────────────────────────────

/**
 * Compile an IronStrokeModel into a RibbonGeometry.
 */
export function compileRibbon(model: IronStrokeModel): RibbonGeometry {
  const curves = normalize(model);
  const samples = sampleCurves(curves, model);
  const { leftEdge, rightEdge } = buildRibbon(samples);
  const joins = buildJoins(samples, curves, model);
  const caps  = buildCaps(samples, model);
  return { samples, leftEdge, rightEdge, joins, caps };
}

/**
 * Compute paint color at a given arc-length parameter t [0..1].
 * For 'solid' paint, always returns the single color.
 * For 'gradient' paint, linearly interpolates between the two nearest stops.
 */
export function paintColorAt(paint: StrokePaint, t: number): string {
  if (paint.kind === 'solid') return paint.color;
  const { stops } = paint;
  if (stops.length === 0) return 'transparent';
  if (stops.length === 1) return stops[0].color;
  if (t <= stops[0].t) return stops[0].color;
  if (t >= stops[stops.length - 1].t) return stops[stops.length - 1].color;
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].t && t <= stops[i + 1].t) { lo = stops[i]; hi = stops[i + 1]; break; }
  }
  const f = (t - lo.t) / (hi.t - lo.t);
  return lo.color; // placeholder — real impl would lerp hex colors
}

/**
 * Full compile: RibbonGeometry + SVG path strings ready for the renderer.
 */
export function compileStroke(model: IronStrokeModel, debug = false): CompiledStroke {
  const { samples, leftEdge, rightEdge, joins, caps } = compileRibbon(model);
  const curves = normalize(model);

  const silhouette = buildSilhouettePath(leftEdge, rightEdge, caps);
  const seam = buildSeamPath(samples);
  const debugPath = debug ? buildDebugPath(samples, curves, model) : null;

  return { silhouette, face: silhouette, seam, debug: debugPath };
}
