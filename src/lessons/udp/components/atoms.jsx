/* ───────────────────────────────────────────────────────────────────────
   PRIMITIVES — small reusable atoms shared across sections.
   ─────────────────────────────────────────────────────────────────────── */

export const Pill = ({ tone = 'default', children, icon: Icon }) => {
  const cls =
    tone === 'signal'
      ? 'udp-pill udp-pill-signal'
      : tone === 'ok'
        ? 'udp-pill udp-pill-ok'
        : tone === 'lost'
          ? 'udp-pill udp-pill-lost'
          : tone === 'tcp'
            ? 'udp-pill udp-pill-tcp'
            : 'udp-pill';
  return (
    <span className={cls}>
      {Icon && <Icon size={11} strokeWidth={2} />}
      {children}
    </span>
  );
};

export const Label = ({ children, style = {} }) => (
  <div className="udp-label" style={{ marginBottom: 8, ...style }}>
    {children}
  </div>
);

export const SectionHeading = ({ tag, title, lede }) => (
  <>
    <div className="udp-section-tag">{tag}</div>
    <h2 className="udp-h2">{title}</h2>
    {lede && <p className="udp-lede">{lede}</p>}
  </>
);

/* A datagram visualization — small package icon with state */
export const Datagram = ({ state = 'flight', label, size = 'md' }) => {
  // states: flight, delivered, lost, duplicate
  const dims = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
  const color =
    state === 'delivered'
      ? 'var(--ok)'
      : state === 'lost'
        ? 'var(--lost)'
        : state === 'duplicate'
          ? 'var(--warn)'
          : 'var(--signal)';
  const bg =
    state === 'delivered'
      ? 'var(--ok-soft)'
      : state === 'lost'
        ? 'var(--lost-soft)'
        : state === 'duplicate'
          ? 'var(--warn-soft)'
          : 'var(--signal-soft)';
  return (
    <div
      style={{
        width: dims,
        height: dims,
        borderRadius: 4,
        border: `1px solid ${color}`,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        fontFamily: 'JetBrains Mono',
        fontSize: dims * 0.32,
        fontWeight: 600,
        position: 'relative',
        opacity: state === 'lost' ? 0.5 : 1,
        textDecoration: state === 'lost' ? 'line-through' : 'none',
        transition: 'all 0.3s',
      }}
    >
      {label !== undefined ? label : '∎'}
    </div>
  );
};
