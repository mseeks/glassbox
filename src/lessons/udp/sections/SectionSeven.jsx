import { useState, useRef } from 'react';
import {
  Globe,
  Phone,
  Gamepad2,
  Tv,
  Clock,
  Database,
  Network,
  Activity,
  Radio,
  Repeat,
} from 'lucide-react';
import { Label, SectionHeading } from '../components/atoms.jsx';

/* ───────────────────────────────────────────────────────────────────────
   §7 — THE DECISION MATRIX
   Pick a use case, see which protocol wins and why. The interactive
   way to internalize the tradeoff.
   ─────────────────────────────────────────────────────────────────────── */

const CriteriaBar = ({ name, tip, value, color }) => (
  <div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 6,
      }}
    >
      <div>
        <div
          className="udp-mono"
          style={{
            fontSize: 11,
            color: 'var(--ink)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 1 }}>{tip}</div>
      </div>
      <div className="udp-mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
        {value}/5
      </div>
    </div>
    <div
      style={{
        display: 'flex',
        gap: 3,
        height: 6,
      }}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            background: i < value ? color : 'var(--surface-3)',
            borderRadius: 1,
            opacity: i < value ? 0.5 + (i + 1) * 0.1 : 0.4,
            transition: 'all 0.3s',
          }}
        />
      ))}
    </div>
  </div>
);

