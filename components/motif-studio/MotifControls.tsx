'use client';
/**
 * MotifControls.tsx — parameter panel for the Motif Studio
 *
 * Controls for editing a StrokeConfig:
 *   - Name
 *   - Spline node editor (start point + steps with control points)
 *   - Size (s) slider
 *   - Stroke width (w) slider
 *   - Color selector
 *   - Symmetry mode
 *   - Fill / Stroke toggle
 */

import type { StrokeConfig, SymmetryMode, MotifMode, NormalizedSpline, NormalizedStep, Pt2 } from './motifTypes';
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
  { value: 'none', label: 'None' },
  { value: 'MirrorH', label: 'Mirror H' },
  { value: 'MirrorV', label: 'Mirror V' },
  { value: 'Mirror4', label: 'Mirror 4x' },
  { value: 'Rotate2', label: 'Rotate 180' },
];

const COLOR_OPTIONS = [
  { value: IRON.bright, label: 'Bright' },
  { value: IRON.mid, label: 'Mid' },
  { value: IRON.deep, label: 'Deep' },
  { value: '#c8a96e', label: 'Gold accent' },
  { value: '#8b7355', label: 'Bronze' },
];

const STEP_TYPES = [
  { value: 'line', label: 'Line' },
  { value: 'quad', label: 'Quad' },
  { value: 'cubic', label: 'Cubic' },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="ms-field">
      <label className="ms-label">{label}</label>
      <div className="ms-field-body">{children}</div>
    </div>
  );
}

function PtInput({ value, onChange, label }: { value: Pt2; onChange: (p: Pt2) => void; label: string }) {
  return (
    <div className="ms-pt-row">
      <span className="ms-pt-label">{label}</span>
      <input
        type="number"
        className="ms-pt-input"
        value={value[0]}
        step={0.01}
        onChange={e => onChange([parseFloat(e.target.value) || 0, value[1]])}
      />
      <input
        type="number"
        className="ms-pt-input"
        value={value[1]}
        step={0.01}
        onChange={e => onChange([value[0], parseFloat(e.target.value) || 0])}
      />
    </div>
  );
}

function getStepType(step: NormalizedStep): string {
  if ('c1' in step) return 'cubic';
  if ('q' in step) return 'quad';
  return 'line';
}

function StepEditor({ step, index, onChange, onRemove }: {
  step: NormalizedStep;
  index: number;
  onChange: (s: NormalizedStep) => void;
  onRemove: () => void;
}) {
  const type = getStepType(step);

  const changeType = (newType: string) => {
    switch (newType) {
      case 'line':
        onChange({ to: step.to });
        break;
      case 'quad':
        onChange({ to: step.to, q: 'q' in step ? step.q : [0, 0] });
        break;
      case 'cubic':
        onChange({
          to: step.to,
          c1: 'c1' in step ? step.c1 : ('q' in step ? step.q : [0, 0]),
          c2: 'c2' in step ? step.c2 : [0, 0],
        });
        break;
    }
  };

  return (
    <div className="ms-step-card">
      <div className="ms-step-header">
        <span className="ms-step-idx">#{index + 1}</span>
        <select
          className="ms-step-type"
          value={type}
          onChange={e => changeType(e.target.value)}
        >
          {STEP_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <button className="ms-step-remove" onClick={onRemove} title="Remove step">x</button>
      </div>
      <PtInput label="to" value={step.to} onChange={to => onChange({ ...step, to } as NormalizedStep)} />
      {'q' in step && (
        <PtInput label="q" value={step.q} onChange={q => onChange({ ...step, q } as NormalizedStep)} />
      )}
      {'c1' in step && (
        <>
          <PtInput label="c1" value={step.c1} onChange={c1 => onChange({ ...step, c1 } as NormalizedStep)} />
          <PtInput label="c2" value={step.c2} onChange={c2 => onChange({ ...step, c2 } as NormalizedStep)} />
        </>
      )}
    </div>
  );
}

export function MotifControls({ config, s, onSChange, onChange, onReset, onDuplicate }: MotifControlsProps) {
  const update = (patch: Partial<StrokeConfig>) =>
    onChange({ ...config, ...patch });

  const updateSpline = (sp: NormalizedSpline) => update({ spline: sp });

  const updateStep = (index: number, step: NormalizedStep) => {
    const steps = [...config.spline.steps];
    steps[index] = step;
    updateSpline({ ...config.spline, steps });
  };

  const removeStep = (index: number) => {
    const steps = config.spline.steps.filter((_, i) => i !== index);
    updateSpline({ ...config.spline, steps });
  };

  const addStep = () => {
    const last = config.spline.steps[config.spline.steps.length - 1];
    const newTo: Pt2 = last ? [last.to[0] + 0.1, last.to[1]] : [0.5, 0];
    updateSpline({ ...config.spline, steps: [...config.spline.steps, { to: newTo, q: [0, 0] }] });
  };

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

      {/* Spline editor */}
      <div className="ms-path-section">
        <label className="ms-path-label">Spline Nodes</label>
        <div className="ms-hint">Coordinates as fractions of s (preview size)</div>

        <PtInput
          label="start"
          value={config.spline.start}
          onChange={start => updateSpline({ ...config.spline, start })}
        />

        {config.spline.steps.map((step, i) => (
          <StepEditor
            key={i}
            step={step}
            index={i}
            onChange={s => updateStep(i, s)}
            onRemove={() => removeStep(i)}
          />
        ))}

        <button className="ms-action-btn ms-add-step" onClick={addStep}>
          + Add Step
        </button>
      </div>

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
          max={3000}
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

      <Field label="Actions">
        <div className="ms-toggle-row">
          <button className="ms-action-btn" onClick={onDuplicate}>Clone</button>
          <button className="ms-action-btn" onClick={onReset}>Reset</button>
        </div>
      </Field>
    </div>
  );
}
