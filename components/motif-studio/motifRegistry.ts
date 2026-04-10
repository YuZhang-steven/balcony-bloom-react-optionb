/**
 * motifRegistry.ts — built-in stroke definitions + localStorage CRUD + code gen
 *
 * Built-in motifs store geometry as NormalizedSpline (coordinates as fractions of `s`).
 * No raw SVG path strings — all geometry flows through the IronStrokeModel pipeline.
 */

import type { StrokeConfig, NormalizedSpline, NormalizedStep } from './motifTypes';

// ─── Built-in motifs ─────────────────────────────────────────────────────────

export const BUILT_IN_STROKES: StrokeConfig[] = [
  {
    name: 'Quatrefoil',
    spline: {
      start: [0, -0.15],
      steps: [
        { to: [0.55, -0.55], q: [0.15, -0.7] },
        { to: [0.15, 0],     q: [0.7,  -0.15] },
      ],
    },
    w: 2.6,
    color: '#3d8466',
    symmetry: 'Mirror4',
    mode: 'stroke',
    builtIn: true,
  },
  {
    name: 'Fleur',
    spline: {
      start: [0, -0.95],
      steps: [
        { to: [0.08, -0.35], q: [0.18, -0.65] },
        { to: [0, 0],        q: [0, -0.12] },
      ],
    },
    w: 2.5,
    color: '#3d8466',
    symmetry: 'MirrorH',
    mode: 'stroke',
    builtIn: true,
    extras: {
      spline: {
        start: [0, 0.05],
        steps: [
          { to: [0.52, 0.42], q: [0.45, 0.08] },
          { to: [0.32, 0.78], q: [0.56, 0.72] },
          { to: [0.15, 0.62], q: [0.14, 0.8] },
          { to: [0.3,  0.5],  q: [0.18, 0.48] },
        ],
      },
      w: 2.25,
      color: '#4a9070',
    },
  },
  {
    name: 'Heart',
    spline: {
      start: [0, 1],
      steps: [
        { to: [0.7,  -0.3],  q: [0.9,  0.3] },
        { to: [0.05, -0.55], q: [0.5, -0.85] },
        { to: [0, -0.05],    q: [-0.22, -0.32] },
      ],
    },
    w: 2.6,
    color: '#3d8466',
    symmetry: 'MirrorH',
    mode: 'stroke',
    builtIn: true,
  },
  {
    name: 'SOrnament',
    spline: {
      start: [-0.05, 0.15],
      steps: [
        { to: [0.45, -0.5],   q: [0.35, -0.1] },
        { to: [0.22, -0.92],  q: [0.52, -0.85] },
        { to: [-0.06, -0.72], q: [-0.02, -0.95] },
        { to: [0.1,  -0.55],  q: [-0.08, -0.55] },
      ],
    },
    w: 2.8,
    color: '#3d8466',
    symmetry: 'Rotate2',
    mode: 'stroke',
    builtIn: true,
  },
  {
    name: 'Knot',
    spline: {
      start: [0, 0],
      steps: [
        { to: [0.45, -0.45], q: [0.12, -0.35] },
        { to: [0.65, -0.2],  q: [0.78, -0.52] },
        { to: [0.2, 0],      q: [0.52,  0.05] },
      ],
    },
    w: 2.4,
    color: '#4a9070',
    symmetry: 'Mirror4',
    mode: 'stroke',
    builtIn: true,
  },
  {
    name: 'Pendant',
    spline: {
      start: [0, 0],
      steps: [{ to: [0, 1] }],
    },
    w: 1.8,
    color: '#3d8466',
    symmetry: 'none',
    mode: 'stroke',
    builtIn: true,
  },
];

// ─── localStorage helpers ────────────────────────────────────────────────────

const STORAGE_KEY = 'bb-motif-studio-strokes-v2';

export function loadStrokes(): StrokeConfig[] {
  if (typeof window === 'undefined') return [...BUILT_IN_STROKES];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const user = raw ? (JSON.parse(raw) as StrokeConfig[]) : [];
    return [...BUILT_IN_STROKES, ...user];
  } catch {
    return [...BUILT_IN_STROKES];
  }
}

export function saveStroke(config: StrokeConfig): void {
  if (typeof window === 'undefined') return;
  if (config.builtIn) return;
  const user = loadStrokes().filter(s => !s.builtIn);
  const existing = user.findIndex(s => s.name === config.name);
  if (existing >= 0) {
    user[existing] = { ...config, builtIn: false };
  } else {
    user.push({ ...config, builtIn: false });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function deleteStroke(name: string): void {
  if (typeof window === 'undefined') return;
  if (BUILT_IN_STROKES.some(s => s.name === name)) return;
  const user = loadStrokes().filter(s => !s.builtIn && s.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

// ─── Code generation — produces TypeScript with spline() builder ─────────────

function fmtPt(p: [number, number]): string {
  return `[${p[0]}, ${p[1]}]`;
}

function fmtStep(step: NormalizedStep, indent: string): string {
  if ('c1' in step) {
    return `${indent}{ to: [s*${step.to[0]}, s*${step.to[1]}], c1: [s*${step.c1[0]}, s*${step.c1[1]}], c2: [s*${step.c2[0]}, s*${step.c2[1]}] },`;
  }
  if ('q' in step) {
    return `${indent}{ to: [s*${step.to[0]}, s*${step.to[1]}], q: [s*${step.q[0]}, s*${step.q[1]}] },`;
  }
  return `${indent}{ to: [s*${step.to[0]}, s*${step.to[1]}] },`;
}

export function generateCode(config: StrokeConfig, s = 80): string {
  const { name, spline, w, color, symmetry, mode, extras } = config;
  const Primitive = mode === 'fill' ? 'IronFill' : 'IronStroke';
  const symOpen = symmetry !== 'none' ? `<${symmetry}>` : '';
  const symClose = symmetry !== 'none' ? `</${symmetry}>` : '';

  const stepsCode = spline.steps
    .map(step => fmtStep(step, '      '))
    .join('\n');

  const mainStroke = mode === 'fill'
    ? `<IronFill d={...} color="${color}" />`
    : `<IronStroke stroke={spline(
      [s*${spline.start[0]}, s*${spline.start[1]}],
      [
${stepsCode}
      ],
      { w: ${w}, color: '${color}' },
    )} />`;

  let extrasCode = '';
  if (extras) {
    const eSteps = extras.spline.steps
      .map(step => fmtStep(step, '        '))
      .join('\n');
    extrasCode = `
      ${symOpen ? `${symOpen}\n        ` : ''}<IronStroke stroke={spline(
        [s*${extras.spline.start[0]}, s*${extras.spline.start[1]}],
        [
${eSteps}
        ],
        { w: ${extras.w ?? w}, color: '${extras.color ?? color}' },
      )} />${symClose ? `\n      ${symClose}` : ''}`;
  }

  return `export function ${name}({ s = ${s}, w = ${w} }: { s?: number; w?: number }) {
  return (
    <g>
      ${symOpen}
        ${mainStroke}
      ${symClose}${extrasCode}
    </g>
  );
}`;
}

// ─── Parse JSON → StrokeConfig ───────────────────────────────────────────────

export function parseJson(json: string): Partial<StrokeConfig> | null {
  try {
    const obj = JSON.parse(json);
    if (obj && obj.spline && obj.spline.start && obj.spline.steps) {
      return obj as Partial<StrokeConfig>;
    }
    return null;
  } catch {
    return null;
  }
}
