// A small segmented control — a tablist of mutually-exclusive options. The
// `ariaLabel` names the whole group; each button is a tab carrying aria-selected.
export default function Seg({ options, value, onChange, ariaLabel }) {
  return (
    <div className="sst-seg" role="tablist" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          className={value === o.value ? 'on' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
