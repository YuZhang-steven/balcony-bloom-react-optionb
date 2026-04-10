/**
 * IronStroke — Authoring Model → Compiler → Renderer
 *
 * The top-level renderer component for wrought-iron bar strokes.
 * Accepts an IronStrokeModel and compiles it through the pipeline:
 *
 *   Layer 1 — Authoring Model  (IronStrokeModel from strokeTypes.ts)
 *   Layer 2 — Compiler         (strokeCompiler.ts: normalize → sample → ribbon → paths)
 *   Layer 3 — Renderer         (this file: SVG layers)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * API
 *
 *   <IronStroke stroke={model} />
 *   <IronStroke stroke={model} debug />
 *
 * Build models with the helpers from strokeBuilder.ts:
 *   import { line, polyline, spline, curve } from './strokeBuilder';
 *
 *   <IronStroke stroke={line([0, 0], [100, 50], { w: 4, color: IRON.deep })} />
 *   <IronStroke stroke={spline([0, 0], [{ to: [100, 50], q: [50, 0] }], { w: 3 })} />
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Render layers (bottom → top):
 *
 *   1. Silhouette  — wide dark outline (cast-iron edge / shadow border)
 *   2. Face        — narrower metal face (full opacity, user color)
 *   3. Seam        — optional thin highlight line along the centre spine
 *   4. Debug       — control polygon + handle lines + node dots (when debug=true)
 */

import { useMemo } from 'react';

import { IRON } from '../game/palettes';
import { compileStroke } from './strokeCompiler';
import type { IronStrokeModel, CompiledStroke } from './strokeTypes';

// ─── IronFill — flat fill primitive ──────────────────────────────────────────

export type IronFillProps = {
  d: string;
  color?: string;
};

/** Plain filled path for flat iron shapes (finials, rosette cores, etc.). */
export function IronFill({ d, color = IRON.mid }: IronFillProps) {
  return <path d={d} fill={color} />;
}

// ─── IronStroke ──────────────────────────────────────────────────────────────

export type IronStrokeProps = {
  stroke: IronStrokeModel;
  debug?: boolean;
};

/**
 * Renders an iron bar stroke as layered SVG paths.
 *
 *   <IronStroke stroke={model} />
 *   <IronStroke stroke={model} debug />
 */
export function IronStroke({ stroke, debug = false }: IronStrokeProps) {
  const compiled: CompiledStroke = useMemo(
    () => compileStroke(stroke, debug),
    [stroke, debug],
  );

  const { silhouette, face, seam, debug: debugOverlay } = compiled;
  const faceColor = stroke.paint.kind === 'solid' ? stroke.paint.color : undefined;

  return (
    <>
      {/* Layer 1 — outer silhouette: wide semi-transparent dark edge */}
      <path d={silhouette} fill={IRON.line} opacity={0.78} />

      {/* Layer 2 — metal face */}
      <path d={face} fill={faceColor} opacity={1} />

      {/* Layer 3 — centre seam highlight */}
      {seam && (
        <path
          d={seam}
          fill="none"
          stroke={IRON.bright}
          strokeWidth={0.8}
          strokeLinecap="round"
          opacity={0.55}
        />
      )}

      {/* Layer 4 — debug overlay */}
      {debug && debugOverlay && (
        <path
          d={debugOverlay}
          fill="none"
          stroke="#ff6b6b"
          strokeWidth={0.6}
          strokeDasharray="3 2"
          opacity={0.85}
        />
      )}
    </>
  );
}
