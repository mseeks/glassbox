import { useState } from 'react';
import { Send, AlertTriangle, Shuffle, Package } from 'lucide-react';
import { Label, SectionHeading } from '../components/atoms.jsx';
import {
  ConnectionlessVisual,
  UnreliableVisual,
  UnorderedVisual,
  MessageOrientedVisual,
} from '../components/visuals.jsx';

/* ───────────────────────────────────────────────────────────────────────
   §4 — THE FOUR PROPERTIES
   The four irreducible properties of UDP, each with its own visual.
   ─────────────────────────────────────────────────────────────────────── */

export const SectionFour = () => {
  const [active, setActive] = useState(0);

  const properties = [
    {
      key: 'connectionless',
      name: 'Connectionless',
      icon: Send,
      tagline: 'No handshake. No state. No teardown.',
      body: (
        <>
          UDP has no concept of a <em>connection</em>. When you call <code>sendto()</code>, the
          kernel constructs the datagram, hands it to IP, and forgets it. There is nothing to set up
          beforehand and nothing to tear down after. Two hosts can exchange UDP traffic without ever
          agreeing they're "talking" — they just send packets at each other's address and port.
        </>
      ),
      visual: <ConnectionlessVisual />,
    },
    {
      key: 'unreliable',
      name: 'Unreliable',
      icon: AlertTriangle,
      tagline: 'Sent does not mean arrived.',
      body: (
        <>
          The sender gets no acknowledgement. The receiver makes no promise to ack. If a packet is
          dropped in transit — by a congested router, a flaky NIC, a wireless glitch — neither side
          hears about it. The packet just doesn't show up. UDP <em>will not retransmit it.</em> If
          reliability matters for your application, you build it on top.
        </>
      ),
      visual: <UnreliableVisual />,
    },
    {
      key: 'unordered',
      name: 'Unordered',
      icon: Shuffle,
      tagline: 'Packets arrive in whatever order they arrive.',
      body: (
        <>
          Two packets sent in sequence may take different paths through the network and arrive in
          different order. UDP does <em>not</em> buffer or reorder them at the receiver. Your
          application sees them in arrival order, not send order. If sequence matters, you number
          your packets and sort them yourself.
        </>
      ),
      visual: <UnorderedVisual />,
    },
    {
      key: 'message',
      name: 'Message-oriented',
      icon: Package,
      tagline: 'One send equals one receive. Boundaries preserved.',
      body: (
        <>
          UDP is a <em>datagram</em> protocol, not a stream. If you send three datagrams of 100
          bytes each, the receiver gets exactly three
          <code>recv()</code> calls of 100 bytes each — not one of 300, not 150+150. Message
          boundaries are preserved. (TCP, by contrast, is a byte stream — boundaries disappear and
          the application has to re-frame.) This makes UDP much more natural for request/response
          protocols where each message is a unit.
        </>
      ),
      visual: <MessageOrientedVisual />,
    },
  ];

  const p = properties[active];
  const Icon = p.icon;

  return (
    <section className="udp-section">
      <div className="udp-page">
        <SectionHeading
          tag="§ 04  ·  Properties"
          title="Four irreducible truths."
          lede={
            <>
              Everything UDP does — and doesn't do — follows from four properties. Each shapes when
              UDP is the right choice and when it isn't.
            </>
          }
        />

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 28,
            marginBottom: 28,
            flexWrap: 'wrap',
          }}
        >
          {properties.map((prop, i) => {
            const PIcon = prop.icon;
            return (
              <button
                key={prop.key}
                onClick={() => setActive(i)}
                className={`udp-tab ${active === i ? 'udp-tab-active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <PIcon size={14} strokeWidth={2} />
                {prop.name}
              </button>
            );
          })}
        </div>

        {/* Active panel */}
        <div
          className="udp-panel udp-prop-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
            gap: 32,
            padding: 28,
          }}
        >
          <div className="udp-prop-text">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
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
              <Label>Property {active + 1} of 4</Label>
            </div>
            <h3
              className="udp-display"
              style={{
                fontSize: 36,
                color: 'var(--ink-warm)',
                margin: '6px 0 8px 0',
                lineHeight: 1,
              }}
            >
              {p.name}
            </h3>
            <p
              style={{
                fontSize: 16,
                fontStyle: 'italic',
                color: 'var(--signal)',
                margin: '0 0 18px 0',
                fontFamily: 'Bricolage Grotesque',
              }}
            >
              {p.tagline}
            </p>
            <p
              style={{
                fontSize: 15.5,
                lineHeight: 1.7,
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              {p.body}
            </p>
          </div>
          <div
            className="udp-prop-visual"
            style={{
              background: 'var(--bg-deep)',
              border: '1px solid var(--line)',
              borderRadius: 4,
              padding: 22,
              minHeight: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {p.visual}
          </div>
        </div>
      </div>
    </section>
  );
};
