import { useState, useRef } from 'react';
import { Label, SectionHeading } from '../components/atoms.jsx';

/* ───────────────────────────────────────────────────────────────────────
   §3 — THE 8-BYTE HEADER
   Interactive anatomy: click each field to learn what it does.
   RFC 768 — the shortest, simplest protocol RFC in existence.
   ─────────────────────────────────────────────────────────────────────── */

const FieldCell = ({ field, cols, selected, onClick }) => {
  const active = selected;
  return (
    <button
      onClick={() => onClick(field.key)}
      className="udp-field-cell"
      style={{
        gridColumn: cols,
        padding: '18px 10px',
        background: active ? 'var(--signal)' : 'var(--surface)',
        border: `1px solid ${active ? 'var(--signal)' : 'var(--line-bright)'}`,
        color: active ? 'var(--udp-on-accent)' : 'var(--ink)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        textAlign: 'center',
        fontFamily: 'JetBrains Mono',
        boxShadow: active ? '0 0 16px var(--signal-soft)' : 'none',
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.08em',
          opacity: 0.7,
          marginBottom: 4,
        }}
      >
        BYTES {field.bytes}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {field.name}
      </div>
      <div
        style={{
          fontSize: 10,
          marginTop: 4,
          opacity: 0.8,
          fontFamily: 'JetBrains Mono',
        }}
      >
        16 bits
      </div>
    </button>
  );
};

