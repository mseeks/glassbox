// Labelled range input with a value readout and a built-in accessible name
// (range inputs otherwise fail the a11y gate). `display` is the formatted value
// shown top-right; `onChange` receives the numeric value.
export function Slider({
  label,
  value,
  display,
  min,
  max,
  step = 1,
  onChange,
  ariaLabel,
  className = '',
  ...rest
}) {
  return (
    <div className={`lk-slider ${className}`.trim()}>
      <div className="lk-slider-top">
        <span>{label}</span>
        {display != null && <b>{display}</b>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel || label}
        onChange={(e) => onChange(Number(e.target.value))}
        {...rest}
      />
    </div>
  );
}
