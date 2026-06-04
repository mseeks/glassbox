import { Globe, Phone, Clock, Network, Zap, Radio, Activity, Layers, Send } from 'lucide-react';
import { SectionHeading } from '../components/atoms.jsx';

/* ───────────────────────────────────────────────────────────────────────
   §8 — REAL SYSTEMS IN THE WILD
   Cards for the major UDP-based protocols and what each rationalizes
   about its UDP choice.
   ─────────────────────────────────────────────────────────────────────── */

export const SectionEight = () => {
  const systems = [
    {
      name: 'DNS',
      port: '53',
      icon: Globe,
      caption: 'Domain Name System',
      why: 'A query is a few bytes. A response usually fits in one packet. A TCP handshake would roughly double the latency for what is, at heart, a single round-trip exchange between you and a resolver across the network. Falls back to TCP only when responses exceed UDP size limits.',
    },
    {
      name: 'NTP',
      port: '123',
      icon: Clock,
      caption: 'Network Time Protocol',
      why: 'Measures round-trip time as the very core of its algorithm, so any extra buffering or retransmission a transport adds would quietly skew the measurement it depends on. Drop one packet, retry. No big deal at 64-second polling intervals.',
    },
    {
      name: 'DHCP',
      port: '67/68',
      icon: Network,
      caption: 'Dynamic Host Configuration',
      why: 'You need an IP address to use TCP. So bootstrapping requires a connectionless protocol that can broadcast before you have any address at all. A chicken-and-egg problem. DHCP literally cannot work over TCP.',
    },
    {
      name: 'WebRTC',
      port: 'varies',
      icon: Phone,
      caption: 'Real-time browser comms',
      why: 'Voice, video, peer-to-peer data. It is built on UDP for one precise reason: so that a single lost packet never stalls the live stream the way TCP would. Wraps DTLS for crypto and SRTP for media.',
    },
    {
      name: 'QUIC / HTTP/3',
      port: '443',
      icon: Zap,
      caption: 'Modern transport',
      why: "TCP's head-of-line blocking became unacceptable for heavily multiplexed HTTP traffic, where one lost packet stalls every parallel stream at once. So Google rebuilt the entire transport on UDP. See §10.",
    },
    {
      name: 'mDNS / SSDP',
      port: '5353 / 1900',
      icon: Radio,
      caption: 'Local discovery',
      why: 'Multicast on the LAN. It is how your machine finds printers, Chromecasts, and AirPlay devices without anyone configuring an address first. Strictly impossible over TCP, which has no multicast.',
    },
    {
      name: 'SNMP',
      port: '161/162',
      icon: Activity,
      caption: 'Network monitoring',
      why: "Polls thousands of devices for metrics. Setting up and tearing down a full TCP connection to every single router, every single minute, would crush both ends. So it doesn't. Lose a sample, get it next poll.",
    },
    {
      name: 'WireGuard',
      port: 'any',
      icon: Layers,
      caption: 'Modern VPN',
      why: 'Tunneling over UDP avoids the TCP-over-TCP meltdown, where two retransmit timers fight each other and throughput collapses on any lossy link. UDP adds essentially zero overhead beyond the encryption layer. Lean by design.',
    },
    {
      name: 'TFTP',
      port: '69',
      icon: Send,
      caption: 'Trivial File Transfer',
      why: 'Famously simple: small, stateless, used by bootloaders before they have a full TCP stack. Implements its own ack/retry on top because file transfer does need reliability, but the transport itself is plain UDP.',
    },
  ];

  return (
    <section className="udp-section">
      <div className="udp-page">
        <SectionHeading
          tag="§ 08  ·  In the wild"
          title="Where UDP earns its keep."
          lede="The protocols you use every day that run on UDP, and why each one decided UDP was right."
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 18,
            marginTop: 28,
          }}
        >
          {systems.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.name}
                className="udp-panel"
                style={{
                  padding: 22,
                  borderColor: 'var(--line)',
                  transition: 'all 0.18s',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      background: 'var(--signal-soft)',
                      border: '1px solid var(--signal-edge)',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} color="var(--signal)" strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      className="udp-display"
                      style={{
                        fontSize: 19,
                        color: 'var(--ink-warm)',
                        lineHeight: 1,
                      }}
                    >
                      {s.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-faint-fn)', marginTop: 4 }}>
                      {s.caption}
                    </div>
                  </div>
                  <div className="udp-pill udp-pill-signal" style={{ fontSize: 9.5 }}>
                    :{s.port}
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: 'var(--ink-dim)',
                    margin: 0,
                  }}
                >
                  {s.why}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
