import { IronStroke } from '../ironwork/IronStroke';
import { line, spline } from '../ironwork/strokeBuilder';
import { MirrorH, TileRow } from '../ironwork/Symmetry';
import { Heart, Fleur, SOrnament } from '../ironwork/motifs';
import { IRON } from '../game/palettes';
import { useRegisterAnchors } from '../game/AnchorContext';
import type { Anchor } from '../../types';

type RailingPanelProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  pattern: number;
}

export function RailingPanel({ x, y, w, h, pattern }: RailingPanelProps) {
  const anchors: Anchor[] = [];
  const nA = Math.max(2, Math.floor(w / 90));
  for (let i = 0; i < nA; i++) {
    anchors.push({ x: x + w * (i + 0.5) / nA, y: y + 2, kind: 'rail',
                   meta: { railX1: x, railX2: x + w, railY: y } });
  }
  useRegisterAnchors(anchors);

  const Tile = TILES[pattern] || TILES[0];

  return (
    <g className="railing-panel">
      <IronStroke stroke={line([x, y], [x + w, y], { w: 4.2, color: IRON.deep })} />
      <IronStroke stroke={line([x, y + h], [x + w, y + h], { w: 3.4, color: IRON.deep })} />
      <TileRow x={x} y={y} w={w} h={h} tileW={Tile.tileW}>
        <Tile.render />
      </TileRow>
    </g>
  );
}

const HeartTile = {
  tileW: 56,
  render: () => (
    <g>
      <g transform="translate(0 30)"><Heart s={24} /></g>
      <g transform="translate(0 72)"><Heart s={20} /></g>
      <IronStroke stroke={line([0, 54], [0, 50], { w: 1.8 })} />
      <IronStroke stroke={line([28, 4], [28, 96], { w: 2 })} />
    </g>
  ),
};

const FleurTile = {
  tileW: 64,
  render: () => {
    const scrollCurl = spline(
      [0, 0],
      [
        { to: [18, 8],  q: [14, -2] },
        { to: [12, 16], q: [20, 16] },
        { to: [8, 9],   q: [6, 15]  },
      ],
      { w: 2.1, color: IRON.bright },
    );
    return (
      <g>
        <g transform="translate(0 44)"><Fleur s={30} /></g>
        <g transform="translate(0 82)">
          <MirrorH>
            <IronStroke stroke={scrollCurl} />
          </MirrorH>
        </g>
        <IronStroke stroke={line([32, 4], [32, 96], { w: 2.2 })} />
      </g>
    );
  },
};

const STile = {
  tileW: 60,
  render: () => (
    <g>
      <g transform="translate(0 50)"><SOrnament s={36} /></g>
      <IronStroke stroke={line([30, 4], [30, 96], { w: 2 })} />
    </g>
  ),
};

const TILES = [HeartTile, FleurTile, STile];
