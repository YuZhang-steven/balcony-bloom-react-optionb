import { rand, irand, pick, coin } from '../game/random';
import { WISTERIA, ROSE, JASMINE, BOUGAIN, LEAF, LEAF_LIME, WOOD } from '../game/palettes';
import { bladeLeaf, leafFan, petalDab, ivyLeaf } from './shapes';

export function wisteria(a: { x: number; y: number }) {
  const elements: Array<{
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
    anim: { kind: string; delay: number; dur: number };
  }> = [];
  const nRacemes = irand(3, 6);
  const baseLen = rand(110, 190);

  elements.push({
    type: 'dab', x: a.x + rand(-12, 12), y: a.y + baseLen * 0.5,
    rx: rand(30, 50), ry: baseLen * 0.55, fill: pick([...WISTERIA]), opacity: 0.14,
    anim: { kind: 'bloom', delay: 0, dur: 500 }
  });

  for (let i = 0; i < irand(5, 9); i++) {
    const fan = leafFan(irand(2, 3), rand(14, 24));
    const fx = a.x + rand(-40, 40), fy = a.y + rand(-12, 18);
    fan.forEach((b, bi) => {
      elements.push({
        type: 'leaf', d: b.d, x: fx, y: fy, angle: b.angle + rand(-15, 15),
        fill: pick([...LEAF]), opacity: rand(0.35, 0.58),
        anim: { kind: 'bloom', delay: i * 40 + bi * 20, dur: 400 }
      });
    });
  }

  for (let r = 0; r < nRacemes; r++) {
    const ox = a.x + rand(-38, 38);
    const len = baseLen * rand(0.55, 1.08);
    const sway = rand(-22, 22);
    const delay = r * 120 + rand(0, 80);

    elements.push({
      type: 'path',
      x: ox,
      y: a.y - 4,
      d: `M ${ox} ${a.y - 4} Q ${ox + sway * 0.4} ${a.y + len * 0.35} ${ox + sway * 0.75} ${a.y + len * 0.7}
         Q ${ox + sway} ${a.y + len * 0.92} ${ox + sway * 1.1} ${a.y + len}`,
      stroke: pick([...WOOD]), w: rand(1.1, 1.8), opacity: 0.62,
      anim: { kind: 'draw', delay, dur: 850 }
    });

    const nF = Math.floor(len / 7.5);
    for (let i = 0; i < nF; i++) {
      const t = i / nF;
      const fx = ox + sway * (0.4 * t + 0.7 * t * t) * 0.85 + rand(-7, 7);
      const fy = a.y + len * t + rand(-2, 3);
      const sz = (1 - t * 0.52) * rand(4.5, 7.8);
      const dabs = t < 0.6 ? irand(2, 3) : irand(1, 2);
      for (let d = 0; d < dabs; d++) {
        elements.push({
          type: 'dab', x: fx + rand(-sz * 0.5, sz * 0.5), y: fy + rand(-sz * 0.3, sz * 0.3),
          rx: sz * rand(0.75, 1), ry: sz * rand(0.5, 0.68), rot: rand(-35, 35),
          fill: pick([...WISTERIA]), opacity: rand(0.48, 0.82),
          anim: { kind: 'bloom', delay: delay + 250 + t * 650 + d * 35, dur: 420 }
        });
      }
      if (coin(0.25)) {
        elements.push({
          type: 'dab', x: fx + rand(-2, 2), y: fy + rand(-2, 2),
          rx: sz * 0.48, ry: sz * 0.32,
          fill: '#e8dcea', opacity: rand(0.35, 0.55),
          anim: { kind: 'bloom', delay: delay + 380 + t * 650, dur: 380 }
        });
      }
    }
  }

  return { layer: (coin(0.45) ? 'back' : 'front') as 'front' | 'back', elements };
}

