// A labelled range control. The visible label sits above the track and a live
// `display` value sits beside it; the range input carries the label as its
// aria-label so it has an accessible name for screen readers.
export default function Slider({ label, value, display, min, max, step = 1, onChange }) {
  return (
    <div className="slider">
      <div className="sl-top">
        <span>{label}</span>
        <b>{display}</b>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
