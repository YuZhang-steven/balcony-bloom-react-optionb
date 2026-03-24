# Balcony Bloom — React

A procedurally-composed French-Quarter porch study. Click the ironwork;
the garden answers.

## The Module System

A balcony is built from repeating **porch modules** that share pilasters:

```
[Pilaster][── Module ──][Pilaster][── Module ──][Pilaster]
           Side+Triangle+Top        (N modules, N+1 pilasters)
```

One module (`architecture/PorchModule.jsx`) contains:
- **Top frieze** — Greek-key or scroll band
- **Triangle bracket pair** — drawn as ONE half, mirrored about the module
  centre. Reach is < half-width so the two triangles don't always touch.

Pilasters (`architecture/Pilaster.jsx`) flank modules — tall strips of
stacked symmetric motifs. One pilaster is shared between adjacent modules.

Modules can have different widths. The scene generator picks 2-4 modules
and distributes the balcony width among them.

## Symmetry — the Grammar of Cast Iron

`ironwork/Symmetry.jsx` provides the reflection wrappers:

| Wrapper | Operation | Example |
|---|---|---|
| `<MirrorH>` | reflect across x=0 | Heart, Fleur-de-lis |
| `<MirrorV>` | reflect across y=0 | |
| `<Mirror4>` | reflect across both axes | Quatrefoil, Knot |
| `<Rotate2>` | 180° point symmetry | S-scroll |
| `<TileRow>` | repeat tile to fill width, no squish | Railing panels |

`ironwork/motifs.jsx` draws **only the unique half or quarter** of each
motif. The wrappers complete them. To add a new ornament: write one curve,
pick the right wrapper.

## Railing Tiles

Railing patterns are defined as **half-tiles** in a normalised 100-unit-tall
space. `<TileRow>` mirrors them, counts how many fit the span, and spaces
them evenly. The motif never squishes — only the tile COUNT changes.

## Component Tree

```
src/
├── ironwork/
│   ├── Symmetry.jsx      ← MirrorH, Mirror4, Rotate2, TileRow
│   ├── motifs.jsx        ← Quatrefoil, Fleur, Heart, SOrnament, Knot
│   ├── primitives.js     ← cScroll, greekKey, acanthus, bladeLeaf
│   └── IronStroke.jsx    ← double-stroke (outline + verdigris)
│
├── components/
│   ├── Balcony.jsx           ← module composer
│   └── architecture/
│       ├── PorchModule.jsx   ← one bay: frieze + mirrored brackets
│       ├── Pilaster.jsx      ← vertical divider: stacked motifs
│       ├── RailingPanel.jsx  ← half-tile + TileRow
│       ├── Staircase.jsx     ← frontal steps + drum newels
│       └── PorchSlab.jsx     ← floor, wash, door
│
├── game/
│   ├── sceneGenerator.js     ← rolls N modules, pilaster positions
│   ├── AnchorContext.jsx     ← components register click-points
│   └── palettes.js / random.js
│
└── components/plants/        ← railTwine, wisteria, rooftopGarden…
```

## Adding Content

**New motif** → write one curve in `motifs.jsx`, wrap it in a symmetry
component. Add its key to `MOTIF_LIB` in `Pilaster.jsx` to stack it.

**New railing tile** → write a half-tile in `RailingPanel.jsx`, export
`{tileW, render}`, push to `TILES`.

**New module count/width** → adjust `nModules` range in `sceneGenerator.js`.

**New plant** → generator in `plants/generators.js`, register in
`plants/registry.js`.
