import Eyebrow from '../components/Eyebrow.jsx';

// Title card: the gRPC promise stated plainly, over a request/response wire that
// pulses a frame each way (CSS animation, stilled under reduced motion).
export default function Hero() {
  return (
    <header
      className="gx-section"
      style={{ paddingTop: 64, paddingBottom: 30, textAlign: 'center' }}
    >
      <div className="gx-fade in" style={{ display: 'inline-block' }}>
        <Eyebrow>Google · 2015 · to the byte</Eyebrow>
      </div>
      <h1
        style={{
          fontSize: 'clamp(44px, 11vw, 104px)',
          fontWeight: 700,
          margin: '18px 0 0',
          letterSpacing: '-0.03em',
        }}
      >
        gRPC<span style={{ color: 'var(--cyan)' }}>.</span>
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(11px,2.4vw,14px)',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--ink-dim)',
          margin: '10px 0 0',
        }}
      >
        on the wire
      </p>
      <p className="gx-lede" style={{ margin: '26px auto 0', textAlign: 'center' }}>
        Call a function that lives on another machine. Feel nothing. That is the dream gRPC sells.
        This is how it keeps the promise, where the promise leaks, and what every byte is doing.
      </p>
      <HeroWire />
    </header>
  );
}

function HeroWire() {
  return (
    <div
      className="gx-panel"
      style={{ margin: '40px auto 0', maxWidth: 640, padding: '30px 22px 26px' }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
      >
        <Node label="client" sub="account.Withdraw(100)" />
        <div className="hw-link">
          <div className="hw-track" />
          <div className="hw-frame req">
            <span>REQUEST</span>
          </div>
          <div className="hw-frame res">
            <span>RESPONSE</span>
          </div>
        </div>
        <Node label="server" sub="balance −= 100" accent="amber" />
      </div>
      <p
        style={{
          fontSize: 13,
          color: 'var(--ink-dim)',
          textAlign: 'center',
          margin: '22px 0 0',
          maxWidth: '42ch',
          marginInline: 'auto',
        }}
      >
        One call. Arguments serialized, shipped across a network, executed elsewhere, the result
        shipped back. Ideally invisible to the programmer.
      </p>
    </div>
  );
}

function Node({ label, sub, accent }) {
  const c = accent === 'amber' ? 'var(--amber)' : 'var(--cyan)';
  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 12,
          border: `1px solid ${c}`,
          background: 'var(--panel2)',
          display: 'grid',
          placeItems: 'center',
          margin: '0 auto',
          boxShadow: `0 0 22px ${accent === 'amber' ? 'var(--amber-glow)' : 'var(--cyan-glow)'}`,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6">
          <rect x="3" y="4" width="18" height="6" rx="1.5" />
          <rect x="3" y="14" width="18" height="6" rx="1.5" />
          <path d="M7 7h.01M7 17h.01" />
        </svg>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: c,
          marginTop: 9,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--ink-faint2)',
          marginTop: 3,
          maxWidth: 92,
        }}
      >
        {sub}
      </div>
    </div>
  );
}