const DetailRow = ({ label, children }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '4px 0',
      borderBottom: '1px solid var(--line-faint)',
    }}
  >
    <span
      className="udp-mono"
      style={{
        fontSize: 11,
        color: 'var(--ink-faint-fn)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
    <span className="udp-mono" style={{ fontSize: 13, color: 'var(--ink)' }}>
      {children}
    </span>
  </div>
);

export const SectionThree = () => {
  const fields = [
    {
      key: 'srcport',
      name: 'Source Port',
      bytes: '0–1',
      hex: '0xc01a',
      example: '49178',
      span: 16,
      color: 'signal',
      explain:
        'A 16-bit identifier (0–65535) saying which sending application this datagram came from. The kernel multiplexes many programs over one IP address using ports. Optional in either version (may be zero when no reply is expected).',
      note: 'Picked by the kernel for outbound traffic, usually from the "ephemeral" range (32768–60999 on Linux).',
    },
    {
      key: 'dstport',
      name: 'Destination Port',
      bytes: '2–3',
      hex: '0x0035',
      example: '53',
      span: 16,
      color: 'signal',
      explain:
        'Which receiving application should get this datagram. The receiving kernel uses this to look up which socket is bound to the port and hand the data over.',
      note: 'Well-known examples: 53 (DNS), 67/68 (DHCP), 123 (NTP), 161 (SNMP), 1194 (OpenVPN), 3478 (STUN).',
    },
    {
      key: 'len',
      name: 'Length',
      bytes: '4–5',
      hex: '0x0028',
      example: '40',
      span: 16,
      color: 'signal',
      explain:
        'The total length in bytes of the datagram: header (8) plus the payload. Minimum 8 (empty payload). Maximum theoretical 65,535, but in practice far lower due to MTU constraints, which we cover later.',
      note: "Redundant with IP's length field, kept for historical reasons. Most implementations ignore minor mismatches.",
    },
    {
      key: 'sum',
      name: 'Checksum',
      bytes: '6–7',
      hex: '0xab12',
      example: '–',
      span: 16,
      color: 'signal',
      explain:
        'A 16-bit ones-complement sum over the pseudo-header (source IP, dest IP, protocol, length) plus the UDP header and payload. Detects bit-flips in transit. If zero in IPv4, it means "no checksum used." That\'s legal but rare in practice. In IPv6 the checksum is mandatory.',
      note: 'Detects corruption, NOT loss. The whole datagram has to actually arrive before this matters.',
    },
  ];

  const [selected, setSelected] = useState('srcport');
  const current = fields.find((f) => f.key === selected);
  const detailRef = useRef(null);

  const handleSelect = (key) => {
    setSelected(key);
    // On narrow screens, bring the detail into view after the click
    if (typeof window !== 'undefined' && window.innerWidth < 720 && detailRef.current) {
      setTimeout(() => {
        detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  return (
    <section className="udp-section">
      <div className="udp-page">
        <SectionHeading
          tag="§ 03  ·  Anatomy"
          title="Eight bytes. The whole specification."
          lede={
            <>
              UDP is defined by <strong>RFC 768</strong>, famously the shortest protocol RFC ever
              written. Three pages. The header is four 16-bit fields. That's the entire wire format.
              Tap each field to see what it does.
            </>
          }
        />

        {/* Header visualization */}
        <div
          className="udp-panel udp-anatomy-panel"
          style={{
            background: 'var(--bg-deep)',
            padding: 28,
            marginTop: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 14,
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <Label>Fig. 4: The UDP header (RFC 768)</Label>
            <div className="udp-mono" style={{ fontSize: 11, color: 'var(--ink-faint-fn)' }}>
              ┌─ 32 bits wide ─┐
            </div>
          </div>

          {/* Byte ruler */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(32, 1fr)',
              gap: 1,
              marginBottom: 4,
              fontFamily: 'JetBrains Mono',
              fontSize: 9,
              color: 'var(--ink-faint-fn)',
              textAlign: 'center',
            }}
          >
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i}>{i % 8 === 0 ? i : '·'}</div>
            ))}
          </div>

          {/* Header rows */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(32, 1fr)',
              gap: 1,
            }}
          >
            <FieldCell
              field={fields[0]}
              cols="span 16"
              selected={selected === 'srcport'}
              onClick={handleSelect}
            />
            <FieldCell
              field={fields[1]}
              cols="span 16"
              selected={selected === 'dstport'}
              onClick={handleSelect}
            />
            <FieldCell
              field={fields[2]}
              cols="span 16"
              selected={selected === 'len'}
              onClick={handleSelect}
            />
            <FieldCell
              field={fields[3]}
              cols="span 16"
              selected={selected === 'sum'}
              onClick={handleSelect}
            />
          </div>

          {/* Payload */}
          <div
            style={{
              marginTop: 1,
              padding: '14px 14px',
              background: 'var(--surface-2)',
              border: '1px dashed var(--line-bright)',
              borderRadius: 3,
              textAlign: 'center',
              fontFamily: 'JetBrains Mono',
              fontSize: 12,
              color: 'var(--ink-dim)',
              letterSpacing: '0.08em',
            }}
          >
            Payload: variable length, 0 to ~65,507 bytes (in practice, far smaller)
          </div>

          {/* Hint on mobile */}
          <div
            className="udp-anatomy-hint"
            style={{
              display: 'none',
              marginTop: 14,
              fontSize: 11,
              color: 'var(--ink-faint-fn)',
              fontFamily: 'JetBrains Mono',
              letterSpacing: '0.1em',
              textAlign: 'center',
            }}
          >
            ↓ tap a field above ↓
          </div>

          {/* Field detail */}
          <div
            ref={detailRef}
            className="udp-field-detail"
            style={{
              marginTop: 22,
              paddingTop: 22,
              borderTop: '1px solid var(--line-faint)',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 0.45fr) minmax(0, 1fr)',
              gap: 28,
              scrollMarginTop: 24,
            }}
          >
            <div>
              <Label>Selected field</Label>
              <div
                className="udp-display"
                style={{
                  fontSize: 32,
                  color: 'var(--signal)',
                  margin: '6px 0',
                  lineHeight: 1,
                }}
              >
                {current.name}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 14 }}>
                <DetailRow label="Position">bytes {current.bytes}</DetailRow>
                <DetailRow label="Width">{current.span} bits</DetailRow>
                <DetailRow label="Example value">{current.example}</DetailRow>
              </div>
            </div>
            <div>
              <Label>Purpose</Label>
              <p style={{ marginTop: 8, fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink)' }}>
                {current.explain}
              </p>
              <div
                style={{
                  marginTop: 16,
                  padding: '14px 16px',
                  background: 'var(--signal-soft)',
                  borderLeft: '2px solid var(--signal)',
                  borderRadius: '0 4px 4px 0',
                  fontSize: 13,
                  color: 'var(--ink)',
                }}
              >
                <strong style={{ color: 'var(--signal)' }}>Note. </strong>
                {current.note}
              </div>
            </div>
          </div>
        </div>

        {/* Total */}
        <div
          className="udp-panel-bordered"
          style={{
            marginTop: 32,
            padding: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 18,
          }}
        >
          <div>
            <Label>Total header size</Label>
            <div
              className="udp-display"
              style={{ fontSize: 56, color: 'var(--ink-warm)', lineHeight: 1, marginTop: 6 }}
            >
              8 bytes
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-dim)', marginTop: 6 }}>
              Fixed. No options. No extension headers. No state.
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Label>vs. TCP</Label>
            <div
              className="udp-display"
              style={{ fontSize: 32, color: 'var(--tcp)', lineHeight: 1, marginTop: 6 }}
            >
              20–60 bytes
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-dim)', marginTop: 6 }}>
              Plus ~80 bytes of socket state per connection, both ends.
            </div>
          </div>
        </div>

        <p className="udp-prose" style={{ marginTop: 28 }}>
          You can read the entire UDP specification, cover to cover, in about ten minutes. There's
          nothing else in it. The simplicity is the point.
        </p>
      </div>
    </section>
  );
};
