// A row of mutually-exclusive pills. `options` is either [{ value, label }] or a
// plain [value, ...] array; `value` is the active value; `onChange(value)` fires
// on click. Each button carries aria-pressed for state and an accessible name.
export function SegmentedControl({ options, value, onChange, ariaLabel, className = '' }) {
  const opts = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  return (
    <div className={`lk-seg ${className}`.trim()} role="group" aria-label={ariaLabel}>
      {opts.map((o) => (
        <button
          key={o.value}
          type="button"
          className="lk-seg-btn"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
