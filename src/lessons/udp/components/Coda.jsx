/* ───────────────────────────────────────────────────────────────────────
   CODA — closing synthesis
   ─────────────────────────────────────────────────────────────────────── */

const CodaPoint = ({ n, title, body }) => (
  <div>
    <div
      className="udp-display"
      style={{
        fontSize: 44,
        fontStyle: 'italic',
        fontWeight: 300,
        color: 'var(--signal)',
        lineHeight: 1,
        marginBottom: 12,
      }}
    >
      {n}
    </div>
    {title && (
      <div
        className="udp-mono"
        style={{
          fontSize: 11,
          color: 'var(--signal)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: 10,
          fontWeight: 600,
        }}
      >
        {title}
      </div>
    )}
    <div
      style={{
        fontSize: 15.5,
        lineHeight: 1.55,
        color: 'var(--ink)',
        fontFamily: 'Atkinson Hyperlegible',
        fontWeight: 400,
      }}
    >
      {body}
    </div>
  </div>
);

export const Coda = () => (
  <section
    style={{
      padding: '140px 0',
      borderTop: '1px solid var(--line-faint)',
      background: 'linear-gradient(180deg, transparent, var(--bg-deep))',
    }}
  >
    <div className="udp-page">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontFamily: 'JetBrains Mono',
          fontSize: 11,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--signal)',
          marginBottom: 36,
        }}
      >
        <span style={{ width: 28, height: 1, background: 'var(--signal)' }}></span>
        Coda
      </div>

      <h2
        className="udp-display"
        style={{
          fontSize: 'clamp(38px, 6vw, 72px)',
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: 'var(--ink-warm)',
          margin: 0,
          fontWeight: 350,
          maxWidth: 980,
        }}
      >
        Every protocol promises something.
        <br />
        <span style={{ color: 'var(--signal)', fontStyle: 'italic', fontWeight: 300 }}>
          UDP
        </span>{' '}
        commits to <span style={{ fontStyle: 'italic' }}>three things:</span>
      </h2>

      <div
        style={{
          marginTop: 56,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 28,
        }}
      >
        <CodaPoint
          n="I"
          title="Right application"
          body="If a datagram arrives, the port number routes it to the socket you bound. That's what ports are for."
        />
        <CodaPoint
          n="II"
          title="Whole message"
          body="If a datagram arrives, its boundary is preserved. One send becomes one recv, never half, never merged."
        />
        <CodaPoint
          n="III"
          title="Detected corruption"
          body="If a datagram arrives with the checksum mismatched, the kernel discards it before your application sees it."
        />
      </div>

      <p
        className="udp-prose"
        style={{
          marginTop: 56,
          fontSize: 18,
          lineHeight: 1.75,
          maxWidth: 760,
        }}
      >
        And one big admission: <strong style={{ color: 'var(--signal)' }}>nothing else.</strong> Not
        delivery. Not order. Not deduplication. Not flow control. Not congestion control. Not
        encryption. Not framing of payloads larger than a datagram. None of these are gifts UDP
        gives you. They are problems UDP <em>steps out of the way of</em>, so you can solve them in
        whichever way fits your application.
      </p>
      <p
        className="udp-prose"
        style={{
          fontSize: 18,
          lineHeight: 1.75,
          maxWidth: 760,
        }}
      >
        For DNS, the right way is to retry the query. For voice, the right way is to skip the loss.
        For gossip, the right way is to re-state the same facts every round. For QUIC, the right way
        is an entirely new transport with stream-aware loss recovery.{' '}
        <em>For every interesting application, the right way is different.</em>
      </p>

      <div
        style={{
          marginTop: 72,
          padding: '36px 40px',
          background: 'var(--surface)',
          borderLeft: '3px solid var(--signal)',
          borderRadius: '0 6px 6px 0',
          position: 'relative',
          maxWidth: 840,
        }}
      >
        <div
          style={{
            fontFamily: 'JetBrains Mono',
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--signal)',
            marginBottom: 16,
          }}
        >
          The closing thought
        </div>
        <div
          className="udp-display"
          style={{
            fontSize: 'clamp(24px, 3.4vw, 38px)',
            lineHeight: 1.25,
            color: 'var(--ink-warm)',
            fontWeight: 400,
            fontStyle: 'italic',
            letterSpacing: '-0.015em',
          }}
        >
          UDP is the protocol that tells the truth about the network. Everything else — reliable,
          ordered, encrypted, multiplexed — is something you build on top of that truth.
        </div>
      </div>

      <div
        style={{
          marginTop: 80,
          paddingTop: 36,
          borderTop: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 18,
          fontFamily: 'JetBrains Mono',
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint)',
        }}
      >
        <span>End of transmission &nbsp;·&nbsp; RFC 768 &nbsp;·&nbsp; August 1980</span>
        <span style={{ color: 'var(--signal)' }}>◖ ◗</span>
      </div>
    </div>
  </section>
);
