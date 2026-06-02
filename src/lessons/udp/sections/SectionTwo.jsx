import { Check } from 'lucide-react';
import { Label, SectionHeading } from '../components/atoms.jsx';

/* ───────────────────────────────────────────────────────────────────────
   §2 — TWO PHILOSOPHIES
   TCP's elaborate fiction vs UDP's bare honesty. Side-by-side feature
   comparison; visual contrast of header sizes.
   ─────────────────────────────────────────────────────────────────────── */

export const SectionTwo = () => {
  // Shared feature matrix — each row is a property; columns show what each protocol provides
  const features = [
    {
      name: 'Connection setup',
      tcp: 'Three-way handshake (1 RTT)',
      udp: 'None. Send straight away',
    },
    { name: 'Reliability', tcp: 'Acks + retransmit on loss', udp: 'No acks. Loss is silent' },
    {
      name: 'Ordering',
      tcp: 'Strict in-order delivery',
      udp: 'None. Arrival order = delivery order',
    },
    {
      name: 'Deduplication',
      tcp: 'Sequence numbers detect dups',
      udp: 'None. Duplicates pass through',
    },
    {
      name: 'Flow control',
      tcp: 'Receiver sets a sliding window',
      udp: 'None. Sender pays no attention',
    },
    {
      name: 'Congestion control',
      tcp: 'Slow start, AIMD, backoff',
      udp: 'None. Your responsibility',
    },
    {
      name: 'Message boundaries',
      tcp: "Removed. It's a byte stream",
      udp: 'Preserved. One send, one receive',
    },
    { name: 'Per-connection state', tcp: '~80 bytes of kernel memory', udp: 'Zero state' },
    { name: 'Header size', tcp: '20–60 bytes per segment', udp: '8 bytes, flat' },
  ];

  return (
    <section className="udp-section">
      <div className="udp-page">
        <SectionHeading
          tag="§ 02  ·  Two designs"
          title="The same network. Two stances."
          lede={
            <>
              TCP and UDP both ride on top of best-effort IP. They take{' '}
              <strong>opposite stances</strong> on what to do about it. One wraps the substrate in
              machinery so your application sees a clean byte-pipe. The other passes the substrate
              through, untouched, and lets you decide what to add. Neither is better. They are built
              for different jobs.
            </>
          }
        />

        {/* Two intro cards — softer framing */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 22,
            marginTop: 36,
            marginBottom: 36,
          }}
          className="udp-twocol"
        >
          <div className="udp-panel" style={{ borderColor: 'var(--tcp-edge)', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8 }}>
              <h3 className="udp-h3" style={{ color: 'var(--tcp)', margin: 0 }}>
                TCP
              </h3>
              <span
                className="udp-mono"
                style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}
              >
                THE MANAGED STREAM
              </span>
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink)', margin: 0 }}>
              A reliable, ordered, byte-oriented connection. The kernel handles acks, retransmits,
              flow control, and congestion control on your behalf.{' '}
              <strong style={{ color: 'var(--tcp)' }}>
                You write bytes in; the same bytes come out the other side.
              </strong>
            </p>
          </div>
          <div className="udp-panel" style={{ borderColor: 'var(--signal-edge)', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8 }}>
              <h3 className="udp-h3" style={{ color: 'var(--signal)', margin: 0 }}>
                UDP
              </h3>
              <span
                className="udp-mono"
                style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}
              >
                THE RAW DATAGRAM
              </span>
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink)', margin: 0 }}>
              A thin envelope around an IP packet: ports for multiplexing, a checksum, and a length.
              Nothing more.{' '}
              <strong style={{ color: 'var(--signal)' }}>
                You hand the kernel a message; the kernel hands the network a packet.
              </strong>
            </p>
          </div>
        </div>

        {/* Unified comparison matrix */}
        <div
          className="udp-panel"
          style={{ background: 'var(--bg-deep)', padding: 0, overflow: 'hidden' }}
        >
          <div
            style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <Label>Fig. 2: How each protocol handles each concern</Label>
          </div>

          {/* Header row */}
          <div
            className="udp-compare-row udp-compare-head"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 1.4fr 1.4fr',
              padding: '14px 24px',
              borderBottom: '1px solid var(--line)',
              background: 'var(--surface-2)',
              fontFamily: 'JetBrains Mono',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ink-dim)',
            }}
          >
            <div>Concern</div>
            <div style={{ color: 'var(--tcp)' }}>TCP provides</div>
            <div style={{ color: 'var(--signal)' }}>UDP provides</div>
          </div>

          {features.map((f, i) => (
            <div
              key={f.name}
              className="udp-compare-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 1.4fr 1.4fr',
                padding: '14px 24px',
                borderBottom: i === features.length - 1 ? 'none' : '1px solid var(--line-faint)',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                className="udp-mono"
                style={{
                  fontSize: 12.5,
                  color: 'var(--ink-warm)',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}
              >
                {f.name}
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  color: 'var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Check size={13} color="var(--tcp)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                <span>{f.tcp}</span>
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  color: 'var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                {f.udp.startsWith('None') ||
                f.udp.startsWith('Zero') ||
                f.udp.startsWith('Removed') ? (
                  <span
                    style={{
                      color: 'var(--ink-faint)',
                      fontFamily: 'JetBrains Mono',
                      fontWeight: 600,
                      fontSize: 13,
                      flexShrink: 0,
                      width: 13,
                      textAlign: 'center',
                    }}
                  >
                    &ndash;
                  </span>
                ) : (
                  <Check
                    size={13}
                    color="var(--signal)"
                    strokeWidth={2.5}
                    style={{ flexShrink: 0 }}
                  />
                )}
                <span
                  style={{
                    color:
                      f.udp.startsWith('None') ||
                      f.udp.startsWith('Zero') ||
                      f.udp.startsWith('Removed')
                        ? 'var(--ink-dim)'
                        : 'var(--ink)',
                  }}
                >
                  {f.udp}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Header size bar — full range visualization */}
        <div
          className="udp-panel"
          style={{
            marginTop: 28,
            background: 'var(--bg-deep)',
            padding: 28,
          }}
        >
          <Label>Fig. 3: Header sizes on the wire, to scale (1 cell = 1 byte)</Label>
          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* TCP bar — show min (20) solid + max (40) optional dashed */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  fontFamily: 'JetBrains Mono',
                  fontSize: 12,
                  alignItems: 'baseline',
                }}
              >
                <span style={{ color: 'var(--tcp)', fontWeight: 600 }}>TCP</span>
                <span style={{ color: 'var(--ink-dim)' }}>
                  20 bytes (min) + up to 40 bytes of options
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(60, 1fr)',
                  gap: 1,
                  height: 28,
                }}
              >
                {Array.from({ length: 60 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background: i < 20 ? 'var(--tcp)' : 'transparent',
                      border: i >= 20 ? '1px dashed var(--tcp-edge)' : 'none',
                      opacity: i < 20 ? 0.85 : 0.7,
                      borderRadius: 1,
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontFamily: 'JetBrains Mono',
                  fontSize: 10,
                  color: 'var(--ink-faint)',
                  marginTop: 4,
                  gap: 14,
                }}
              >
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      background: 'var(--tcp)',
                      verticalAlign: 'middle',
                      marginRight: 5,
                    }}
                  ></span>
                  fixed header (20 B)
                </span>
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      border: '1px dashed var(--tcp-edge)',
                      verticalAlign: 'middle',
                      marginRight: 5,
                    }}
                  ></span>
                  options (0–40 B)
                </span>
              </div>
            </div>
            {/* UDP bar */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  fontFamily: 'JetBrains Mono',
                  fontSize: 12,
                  alignItems: 'baseline',
                }}
              >
                <span style={{ color: 'var(--signal)', fontWeight: 600 }}>UDP</span>
                <span style={{ color: 'var(--ink-dim)' }}>8 bytes, fixed</span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(60, 1fr)',
                  gap: 1,
                  height: 28,
                }}
              >
                {Array.from({ length: 60 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background: i < 8 ? 'var(--signal)' : 'transparent',
                      opacity: i < 8 ? 0.9 : 0,
                      boxShadow: i < 8 ? '0 0 6px var(--signal-soft)' : 'none',
                      borderRadius: 1,
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: 10,
                  color: 'var(--ink-faint)',
                  marginTop: 4,
                }}
              >
                src port · dst port · length · checksum &nbsp;·&nbsp; no options, no extensions
              </div>
            </div>
          </div>
        </div>

        <p className="udp-pullquote">
          The question isn't which is better. The question is whether your application wants TCP's
          full-service contract, or whether it wants to design its own.
        </p>
      </div>
    </section>
  );
};
