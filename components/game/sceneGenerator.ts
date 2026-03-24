import { Scene } from '../../types';
import { reseed, rand, irand, coin } from './random';

export const VIEW_W = 1600;
export const VIEW_H = 780;

export type { Scene };

export function generateScene(seed: number): Scene {
  reseed(seed);

  const margin = rand(90, 140);
  const porchX = margin;
  const porchW = VIEW_W - margin * 2;
  const porchY = rand(440, 500);
  const porchH = rand(40, 52);
  const canopyY = rand(140, 180);
  const railH = rand(92, 118);

  const nModules = irand(2, 4);
  const pilasterW = 38;
  const innerW = porchW - pilasterW * (nModules + 1);
  const weights = Array.from({ length: nModules }, () => rand(0.85, 1.15));
  const sumW = weights.reduce((a, b) => a + b, 0);
  const moduleWs = weights.map(w => (w / sumW) * innerW);

  const pilasterXs = [porchX + pilasterW / 2];
  let cursor = porchX + pilasterW;
  for (let i = 0; i < nModules; i++) {
    cursor += moduleWs[i] + pilasterW;
    pilasterXs.push(cursor - pilasterW / 2);
  }

  const moduleCXs: number[] = [];
  for (let i = 0; i < nModules; i++) {
    const left = pilasterXs[i] + pilasterW / 2;
    const right = pilasterXs[i + 1] - pilasterW / 2;
    moduleCXs.push((left + right) / 2);
  }

  const triH = rand(85, 115);
  const triReachRatio = rand(0.35, 0.48);

  const stairModule = nModules >= 3 ? irand(1, nModules - 2)
                    : nModules === 2 ? irand(0, 1) : 0;
  const stairCX = moduleCXs[stairModule];
  const nStairs = irand(4, 6);
  const stairH = rand(22, 28);
  const treadH = rand(5, 7);
  const stairGrow = rand(20, 30);
  const stairTopW = Math.min(moduleWs[stairModule] * 0.85, rand(150, 200));
  const stairBotY = porchY + porchH + nStairs * (stairH + treadH);

  const railingPattern = irand(0, 2);
  const hasGreekKey = coin(0.6);
  const doorModule = (stairModule + 1) % nModules;
  const doorW = rand(72, 100);
  const hasWindow = coin(0.65);
  const windowModule = nModules > 2 ? (stairModule + 2) % nModules : doorModule;

  // Precompute interior shadows to avoid hydration mismatch
  const h = porchY - canopyY;
  const interiorShadows = moduleCXs.map(() => ({
    cxOffset: rand(-20, 20),
    cy: canopyY + h * rand(0.4, 0.6),
    rx: rand(85, 140),
    ry: h * rand(0.38, 0.5),
    opacity: rand(0.14, 0.22),
    deepCxOffset: rand(-30, 30),
    deepCy: canopyY + h * rand(0.45, 0.65),
    deepRx: rand(55, 95),
    deepRy: h * rand(0.25, 0.38),
    deepOpacity: rand(0.10, 0.16),
  }));

  // Precompute window config if needed
  let windowConfig: { w: number; h: number; x: number; y: number } | undefined;
  if (hasWindow && windowModule !== doorModule) {
    const wCX = moduleCXs[windowModule];
    const ww = rand(60, 82);
    const wh = rand(95, 130);
    windowConfig = {
      w: ww,
      h: wh,
      x: wCX - ww / 2 + rand(-15, 15),
      y: canopyY + rand(70, 100),
    };
  }

  // Precompute stair tread shadow depths to avoid hydration mismatch
  const stairTreadDepths = Array.from({ length: nStairs }, (_, i) => {
    return i === nStairs - 1 ? rand(0.6, 0.85) : rand(0.6, 0.85);
  });

  return {
    seed,
    porchX, porchY, porchW, porchH, canopyY, railH,
    nModules, moduleWs, moduleCXs, pilasterXs, pilasterW,
    triH, triReachRatio,
    stairModule, stairCX, nStairs, stairH, treadH, stairGrow, stairTopW, stairBotY,
    railingPattern, hasGreekKey,
    doorModule, doorW, hasWindow, windowModule,
    interiorShadows,
    windowConfig,
    stairTreadDepths,
  };
}
