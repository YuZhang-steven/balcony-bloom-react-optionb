export interface Anchor {
  x: number;
  y: number;
  kind: AnchorKind;
  meta?: AnchorMeta;
}

export type AnchorKind = 'rooftop' | 'canopy' | 'bracket' | 'rail' | 'column' | 'stair' | 'newel';

export interface AnchorMeta {
  flip?: boolean;
  col?: number;
  top?: number;
  bottom?: number;
  railX1?: number;
  railX2?: number;
  railY?: number;
  [key: string]: unknown;
}

export interface PlantElement {
  type: 'path' | 'leaf' | 'dab';
  d?: string;
  x: number;
  y: number;
  stroke?: string;
  w?: number;
  opacity: number;
  fill?: string;
  rx?: number;
  ry?: number;
  rot?: number;
  tx?: number;
  angle?: number;
  anim: AnimationConfig;
}

export interface AnimationConfig {
  kind: 'draw' | 'bloom';
  delay: number;
  dur: number;
}

export interface Plant {
  id: number;
  layer: 'front' | 'back';
  elements: PlantElement[];
}

export interface InteriorShadow {
  cxOffset: number;
  cy: number;
  rx: number;
  ry: number;
  opacity: number;
  deepCxOffset: number;
  deepCy: number;
  deepRx: number;
  deepRy: number;
  deepOpacity: number;
}

export interface Scene {
  seed: number;
  porchX: number;
  porchY: number;
  porchW: number;
  porchH: number;
  canopyY: number;
  railH: number;
  nModules: number;
  moduleWs: number[];
  moduleCXs: number[];
  pilasterXs: number[];
  pilasterW: number;
  triH: number;
  triReachRatio: number;
  stairModule: number;
  stairCX: number;
  nStairs: number;
  stairH: number;
  treadH: number;
  stairGrow: number;
  stairTopW: number;
  stairBotY: number;
  railingPattern: number;
  hasGreekKey: boolean;
  doorModule: number;
  doorW: number;
  hasWindow: boolean;
  windowModule: number;
  interiorShadows: InteriorShadow[];
  windowConfig?: { w: number; h: number; x: number; y: number };
  stairTreadDepths: number[];
}

export interface RailingSegment {
  x: number;
  w: number;
}

export interface StepData {
  x: number;
  y: number;
  w: number;
  treadY: number;
  riserY: number;
  last: boolean;
  i: number;
}

export interface RailPoint {
  x: number;
  y: number;
}

export interface TileConfig {
  tileW: number;
  render: () => React.ReactNode;
}

export interface LeafBlade {
  d: string;
  angle: number;
}
