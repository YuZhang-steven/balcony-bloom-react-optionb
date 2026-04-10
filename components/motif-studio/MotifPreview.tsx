'use client';
/**
 * MotifPreview.tsx — live SVG canvas for the Motif Studio
 *
 * Renders the currently configured StrokeConfig as a live SVG motif,
 * centered in a 1600x780 viewBox (same as the main game canvas).
 * Supports optional alignment grid overlay and fill/stroke mode toggle.
 */

import { IronStroke, IronFill } from '../ironwork/IronStroke';
import { svgPath } from '../ironwork/strokeBuilder';
import { MirrorH, Mirror4, MirrorV, Rotate2 } from '../ironwork/Symmetry';
import { IRON } from '../game/palettes';
import type { StrokeConfig, SymmetryMode } from './motifTypes';

// NOTE: svgPath is used here as a bridge for the Motif Studio's user-editable
// path strings (StrokeConfig.path). The studio allows users to author raw SVG
// path data interactively, so string→model conversion is required at this layer.
// All other ironwork code uses structured builders (line, spline, polyline, etc.).

const VIEW_W = 1600;
const VIEW_H = 780;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;

type MotifPreviewProps = {
  config: StrokeConfig;
  s: number;
  showGrid: boolean;
  /** Evaluate the template-string path with the current s value */
  evalPath: (path: string) => string;
};

function SymmetryWrapper({
  mode,
  children,
}: {
  mode: SymmetryMode;
  children: React.ReactNode;
}) {
  switch (mode) {
    case 'MirrorH': return <><MirrorH>{children}</MirrorH></>;
    case 'MirrorV': return <><MirrorV>{children}</MirrorV></>;
    case 'Mirror4': return <><Mirror4>{children}</Mirror4></>;
    case 'Rotate2': return <><Rotate2>{children}</Rotate2></>;
    default: return <>{children}</>;
  }
}

function GridLines() {
  const lines = [];
  for (let x = 100; x < VIEW_W; x += 100) {
    lines.push(
      <line key={`v${x}`} x1={x} y1={0} x2={x} y2={VIEW_H}
        stroke="rgba(141,122,146,0.18)" strokeWidth={0.5} strokeDasharray="4 6" />
    );
  }
  for (let y = 100; y < VIEW_H; y += 100) {
    lines.push(
      <line key={`h${y}`} x1={0} y1={y} x2={VIEW_W} y2={y}
        stroke="rgba(141,122,146,0.18)" strokeWidth={0.5} strokeDasharray="4 6" />
    );
  }
  lines.push(
    <line key="cx" x1={CX} y1={0} x2={CX} y2={VIEW_H} stroke="rgba(141,122,146,0.35)" strokeWidth={0.8} />,
    <line key="cy" x1={0} y1={CY} x2={VIEW_W} y2={CY} stroke="rgba(141,122,146,0.35)" strokeWidth={0.8} />
  );
  return <>{lines}</>;
}

export function MotifPreview({ config, s, showGrid, evalPath }: MotifPreviewProps) {
  const { path, w, color, symmetry, mode, extras } = config;
  const d = evalPath(path);

  let extraEls: React.ReactNode = null;
  if (extras && typeof extras === 'function') {
    const extra = extras({ s });
    if (extra && extra.path) {
      extraEls = (
        <SymmetryWrapper mode={symmetry}>
          <IronStroke
            stroke={svgPath(evalPath(extra.path), { w: extra.w ?? w, color: extra.color ?? IRON.bright })}
          />
        </SymmetryWrapper>
      );
    }
  }

  const isPendant = config.name === 'Pendant';

  return (
    <div className="ms-preview-wrap">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="ms-preview-svg"
        aria-label="Motif preview"
      >
        <rect width={VIEW_W} height={VIEW_H} fill="var(--paper-warm)" />

        <defs>
          <filter id="ms-wobble" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" result="t" />
            <feDisplacementMap in="SourceGraphic" in2="t" scale="2" />
          </filter>
        </defs>

        {showGrid && <GridLines />}

        <g transform={`translate(${CX} ${CY})`} filter="url(#ms-wobble)">
          <SymmetryWrapper mode={symmetry}>
            {mode === 'fill' ? (
              <IronFill d={d} color={color} />
            ) : (
              <IronStroke stroke={svgPath(d, { w, color })} />
            )}
          </SymmetryWrapper>

          {extraEls}
        </g>

        <text
          x={VIEW_W - 16}
          y={VIEW_H - 14}
          textAnchor="end"
          fill="var(--text-muted)"
          fontSize={11}
          fontFamily="monospace"
        >
          s={s}  w={w}  {symmetry}
        </text>
      </svg>
    </div>
  );
}
