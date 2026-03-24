import { STONE, SHADOW } from '../game/palettes';
import type { Scene } from '../../types';

type PorchSlabProps = {
  scene: Scene;
}

export function PorchSlab({ scene }: PorchSlabProps) {
  const { porchX, porchY, porchW, porchH } = scene;
  return (
    <g className="porch-slab">
      <path d={`M ${porchX - 8} ${porchY} L ${porchX + porchW + 8} ${porchY}
                L ${porchX + porchW + 12} ${porchY + porchH} L ${porchX - 12} ${porchY + porchH} Z`}
        fill={STONE.light} opacity={0.72} />
      <path d={`M ${porchX - 8} ${porchY} L ${porchX + porchW + 8} ${porchY}
                L ${porchX + porchW + 8} ${porchY + 10} L ${porchX - 8} ${porchY + 10} Z`}
        fill={STONE.tan} opacity={0.42} />
      <line x1={porchX - 8} y1={porchY} x2={porchX + porchW + 8} y2={porchY}
        stroke="#8a7560" strokeWidth={0.9} opacity={0.32} />
    </g>
  );
}

type InteriorWashProps = {
  scene: Scene;
}

export function InteriorWash({ scene }: InteriorWashProps) {
  const { porchX, porchY, porchW, canopyY, stairBotY, interiorShadows } = scene;

  return (
    <g className="interior-wash">
      <ellipse cx={porchX + porchW * 0.5} cy={canopyY + (porchY - canopyY) * 0.5}
        rx={porchW * 0.52} ry={(porchY - canopyY) * 0.55} fill="#ddd3c0" opacity={0.14} />
      {interiorShadows.map((shadow, i) => (
        <g key={i}>
          <ellipse cx={scene.moduleCXs[i] + shadow.cxOffset} cy={shadow.cy}
            rx={shadow.rx} ry={shadow.ry}
            fill={SHADOW.blue} opacity={shadow.opacity} />
          <ellipse cx={scene.moduleCXs[i] + shadow.deepCxOffset} cy={shadow.deepCy}
            rx={shadow.deepRx} ry={shadow.deepRy}
            fill={SHADOW.deep} opacity={shadow.deepOpacity} />
        </g>
      ))}
      <ellipse cx={porchX + porchW * 0.5} cy={(porchY + stairBotY) / 2}
        rx={porchW * 0.38} ry={(stairBotY - porchY) * 0.45}
        fill={SHADOW.blue} opacity={0.08} />
    </g>
  );
}

type DoorAndWindowProps = {
  scene: Scene;
}

export function DoorAndWindow({ scene }: DoorAndWindowProps) {
  const { porchY, canopyY, moduleCXs, moduleWs,
          doorModule, doorW, hasWindow, windowConfig } = scene;

  const doorCX = moduleCXs[doorModule];
  const doorX = doorCX - doorW / 2;
  const doorH = porchY - canopyY - 42;

  return (
    <g className="door-window">
      <rect x={doorX} y={canopyY + 40} width={doorW} height={doorH}
        fill={SHADOW.deep} opacity={0.32} />
      <rect x={doorX + 6} y={canopyY + 48} width={doorW - 12} height={doorH - 16}
        fill="none" stroke="#6b5f4e" strokeWidth={1.2} opacity={0.32} />
      <rect x={doorX + doorW * 0.47} y={canopyY + 48} width={1.5} height={doorH - 16}
        fill="#6b5f4e" opacity={0.28} />

      {hasWindow && windowConfig && (
        <g>
          <rect x={windowConfig.x} y={windowConfig.y} width={windowConfig.w} height={windowConfig.h}
            fill={SHADOW.blue} opacity={0.30} />
          <path d={`M ${windowConfig.x} ${windowConfig.y + windowConfig.h / 2}
                    L ${windowConfig.x + windowConfig.w} ${windowConfig.y + windowConfig.h / 2}
                    M ${windowConfig.x + windowConfig.w / 2} ${windowConfig.y}
                    L ${windowConfig.x + windowConfig.w / 2} ${windowConfig.y + windowConfig.h}`}
            stroke="#6b5f4e" strokeWidth={1.1} opacity={0.36} fill="none" />
          <rect x={windowConfig.x - 3} y={windowConfig.y - 3}
            width={windowConfig.w + 6} height={windowConfig.h + 6}
            fill="none" stroke="#8a7d68" strokeWidth={1.4} opacity={0.32} />
        </g>
      )}
    </g>
  );
}
