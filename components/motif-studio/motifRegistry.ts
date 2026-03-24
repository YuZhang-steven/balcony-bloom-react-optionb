/**
 * motifRegistry.ts — built-in stroke definitions + localStorage CRUD
 *
 * Built-in motifs are defined as StrokeConfig objects so the Motif Studio
 * can render them, allow users to clone them, and generate copy-ready code.
 */

import type { StrokeConfig, MotifKind, MotifExtras } from './motifTypes';

// ---------------------------------------------------------------------------
// Built-in motifs — must match the path data from ../ironwork/motifs.tsx
// ---------------------------------------------------------------------------

export const BUILT_IN_STROKES: StrokeConfig[] = [
  {
    name: 'Quatrefoil',
    path: `M 0 \${-s * 0.15}
  Q \${s * 0.15} \${-s * 0.7} \${s * 0.55} \${-s * 0.55}
  Q \${s * 0.7} \${-s * 0.15} \${s * 0.15} 0`,
    w: 2.6,
    color: '#3d8466',
    symmetry: 'Mirror4',
    mode: 'stroke',
    builtIn: true,
  },
  {
    name: 'Fleur',
    path: `M 0 \${-s * 0.95}
  Q \${s * 0.18} \${-s * 0.65} \${s * 0.08} \${-s * 0.35}
  Q 0 \${-s * 0.12} 0 0`,
    w: 2.5,
    color: '#3d8466',
    symmetry: 'MirrorH',
    mode: 'stroke',
    builtIn: true,
    // Second path for the spiral accent — handled via extras
    extras: ({ s }: { s: number }): MotifExtras => ({
      path: `M 0 \${s * 0.05}
  Q \${s * 0.45} \${s * 0.08} \${s * 0.52} \${s * 0.42}
  Q \${s * 0.56} \${s * 0.72} \${s * 0.32} \${s * 0.78}
  Q \${s * 0.14} \${s * 0.8} \${s * 0.15} \${s * 0.62}
  Q \${s * 0.18} \${s * 0.48} \${s * 0.3} \${s * 0.5}`,
      w: 2.25,
      color: '#4a9070',
    }),
  },
  {
    name: 'Heart',
    path: `M 0 \${s}
  Q \${s * 0.9} \${s * 0.3} \${s * 0.7} \${-s * 0.3}
  Q \${s * 0.5} \${-s * 0.85} \${s * 0.05} \${-s * 0.55}
  Q \${-s * 0.22} \${-s * 0.32} 0 \${-s * 0.05}`,
    w: 2.6,
    color: '#3d8466',
    symmetry: 'MirrorH',
    mode: 'stroke',
    builtIn: true,
  },
  {
    name: 'SOrnament',
    path: `M \${-s * 0.05} \${s * 0.15}
  Q \${s * 0.35} \${-s * 0.1} \${s * 0.45} \${-s * 0.5}
  Q \${s * 0.52} \${-s * 0.85} \${s * 0.22} \${-s * 0.92}
  Q \${-s * 0.02} \${-s * 0.95} \${-s * 0.06} \${-s * 0.72}
  Q \${-s * 0.08} \${-s * 0.55} \${s * 0.1} \${-s * 0.55}`,
    w: 2.8,
    color: '#3d8466',
    symmetry: 'Rotate2',
    mode: 'stroke',
    builtIn: true,
  },
  {
    name: 'Knot',
    path: `M 0 0
  Q \${s * 0.12} \${-s * 0.35} \${s * 0.45} \${-s * 0.45}
  Q \${s * 0.78} \${-s * 0.52} \${s * 0.65} \${-s * 0.2}
  Q \${s * 0.52} \${s * 0.05} \${s * 0.2} 0`,
    w: 2.4,
    color: '#4a9070',
    symmetry: 'Mirror4',
    mode: 'stroke',
    builtIn: true,
  },
  {
    name: 'Pendant',
    path: `M 0 0 L 0 \${len ?? 14}`,
    w: 1.8,
    color: '#3d8466',
    symmetry: 'none',
    mode: 'stroke',
    builtIn: true,
  },
];

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'bb-motif-studio-strokes';

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
  if (config.builtIn) return; // never overwrite built-ins
  const user = BUILT_IN_STROKES.length === 0
    ? []
    : loadStrokes().filter(s => !s.builtIn);
  const existing = user.findIndex(s => s.name === config.name);
  if (existing >= 0) {
    user[existing] = { ...config, builtIn: false };
  } else {
    user.push({ ...config, builtIn: false });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function deleteStroke(name: MotifKind): void {
  if (typeof window === 'undefined') return;
  const isBuiltIn = BUILT_IN_STROKES.some(s => s.name === name);
  if (isBuiltIn) return;
  const user = loadStrokes()
    .filter(s => !s.builtIn && s.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function loadUserStrokes(): StrokeConfig[] {
  return loadStrokes().filter(s => !s.builtIn);
}

// ---------------------------------------------------------------------------
// Code generation — produces TypeScript pasteable into motifs.tsx
// ---------------------------------------------------------------------------

export function generateCode(config: StrokeConfig, s = 80): string {
  const { name, path, w, color, symmetry, mode, extras } = config;
  const camelName = name.replace(/([A-Z])/g, '_$1').replace(/^/, '');

  let extraCode = '';
  if (extras && typeof extras === 'function') {
    const extra = extras({ s });
    if (extra && extra.path) {
      const extraSym = symmetry === 'none' ? '' : `      <${symmetry}>`;
      const extraSymClose = symmetry === 'none' ? '' : `</${symmetry}>`;
      extraCode = `
      ${extraSym}
        <IronStroke d={${extra.path.replace(/\${s/g, '${s')}} w={${extra.w}} color={IRON.bright} />
      ${extraSymClose}`;
    }
  }

  const symOpen = symmetry === 'none' ? '' : `    <${symmetry}>`;
  const symClose = symmetry === 'none' ? '' : `</${symmetry}>`;
  const Primitive = mode === 'fill' ? 'IronFill' : 'IronStroke';

  // Unescape template literal back-ticks for the generated code
  const escapedPath = path.replace(/\\`/g, '`');

  return `export function ${name}({ s = ${s}, w = ${w} }: { s?: number; w?: number }) {
  const pathD = \`${escapedPath}\`;
  return (
    <g>
${symOpen}
        <${Primitive} d={pathD} w={w} color={IRON.mid} />
${extraCode}
${symClose}
    </g>
  );
}`;
}

// ---------------------------------------------------------------------------
// Parse TypeScript code → StrokeConfig (best-effort)
// ---------------------------------------------------------------------------

export function parseCode(code: string): Partial<StrokeConfig> | null {
  try {
    // Extract d={`...`} — use a multi-line-capable approach without the 's' flag
    const dMatch = code.match(/d=\{`([^`]+)`\}/);
    const path = dMatch ? dMatch[1].trim() : '';

    // Extract w={number} or w={number}
    const wMatch = code.match(/w[=\s]*\{?(\d+\.?\d*)/);
    const w = wMatch ? parseFloat(wMatch[1]) : 2.5;

    // Detect symmetry wrapper
    const hasMirrorH = /\bMirrorH\b/.test(code);
    const hasMirrorV = /\bMirrorV\b/.test(code);
    const hasMirror4 = /\bMirror4\b/.test(code);
    const hasRotate2 = /\bRotate2\b/.test(code);
    let symmetry: StrokeConfig['symmetry'] = 'none';
    if (hasMirrorH) symmetry = 'MirrorH';
    else if (hasMirrorV) symmetry = 'MirrorV';
    else if (hasMirror4) symmetry = 'Mirror4';
    else if (hasRotate2) symmetry = 'Rotate2';

    // Detect mode
    const mode: StrokeConfig['mode'] = /\bIronFill\b/.test(code) ? 'fill' : 'stroke';

    // Extract name from "export function Name"
    const nameMatch = code.match(/export\s+function\s+(\w+)/);
    const name = nameMatch ? nameMatch[1] : 'CustomMotif';

    if (!path) return null;

    return { name, path, w, symmetry, mode, color: '#3d8466' };
  } catch {
    return null;
  }
}
