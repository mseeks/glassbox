import { AlertTriangle, Clock, Layers, Shuffle, Zap, Hash } from 'lucide-react';
import { SectionHeading } from '../components/atoms.jsx';

/* ───────────────────────────────────────────────────────────────────────
   §11 — PITFALLS
   The gotchas: no congestion control, NAT keepalives, DTLS, fragments.
   ─────────────────────────────────────────────────────────────────────── */

export const SectionEleven = () => {
  const pitfalls = [
    {
      title: 'No congestion control',
      icon: AlertTriangle,
      severity: 'high',
      body: (
        <>
          UDP has no notion of "the network is congested, slow down." A misbehaving sender can blast
          packets at line rate, hurting itself (most are dropped) and everyone sharing the link. It
          will not back off on its own. If your application sends sustained UDP traffic,{' '}
          <strong>you must implement congestion control yourself</strong>. QUIC, WebRTC, and SRT all
          do this above UDP.
        </>
      ),
      mitigation:
        'Build it in. Implement application-layer congestion control, borrowing either from the proven TCP algorithms (NewReno, CUBIC) or from a more modern one such as BBR.',
    },
    {
      title: 'NAT mapping timeouts',
      icon: Clock,
      severity: 'high',
      body: (
        <>
          NAT routers expire idle UDP mappings aggressively, typically within
          <strong> 30 to 180 seconds</strong>. Then it's gone. With no keepalive traffic, your peer
          can no longer reach you because the NAT has quietly forgotten the mapping that once tied
          your address to the open port. Compare to TCP, where NAT keeps mappings open for hours
          because it sees connection-state packets.
        </>
      ),
      mitigation:
        'Send a keepalive datagram every ~25 seconds in both directions to refresh the NAT binding.',
    },
    {
      title: 'No native encryption',
      icon: Layers,
      severity: 'medium',
      body: (
        <>
          UDP has no equivalent of TLS-over-TCP. Anyone on the path can read and modify your
          datagrams. They are wide open. To encrypt UDP traffic you use
          <code> DTLS </code>(Datagram TLS), a variant of TLS that has been carefully adapted for
          the unreliable, unordered transport underneath it. Quietly different in some operational
          details (no record-layer ordering, retry on handshake loss).
        </>
      ),
      mitigation: 'Use DTLS, SRTP, WireGuard, or QUIC for any non-trivial UDP application.',
    },
    {
      title: 'Fragments break in the wild',
      icon: Shuffle,
      severity: 'high',
      body: (
        <>
          Many middleboxes (NATs, firewalls, load balancers) drop UDP fragments outright, because a
          non-first fragment carries no transport header and so cannot be classified or routed by
          the rules they enforce. Path MTU Discovery is unreliable too. Routers may drop the ICMP
          "Packet Too Big" messages it depends on. <strong>Fragmentation is a trap.</strong>
        </>
      ),
      mitigation:
        'Stay under ~1200 bytes per datagram and frame larger application messages yourself.',
    },
    {
      title: 'Amplification attack vector',
      icon: Zap,
      severity: 'high',
      body: (
        <>
          UDP has no handshake to verify the source IP, so an attacker can forge it. They send a
          small query to a public UDP service (DNS, NTP, Memcached), but put the <em>victim's</em>{' '}
          IP in the source field. The server dutifully sends its much larger response to the victim,
          who never asked. One spoofed byte in, thousands of bytes out, multiplied across thousands
          of public servers. Memcached has been weaponized at
          <strong> 50,000× amplification</strong>.
        </>
      ),
      mitigation:
        "Keep it private. Don't expose UDP services to the public internet unless you truly must, and for the ones that have to be public, require a small handshake or cookie (DNS cookies, QUIC retry tokens) and rate-limit by source IP.",
    },
    {
      title: 'Checksum is weak',
      icon: Hash,
      severity: 'low',
      body: (
        <>
          UDP's 16-bit ones-complement checksum catches most random bit-flips but does nothing
          against an attacker who corrupts the payload on purpose and recomputes the sum to match.
          And in IPv4, the checksum is technically optional. For anything important, layer a real
          MAC (HMAC, AEAD) on top.
        </>
      ),
      mitigation:
        'Use authenticated encryption (DTLS, AES-GCM). The UDP checksum is a sanity check, not a security primitive.',
    },
  ];

  return (
    <section className="udp-section">
      <div className="udp-page">
        <SectionHeading
          tag="§ 11  ·  Pitfalls"
          title="What UDP doesn't tell you it isn't doing."
          lede={
            <>
              Every property that makes UDP fast also makes it a footgun. These are the things you
              have to handle yourself, or find a library that handles them for you.
            </>
          }
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 18,
            marginTop: 28,
          }}
        >
          {pitfalls.map((p) => {
            const Icon = p.icon;
            const sevColor =
              p.severity === 'high'
                ? 'var(--lost)'
                : p.severity === 'medium'
                  ? 'var(--warn)'
                  : 'var(--ink-dim)';
            return (
              <div
                key={p.title}
                className="udp-panel"
                style={{
                  padding: 24,
                  borderLeft: `2px solid ${sevColor}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <Icon size={16} color={sevColor} strokeWidth={2} />
                  <h3 className="udp-h3" style={{ margin: 0, fontSize: 18 }}>
                    {p.title}
                  </h3>
                  <span
                    className="udp-pill"
                    style={{
                      marginLeft: 'auto',
                      color: sevColor,
                      borderColor: sevColor,
                      background: 'transparent',
                      fontSize: 9.5,
                    }}
                  >
                    {p.severity}
                  </span>
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--ink)' }}>
                  {p.body}
                </div>
                <div
                  style={{
                    marginTop: 14,
                    padding: '10px 12px',
                    background: 'var(--bg-deep)',
                    borderRadius: 3,
                    fontSize: 12,
                    color: 'var(--ink-dim)',
                    borderLeft: '2px solid var(--ok)',
                  }}
                >
                  <span
                    className="udp-mono"
                    style={{ fontSize: 10, color: 'var(--ok)', letterSpacing: '0.1em' }}
                  >
                    MITIGATION ·
                  </span>{' '}
                  {p.mitigation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
