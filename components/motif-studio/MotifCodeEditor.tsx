'use client';
/**
 * MotifCodeEditor.tsx — code viewer, editor, and parser for the Motif Studio
 *
 * The 1:1 counterpart to MotifPreview. This panel shows generated TypeScript
 * code and lets the user edit it freely. The "Parse" button extracts
 * path/symmetry/w from the edited code back into the controls.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { StrokeConfig } from './motifTypes';
import { generateCode, parseCode } from './motifRegistry';

type MotifCodeEditorProps = {
  config: StrokeConfig;
  s: number;
  onConfigChange: (next: Partial<StrokeConfig>) => void;
};

export function MotifCodeEditor({ config, s, onConfigChange }: MotifCodeEditorProps) {
  // The editable code — kept in local state so typing doesn't
  // constantly re-trigger config updates and re-renders.
  const [code, setCode] = useState(() => generateCode(config, s));
  const [parseInput, setParseInput] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copy');
  const [parseError, setParseError] = useState('');
  // Track which config.name was used to generate `code`
  const codeNameRef = useRef(config.name);

  // Re-generate code whenever the config (from outside) changes — but NOT
  // when the change came from our own textarea edits (identified by name match).
  useEffect(() => {
    if (config.name !== codeNameRef.current) {
      // External change (e.g. switched to a different motif in the strokes list)
      codeNameRef.current = config.name;
      setCode(generateCode(config, s));
    }
    // If names match, do nothing — the user is actively editing this motif.
  }, [config]);

  // Re-generate when s changes too (but only if the user isn't mid-edit)
  useEffect(() => {
    if (config.name === codeNameRef.current) {
      setCode(generateCode(config, s));
    }
  }, [s]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    // Try to parse path and w from partial edits (for live feedback on the preview side)
    const partial = parseCode(newCode);
    if (partial) {
      onConfigChange(partial);
    }
  };

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

  const handleParse = () => {
    const parsed = parseCode(parseInput);
    if (!parsed) {
      setParseError('Could not parse path, symmetry, or w from the code.');
      return;
    }
    setParseError('');
    onConfigChange(parsed);
    // Update local code state to reflect the parsed result
    const merged = { ...config, ...parsed };
    setCode(generateCode(merged, s));
    codeNameRef.current = merged.name;
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name}.stroke.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ms-code-panel">
      <div className="ms-panel-header">Code</div>

      {/* Generated / editable code block */}
      <div className="ms-code-section">
        <div className="ms-code-toolbar">
          <span className="ms-code-toolbar-label">TypeScript</span>
          <button className="ms-copy-btn" onClick={handleCopy}>
            {copyLabel}
          </button>
        </div>
        <textarea
          className="ms-code-textarea"
          value={code}
          onChange={e => handleCodeChange(e.target.value)}
          rows={16}
          spellCheck={false}
          aria-label="Generated motif code"
        />
        <div className="ms-hint" style={{ padding: '0.4rem 1rem', borderTop: '1px solid var(--border-wash)' }}>
          Edit path coords directly — preview updates live.
        </div>
      </div>

      {/* Parse section */}
      <div className="ms-code-section">
        <div className="ms-code-toolbar">
          <span className="ms-code-toolbar-label">Load from motifs.tsx</span>
          <button className="ms-copy-btn" onClick={handleParse}>
            Parse
          </button>
        </div>
        <textarea
          className="ms-code-textarea"
          value={parseInput}
          onChange={e => setParseInput(e.target.value)}
          rows={8}
          spellCheck={false}
          placeholder={`Paste motif code here, e.g.:
export function MyMotif({ s = 80, w = 2.5 }) {
  const half = \`M 0 0 Q ...\`;
  return (
    &lt;MirrorH&gt;
      &lt;IronStroke d={half} w={w} /&gt;
    &lt;/MirrorH&gt;
  );
}`}
          aria-label="Parse motif code"
        />
        {parseError && (
          <div className="ms-parse-error">{parseError}</div>
        )}
      </div>

      {/* Export */}
      <div className="ms-code-section">
        <div className="ms-code-toolbar">
          <span className="ms-code-toolbar-label">Export</span>
          <button className="ms-copy-btn" onClick={handleExportJson}>
            .json
          </button>
        </div>
      </div>
    </div>
  );
}
