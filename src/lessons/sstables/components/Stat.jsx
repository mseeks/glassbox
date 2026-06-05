// A big Bodoni readout numeral with a mono caption, tinted by semantic tone.
export default function Stat({ value, label, tone }) {
  const color =
    tone === 'blood'
      ? 'var(--blood)'
      : tone === 'steel'
        ? 'var(--steel)'
        : tone === 'sage'
          ? 'var(--sage)'
          : 'var(--ink)';
  return (
    <div className="sst-stat">
      <span className="v" style={{ color }}>
        {value}
      </span>
      <span className="l">{label}</span>
    </div>
  );
}
