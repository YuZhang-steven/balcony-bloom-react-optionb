/**
 * IronStroke Authoring Model
 *
 * Design philosophy: separate the "what to draw" (model) from "how to draw it" (compiler/renderer).
 *
 * Layer 1 — Authoring Model  : IronStrokeModel describes geometry + paint + style as structured data.
 * Layer 2 — Compiler        : normalizes the model, samples arc-length, computes ribbon geometry.
 * Layer 3 — Renderer        : transforms ribbon geometry into layered SVG paths (silhouette, face, seam).
 *
 * All positions are in SVG units (px).  Origin is top-left; Y increases downward.
 */

export type Vec2 = { x: number; y: number };

// ── Node / Segment ──────────────────────────────────────────────────────────

/** How handle control points relate when dragging a tangent. */
export type HandleMode = 'none' | 'mirrored' | 'aligned' | 'free';

/** Whether the node acts as a smooth interpolated joint or a hard corner. */
export type NodeMode = 'smooth' | 'corner';

/** How to render the exterior corner between two stroke edges. */
export type JoinStyle = 'round' | 'bevel' | 'miter';

/** A single control point on the path. */
export type StrokeNode = {
  id: string;
  x: number;
  y: number;

  /** Inbound handle — absolute position, or null to suppress. */
  in?: Vec2 | null;
  /** Outbound handle — absolute position, or null to suppress. */
  out?: Vec2 | null;

  handleMode?: HandleMode;
  nodeMode?: NodeMode;
  joinStyle?: JoinStyle;

  /** Full stroke width (px) at this node. Interpolated when omitted. */
  width?: number;
};

/** Connection between two nodes. 'cubic' uses both nodes' handles; 'line' is straight. */
export type StrokeSegment = {
  from: string;
  to: string;
  kind: 'line' | 'cubic';
};

// ── Paint ───────────────────────────────────────────────────────────────────

/** One stop of a multi-stop color ramp along the path parameter 0..1. */
export type PaintStop = {
  t: number;     // 0 = start of path, 1 = end
  color: string; // Any valid CSS color
};

/** Paint strategy for the stroke face. */
export type StrokePaint =
  | { kind: 'solid'; color: string }
  | { kind: 'gradient'; stops: PaintStop[] };

// ── Model ───────────────────────────────────────────────────────────────────

/**
 * The full authoring model for a single iron bar stroke.
 *
 * Example — a simple arc:
 * ```
 * {
 *   id: 'arc-1',
 *   nodes: [
 *     { id: 'a', x: 50, y: 100, out: { x: 80, y: 100 } },
 *     { id: 'b', x: 150, y: 100, in: { x: 120, y: 100 } },
 *   ],
 *   segments: [{ from: 'a', to: 'b', kind: 'cubic' }],
 *   paint: { kind: 'solid', color: IRON.mid },
 *   defaultJoin: 'round',
 * }
 * ```
 */
export type IronStrokeModel = {
  id: string;
  closed?: boolean;
  nodes: StrokeNode[];
  segments: StrokeSegment[];
  paint: StrokePaint;

  cap?: 'round' | 'butt' | 'square';
  defaultJoin?: JoinStyle;
};

// ── Computed internals (compiler output) ────────────────────────────────────

/** One sample point on the sampled arc-length curve. */
export type CurveSample = {
  /** Position in SVG units. */
  pos: Vec2;
  /** Unit tangent (direction of travel). */
  tan: Vec2;
  /** Unit normal (perpendicular to tan, pointing "right" of the path). */
  norm: Vec2;
  /** Full stroke width at this sample, linearly interpolated from adjacent nodes. */
  width: number;
  /** Normalised arc-length parameter [0..1]. */
  t: number;
};

/** The offset ribbon built by the compiler. */
export type RibbonGeometry = {
  samples: CurveSample[];
  leftEdge: Vec2[];
  rightEdge: Vec2[];
  joins: JoinGeometry[];
  caps: CapGeometry[];
};

/** Geometry generated at a corner join. */
export type JoinGeometry = {
  nodeId: string;
  style: JoinStyle;
  left: Vec2[];   // polygon points for the left join
  right: Vec2[];
};

/** Geometry generated at an open end-cap. */
export type CapGeometry = {
  side: 'start' | 'end';
  shape: Vec2[];
};

// ── Renderer internals ──────────────────────────────────────────────────────

/** The four SVG path strings produced by the compiler. */
export type CompiledStroke = {
  /** Wide dark silhouette (outer border + joins/caps). */
  silhouette: string;
  /** Narrow lighter stroke for the metal face. */
  face: string;
  /** Optional center highlight / seam line. */
  seam: string | null;
  /** Debug overlay paths (control polygon, handle lines, node dots). */
  debug: string | null;
};
