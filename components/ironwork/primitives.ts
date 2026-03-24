export function cScroll(cx: number, cy: number, r: number, dir = 1, turns = 1.35): string {
  const steps = 36;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = dir * t * turns * Math.PI * 2;
    const rr = r * (1 - 0.62 * t);
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    d += (i === 0 ? 'M' : 'L') + ` ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

export function sScroll(x: number, y: number, w: number, h: number): string[] {
  const r = Math.min(w, h) * 0.26;
  const tx = x + w * 0.25, ty = y + r * 0.9;
  const bx = x + w * 0.75, by = y + h - r * 0.9;
  const spine = `M ${tx - r} ${ty} C ${tx - r * 1.2} ${ty + h * 0.35}, ${bx + r * 1.2} ${by - h * 0.35}, ${bx + r} ${by}`;
  let top = `M ${tx - r} ${ty}`;
  for (let i = 1; i <= 18; i++) {
    const t = i / 18, a = Math.PI + t * 1.4 * Math.PI * 2, rr = r * (1 - t * 0.78);
    top += ` L ${(tx + Math.cos(a) * rr).toFixed(2)} ${(ty + Math.sin(a) * rr).toFixed(2)}`;
  }
  let bot = `M ${bx + r} ${by}`;
  for (let i = 1; i <= 18; i++) {
    const t = i / 18, a = t * 1.4 * Math.PI * 2, rr = r * (1 - t * 0.78);
    bot += ` L ${(bx + Math.cos(a) * rr).toFixed(2)} ${(by + Math.sin(a) * rr).toFixed(2)}`;
  }
  return [spine, top, bot];
}

export function heart(cx: number, cy: number, s: number): string[] {
  const left = `M ${cx} ${cy + s} Q ${cx - s * 0.9} ${cy + s * 0.3} ${cx - s * 0.7} ${cy - s * 0.3}
    Q ${cx - s * 0.5} ${cy - s * 0.85} ${cx - s * 0.05} ${cy - s * 0.55}
    Q ${cx + s * 0.25} ${cy - s * 0.35} ${cx} ${cy - s * 0.05}`;
  const right = `M ${cx} ${cy + s} Q ${cx + s * 0.9} ${cy + s * 0.3} ${cx + s * 0.7} ${cy - s * 0.3}
    Q ${cx + s * 0.5} ${cy - s * 0.85} ${cx + s * 0.05} ${cy - s * 0.55}
    Q ${cx - s * 0.25} ${cy - s * 0.35} ${cx} ${cy - s * 0.05}`;
  return [left, right];
}

export function greekKey(x: number, y: number, w: number, h: number): string {
  const unit = h * 1.4;
  let d = `M ${x} ${y + h}`, px = x;
  while (px < x + w - unit) {
    d += ` L ${px} ${y} L ${px + unit * 0.5} ${y} L ${px + unit * 0.5} ${y + h * 0.55}
           L ${px + unit * 0.25} ${y + h * 0.55} L ${px + unit * 0.25} ${y + h * 0.3}
           L ${px + unit * 0.75} ${y + h * 0.3} L ${px + unit * 0.75} ${y + h}
           L ${px + unit} ${y + h}`;
    px += unit;
  }
  return d + ` L ${x + w} ${y + h}`;
}

export function twistBar(x: number, y1: number, y2: number): { main: string; ticks: string } {
  const main = `M ${x} ${y1} L ${x} ${y2}`;
  const ticks: string[] = [];
  const seg = 11, n = Math.floor((y2 - y1) / seg);
  for (let i = 1; i < n; i++) {
    const ty = y1 + i * seg;
    ticks.push(`M ${x - 2.4} ${ty - 1.7} L ${x + 2.4} ${ty + 1.7}`);
  }
  return { main, ticks: ticks.join(' ') };
}

export function acanthus(len: number): string {
  return `M 0 0 Q ${len * 0.15} ${-len * 0.25} ${len * 0.35} ${-len * 0.18}
    Q ${len * 0.5} ${-len * 0.1} ${len * 0.55} ${-len * 0.28}
    Q ${len * 0.7} ${-len * 0.12} ${len * 0.78} ${-len * 0.3}
    Q ${len * 0.92} ${-len * 0.08} ${len} 0
    Q ${len * 0.92} ${len * 0.08} ${len * 0.78} ${len * 0.3}
    Q ${len * 0.7} ${len * 0.12} ${len * 0.55} ${len * 0.28}
    Q ${len * 0.5} ${len * 0.1} ${len * 0.35} ${len * 0.18}
    Q ${len * 0.15} ${len * 0.25} 0 0 Z`;
}

export function bladeLeaf(len: number, width: number): string {
  const w = width * 0.5;
  return `M 0 0
    Q ${len * 0.3} ${-w} ${len * 0.6} ${-w * 0.7}
    Q ${len * 0.85} ${-w * 0.3} ${len} 0
    Q ${len * 0.85} ${w * 0.3} ${len * 0.6} ${w * 0.7}
    Q ${len * 0.3} ${w} 0 0 Z`;
}