export const SectionSeven = () => {
  const cases = [
    {
      key: 'filedl',
      name: 'Downloading a file',
      icon: Database,
      winner: 'tcp',
      criteria: { reliability: 5, ordering: 5, latency: 1, throughput: 4, multicast: 0 },
      reasoning: (
        <>
          You need every byte. You need them in order. A two-second stall while a packet retransmits
          is invisible to you; a missing chunk is a corrupted file.{' '}
          <strong>TCP is correct here.</strong>
        </>
      ),
    },
    {
      key: 'voip',
      name: 'Voice call',
      icon: Phone,
      winner: 'udp',
      criteria: { reliability: 2, ordering: 3, latency: 5, throughput: 3, multicast: 0 },
      reasoning: (
        <>
          Voice is a real-time stream. If a 20ms audio frame is lost, you can't replay it later.
          That moment of conversation is already past. TCP would stall the whole call retransmitting
          a packet whose contents are already obsolete. <strong>UDP wins.</strong> A brief glitch is
          acceptable; a frozen call is not.
        </>
      ),
    },
    {
      key: 'dns',
      name: 'DNS query',
      icon: Globe,
      winner: 'udp',
      criteria: { reliability: 3, ordering: 1, latency: 5, throughput: 1, multicast: 0 },
      reasoning: (
        <>
          One small query, one small response. The whole transaction is two datagrams. TCP would
          require a three-way handshake (one extra round trip before any data) before you could even
          ask. <strong>UDP wins on latency by a wide margin.</strong> Retry at the application layer
          if needed.
        </>
      ),
    },
    {
      key: 'game',
      name: 'Multiplayer game (state sync)',
      icon: Gamepad2,
      winner: 'udp',
      criteria: { reliability: 2, ordering: 2, latency: 5, throughput: 3, multicast: 0 },
      reasoning: (
        <>
          The current position of every player is a constantly-updating stream. A position update
          from 100ms ago is irrelevant. You only care about the freshest one. TCP's head-of-line
          blocking would freeze the whole game during a packet loss. <strong>UDP wins.</strong> Most
          games layer their own custom reliability on top for specific events (chat, kills) while
          letting positions flow unreliably.
        </>
      ),
    },
    {
      key: 'stream',
      name: 'Live video streaming',
      icon: Tv,
      winner: 'udp',
      criteria: { reliability: 2, ordering: 3, latency: 5, throughput: 5, multicast: 1 },
      reasoning: (
        <>
          Same logic as voice but with much higher bitrate. A late frame is worse than a missing
          frame. Some live streaming uses UDP-based RTP/SRTP; modern live streaming over the web
          increasingly uses WebRTC (UDP) or LL-HLS (TCP with very small chunks).{' '}
          <strong>UDP wins for real-time interactivity</strong>; TCP variants win for "live-ish"
          broadcast where 5+ seconds of latency is tolerable.
        </>
      ),
    },
    {
      key: 'web',
      name: 'Loading a webpage (HTTP)',
      icon: Network,
      winner: 'tcp',
      criteria: { reliability: 5, ordering: 4, latency: 4, throughput: 4, multicast: 0 },
      reasoning: (
        <>
          HTML, CSS, JS, images. None of it works partial. The page is broken without every byte.
          HTTP/1.1 and HTTP/2 ride on TCP. <strong>TCP is correct here</strong>, though HTTP/3 has
          moved to QUIC over UDP for other reasons we'll get to in section 10.
        </>
      ),
    },
    {
      key: 'telemetry',
      name: 'Metrics/log shipping (firehose)',
      icon: Activity,
      winner: 'udp',
      criteria: { reliability: 3, ordering: 1, latency: 4, throughput: 5, multicast: 0 },
      reasoning: (
        <>
          High-volume telemetry where missing some samples is statistically fine (you're watching
          trends, not auditing). The classic case is StatsD over UDP.{' '}
          <strong>UDP wins on throughput</strong>: no per-connection overhead, no backpressure
          delaying real workloads. Use TCP if every event must be retained (audit logs).
        </>
      ),
    },
    {
      key: 'ntp',
      name: 'Clock synchronization (NTP)',
      icon: Clock,
      winner: 'udp',
      criteria: { reliability: 2, ordering: 1, latency: 5, throughput: 1, multicast: 1 },
      reasoning: (
        <>
          NTP measures network round-trip time as part of its protocol. It needs raw, unbuffered
          packets with predictable timing. TCP's retransmits and buffering would corrupt the
          measurement. <strong>UDP wins.</strong> NTP retries at the protocol layer when packets are
          lost.
        </>
      ),
    },
    {
      key: 'gossip',
      name: 'Cluster gossip / membership',
      icon: Repeat,
      winner: 'udp',
      criteria: { reliability: 1, ordering: 1, latency: 4, throughput: 3, multicast: 1 },
      reasoning: (
        <>
          Designed for loss tolerance from day one. Each ping is small, frequent, and any single
          drop is statistically irrelevant. The protocol re-checks naturally on the next round. TCP
          would explode at scale (N² connections) and would needlessly retransmit information that's
          about to be re-asserted anyway. <strong>UDP wins.</strong>
        </>
      ),
    },
    {
      key: 'multicast',
      name: 'One-to-many delivery',
      icon: Radio,
      winner: 'udp',
      criteria: { reliability: 2, ordering: 2, latency: 4, throughput: 4, multicast: 5 },
      reasoning: (
        <>
          TCP is intrinsically point-to-point. There is no way to TCP-send a single packet to many
          receivers. <strong>UDP is the only option</strong> for IP multicast, broadcast, and most
          pub/sub-style one-to-many distribution at the network layer.
        </>
      ),
    },
  ];

  const [active, setActive] = useState(0);
  const c = cases[active];
  const CIcon = c.icon;
  const resultRef = useRef(null);

  const handleSelect = (i) => {
    setActive(i);
    if (typeof window !== 'undefined' && window.innerWidth < 880 && resultRef.current) {
      setTimeout(() => {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  return (
    <section className="udp-section">
      <div className="udp-page">
        <SectionHeading
          tag="§ 07  ·  When TCP, when UDP"
          title="The right protocol depends on what hurts more."
          lede={
            <>
              Reliability, ordering, latency, throughput, multicast. Different applications need
              different things. Pick a workload. See which protocol matches and why.
            </>
          }
        />

        {/* Use case tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 8,
            marginTop: 28,
            marginBottom: 28,
          }}
        >
          {cases.map((cc, i) => {
            const Icon = cc.icon;
            const isActive = i === active;
            return (
              <button
                key={cc.key}
                onClick={() => handleSelect(i)}
                style={{
                  padding: '12px 12px',
                  background: isActive
                    ? cc.winner === 'tcp'
                      ? 'var(--tcp-soft)'
                      : 'var(--signal-soft)'
                    : 'var(--surface)',
                  border: `1px solid ${isActive ? (cc.winner === 'tcp' ? 'var(--tcp)' : 'var(--signal)') : 'var(--line)'}`,
                  borderRadius: 4,
                  color: isActive ? 'var(--ink-warm)' : 'var(--ink-dim)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <Icon
                  size={15}
                  color={
                    isActive
                      ? cc.winner === 'tcp'
                        ? 'var(--tcp)'
                        : 'var(--signal)'
                      : 'var(--ink-faint)'
                  }
                  strokeWidth={1.8}
                />
                <span
                  style={{
                    fontSize: 12.5,
                    lineHeight: 1.3,
                    fontFamily: 'Atkinson Hyperlegible',
                    fontWeight: isActive ? 700 : 400,
                  }}
                >
                  {cc.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div ref={resultRef} className="udp-panel" style={{ padding: 28, scrollMarginTop: 20 }}>
          <div
            className="udp-dec-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.9fr)',
              gap: 32,
            }}
          >
            {/* Left: the verdict */}
            <div>
              <Label>Workload</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                <CIcon size={20} color="var(--ink-warm)" strokeWidth={1.8} />
                <h3
                  className="udp-display"
                  style={{ fontSize: 30, color: 'var(--ink-warm)', margin: 0 }}
                >
                  {c.name}
                </h3>
              </div>

              <div
                style={{
                  marginTop: 22,
                  padding: '20px 24px',
                  background: c.winner === 'tcp' ? 'var(--tcp-soft)' : 'var(--signal-soft)',
                  borderLeft: `3px solid ${c.winner === 'tcp' ? 'var(--tcp)' : 'var(--signal)'}`,
                  borderRadius: '0 4px 4px 0',
                }}
              >
                <Label style={{ color: c.winner === 'tcp' ? 'var(--tcp)' : 'var(--signal)' }}>
                  Verdict
                </Label>
                <div
                  className="udp-display"
                  style={{
                    fontSize: 42,
                    color: c.winner === 'tcp' ? 'var(--tcp)' : 'var(--signal)',
                    margin: '6px 0',
                    lineHeight: 1,
                  }}
                >
                  {c.winner === 'tcp' ? 'TCP' : 'UDP'}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink)', margin: 0 }}>
                  {c.reasoning}
                </p>
              </div>
            </div>

            {/* Right: requirements profile */}
            <div>
              <Label>What this workload needs</Label>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { key: 'reliability', name: 'Reliability', tip: 'Every packet must arrive' },
                  { key: 'ordering', name: 'In-order', tip: 'Sequence must be preserved' },
                  { key: 'latency', name: 'Low latency', tip: 'Time-to-receive matters' },
                  { key: 'throughput', name: 'Throughput', tip: 'Bytes per second' },
                  { key: 'multicast', name: 'One-to-many', tip: 'Same packet to many receivers' },
                ].map((req) => (
                  <CriteriaBar
                    key={req.key}
                    name={req.name}
                    tip={req.tip}
                    value={c.criteria[req.key]}
                    color={c.winner === 'tcp' ? 'var(--tcp)' : 'var(--signal)'}
                  />
                ))}
              </div>
              <div
                style={{
                  marginTop: 22,
                  padding: '12px 14px',
                  background: 'var(--bg-deep)',
                  borderRadius: 3,
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono',
                  color: 'var(--ink-faint)',
                  letterSpacing: '0.05em',
                  lineHeight: 1.5,
                }}
              >
                Higher bar = the workload depends more on that property. The shape of this profile
                decides the protocol.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
