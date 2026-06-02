export function Stat({ label, value, sub = null }) {
  return (
    <div>
      <div className="cf-eyebrow" style={{ marginBottom: 6 }}>
        {label}
      </div>
      <div className="cf-mono" style={{ fontSize: 24, color: 'var(--text)', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div
          className="cf-mono"
          style={{ fontSize: 10, color: 'var(--text-mute)', marginTop: 4, letterSpacing: 1 }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
