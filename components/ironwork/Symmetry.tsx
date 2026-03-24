import type { ReactNode } from 'react';

interface MirrorHProps {
  children: ReactNode;
}

export function MirrorH({ children }: MirrorHProps) {
  return (
    <>
      <g>{children}</g>
      <g transform="scale(-1,1)">{children}</g>
    </>
  );
}

interface MirrorVProps {
  children: ReactNode;
}

export function MirrorV({ children }: MirrorVProps) {
  return (
    <>
      <g>{children}</g>
      <g transform="scale(1,-1)">{children}</g>
    </>
  );
}

interface Mirror4Props {
  children: ReactNode;
}

export function Mirror4({ children }: Mirror4Props) {
  return (
    <>
      <g>{children}</g>
      <g transform="scale(-1,1)">{children}</g>
      <g transform="scale(1,-1)">{children}</g>
      <g transform="scale(-1,-1)">{children}</g>
    </>
  );
}

interface Rotate2Props {
  children: ReactNode;
}

export function Rotate2({ children }: Rotate2Props) {
  return (
    <>
      <g>{children}</g>
      <g transform="rotate(180)">{children}</g>
    </>
  );
}

import { useId } from 'react';

interface TileRowProps {
  x: number;
  y: number;
  w: number;
  h: number;
  tileW: number;
  children: ReactNode;
}

export function TileRow({ x, y, w, h, tileW, children }: TileRowProps) {
  const uid = useId();
  const id = `tile-${uid}`;
  const n = Math.max(1, Math.round(w / tileW));
  const step = w / n;
  const scaleY = h / 100;

  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <g id={id}>{children}</g>
      </defs>
      {Array.from({ length: n }).map((_, i) => (
        <use key={i} href={`#${id}`}
          transform={`translate(${i * step + step / 2} 0) scale(1 ${scaleY})`} />
      ))}
    </g>
  );
}