export function rooftopGarden(a: { x: number; y: number }) {
  const elements: Array<{
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
    anim: { kind: string; delay: number; dur: number };
  }> = [];
  const spread = rand(60, 100);
  const rise = rand(45, 75);
  const droop = rand(20, 45);

  const layers = [
    { pals: [LEAF[3], LEAF[4], '#2a5530'], scale: 1.15, yOff: 2,   len: [22, 36], op: [0.38, 0.55], n: [6, 10] },
    { pals: [LEAF[1], LEAF[2], LEAF[3]],   scale: 1.0,  yOff: -6,  len: [18, 30], op: [0.42, 0.60], n: [7, 12] },
    { pals: [LEAF[0], LEAF[1], '#6aa058'], scale: 0.85, yOff: -12, len: [15, 26], op: [0.45, 0.65], n: [7, 13] },
    { pals: [...LEAF_LIME],               scale: 0.65, yOff: -18, len: [12, 22], op: [0.35, 0.55], n: [5, 10] },
  ];

  let di = 0;
  for (const L of layers) {
    const nFans = irand(L.n[0], L.n[1]);
    for (let i = 0; i < nFans; i++) {
      const fx = a.x + rand(-spread * L.scale, spread * L.scale);
      const fy = L.yOff + rand(-rise * 0.4, droop * 0.3);
      const baseLen = rand(L.len[0], L.len[1]);
      const nBlades = irand(3, 6);
      const fanRot = rand(-50, 50);
      const blades = leafFan(nBlades, baseLen);
      blades.forEach((b, bi) => {
        elements.push({
          type: 'leaf', d: b.d, x: fx, y: fy,
          angle: fanRot + b.angle,
          fill: pick(L.pals), opacity: rand(L.op[0], L.op[1]),
          anim: { kind: 'bloom', delay: di * 12 + bi * 8, dur: 420 }
        });
      });
      di++;
    }
  }

  const nClusters = irand(6, 12);
  for (let c = 0; c < nClusters; c++) {
    const fx = a.x + rand(-spread * 0.9, spread * 0.9);
    const fy = a.y + rand(-rise * 0.55, droop * 0.25);
    const pal = coin(0.6) ? [...WISTERIA] : [...ROSE];
    const nDabs = irand(5, 12);
    for (let d = 0; d < nDabs; d++) {
      const sz = rand(4.5, 9.5);
      elements.push({
        type: 'dab', x: fx + rand(-16, 16), y: fy + rand(-9, 12),
        rx: sz * rand(0.65, 1.1), ry: sz * rand(0.4, 0.75), rot: rand(-45, 45),
        fill: pick(pal), opacity: rand(0.48, 0.82),
        anim: { kind: 'bloom', delay: 140 + c * 45 + d * 20, dur: 400 }
      });
    }
    if (coin(0.35)) {
      elements.push({
        type: 'dab', x: fx + rand(-5, 5), y: fy + rand(-3, 3),
        rx: rand(3.5, 6), ry: rand(2, 4),
        fill: '#e8dcea', opacity: rand(0.35, 0.55),
        anim: { kind: 'bloom', delay: 200 + c * 45, dur: 350 }
      });
    }
  }

  const nTrails = irand(3, 6);
  for (let t = 0; t < nTrails; t++) {
    const tx = a.x + rand(-spread * 0.8, spread * 0.8);
    const len = rand(40, 95);
    const sway = rand(-14, 14);
    const delay = 260 + t * 85;
    elements.push({
      type: 'path',
      x: tx,
      y: a.y + 4,
      d: `M ${tx} ${a.y + 4} Q ${tx + sway * 0.4} ${a.y + len * 0.45} ${tx + sway} ${a.y + len}`,
      stroke: pick([...WOOD]), w: rand(1.0, 1.5), opacity: 0.55,
      anim: { kind: 'draw', delay, dur: 700 }
    });
    const nF = Math.floor(len / 7);
    for (let i = 0; i < nF; i++) {
      const tt = i / nF;
      const sz = (1 - tt * 0.45) * rand(4, 6.5);
      elements.push({
        type: 'dab',
        x: tx + sway * tt + rand(-5, 5), y: a.y + 4 + len * tt,
        rx: sz * rand(0.7, 1), ry: sz * rand(0.4, 0.65), rot: rand(-30, 30),
        fill: pick([...WISTERIA]), opacity: rand(0.42, 0.74),
        anim: { kind: 'bloom', delay: delay + 120 + tt * 480, dur: 350 }
      });
    }
  }

  if (coin(0.6)) {
    const dir = coin() ? -1 : 1;
    const len = rand(75, 140);
    const sx = a.x + dir * spread * 0.6;
    const ex = sx + dir * len, ey = a.y + rand(35, 80);
    const path = `M ${sx} ${a.y - rise * 0.2}
      Q ${sx + dir * len * 0.3} ${a.y - rise * 0.12} ${sx + dir * len * 0.55} ${a.y + 10}
      Q ${sx + dir * len * 0.8} ${(ey + a.y) / 2} ${ex} ${ey}`;
    elements.push({
      type: 'path', x: sx, y: a.y - rise * 0.2, d: path, stroke: pick([...LEAF]), w: rand(1.5, 2.2), opacity: 0.58,
      anim: { kind: 'draw', delay: 200, dur: 900 }
    });
    for (let i = 1; i < 9; i++) {
      const t = i / 9;
      const px = sx + dir * len * t;
      const py = a.y - rise * 0.2 + (ey - (a.y - rise * 0.2)) * t * t;
      const fan = leafFan(irand(2, 3), rand(12, 20));
      fan.forEach((b, bi) => {
        elements.push({
          type: 'leaf', d: b.d, x: px, y: py,
          angle: rand(-60, 60) + b.angle, fill: pick([...LEAF]), opacity: rand(0.4, 0.62),
          anim: { kind: 'bloom', delay: 320 + i * 65 + bi * 15, dur: 380 }
        });
      });
      if (coin(0.4)) {
        elements.push({
          type: 'dab', x: px + rand(-5, 5), y: py + rand(-4, 4),
          rx: rand(3, 5), ry: rand(2, 3.5), rot: rand(-40, 40),
          fill: pick(coin() ? [...WISTERIA] : [...ROSE]), opacity: rand(0.45, 0.7),
          anim: { kind: 'bloom', delay: 380 + i * 65, dur: 350 }
        });
      }
    }
  }

  return { layer: 'back' as const, elements };
}

