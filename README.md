# Balcony Bloom — React

A procedurally-composed French-Quarter porch study. Click the ironwork;
the garden answers.

## The Module System

A balcony is built from repeating **porch modules** that share pilasters:

```
[Pilaster][── Module ──][Pilaster][── Module ──][Pilaster]
           Side+Triangle+Top        (N modules, N+1 pilasters)
```

One module (`architecture/PorchModule.tsx`) contains:
- **Top frieze** — Greek-key or scroll band
- **Triangle bracket pair** — drawn as ONE half, mirrored about the module
  centre. Reach is < half-width so the two triangles don't always touch.

Pilasters (`architecture/Pilaster.tsx`) flank modules — tall strips of
stacked symmetric motifs. One pilaster is shared between adjacent modules.

Modules can have different widths. The scene generator picks 2-4 modules
and distributes the balcony width among them.

## Symmetry — the Grammar of Cast Iron

`ironwork/Symmetry.tsx` provides the reflection wrappers:

| Wrapper | Operation | Example |
|---|---|---|
| `<MirrorH>` | reflect across x=0 | Heart, Fleur-de-lis |
| `<MirrorV>` | reflect across y=0 | |
| `<Mirror4>` | reflect across both axes | Quatrefoil, Knot |
| `<Rotate2>` | 180° point symmetry | S-scroll |
| `<TileRow>` | repeat tile to fill width, no squish | Railing panels |

`ironwork/motifs.tsx` draws **only the unique half or quarter** of each
motif. The wrappers complete them. To add a new ornament: write one curve,
pick the right wrapper.

## Railing Tiles

Railing patterns are defined as **half-tiles** in a normalised 100-unit-tall
space. `<TileRow>` mirrors them, counts how many fit the span, and spaces
them evenly. The motif never squishes — only the tile COUNT changes.

```
src/                         (source root)
├── types/
│   └── index.ts              ← shared TypeScript types
│
├── components/
│   ├── Balcony.tsx           ← module composer + scene assembly
│   ├── architecture/
│   │   ├── PorchModule.tsx   ← one bay: frieze + mirrored brackets
│   │   ├── Pilaster.tsx      ← vertical divider: stacked motifs
│   │   ├── RailingPanel.tsx  ← half-tile + TileRow
│   │   ├── Staircase.tsx     ← frontal steps + drum newels
│   │   └── PorchSlab.tsx     ← floor, wash, door
│   ├── ironwork/
│   │   ├── Symmetry.tsx      ← MirrorH, Mirror4, Rotate2, TileRow
│   │   ├── motifs.tsx        ← Quatrefoil, Fleur, Heart, SOrnament, Knot
│   │   ├── primitives.ts     ← cScroll, greekKey, acanthus, bladeLeaf
│   │   └── IronStroke.tsx    ← double-stroke (outline + verdigris)
│   ├── game/
│   │   ├── sceneGenerator.ts ← rolls N modules, pilaster positions
│   │   ├── AnchorContext.tsx  ← components register click-points
│   │   ├── palettes.ts
│   │   └── random.ts
│   ├── plants/
│   │   ├── PlantLayer.tsx    ← renders all plant layers
│   │   ├── generators.ts     ← procedural plant generators
│   │   ├── registry.ts       ← plant type registry
│   │   └── shapes.ts        ← shared plant path helpers
│   ├── debug/
│   │   ├── DebugAnchors.tsx  ← click-point overlay
│   │   └── DebugPanel.tsx    ← dev controls panel
│   └── motif-studio/
│       ├── MotifStudio.tsx   ← interactive motif editor shell
│       ├── MotifCodeEditor.tsx
│       ├── MotifControls.tsx
│       ├── MotifPreview.tsx
│       ├── motifRegistry.ts
│       └── motifTypes.ts
│
└── app/                      ← Next.js App Router
    ├── layout.tsx
    ├── page.tsx              ← main scene page
    ├── globals.css
    └── motif-studio/
        └── page.tsx          ← /motif-studio route
```

## Adding Content

**New motif** → write one curve in `motifs.tsx`, wrap it in a symmetry
component. Add its key to `MOTIF_LIB` in `Pilaster.tsx` to stack it.

**New railing tile** → write a half-tile in `RailingPanel.tsx`, export
`{tileW, render}`, push to `TILES`.

**New module count/width** → adjust `nModules` range in `sceneGenerator.ts`.

**New plant** → generator in `plants/generators.ts`, register in
`plants/registry.ts`.

**New motif-studio preset** → define a preset in `motifRegistry.ts` and
add its type to `motifTypes.ts`.
