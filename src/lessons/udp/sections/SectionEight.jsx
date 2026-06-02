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
      why: 'A query is a few bytes; a response usually fits in one packet. TCP handshake would triple the latency for what is effectively a single round-trip. Falls back to TCP only when responses exceed UDP size limits.',
    },
    {
      name: 'NTP',
      port: '123',
      icon: Clock,
      caption: 'Network Time Protocol',
      why: 'Measures round-trip time as the core of its algorithm. TCP buffering and retransmits would skew the measurement. Drop one packet, retry — no big deal at 64-second polling intervals.',
    },
    {
      name: 'DHCP',
      port: '67/68',
      icon: Network,
      caption: 'Dynamic Host Configuration',
      why: 'You need an IP address to use TCP. So bootstrapping requires a connectionless protocol that can broadcast — DHCP literally cannot work over TCP.',
    },
    {
      name: 'WebRTC',
      port: 'varies',
      icon: Phone,
      caption: 'Real-time browser comms',
      why: "Voice, video, peer-to-peer data. Built on UDP precisely so that loss doesn't stall the stream. Wraps DTLS for crypto and SRTP for media.",
    },
    {
      name: 'QUIC / HTTP/3',
      port: '443',
      icon: Zap,
      caption: 'Modern transport',
      why: "TCP's head-of-line blocking became unacceptable for multiplexed HTTP. Google rebuilt the entire transport on UDP. See §10.",
    },
    {
      name: 'mDNS / SSDP',
      port: '5353',
      icon: Radio,
      caption: 'Local discovery',
      why: 'Multicast on the LAN — find printers, Chromecasts, AirPlay devices. Strictly impossible over TCP, which has no multicast.',
    },
    {
      name: 'SNMP',
      port: '161/162',
      icon: Activity,
      caption: 'Network monitoring',
      why: 'Polls thousands of devices for metrics. Setting up TCP connections to every router every minute would crush both ends. Lose a sample, get it next poll.',
    },
    {
      name: 'WireGuard',
      port: 'any',
      icon: Layers,
      caption: 'Modern VPN',
      why: 'Tunneled traffic over UDP means TCP-over-TCP nightmares are avoided. UDP also adds essentially zero overhead beyond the encryption layer.',
    },
    {
      name: 'TFTP',
      port: '69',
      icon: Send,
      caption: 'Trivial File Transfer',
      why: 'Famously simple: small, stateless, used by bootloaders before they have a full TCP stack. Implements its own ack/retry on top because file transfer does need reliability — but the transport is UDP.',
    },
  ];

  return (
    <section className="udp-section">
      <div className="udp-page">
        <SectionHeading
          tag="§ 08  ·  In the wild"
          title="Where UDP earns its keep."
          lede="The protocols you use every day that run on UDP — and why each one decided UDP was right."
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
                    <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 4 }}>
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
