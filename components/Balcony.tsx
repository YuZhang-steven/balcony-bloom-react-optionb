import { PorchModule } from './architecture/PorchModule';
import { Pilaster, pickPilasterSequence } from './architecture/Pilaster';
import { RailingPanel } from './architecture/RailingPanel';
import { Staircase } from './architecture/Staircase';
import { PorchSlab, InteriorWash, DoorAndWindow } from './architecture/PorchSlab';
import { useMemo } from 'react';
import type { Scene } from '../types';

type BalconyBackProps = {
  scene: Scene;
}

export function BalconyBack({ scene }: BalconyBackProps) {
  return (
    <>
      <g filter="url(#wash)" style={{ pointerEvents: 'none' }}>
        <InteriorWash scene={scene} />
      </g>
      <g filter="url(#wobble)" style={{ pointerEvents: 'none' }}>
        <DoorAndWindow scene={scene} />
        <PorchSlab scene={scene} />
        <Staircase scene={scene} />
      </g>
    </>
  );
}

type BalconyIronProps = {
  scene: Scene;
}

export function BalconyIron({ scene }: BalconyIronProps) {
  const {
    porchY, canopyY, railH,
    nModules, moduleWs, moduleCXs, pilasterXs, pilasterW,
    triH, triReachRatio, hasGreekKey,
    stairModule, stairCX, stairTopW,
    railingPattern,
  } = scene;

  const pilasterSeq = useMemo(() => pickPilasterSequence(), []);

  const railY = porchY - railH;
  const stairL = stairCX - stairTopW / 2;
  const stairR = stairCX + stairTopW / 2;

  return (
    <g filter="url(#wobble)">
      {pilasterXs.map((px, i) => (
        <Pilaster key={i} x={px} topY={canopyY} bottomY={porchY}
          w={pilasterW} sequence={pilasterSeq} />
      ))}

      {moduleCXs.map((cx, i) => (
        <PorchModule key={i} cx={cx} topY={canopyY}
          moduleW={moduleWs[i]}
          triH={triH} triReach={moduleWs[i] * 0.5 * triReachRatio}
          hasKey={hasGreekKey} />
      ))}

      {moduleCXs.map((cx, i) => {
        const x1 = pilasterXs[i] + pilasterW / 2;
        const x2 = pilasterXs[i + 1] - pilasterW / 2;
        const segs = railingSegments(x1, x2, i === stairModule ? stairL : Infinity,
                                             i === stairModule ? stairR : -Infinity);
        return segs.map((seg, j) => (
          seg.w > 36 && <RailingPanel key={`${i}-${j}`}
            x={seg.x} y={railY} w={seg.w} h={railH} pattern={railingPattern} />
        ));
      })}
    </g>
  );
}

type RailingSegment = {
  x: number;
  w: number;
}

function railingSegments(x1: number, x2: number, stairL: number, stairR: number): RailingSegment[] {
  if (stairR <= x1 || stairL >= x2) return [{ x: x1, w: x2 - x1 }];
  const segs: RailingSegment[] = [];
  if (stairL > x1) segs.push({ x: x1, w: stairL - x1 - 4 });
  if (stairR < x2) segs.push({ x: stairR + 4, w: x2 - stairR - 4 });
  return segs;
}
