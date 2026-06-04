export function Footer() {
  return (
    <footer
      className="relative z-10 max-w-3xl mx-auto px-6 md:px-12"
      style={{ paddingTop: '4rem', paddingBottom: '6rem' }}
    >
      {/* Final bit pattern */}
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '3rem' }}>
        {[1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1].map((b, i) => (
          <div
            key={i}
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '1px',
              background: b ? 'var(--bf-violet-line-5)' : 'var(--bf-line-strong)',
              boxShadow: b ? '0 0 4px var(--bf-violet-glow)' : 'none',
            }}
          />
        ))}
      </div>

      <div className="text-center">
        <div
          className="bf-display-italic"
          style={{
            fontSize: '1.35rem',
            color: 'var(--bf-ink-muted)',
            lineHeight: 1.45,
            maxWidth: '36rem',
            margin: '0 auto',
          }}
        >
          The whole craft. The rest is parameters.
        </div>
        <div
          className="bf-ui bf-mark-muted mt-12"
          style={{
            fontSize: '0.72rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            opacity: 0.5,
          }}
        >
          End of the lesson
        </div>
      </div>
    </footer>
  );
}
