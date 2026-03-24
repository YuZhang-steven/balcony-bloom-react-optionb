import { IronStroke } from '../ironwork/IronStroke';
import { IronFill } from '../ironwork/IronStroke';
import { MirrorH } from '../ironwork/Symmetry';
import { cScroll, acanthus, greekKey } from '../ironwork/primitives';
import { IRON } from '../game/palettes';
import { useRegisterAnchors } from '../game/AnchorContext';
import { rand, irand, coin } from '../game/random';
import type { Anchor } from '../../types';

type PorchModuleProps = {
  cx: number;
  topY: number;
  moduleW: number;
  triH: number;
  triReach: number;
  hasKey: boolean;
}

export function PorchModule({ cx, topY, moduleW, triH, triReach, hasKey }: PorchModuleProps) {
  const halfW = moduleW / 2;
  const friezeH = 26;

  const anchors: Anchor[] = [];
  anchors.push({ x: cx, y: topY - friezeH - 8, kind: 'rooftop' });
  anchors.push({ x: cx - halfW * 0.45, y: topY - friezeH - 6, kind: 'rooftop' });
  anchors.push({ x: cx + halfW * 0.45, y: topY - friezeH - 6, kind: 'rooftop' });
  anchors.push({ x: cx, y: topY + 12, kind: 'canopy' });
  anchors.push({ x: cx - halfW * 0.4, y: topY + 10, kind: 'canopy' });
  anchors.push({ x: cx + halfW * 0.4, y: topY + 10, kind: 'canopy' });
  anchors.push({ x: cx - halfW + triReach * 0.6, y: topY + triH * 0.55, kind: 'bracket', meta: { flip: false } });
  anchors.push({ x: cx + halfW - triReach * 0.6, y: topY + triH * 0.55, kind: 'bracket', meta: { flip: true } });
  useRegisterAnchors(anchors);

  return (
    <g className="porch-module">
      <IronStroke d={`M ${cx - halfW} ${topY} L ${cx + halfW} ${topY}`} w={6} color={IRON.deep} />
      <IronStroke d={`M ${cx - halfW} ${topY - friezeH} L ${cx + halfW} ${topY - friezeH}`} w={4.5} color={IRON.mid} />
      {hasKey && (
        <IronStroke d={greekKey(cx - halfW + 8, topY - friezeH + 4, moduleW - 16, friezeH - 8)}
          w={3} color={IRON.deep} />
      )}
      {!hasKey && (
        <g transform={`translate(${cx} ${topY - friezeH / 2})`}>
          <MirrorH>
            {Array.from({ length: Math.floor(halfW / 32) }).map((_, i) => (
              <g key={i} transform={`translate(${12 + i * 32} 0)`}>
                <IronStroke d={cScroll(0, 0, 8, 1, 1.1)} w={2.2} color={IRON.bright} />
              </g>
            ))}
          </MirrorH>
        </g>
      )}

      <g transform={`translate(${cx} ${topY})`}>
        <MirrorH>
          <TriangleBracket pilasterX={halfW} reach={triReach} h={triH} />
        </MirrorH>
      </g>
    </g>
  );
}

type TriangleBracketProps = {
  pilasterX: number;
  reach: number;
  h: number;
}

function TriangleBracket({ pilasterX, reach, h }: TriangleBracketProps) {
  const sweep = `M ${pilasterX} ${h}
    Q ${pilasterX - reach * 0.18} ${h * 0.6} ${pilasterX - reach * 0.5} ${h * 0.35}
    Q ${pilasterX - reach * 0.82} ${h * 0.12} ${pilasterX - reach} 2`;

  const sr = Math.min(reach, h) * 0.32;
  const sx = pilasterX - reach * 0.42, sy = h * 0.44;

  const er = sr * 0.5;
  const ex = pilasterX - reach * 0.78, ey = h * 0.18;

  const aLen = reach * 0.3;
  const ax = pilasterX - reach * 0.25, ay = h * 0.68, aAng = -155;

  return (
    <g>
      <IronStroke d={sweep} w={4.5} color={IRON.deep} />
      <IronStroke d={cScroll(sx, sy, sr, -1, 1.5)} w={3} />
      <circle cx={sx} cy={sy} r={sr * 0.18} fill={IRON.deep} />
      <IronStroke d={cScroll(ex, ey, er, 1, 1.2)} w={2.4} color={IRON.bright} />
      <g transform={`translate(${ax} ${ay}) rotate(${aAng})`}>
        <IronFill d={acanthus(aLen)} color={IRON.bright} />
      </g>
      <IronStroke d={`M ${pilasterX - 2} ${h * 0.88}
        Q ${pilasterX - reach * 0.08} ${h * 0.82} ${pilasterX - reach * 0.06} ${h * 0.7}
        Q ${pilasterX - reach * 0.03} ${h * 0.6} ${pilasterX - reach * 0.1} ${h * 0.62}`}
        w={2.2} color={IRON.bright} />
    </g>
  );
}
