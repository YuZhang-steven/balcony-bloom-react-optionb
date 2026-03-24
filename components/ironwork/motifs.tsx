import { IronStroke, IronFill } from './IronStroke';
import { MirrorH, Mirror4, Rotate2 } from './Symmetry';
import { IRON } from '../game/palettes';

interface QuatrefoilProps {
  s: number;
  w?: number;
}

export function Quatrefoil({ s, w = 2.6 }: QuatrefoilProps) {
  const quarter = `M 0 ${-s * 0.15}
    Q ${s * 0.15} ${-s * 0.7} ${s * 0.55} ${-s * 0.55}
    Q ${s * 0.7} ${-s * 0.15} ${s * 0.15} 0`;
  return (
    <g>
      <Mirror4>
        <IronStroke d={quarter} w={w} />
      </Mirror4>
      <circle cx={0} cy={0} r={s * 0.12} fill={IRON.deep} />
    </g>
  );
}

interface FleurProps {
  s: number;
  w?: number;
}

export function Fleur({ s, w = 2.5 }: FleurProps) {
  const tipS = `M 0 ${-s * 0.95}
    Q ${s * 0.18} ${-s * 0.65} ${s * 0.08} ${-s * 0.35}
    Q 0 ${-s * 0.12} 0 0`;
  const spiral = `M 0 ${s * 0.05}
    Q ${s * 0.45} ${s * 0.08} ${s * 0.52} ${s * 0.42}
    Q ${s * 0.56} ${s * 0.72} ${s * 0.32} ${s * 0.78}
    Q ${s * 0.14} ${s * 0.8} ${s * 0.15} ${s * 0.62}
    Q ${s * 0.18} ${s * 0.48} ${s * 0.3} ${s * 0.5}`;
  return (
    <MirrorH>
      <IronStroke d={tipS} w={w} />
      <IronStroke d={spiral} w={w * 0.9} color={IRON.bright} />
    </MirrorH>
  );
}

interface HeartProps {
  s: number;
  w?: number;
}

export function Heart({ s, w = 2.6 }: HeartProps) {
  const half = `M 0 ${s}
    Q ${s * 0.9} ${s * 0.3} ${s * 0.7} ${-s * 0.3}
    Q ${s * 0.5} ${-s * 0.85} ${s * 0.05} ${-s * 0.55}
    Q ${-s * 0.22} ${-s * 0.32} 0 ${-s * 0.05}`;
  return <MirrorH><IronStroke d={half} w={w} /></MirrorH>;
}

interface SOrnamentProps {
  s: number;
  w?: number;
}

export function SOrnament({ s, w = 2.8 }: SOrnamentProps) {
  const half = `M ${-s * 0.05} ${s * 0.15}
    Q ${s * 0.35} ${-s * 0.1} ${s * 0.45} ${-s * 0.5}
    Q ${s * 0.52} ${-s * 0.85} ${s * 0.22} ${-s * 0.92}
    Q ${-s * 0.02} ${-s * 0.95} ${-s * 0.06} ${-s * 0.72}
    Q ${-s * 0.08} ${-s * 0.55} ${s * 0.1} ${-s * 0.55}`;
  return <Rotate2><IronStroke d={half} w={w} /></Rotate2>;
}

interface KnotProps {
  s: number;
  w?: number;
}

export function Knot({ s, w = 2.4 }: KnotProps) {
  const q = `M 0 0
    Q ${s * 0.12} ${-s * 0.35} ${s * 0.45} ${-s * 0.45}
    Q ${s * 0.78} ${-s * 0.52} ${s * 0.65} ${-s * 0.2}
    Q ${s * 0.52} ${s * 0.05} ${s * 0.2} 0`;
  return <Mirror4><IronStroke d={q} w={w} color={IRON.bright} /></Mirror4>;
}

interface PendantProps {
  len?: number;
}

export function Pendant({ len = 14 }: PendantProps) {
  return (
    <g>
      <IronStroke d={`M 0 0 L 0 ${len}`} w={1.8} />
      <IronFill d={`M 0 ${len} Q -3.5 ${len + 4} 0 ${len + 10} Q 3.5 ${len + 4} 0 ${len} Z`}
        color={IRON.deep} />
    </g>
  );
}
