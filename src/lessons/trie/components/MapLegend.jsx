// The little key beneath every map: what start, junction, and word-end nodes
// look like.
export default function MapLegend() {
  return (
    <div className="legend">
      <span className="li">
        <span
          className="swatch"
          style={{
            background: 'var(--ink)',
            borderRadius: 3,
            transform: 'rotate(45deg)',
            width: 13,
            height: 13,
          }}
        />
        start (empty prefix)
      </span>
      <span className="li">
        <span
          className="swatch"
          style={{ background: 'var(--panel)', border: '2px solid var(--ink-dim)' }}
        />
        junction
      </span>
      <span className="li">
        <span className="swatch" style={{ background: 'var(--signal)' }} />a word ends here
      </span>
    </div>
  );
}
