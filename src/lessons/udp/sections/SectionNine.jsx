import { useState } from 'react';
import { Label, SectionHeading } from '../components/atoms.jsx';
import { classifyUdpPayloadSize } from '../engine/index.js';

/* ───────────────────────────────────────────────────────────────────────
   §9 — THE MTU CONSTRAINT
   Interactive: slider for datagram size, see what happens at each
   threshold (fits in MTU, fragments, drops at IPv6 hosts, etc.).
   ─────────────────────────────────────────────────────────────────────── */

const MTUCard = ({ title, body }) => (
  <div className="udp-panel-bordered" style={{ padding: 22 }}>
    <h3
      className="udp-display"
      style={{ fontSize: 19, color: 'var(--ink-warm)', margin: '0 0 10px 0' }}
    >
      {title}
    </h3>
    <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--ink-dim)', margin: 0 }}>{body}</p>
  </div>
);

export const SectionNine = () => {
  const [size, setSize] = useState(1200);
  const { zone, fragments } = classifyUdpPayloadSize(size);
  const zoneDetail = {
    SAFE: {
      color: 'var(--ok)',
      headline:
        size <= 512
          ? 'Universally deliverable'
          : 'Fits IPv6 minimum guaranteed path MTU (1280 bytes)',
      detail:
        size <= 512
          ? 'Fits in any IPv4/IPv6 link, any tunnel, any path. DNS classically used this ceiling.'
          : 'Survives any IPv6 path without fragmentation. QUIC uses 1200 as its initial packet size for this reason.',
    },
    CAUTION: {
      color: 'var(--warn)',
      headline: 'Fits Ethernet MTU but not IPv6 minimum',
      detail:
        'Works on most paths today, but tunnels (VPN, GRE, IPsec) eat ~20-100 bytes of overhead. Could be dropped on paths with smaller MTU.',
    },
    FRAGMENTS: {
      color: 'var(--lost)',
      headline: 'Exceeds standard MTU: IP must fragment',
      detail:
        'IPv4 routers will split this into fragments. IPv6 routers won\'t fragment at all. They drop the packet and send back an ICMP "Packet Too Big". Many middleboxes drop fragments outright as a security measure.',
    },
    PATHOLOGICAL: {
      color: 'var(--lost)',
      headline: 'Many fragments, very high loss probability',
      detail:
        'A 64KB datagram fragments into ~45 pieces. Lose any one and the entire datagram is lost. NAT cannot demultiplex non-first fragments. This is technically legal but practically unusable on the public internet.',
    },
    INVALID: {
      color: 'var(--lost)',
      headline: "Exceeds UDP's maximum",
      detail:
        "UDP's length field is 16 bits, so the absolute maximum datagram is 65,535 bytes (65,507 of payload). Above this, the protocol can't even represent the size.",
    },
  }[zone];
  const { color, headline, detail } = zoneDetail;

  return (
    <section className="udp-section">
      <div className="udp-page">
        <SectionHeading
          tag="§ 09  ·  The size constraint"
          title="There is a ceiling. It is much lower than you think."
          lede={
            <>
              UDP can theoretically carry 64KB per datagram. In practice, anything larger than ~1400
              bytes starts inviting trouble. This is the single most consequential operational
              constraint of working with UDP.
            </>
          }
        />

        <div className="udp-panel" style={{ padding: 28 }}>
          {/* Slider with positioned tick markers */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 14,
              }}
            >
              <Label>Datagram payload size</Label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                }}
              >
                <span
                  className="udp-display"
                  style={{ fontSize: 36, color, lineHeight: 1, fontWeight: 500 }}
                >
                  {size.toLocaleString()}
                </span>
                <span className="udp-mono" style={{ fontSize: 12, color: 'var(--ink-dim)' }}>
                  bytes
                </span>
              </div>
            </div>

            {/* The slider, plus tick marks rendered on a positioned overlay */}
            <div style={{ position: 'relative', padding: '20px 0 28px 0' }}>
              <input
                type="range"
                className="udp-slider"
                aria-label="Datagram payload size in bytes"
                aria-valuetext={`${size.toLocaleString()} bytes`}
                min={64}
                max={9500}
                step={64}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                style={{ position: 'relative', zIndex: 2 }}
              />
              {/* Tick marks positioned on the track */}
              {[
                { v: 1232, label: 'IPv6 safe' },
                { v: 1472, label: 'Ethernet' },
                { v: 9000, label: 'jumbo' },
              ].map((t) => {
                const pct = ((t.v - 64) / (9500 - 64)) * 100;
                return (
                  <div
                    key={t.v}
                    style={{
                      position: 'absolute',
                      left: `${pct}%`,
                      top: 14,
                      transform: 'translateX(-50%)',
                      pointerEvents: 'none',
                      zIndex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 1,
                        height: 14,
                        background: 'var(--line-bright)',
                      }}
                    />
                    <div
                      className="udp-mono"
                      style={{
                        fontSize: 9.5,
                        color: 'var(--ink-faint)',
                        letterSpacing: '0.05em',
                        marginTop: 4,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t.v.toLocaleString()} · {t.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div
            style={{
              padding: '20px 24px',
              background:
                color === 'var(--ok)'
                  ? 'var(--ok-soft)'
                  : color === 'var(--warn)'
                    ? 'var(--warn-soft)'
                    : 'var(--lost-soft)',
              borderLeft: `3px solid ${color}`,
              borderRadius: '0 4px 4px 0',
              marginBottom: 24,
            }}
          >
            <div
              className="udp-mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.15em',
                color,
                marginBottom: 6,
              }}
            >
              ZONE · {zone}
            </div>
            <h3 className="udp-h3" style={{ color: 'var(--ink-warm)', margin: '0 0 8px 0' }}>
              {headline}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--ink-dim)', margin: 0, lineHeight: 1.65 }}>
              {detail}
            </p>
          </div>

          {/* Visualization — what the packet looks like on the wire */}
          <div>
            <Label>On the wire</Label>
            <div style={{ marginTop: 14 }}>
              {fragments === 1 ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    height: 44,
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      background: 'var(--surface-3)',
                      border: '1px solid var(--line-bright)',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'JetBrains Mono',
                      fontSize: 9,
                      color: 'var(--ink-dim)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    IP+UDP
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: '100%',
                      background: `linear-gradient(90deg, ${color} 0%, ${color} ${Math.min(100, (size / 1500) * 100)}%, var(--surface) ${Math.min(100, (size / 1500) * 100)}%, var(--surface) 100%)`,
                      border: `1px solid ${color}`,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 14,
                      fontFamily: 'JetBrains Mono',
                      fontSize: 11,
                      color: '#1a1108',
                      fontWeight: 600,
                    }}
                  >
                    PAYLOAD {size}B
                  </div>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--lost)',
                      marginBottom: 10,
                      fontFamily: 'JetBrains Mono',
                    }}
                  >
                    FRAGMENTED INTO {fragments} PIECES
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${Math.min(fragments, 16)}, 1fr)`,
                      gap: 2,
                      height: 36,
                      marginBottom: 12,
                    }}
                  >
                    {Array.from({ length: Math.min(fragments, 16) }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          background: 'var(--lost-soft)',
                          border: '1px solid var(--lost)',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'JetBrains Mono',
                          fontSize: 9,
                          color: 'var(--lost)',
                          fontWeight: 600,
                        }}
                      >
                        F{i + 1}
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--ink-dim)',
                      padding: '12px 14px',
                      background: 'var(--lost-soft)',
                      borderRadius: 3,
                      border: '1px solid var(--lost-edge)',
                      lineHeight: 1.65,
                    }}
                  >
                    <strong style={{ color: 'var(--lost)' }}>Every fragment must arrive.</strong>{' '}
                    Lose any one and the whole datagram is lost at reassembly. With ~1% per-hop drop
                    rate and {fragments} fragments, effective loss is roughly{' '}
                    {Math.min(99, fragments * 1).toFixed(0)}%.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Why this matters */}
        <div
          style={{
            marginTop: 32,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
          }}
        >
          <MTUCard
            title="Why 1500?"
            body="Ethernet's MTU has been 1500 bytes since the 1980s, picked to balance frame error rates against header overhead. Almost the entire internet inherits this number."
          />
          <MTUCard
            title="Why 1200?"
            body="IPv6 guarantees only 1280 bytes path-wide. Subtract IPv6 + UDP headers and you get 1232. QUIC rounds down to 1200 for safety. Every modern UDP-based protocol uses ~1200 as its initial packet size."
          />
          <MTUCard
            title="Why not fragment?"
            body="Modern middleboxes routinely drop IP fragments for security. NAT can't demultiplex them. Path MTU Discovery is unreliable. Just stay under the ceiling. The application can frame its own messages if it needs to."
          />
        </div>

        <p className="udp-pullquote">
          The single operational rule of working with UDP:
          <br />
          stay under ~1200 bytes per datagram, and frame anything larger at the application layer.
        </p>
      </div>
    </section>
  );
};
