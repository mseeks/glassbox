export function Chapter({ num, title, anchor, children }) {
  return (
    <section id={anchor} className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 py-20 md:py-24">
      <div className="bf-chapter-num mb-4">CH · {num}</div>
      <h2 className="bf-chapter-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}>
        {title}
      </h2>
      <div style={{ display: 'flex', gap: '4px', margin: '2rem 0 2rem 0' }}>
        {[1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1].map((b, i) => (
          <div
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '1px',
              background: b ? 'var(--bf-violet-line-5)' : 'var(--bf-line-strong)',
            }}
          />
        ))}
      </div>
      <div className="bf-prose">{children}</div>
    </section>
  );
}