export function railTwine(a: { x: number; y: number; meta?: { railX1?: number; railX2?: number; railY?: number } }, pal: readonly string[] = [...ROSE]) {
  const elements: Array<{
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
  }> = [];
  const meta = a.meta || {};
  const x1 = meta.railX1 ?? a.x - 60;
  const x2 = meta.railX2 ?? a.x + 60;
  const railY = meta.railY ?? a.y;

  const dir = coin() ? 1 : -1;
  const reach = rand(55, 110);
  const endX = Math.max(x1 + 8, Math.min(x2 - 8, a.x + dir * reach));
  const span = endX - a.x;

  const steps = 14;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = a.x + span * t;
    const py = railY + Math.sin(t * Math.PI * rand(1.5, 2.5)) * rand(3, 6)
             + (t > 0.8 ? (t - 0.8) * rand(20, 45) : 0);
    pts.push({ x: px, y: py, t });
  }
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
  elements.push({
    type: 'path', x: pts[0].x, y: pts[0].y, d, stroke: pick([...LEAF]), w: rand(1.6, 2.2), opacity: 0.68,
    anim: { kind: 'draw', delay: 0, dur: 900 }
  });

  elements.push({
    type: 'path',
    x: a.x,
    y: railY + 3,
    d: `M ${a.x} ${railY + 3} Q ${a.x + 6} ${railY - 3} ${a.x + 2} ${railY - 7}
       Q ${a.x - 3} ${railY - 10} ${a.x + 1} ${railY - 13}`,
    stroke: pick([...LEAF]), w: 1.1, opacity: 0.55,
    anim: { kind: 'draw', delay: 120, dur: 500 }
  });

  for (const p of pts) {
    if (p.t < 0.1) continue;
    const side = p.t < 0.85 ? 1 : (coin() ? 1 : -1);
    if (coin(0.6)) {
      elements.push({
        type: 'leaf', d: bladeLeaf(rand(9, 16), rand(3, 5.5)),
        x: p.x + rand(-3, 3), y: p.y + side * rand(2, 5),
        angle: 90 + rand(-35, 35),
        fill: pick([...LEAF]), opacity: rand(0.45, 0.68),
        anim: { kind: 'bloom', delay: 180 + p.t * 700, dur: 380 }
      });
    }
    if (coin(0.45)) {
      const nPet = pal === JASMINE ? 5 : 4;
      const fx = p.x + rand(-4, 4), fy = p.y + rand(1, 6);
      for (let k = 0; k < nPet; k++) {
        elements.push({
          type: 'dab', x: fx, y: fy,
          rx: rand(3, 5), ry: rand(1.8, 3), rot: k * (360 / nPet) + rand(-12, 12),
          tx: rand(2.5, 4), fill: pick([...pal]), opacity: rand(0.55, 0.85),
          anim: { kind: 'bloom', delay: 260 + p.t * 700 + k * 25, dur: 340 }
        });
      }
    }
  }

  return { layer: 'front', elements };
}

