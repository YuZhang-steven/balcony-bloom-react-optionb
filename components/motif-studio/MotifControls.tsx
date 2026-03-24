'use client';
/**
 * MotifControls.tsx — parameter panel for the Motif Studio
 *
 * Provides all editable controls for a StrokeConfig:
 *   - Name
 *   - Path `d` attribute (large textarea)
 *   - Size (s) slider
 *   - Stroke width (w) slider
 *   - Color selector
 *   - Symmetry mode
 *   - Fill / Stroke toggle
 *   - Grid overlay toggle
 *   - Reset to defaults
 */

import type { StrokeConfig, SymmetryMode, MotifMode } from './motifTypes';
import { IRON } from '../game/palettes';

type MotifControlsProps = {
  config: StrokeConfig;
  s: number;
  onSChange: (v: number) => void;
  onChange: (next: StrokeConfig) => void;
  onReset: () => void;
  onDuplicate: () => void;
};

const SYMMETRY_OPTIONS: { value: SymmetryMode; label: string }[] = [
  { value: 'none',    label: 'None' },
  { value: 'MirrorH', label: 'Mirror H' },
  { value: 'MirrorV', label: 'Mirror V' },
  { value: 'Mirror4', label: 'Mirror 4x' },
  { value: 'Rotate2',  label: 'Rotate 180' },
];

const COLOR_OPTIONS = [
  { value: IRON.bright, label: 'Bright' },
  { value: IRON.mid,    label: 'Mid' },
  { value: IRON.deep,   label: 'Deep' },
  { value: '#c8a96e',   label: 'Gold accent' },
  { value: '#8b7355',   label: 'Bronze' },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="ms-field">
      <label className="ms-label">{label}</label>
      <div className="ms-field-body">{children}</div>
    </div>
  );
}

export function MotifControls({ config, s, onSChange, onChange, onReset, onDuplicate }: MotifControlsProps) {
  const update = (patch: Partial<StrokeConfig>) =>
    onChange({ ...config, ...patch });

  return (
    <div className="ms-controls-panel">
      <div className="ms-panel-header">Stroke Config</div>

      <Field label="Name">
        <input
          type="text"
          className="ms-input"
          value={config.name}
          onChange={e => update({ name: e.target.value })}
          placeholder="MotifName"
        />
      </Field>

      <Field label="Path d">
        <textarea
          className="ms-textarea"
          value={config.path}
          onChange={e => update({ path: e.target.value })}
          rows={8}
          spellCheck={false}
          placeholder="M 0 0 Q ..."
        />
        <div className="ms-hint">Use ${`{s * ...}`} for size-relative coords. M/L/Q/C/Z commands.</div>
      </Field>

      <Field label={`Stroke Width (w = ${config.w})`}>
        <input
          type="range"
          className="ms-range ms-range-full"
          min={0.5}
          max={8}
          step={0.1}
          value={config.w}
          onChange={e => update({ w: parseFloat(e.target.value) })}
        />
        <span className="ms-range-val">{config.w.toFixed(1)}</span>
      </Field>

      <Field label={`Preview Size (s = ${s})`}>
        <input
          type="range"
          className="ms-range ms-range-full"
          min={10}
          max={300}
          value={s}
          onChange={e => onSChange(parseInt(e.target.value))}
        />
        <span className="ms-range-val">{s}</span>
      </Field>

      <Field label="Color">
        <select
          className="ms-select"
          value={config.color}
          onChange={e => update({ color: e.target.value })}
        >
          {COLOR_OPTIONS.map(o => (
            <option key={o.label} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input
          type="color"
          className="ms-color-swatch"
          value={config.color}
          onChange={e => update({ color: e.target.value })}
          title="Custom color"
        />
      </Field>

      <Field label="Symmetry">
        <div className="ms-radio-group">
          {SYMMETRY_OPTIONS.map(o => (
            <label key={o.value} className="ms-radio">
              <input
                type="radio"
                name="symmetry"
                value={o.value}
                checked={config.symmetry === o.value}
                onChange={() => update({ symmetry: o.value })}
              />
              {o.label}
            </label>
          ))}
        </div>
      </Field>

      <Field label="Mode">
        <div className="ms-toggle-row">
          <button
            className={`ms-toggle-btn${config.mode === 'stroke' ? ' active' : ''}`}
            onClick={() => update({ mode: 'stroke' })}
          >
            Stroke
          </button>
          <button
            className={`ms-toggle-btn${config.mode === 'fill' ? ' active' : ''}`}
            onClick={() => update({ mode: 'fill' })}
          >
            Fill
          </button>
        </div>
      </Field>

      <Field label="Preview Options">
        <div className="ms-toggle-row">
          <button
            className="ms-action-btn"
            onClick={onDuplicate}
          >
            Clone
          </button>
          <button
            className="ms-action-btn"
            onClick={onReset}
          >
            Reset
          </button>
        </div>
      </Field>
    </div>
  );
}
