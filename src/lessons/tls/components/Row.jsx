// A labelled row: monospace label on the left, free-form value on the right.
export default function Row({ label, color, children }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
      <span
        className="tls-mono"
        style={{ fontSize: 10, letterSpacing: '.12em', color, minWidth: 124, flex: 'none' }}
      >
        {label}
      </span>
      <span style={{ flex: 1, fontSize: 14, minWidth: 0 }}>{children}</span>
    </div>
  );
}