export function climbVine(a: { x: number; y: number }, pal: readonly string[] = [...ROSE], small = true) {
  const elements: Array<{
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
  }> = [];
  const h = small ? rand(45, 75) : rand(85, 130);
  const sway = rand(12, 24) * (coin() ? 1 : -1);
  const cx = a.x + rand(-8, 8);

  const vine = `M ${a.x} ${a.y + rand(6, 14)}
    Q ${cx - sway * 0.25} ${a.y + 3} ${cx} ${a.y}
    Q ${cx + sway * 0.35} ${a.y - h * 0.3} ${cx + sway * 0.2} ${a.y - h * 0.55}
    Q ${cx + sway * 0.55} ${a.y - h * 0.8} ${cx + sway} ${a.y - h}`;
  elements.push({
    type: 'path', x: a.x, y: a.y + rand(6, 14), d: vine, stroke: pick([...LEAF]), w: rand(1.5, 2.1), opacity: 0.68,
    anim: { kind: 'draw', delay: 0, dur: 900 }
  });

  const nLeaf = Math.floor(h / 14);
  for (let i = 1; i <= nLeaf; i++) {
    const t = i / nLeaf;
    const px = cx + sway * (0.3 + t * 0.5);
    const py = a.y - h * t;
    const side = i % 2 ? 1 : -1;
    elements.push({
      type: 'leaf', d: bladeLeaf(rand(8, 13), rand(3, 4.5)),
      x: px + side * rand(3, 6), y: py, angle: side * rand(20, 55),
      fill: pick([...LEAF]), opacity: rand(0.45, 0.68),
      anim: { kind: 'bloom', delay: 200 + t * 700, dur: 360 }
    });
    if (coin(0.5)) {
      for (let k = 0; k < 4; k++) {
        elements.push({
          type: 'dab', x: px - side * 3 + rand(-2, 2), y: py + rand(-2, 2),
          rx: rand(2.8, 4.5), ry: rand(1.6, 2.8), rot: k * 90 + rand(-10, 10),
          tx: rand(2.2, 3.8), fill: pick([...pal]), opacity: rand(0.55, 0.85),
          anim: { kind: 'bloom', delay: 280 + t * 700 + k * 28, dur: 340 }
        });
      }
    }
  }

  return { layer: (coin() ? 'back' : 'front') as 'front' | 'back', elements };
}

export function wrapColumn(a: { x: number; y: number; meta?: { col?: number } }) {
  const elements: Array<{
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
  }> = [];
  const colX = a.meta?.col ?? a.x;
  const h = rand(130, 210);
  const amp = rand(11, 17);
  const loops = rand(2.4, 3.6);

  let d = `M ${colX} ${a.y + 10}`;
  const pts = [];
  for (let i = 1; i <= 60; i++) {
    const t = i / 60, y = a.y + 10 - h * t;
    const x = colX + Math.sin(t * loops * Math.PI * 2) * amp;
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    pts.push({ x, y, t, front: Math.sin(t * loops * Math.PI * 2) > 0 });
  }
  elements.push({
    type: 'path', x: colX, y: a.y + 10, d, stroke: pick([...LEAF]), w: 1.9, opacity: 0.7,
    anim: { kind: 'draw', delay: 0, dur: 1250 }
  });

  for (const p of pts) {
    if (p.front && coin(0.3)) {
      for (let k = 0; k < 5; k++) {
        elements.push({
          type: 'dab', x: p.x, y: p.y,
          rx: rand(2.8, 4), ry: rand(1.5, 2.4), rot: k * 72 + rand(-10, 10), tx: 3.2,
          fill: pick([...JASMINE]), opacity: rand(0.6, 0.85),
          anim: { kind: 'bloom', delay: 250 + p.t * 900 + k * 25, dur: 320 }
        });
      }
    }
    if (coin(0.22)) {
      elements.push({
        type: 'leaf', d: bladeLeaf(rand(7, 12), rand(2.5, 4)),
        x: p.x + rand(-4, 4), y: p.y, angle: rand(-50, 50),
        fill: pick([...LEAF]), opacity: rand(0.4, 0.62),
        anim: { kind: 'bloom', delay: 200 + p.t * 900, dur: 340 }
      });
    }
  }

  return { layer: (coin(0.55) ? 'front' : 'back') as 'front' | 'back', elements };
}

