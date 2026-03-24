import { IronStroke } from '../ironwork/IronStroke';
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
      <IronStroke d={`M ${x} ${y} L ${x + w} ${y}`} w={4.2} color={IRON.deep} />
      <IronStroke d={`M ${x} ${y + h} L ${x + w} ${y + h}`} w={3.4} color={IRON.deep} />
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
      <IronStroke d="M 0 54 L 0 50" w={1.8} />
      <IronStroke d="M 28 4 L 28 96" w={2} />
    </g>
  ),
};

const FleurTile = {
  tileW: 64,
  render: () => (
    <g>
      <g transform="translate(0 44)"><Fleur s={30} /></g>
      <g transform="translate(0 82)">
        <MirrorH>
          <IronStroke d="M 0 0 Q 14 -2 18 8 Q 20 16 12 16 Q 6 15 8 9" w={2.1} color={IRON.bright} />
        </MirrorH>
      </g>
      <IronStroke d="M 32 4 L 32 96" w={2.2} />
    </g>
  ),
};

const STile = {
  tileW: 60,
  render: () => (
    <g>
      <g transform="translate(0 50)"><SOrnament s={36} /></g>
      <IronStroke d="M 30 4 L 30 96" w={2} />
    </g>
  ),
};

const TILES = [HeartTile, FleurTile, STile];
