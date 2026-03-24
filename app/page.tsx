'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnchorProvider, useAnchors } from '../components/game/AnchorContext';
import { generateScene, VIEW_W, VIEW_H, type Scene } from '../components/game/sceneGenerator';
import { generatePlant, type PlantDesc } from '../components/plants/registry';
import { BalconyBack, BalconyIron } from '../components/Balcony';
import { PlantLayer } from '../components/plants/PlantLayer';
import { DebugPanel } from '../components/debug/DebugPanel';
import { DebugAnchors } from '../components/debug/DebugAnchors';
import { IRON } from '../components/game/palettes';
import './globals.css';

export default function Page() {
  return (
    <AnchorProvider>
      <Game />
    </AnchorProvider>
  );
}

type PlantInstance = {
  id: number;
  layer: 'front' | 'back';
  elements: PlantDesc['elements'];
}

function Game() {
  const router = useRouter();
  const [seed, setSeed] = useState(0);
  const [plants, setPlants] = useState<PlantInstance[]>([]);
  const [scale, setScale] = useState(1);
  const [showAnchors, setShowAnchors] = useState(false);
  const { clearAnchors, nearest } = useAnchors();

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 1e6));
  }, []);

  const sceneRef = useRef<Scene>(generateScene(seed));
  const svgRef = useRef<SVGSVGElement>(null);

  const newBalcony = useCallback(() => {
    clearAnchors();
    setPlants([]);
    const s = Math.floor(Math.random() * 1e6);
    setSeed(s);
    sceneRef.current = generateScene(s);
  }, [clearAnchors]);

  const clearGarden = useCallback(() => setPlants([]), []);

  const handleClick = useCallback((ev: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    const loc = pt.matrixTransform(svg.getScreenCTM()!.inverse());

    const anchor = nearest(loc.x, loc.y, 130);
    if (!anchor) return;

    const rip = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    rip.setAttribute('cx', String(anchor.x));
    rip.setAttribute('cy', String(anchor.y));
    rip.setAttribute('r', '3');
    rip.setAttribute('fill', 'none');
    rip.setAttribute('stroke', IRON.bright);
    rip.setAttribute('stroke-width', '1.5');
    rip.style.pointerEvents = 'none';
    svg.appendChild(rip);
    rip.animate([{ r: 3, opacity: 0.6 }, { r: 26, opacity: 0 }],
      { duration: 650, easing: 'ease-out' }).onfinish = () => rip.remove();

    const desc = generatePlant(anchor);
    setPlants(p => [...p, { id: Date.now() + Math.random(), ...desc }]);
  }, [nearest]);


  return (
    <>
      <svg ref={svgRef} id="stage"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ cursor: 'zoom-in' }}
        onClick={handleClick}>
        <Filters />
        <g transform={`scale(${scale})`} transformOrigin={`${VIEW_W / 2}px ${VIEW_H / 2}px`}>
          <g key={seed}>
            <BalconyBack scene={sceneRef.current} />
            <PlantLayer plants={plants} layer="back" />
            <BalconyIron scene={sceneRef.current} />
            <PlantLayer plants={plants} layer="front" />
          </g>
          <DebugAnchors enabled={showAnchors} />
        </g>
      </svg>

      <DebugPanel
        scale={scale}
        onScaleChange={setScale}
        showAnchors={showAnchors}
        onShowAnchorsChange={setShowAnchors}
      />

      <div id="topbar">
        <header id="masthead">
          <h1>Balcony <span className="bloom">Bloom</span></h1>
          <p className="sub">Touch the ironwork and let the garden answer</p>
        </header>
        <div id="controls">
          <span id="count">
            {plants.length === 0 ? '' : plants.length === 1 ? '1 planting' : `${plants.length} plantings`}
          </span>
          <button onClick={clearGarden}>clear garden</button>
          <button onClick={() => router.push('/motif-studio')}>motif studio</button>
          <button onClick={newBalcony}>new balcony</button>
        </div>
      </div>
    </>
  );
}

function Filters() {
  return (
    <defs>
      <filter id="wash" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="7" result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale="7" />
        <feGaussianBlur stdDeviation="1.8" />
      </filter>
      <filter id="wobble" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale="2.5" />
      </filter>
      <filter id="bloom" x="-40%" y="-40%" width="180%" height="180%">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="5" result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale="3.2" />
        <feGaussianBlur stdDeviation="0.45" />
      </filter>
    </defs>
  );
}