export function rose(a: { x: number; y: number }) {
  const elements: Array<{
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
  }> = [];
  const nBlooms = irand(3, 5);

  elements.push({
    type: 'path',
    x: a.x,
    y: a.y + 6,
    d: `M ${a.x} ${a.y + 6} Q ${a.x + rand(-18, 18)} ${a.y - rand(18, 35)} ${a.x + rand(-28, 28)} ${a.y - rand(40, 65)}`,
    stroke: pick([...WOOD]), w: 1.8, opacity: 0.58,
    anim: { kind: 'draw', delay: 0, dur: 620 }
  });

  for (let i = 0; i < nBlooms; i++) {
    const bx = a.x + rand(-32, 32), by = a.y + rand(-55, 8);
    const delay = 180 + i * 140;
    const rings = irand(2, 3);
    for (let r = rings; r >= 1; r--) {
      const rad = r * rand(4.2, 5.8);
      for (let k = 0; k < 5 + r; k++) {
        elements.push({
          type: 'dab', x: bx, y: by,
          rx: rad * 0.7, ry: rad * 0.45,
          rot: k * (360 / (5 + r)) + rand(-10, 10), tx: rad * 0.55,
          fill: pick([...ROSE]), opacity: rand(0.42, 0.72),
          anim: { kind: 'bloom', delay: delay + (rings - r) * 110 + k * 22, dur: 420 }
        });
      }
    }
    for (let k = 0; k < irand(2, 4); k++) {
      elements.push({
        type: 'leaf', d: bladeLeaf(rand(10, 16), rand(4, 7)),
        x: bx + rand(-14, 14), y: by + rand(6, 20), angle: rand(-40, 40),
        fill: pick([...LEAF]), opacity: rand(0.45, 0.65),
        anim: { kind: 'bloom', delay: delay + 60 + k * 50, dur: 360 }
      });
    }
  }

  return { layer: 'front', elements };
}

export function smallTrail(a: { x: number; y: number }) {
  const elements: Array<{
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
    anim: { kind: string; delay: number; dur: number };
  }> = [];
  const len = rand(45, 80), sway = rand(-15, 15);
  elements.push({
    type: 'path',
    x: a.x,
    y: a.y,
    d: `M ${a.x} ${a.y} Q ${a.x + sway * 0.5} ${a.y + len * 0.5} ${a.x + sway} ${a.y + len}`,
    stroke: pick([...LEAF]), w: 1.3, opacity: 0.62,
    anim: { kind: 'draw', delay: 0, dur: 680 }
  });
  const n = Math.floor(len / 9);
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    elements.push({
      type: 'leaf', d: ivyLeaf(rand(4, 7)),
      x: a.x + sway * t + rand(-4, 4), y: a.y + len * t, angle: rand(-30, 30),
      fill: pick([...LEAF]), opacity: rand(0.5, 0.75),
      anim: { kind: 'bloom', delay: 150 + t * 550, dur: 360 }
    });
  }
  return { layer: 'front', elements };
}

export function cascade(a: { x: number; y: number }) {
  const elements: Array<{
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
  }> = [];
  const n = irand(3, 5), baseLen = rand(85, 145);
  for (let r = 0; r < n; r++) {
    const ox = a.x + rand(-30, 30), len = baseLen * rand(0.6, 1), sway = rand(-18, 18);
    const delay = r * 110;
    elements.push({
      type: 'path',
      x: ox,
      y: a.y,
      d: `M ${ox} ${a.y} Q ${ox + sway * 0.5} ${a.y + len * 0.5} ${ox + sway} ${a.y + len}`,
      stroke: pick([...LEAF]), w: 1.4, opacity: 0.55,
      anim: { kind: 'draw', delay, dur: 700 }
    });
    const nF = Math.floor(len / 11);
    for (let i = 0; i < nF; i++) {
      const t = i / nF, fx = ox + sway * t + rand(-6, 6), fy = a.y + len * t;
      for (let k = 0; k < 3; k++) {
        elements.push({
          type: 'dab', x: fx, y: fy,
          rx: rand(4, 6.5), ry: rand(2.5, 4),
          rot: k * 120 + rand(-15, 15), tx: rand(3, 5),
          fill: pick([...BOUGAIN]), opacity: rand(0.5, 0.78),
          anim: { kind: 'bloom', delay: delay + 200 + t * 550 + k * 35, dur: 380 }
        });
      }
    }
  }
  return { layer: 'front', elements };
}
