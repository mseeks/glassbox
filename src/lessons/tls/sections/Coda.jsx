import { EyeOff, ShieldCheck, BadgeCheck } from 'lucide-react';

// §8 — Coda. The three guarantees recapped, where to go next, and a closing
// reflection on the one-way operation that makes the whole edifice possible.
export default function Coda() {
  const recap = [
    {
      icon: EyeOff,
      name: 'Confidentiality',
      how: 'A shared key from ephemeral ECDHE key exchange feeds AES-GCM, so the wire carries only noise.',
      col: 'var(--aqua)',
    },
    {
      icon: ShieldCheck,
      name: 'Integrity',
      how: 'Every record carries an authentication tag, and the handshake ends in a transcript MAC, so any change is caught.',
      col: 'var(--brass)',
    },
    {
      icon: BadgeCheck,
      name: 'Authenticity',
      how: 'A certificate chain to a trusted root, plus a live signature over the transcript, proves who is on the other end.',
      col: 'var(--verm)',
    },
  ];
  const next = [
    ['QUIC / HTTP-3', 'TLS 1.3 fused directly into the transport, over UDP.'],
    ['Mutual TLS', 'The client presents a certificate too. Both ends prove identity.'],
    [
      'Revocation',
      'OCSP, CRLs, and ever-shorter certificate lifetimes for when a key must be killed early.',
    ],
    ['Post-quantum', 'Key exchanges built to survive a quantum computer, now rolling into TLS.'],
  ];
  return (
    <section
      id="coda"
      className="tls-section"
      style={{
        scrollMarginTop: 64,
        borderTop: '1px solid var(--line)',
        background: 'linear-gradient(180deg, transparent, rgba(70,214,198,.03))',
      }}
    >
      <div className="tls-wrap">
        <div className="tls-eyebrow tls-rv">
          <span className="tls-dash" />§ 08 · Coda
        </div>
        <p
          className="tls-pull tls-rv"
          style={{ marginTop: 22, maxWidth: 740, transitionDelay: '.05s' }}
        >
          TLS welds three guarantees into one handshake. <b>Nobody can read it.</b>{' '}
          <b>Nobody can change it unseen.</b> And <b>you know exactly who you're talking to.</b> All
          of it established between strangers, over a wire the whole world can watch.
        </p>

        <div className="tls-grid3 tls-rv" style={{ marginTop: 40, transitionDelay: '.1s' }}>
          {recap.map((r) => (
            <div key={r.name} className="tls-panel" style={{ padding: 18 }}>
              <r.icon size={20} style={{ color: r.col }} />
              <h3 className="tls-h3" style={{ marginTop: 12, fontSize: 18 }}>
                {r.name}
              </h3>
              <p className="tls-prose" style={{ fontSize: 13.5, marginTop: 8, lineHeight: 1.55 }}>
                {r.how}
              </p>
            </div>
          ))}
        </div>

        <h3
          className="tls-h3 tls-rv"
          style={{
            marginTop: 48,
            fontSize: 16,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color: 'var(--bone-faint)',
          }}
        >
          Where to go next
        </h3>
        <div className="tls-grid2 tls-rv" style={{ marginTop: 16 }}>
          {next.map(([t, d]) => (
            <div key={t} className="tls-inset" style={{ padding: 14 }}>
              <div className="tls-mono" style={{ fontSize: 13, color: 'var(--aqua-bright)' }}>
                {t}
              </div>
              <p className="tls-prose" style={{ fontSize: 13, marginTop: 5, lineHeight: 1.5 }}>
                {d}
              </p>
            </div>
          ))}
        </div>

        <p
          className="tls-prose tls-rv"
          style={{
            marginTop: 44,
            fontSize: 17,
            lineHeight: 1.7,
            maxWidth: 720,
            color: 'var(--bone)',
          }}
        >
          The whole edifice rests on one strange, beautiful fact: that two parties can build a
          shared secret in full public view because some operations are easy to perform and
          effectively impossible to reverse. Mix the paint. Never un-mix it. Everything else, from
          signatures to certificates to the choreography of the handshake, exists to answer the one
          question key exchange leaves open: <em>not what we agreed, but with whom.</em>
        </p>
      </div>
    </section>
  );
}
