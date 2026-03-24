'use client';
/**
 * MotifStudio.tsx — main layout for the Motif Studio
 *
 * Four-column layout:
 *   [Controls] | [Code Editor] | [Motif Preview] | [Strokes List]
 *
 * The code and preview panels are equal width (1fr 1fr) — the core
 * of the studio for understanding how code changes affect the motif look.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MotifPreview } from './MotifPreview';
import { MotifControls } from './MotifControls';
import { MotifCodeEditor } from './MotifCodeEditor';
import type { StrokeConfig } from './motifTypes';
import { BUILT_IN_STROKES, loadStrokes, saveStroke, deleteStroke } from './motifRegistry';

const DEFAULT_S = 80;

export function MotifStudio() {
  const router = useRouter();

  // All available strokes (built-in + user-defined)
  const [strokes, setStrokes] = useState<StrokeConfig[]>(BUILT_IN_STROKES);

  // The currently active stroke being edited
  const [active, setActive] = useState<StrokeConfig>(BUILT_IN_STROKES[0]);

  // Preview size parameter
  const [s, setS] = useState(DEFAULT_S);

  // Show alignment grid on the preview
  const [showGrid, setShowGrid] = useState(true);

  // Load strokes from localStorage on mount
  useEffect(() => {
    setStrokes(loadStrokes());
  }, []);

  const handleStrokeSelect = useCallback((stroke: StrokeConfig) => {
    setActive(stroke);
    setS(DEFAULT_S);
  }, []);

  const handleActiveChange = useCallback((next: StrokeConfig | Partial<StrokeConfig>) => {
    const merged = { ...active, ...next };
    setActive(merged);
    // Update in the strokes list
    setStrokes(prev =>
      prev.map(s => s.name === merged.name ? merged : s)
    );
  }, [active]);

  const handleSave = useCallback(() => {
    saveStroke(active);
    setStrokes(loadStrokes());
  }, [active]);

  const handleDelete = useCallback((name: string) => {
    deleteStroke(name);
    setStrokes(loadStrokes());
    // If we deleted the active one, select the first built-in
    if (active.name === name) {
      setActive(BUILT_IN_STROKES[0]);
    }
  }, [active.name]);

  const handleDuplicate = useCallback(() => {
    const newName = `${active.name}_copy`;
    const clone: StrokeConfig = {
      ...active,
      name: newName,
      builtIn: false,
    };
    saveStroke(clone);
    setStrokes(loadStrokes());
    setActive(clone);
  }, [active]);

  const handleReset = useCallback(() => {
    const builtIn = BUILT_IN_STROKES.find(b => b.name === active.name);
    if (builtIn) {
      setActive({ ...builtIn });
      handleActiveChange({ ...builtIn });
    }
  }, [active.name, handleActiveChange]);

  // Evaluate the template-string path with the current s value.
  // Paths in BUILT_IN_STROKES are stored as JS template-literal strings
  // with ${s * ...} tokens. We use new Function so those tokens get
  // evaluated with the current s value to produce the final SVG d string.
  const evalPath = useCallback((path: string): string => {
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('s', `return \`${path}\`;`);
      return fn(s);
    } catch {
      return path;
    }
  }, [s]);

  const builtIns = strokes.filter(s => s.builtIn);
  const userDefs = strokes.filter(s => !s.builtIn);

  return (
    <div className="ms-root">
      {/* Top bar */}
      <header className="ms-topbar">
        <button className="ms-back-btn" onClick={() => router.push('/')}>
          Back to Garden
        </button>
        <h1 className="ms-title">Motif Studio</h1>
        <div className="ms-topbar-right">
          <button
            className={`ms-icon-btn${showGrid ? ' active' : ''}`}
            onClick={() => setShowGrid(g => !g)}
            title="Toggle alignment grid"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="8" y1="1" x2="8" y2="15" />
              <line x1="1" y1="8" x2="15" y2="8" />
              <rect x="2" y="2" width="5" height="5" rx="1" />
              <rect x="9" y="9" width="5" height="5" rx="1" />
            </svg>
          </button>
          <button className="ms-save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </header>

      {/* Four-column body */}
      <div className="ms-body">
        {/* Col 1: Controls */}
        <aside className="ms-controls-col">
          <MotifControls
            config={active}
            s={s}
            onSChange={setS}
            onChange={handleActiveChange}
            onReset={handleReset}
            onDuplicate={handleDuplicate}
          />

          {/* Size presets — lives here because it's the primary interaction */}
          <div className="ms-size-panel">
            <div className="ms-panel-header">Size Presets</div>
            <div className="ms-size-presets">
              {[30, 60, 80, 120, 200].map(v => (
                <button
                  key={v}
                  className={`ms-preset-btn${s === v ? ' active' : ''}`}
                  onClick={() => setS(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Col 2: Code Editor */}
        <section className="ms-code-col">
          <MotifCodeEditor
            config={active}
            s={s}
            onConfigChange={handleActiveChange}
          />
        </section>

        {/* Col 3: Motif Preview */}
        <section className="ms-preview-col">
          <div className="ms-panel-header">
            Preview
            <span className="ms-panel-header-note">centered in 1600 x 780 viewBox</span>
          </div>
          <MotifPreview
            config={active}
            s={s}
            showGrid={showGrid}
            evalPath={evalPath}
          />
        </section>

        {/* Col 4: Strokes List */}
        <aside className="ms-strokes-col">
          <div className="ms-panel-header">Strokes</div>

          <div className="ms-strokes-group-label">Built-in</div>
          <ul className="ms-strokes-list">
            {builtIns.map(stroke => (
              <li key={stroke.name}>
                <button
                  className={`ms-stroke-item${active.name === stroke.name ? ' active' : ''}`}
                  onClick={() => handleStrokeSelect(stroke)}
                >
                  {stroke.name}
                </button>
              </li>
            ))}
          </ul>

          {userDefs.length > 0 && (
            <>
              <div className="ms-strokes-group-label">Custom</div>
              <ul className="ms-strokes-list">
                {userDefs.map(stroke => (
                  <li key={stroke.name} className="ms-stroke-item-row">
                    <button
                      className={`ms-stroke-item${active.name === stroke.name ? ' active' : ''}`}
                      onClick={() => handleStrokeSelect(stroke)}
                    >
                      {stroke.name}
                    </button>
                    <button
                      className="ms-del-btn"
                      onClick={() => handleDelete(stroke.name)}
                      title="Delete"
                    >
                      x
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
