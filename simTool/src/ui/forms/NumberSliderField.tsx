import { useId } from "react";

type NumberSliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
};

export function NumberSliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange
}: NumberSliderFieldProps) {
  const reactId = useId();
  const fieldId = `field-${reactId}`;

  function handleChange(rawValue: string) {
    const parsed = Number(rawValue);
    if (Number.isFinite(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
    }
  }

  return (
    <label className="number-slider-field" htmlFor={fieldId}>
      <span>{label}</span>
      <div className="slider-control">
        <input
          aria-label={`${label} Schieberegler`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => handleChange(event.currentTarget.value)}
        />
        <div className="number-input-wrap">
          <input
            id={fieldId}
            aria-label={label}
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(event) => handleChange(event.currentTarget.value)}
          />
          {unit ? <small>{unit}</small> : null}
        </div>
      </div>
    </label>
  );
}
