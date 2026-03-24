import { useState, useEffect } from 'react';
import { useAnchors } from '../game/AnchorContext';

interface DebugPanelProps {
  scale: number;
  onScaleChange: (s: number) => void;
  showAnchors: boolean;
  onShowAnchorsChange: (v: boolean) => void;
}

export function DebugPanel({ scale, onScaleChange, showAnchors, onShowAnchorsChange }: DebugPanelProps) {
  const [open, setOpen] = useState(false);
  const [anchors, setAnchors] = useState<ReturnType<ReturnType<typeof useAnchors>['all']>>([]);

  const { all: getAnchors, subscribe } = useAnchors();

  useEffect(() => {
    setAnchors(getAnchors());
    return subscribe(() => setAnchors(getAnchors()));
  }, [getAnchors, subscribe]);

  return (
    <>
      <div id="debug-panel" className={open ? 'open' : ''}>
        <button
          id="debug-toggle"
          onClick={() => setOpen(o => !o)}
          title={open ? 'Close debug panel' : 'Open debug panel'}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="3" fill="currentColor" />
            <line x1="9" y1="1" x2="9" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="9" y1="13" x2="9" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="1" y1="9" x2="5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="13" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3.05" y1="3.05" x2="5.93" y2="5.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12.07" y1="12.07" x2="14.95" y2="14.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="14.95" y1="3.05" x2="12.07" y2="5.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="5.93" y1="12.07" x2="3.05" y2="14.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {open && (
          <div id="debug-body">
            <div className="debug-section-label">DEBUG</div>

            <div className="debug-row">
              <span className="debug-label">Zoom</span>
              <div className="zoom-controls">
                <button
                  className="zoom-btn"
                  onClick={() => onScaleChange(Math.max(0.5, scale - 0.25))}
                  disabled={scale <= 0.5}
                  title="Zoom out"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3.5" y1="6" x2="8.5" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                <span className="zoom-value">{Math.round(scale * 100)}%</span>
                <button
                  className="zoom-btn"
                  onClick={() => onScaleChange(Math.min(3, scale + 0.25))}
                  disabled={scale >= 3}
                  title="Zoom in"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="6" y1="3.5" x2="6" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3.5" y1="6" x2="8.5" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="debug-divider" />

            <div className="debug-row">
              <span className="debug-label">Anchors</span>
              <button
                className={`toggle-btn ${showAnchors ? 'active' : ''}`}
                onClick={() => onShowAnchorsChange(!showAnchors)}
              >
                <span className="toggle-knob" />
              </button>
            </div>

            {showAnchors && (
              <div className="anchor-legend">
                <span className="legend-item rooftop">rooftop</span>
                <span className="legend-item canopy">canopy</span>
                <span className="legend-item bracket">bracket</span>
              </div>
            )}

            <div className="debug-divider" />
            <div className="debug-row anchor-count">
              <span className="debug-label">Count</span>
              <span className="debug-value">{anchors.length}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
