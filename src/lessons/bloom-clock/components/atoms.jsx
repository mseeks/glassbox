export const Eyebrow = ({ children, color = 'var(--bc-ink-muted)' }) => (
  <div className="bc-eyebrow" style={{ color, marginBottom: 18 }}>
    {children}
  </div>
);

const ChapterNumber = ({ n }) => (
  <span
    className="bc-numeral bc-chapter-number"
    style={{
      fontSize: 32,
      color: 'var(--bc-gold)',
      fontStyle: 'italic',
      display: 'inline-block',
      minWidth: 50,
    }}
  >
    {n}.
  </span>
);

export const ChapterTitle = ({ number, eyebrow, title, sub }) => (
  <div style={{ marginBottom: 56 }}>
    {eyebrow && <Eyebrow color="var(--bc-gold)">{eyebrow}</Eyebrow>}
    <div className="bc-chapter-head">
      <ChapterNumber n={number} />
      <h2
        className="bc-display bc-chapter-title"
        style={{
          fontSize: 'clamp(34px, 5vw, 56px)',
          margin: 0,
          fontWeight: 400,
          color: 'var(--bc-ink)',
        }}
      >
        {title}
      </h2>
    </div>
    {sub && (
      <p
        className="bc-italic bc-chapter-sub"
        style={{ fontSize: 22, color: 'var(--bc-ink-muted)' }}
      >
        {sub}
      </p>
    )}
  </div>
);

export const Section = ({ children, narrow, id }) => (
  <section id={id} className={`bc-section ${narrow ? 'narrow' : ''}`}>
    {children}
  </section>
);

export const Prose = ({ children, dropcap }) => (
  <div
    className={`bc-prose ${dropcap ? 'bc-dropcap' : ''}`}
    style={{ fontSize: 19, lineHeight: 1.72, color: 'var(--bc-ink-prose)' }}
  >
    {children}
  </div>
);

export const PullQuote = ({ children, accent = 'var(--bc-gold)' }) => (
  <div
    style={{
      margin: '56px 0 56px 0',
      padding: '24px 0 24px 28px',
      borderLeft: `2px solid ${accent}`,
      position: 'relative',
    }}
  >
    <div className="bc-pullquote">{children}</div>
  </div>
);

export const Callout = ({ icon: Icon, title, children, color = 'var(--bc-violet)', tone }) => {
  const bg =
    tone === 'warn'
      ? 'var(--bc-rose-wash)'
      : tone === 'note'
        ? 'var(--bc-emerald-wash)'
        : 'var(--bc-violet-wash)';
  return (
    <div
      style={{
        margin: '32px 0',
        padding: '22px 26px',
        background: bg,
        border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 3,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        {Icon && <Icon size={15} color={color} />}
        <div
          className="bc-mono"
          style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color }}
        >
          {title}
        </div>
      </div>
      <div style={{ fontSize: 16.5, color: 'var(--bc-ink-dim)', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
};

export const Code = ({ children }) => (
  <code
    className="bc-mono"
    style={{
      background: 'var(--bc-control-bg)',
      color: 'var(--bc-gold)',
      padding: '2px 7px',
      borderRadius: 3,
      fontSize: '0.9em',
      border: '1px solid var(--bc-code-border)',
    }}
  >
    {children}
  </code>
);
