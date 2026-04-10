'use client';
/**
 * MotifCodeEditor.tsx — code viewer, editor, and JSON import/export
 *
 * Shows generated TypeScript using spline() builder syntax.
 * Import/export via JSON (NormalizedSpline data, not SVG strings).
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { StrokeConfig } from './motifTypes';
import { generateCode, parseJson } from './motifRegistry';

type MotifCodeEditorProps = {
  config: StrokeConfig;
  s: number;
  onConfigChange: (next: Partial<StrokeConfig>) => void;
};

export function MotifCodeEditor({ config, s, onConfigChange }: MotifCodeEditorProps) {
  const [code, setCode] = useState(() => generateCode(config, s));
  const [importInput, setImportInput] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copy');
  const [importError, setImportError] = useState('');
  const codeNameRef = useRef(config.name);

  useEffect(() => {
    codeNameRef.current = config.name;
    setCode(generateCode(config, s));
  }, [config, s]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyLabel('Copied!');
      setTimeout(() => setCopyLabel('Copy'), 1800);
    } catch {
      setCopyLabel('Failed');
      setTimeout(() => setCopyLabel('Copy'), 1800);
    }
  };

  const handleImport = () => {
    const parsed = parseJson(importInput);
    if (!parsed || !parsed.spline) {
      setImportError('Invalid JSON. Must contain a "spline" field with start + steps.');
      return;
    }
    setImportError('');
    onConfigChange(parsed);
    setImportInput('');
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name}.stroke.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    } catch {}
  };

  return (
    <div className="ms-code-panel">
      <div className="ms-panel-header">Code</div>

      {/* Generated code (read-only) */}
      <div className="ms-code-section">
        <div className="ms-code-toolbar">
          <span className="ms-code-toolbar-label">TypeScript (spline builder)</span>
          <button className="ms-copy-btn" onClick={handleCopy}>{copyLabel}</button>
        </div>
        <textarea
          className="ms-code-textarea"
          value={code}
          readOnly
          rows={16}
          spellCheck={false}
          aria-label="Generated motif code"
        />
        <div className="ms-hint" style={{ padding: '0.4rem 1rem', borderTop: '1px solid var(--border-wash)' }}>
          Edit via the Spline Nodes panel on the left — preview updates live.
        </div>
      </div>

      {/* Import JSON */}
      <div className="ms-code-section">
        <div className="ms-code-toolbar">
          <span className="ms-code-toolbar-label">Import JSON</span>
          <button className="ms-copy-btn" onClick={handleImport}>Import</button>
        </div>
        <textarea
          className="ms-code-textarea"
          value={importInput}
          onChange={e => setImportInput(e.target.value)}
          rows={6}
          spellCheck={false}
          placeholder={`Paste StrokeConfig JSON here, e.g.:
{
  "name": "MyMotif",
  "spline": { "start": [0, -0.5], "steps": [{ "to": [0.5, 0], "q": [0.3, -0.8] }] },
  "w": 2.5, "color": "#3d8466",
  "symmetry": "MirrorH", "mode": "stroke"
}`}
          aria-label="Import motif JSON"
        />
        {importError && <div className="ms-parse-error">{importError}</div>}
      </div>

      {/* Export */}
      <div className="ms-code-section">
        <div className="ms-code-toolbar">
          <span className="ms-code-toolbar-label">Export</span>
          <button className="ms-copy-btn" onClick={handleExportJson}>.json file</button>
          <button className="ms-copy-btn" onClick={handleCopyJson}>Copy JSON</button>
        </div>
      </div>
    </div>
  );
}
