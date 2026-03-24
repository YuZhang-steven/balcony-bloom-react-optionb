import { IRON } from '../game/palettes';

interface IronStrokeProps {
  d: string;
  w?: number;
  color?: string;
}

export function IronStroke({ d, w = 3, color = IRON.mid }: IronStrokeProps) {
  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={IRON.line}
        strokeWidth={w + 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.78}
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

interface IronFillProps {
  d: string;
  color?: string;
}

export function IronFill({ d, color = IRON.mid }: IronFillProps) {
  return (
    <path d={d} fill={color} />
  );
}

interface FinialProps {
  x: number;
  y: number;
}

export function Finial({ x, y }: FinialProps) {
  return (
    <g>
      <IronFill
        d={`M ${x - 8} ${y} L ${x + 8} ${y} L ${x + 6} ${y - 5} L ${x - 6} ${y - 5} Z`}
        color={IRON.deep}
      />
      <IronFill
        d={`M ${x} ${y - 18} A 9 9 0 1 0 ${x + 0.01} ${y - 18} Z`}
        color={IRON.mid}
      />
      <ellipse
        cx={x - 2}
        cy={y - 16}
        rx={3.2}
        ry={4}
        fill={IRON.bright}
        opacity={0.65}
      />
      <IronFill
        d={`M ${x - 3} ${y - 25} Q ${x} ${y - 31} ${x + 3} ${y - 25} L ${x + 2} ${y - 22} L ${x - 2} ${y - 22} Z`}
        color={IRON.deep}
      />
    </g>
  );
}

interface RosetteProps {
  x: number;
  y: number;
  r: number;
}

export function Rosette({ x, y, r }: RosetteProps) {
  return (
    <g>
      <IronFill
        d={`M ${x - r} ${y} A ${r} ${r} 0 1 0 ${x + r} ${y} A ${r} ${r} 0 1 0 ${x - r} ${y} Z`}
      />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i * Math.PI) / 3;
        const px = x + Math.cos(a) * r * 0.55;
        const py = y + Math.sin(a) * r * 0.55;
        return (
          <ellipse
            key={i}
            cx={px}
            cy={py}
            rx={r * 0.32}
            ry={r * 0.2}
            fill={IRON.bright}
            transform={`rotate(${(a * 180) / Math.PI} ${px} ${py})`}
          />
        );
      })}
      <circle cx={x} cy={y} r={r * 0.22} fill={IRON.deep} />
    </g>
  );
}
