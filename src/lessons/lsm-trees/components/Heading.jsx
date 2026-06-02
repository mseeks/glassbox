// Numbered chapter heading — instrument-coloured roman numeral chip,
// kicker eyebrow, display-face title, optional italic lede.
export default function Heading({ n, kicker, title, lede }) {
  return (
    <div style={{ marginBottom: 40, maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <span
          className="m"
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--bg)',
            background: 'var(--instr)',
            width: 30,
            height: 30,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {n}
        </span>
        <span className="kicker">{kicker}</span>
        <span style={{ flex: 1, height: 1, background: 'var(--rule-soft)' }} />
      </div>
      <h2
        className="d"
        style={{
          fontSize: 'clamp(32px, 6vw, 56px)',
          fontWeight: 800,
          lineHeight: 1.02,
          letterSpacing: '-0.025em',
          margin: 0,
          color: 'var(--ink)',
        }}
      >
        {title}
      </h2>
      {lede && (
        <p
          className="serif"
          style={{
            fontStyle: 'italic',
            fontSize: 'clamp(17px,2.4vw,21px)',
            color: 'var(--ink-3)',
            marginTop: 18,
            lineHeight: 1.5,
            maxWidth: 680,
          }}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
