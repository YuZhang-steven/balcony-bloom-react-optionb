import { coin } from '../game/random';
import { ROSE, JASMINE } from '../game/palettes';
import * as G from './generators';

export interface PlantDesc {
  layer: 'front' | 'back';
  elements: Array<{
    type: string;
    x: number;
    y: number;
    rx?: number;
    ry?: number;
    fill?: string;
    opacity: number;
    d?: string;
    stroke?: string;
    w?: number;
    rot?: number;
    angle?: number;
    tx?: number;
    anim: { kind: string; delay: number; dur: number };
  }>;
}

type GeneratorFn = (a: { x: number; y: number; meta?: Record<string, unknown> }) => PlantDesc;

export const plantRegistry: Record<string, GeneratorFn> = {
  rooftop: G.rooftopGarden as GeneratorFn,
  canopy: (a) => coin(0.72) ? G.wisteria(a) as PlantDesc : G.cascade(a) as PlantDesc,
  bracket: (a) => coin(0.6) ? G.wisteria(a) as PlantDesc : G.rose(a) as PlantDesc,
  rail: (a) => coin(0.55) ? G.railTwine(a, ROSE) as PlantDesc : G.railTwine(a, JASMINE) as PlantDesc,
  column: G.wrapColumn as GeneratorFn,
  stair: (a) => coin(0.5) ? G.smallTrail(a) as PlantDesc : G.climbVine(a, JASMINE, true) as PlantDesc,
  newel: G.rose as GeneratorFn,
};

export function generatePlant(anchor: { x: number; y: number; kind: string; meta?: Record<string, unknown> }): PlantDesc {
  const gen = plantRegistry[anchor.kind];
  if (!gen) {
    console.warn(`No plant generator for anchor kind "${anchor.kind}"`);
    return G.rose(anchor as { x: number; y: number }) as PlantDesc;
  }
  return gen(anchor as { x: number; y: number; meta?: Record<string, unknown> });
}
