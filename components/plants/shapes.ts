import { rand } from '../game/random';

export function bladeLeaf(len: number, width: number): string {
  const w = width * 0.5;
  const tip = len * rand(0.9, 1.05);
  return `M 0 0
    Q ${len * 0.25} ${-w * 0.85} ${len * 0.55} ${-w * 0.55}
    Q ${len * 0.8} ${-w * 0.2} ${tip} 0
    Q ${len * 0.8} ${w * 0.2} ${len * 0.55} ${w * 0.55}
    Q ${len * 0.25} ${w * 0.85} 0 0 Z`;
}

export interface LeafBlade {
  d: string;
  angle: number;
}

export function leafFan(nBlades: number, baseLen: number): LeafBlade[] {
  const blades: LeafBlade[] = [];
  for (let i = 0; i < nBlades; i++) {
    const t = nBlades > 1 ? i / (nBlades - 1) : 0.5;
    const angle = (t - 0.5) * rand(60, 100);
    const len = baseLen * (1 - Math.abs(t - 0.5) * 0.3) * rand(0.8, 1.1);
    const w = len * rand(0.22, 0.35);
    blades.push({ d: bladeLeaf(len, w), angle });
  }
  return blades;
}

export function petalDab(sz: number, aspect = 0.6): string {
  const rx = sz, ry = sz * aspect;
  return `M ${-rx} 0 A ${rx} ${ry} 0 1 0 ${rx} 0 A ${rx} ${ry} 0 1 0 ${-rx} 0 Z`;
}

export function ivyLeaf(s: number): string {
  return `M 0 0 Q ${s * 0.8} ${-s * 0.3} ${s} ${s * 0.3}
    Q ${s * 0.5} ${s * 0.9} 0 ${s * 1.1}
    Q ${-s * 0.5} ${s * 0.9} ${-s} ${s * 0.3}
    Q ${-s * 0.8} ${-s * 0.3} 0 0 Z`;
}
