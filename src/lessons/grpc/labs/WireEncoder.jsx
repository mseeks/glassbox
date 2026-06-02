import { useMemo, useState } from 'react';
import { encodeAccount, jsonForAccount } from '../engine/index.js';
import { ByteStrip, Legend } from '../components/Bytes.jsx';

// Live protobuf encoder for the demo Account message. Edit the fields and watch
// the real bytes — and how much smaller they are than the equivalent JSON.
export default function WireEncoder() {
  const [owner, setOwner] = useState('Al');
  const [balance, setBalance] = useState('300');
  const [currency, setCurrency] = useState('USD');
  const [hasCurrency, setHasCurrency] = useState(true);
  const [ascii, setAscii] = useState(false);

  const bal = useMemo(() => {
    try {
      return BigInt(balance || '0');
    } catch {
      return 0n;
    }
  }, [balance]);

  const parts = useMemo(
    () => encodeAccount({ owner, balanceCents: bal, currency, hasCurrency }),
    [owner, bal, currency, hasCurrency],
  );

  const pbLen = parts.length;
  const json = useMemo(
    () => jsonForAccount({ owner, balanceCents: bal, currency, hasCurrency }),
    [owner, bal, currency, hasCurrency],
  );
  const ratio = pbLen ? (json.bytes / pbLen).toFixed(1) : '—';

  return (
    <div className="gx-panel pad" style={{ marginTop: 22 }}>
      <div className="gx-panel-label">
        <span className="dot" />
        live encoder · message Account
      </div>

      {/* controls */}
      <div style={{ display: 'grid', gap: 11, marginBottom: 18 }}>
        <FieldRow n={1} type="string" name="owner">
          <input
            className="gx-input"
            aria-label="owner (field 1, string)"
            value={owner}
            maxLength={18}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="(empty → field omitted)"
          />
        </FieldRow>
        <FieldRow n={2} type="int64" name="balance_cents">
          <input
            className="gx-input"
            aria-label="balance_cents (field 2, int64)"
            value={balance}
            inputMode="numeric"
            onChange={(e) => setBalance(e.target.value.replace(/[^0-9]/g, ''))}
          />
        </FieldRow>
        <FieldRow
          n={3}
          type="string"
          name="currency"
          toggle={{ on: hasCurrency, set: setHasCurrency }}
        >
          <input
            className="gx-input"
            aria-label="currency (field 3, string)"
            value={currency}
            maxLength={6}
            disabled={!hasCurrency}
            style={{ opacity: hasCurrency ? 1 : 0.4 }}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </FieldRow>
      </div>

      {/* the wire */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 9,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint2)',
          }}
        >
          on the wire
        </span>
        <button
          className={`gx-btn ${ascii ? 'on' : ''}`}
          style={{ padding: '5px 9px', fontSize: 10 }}
          onClick={() => setAscii((a) => !a)}
        >
          {ascii ? 'show hex' : 'show text'}
        </button>
      </div>
      <div
        style={{
          background: '#060a0e',
          border: '1px solid var(--line)',
          borderRadius: 10,
          padding: 14,
          minHeight: 56,
        }}
      >
        <ByteStrip parts={parts} showAscii={ascii} />
      </div>
      <Legend />

      {/* scale bars — make the size difference visible, not just numeric */}
      <div style={{ marginTop: 18, display: 'grid', gap: 9 }}>
        <SizeBar
          label="protobuf"
          bytes={pbLen}
          pct={json.bytes ? (pbLen / json.bytes) * 100 : 0}
          color="var(--cyan)"
          glow="var(--cyan-glow)"
        />
        <SizeBar
          label="json"
          bytes={json.bytes}
          pct={100}
          color="var(--amber)"
          glow="var(--amber-glow)"
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
        <span
          style={{
            fontFamily: "'Bricolage Grotesque'",
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--cyan)',
            lineHeight: 1,
          }}
        >
          {ratio}×
        </span>
        <span style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
          smaller on the wire — and no text to parse on arrival.
        </span>
      </div>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--ink-faint2)',
          margin: '12px 0 0',
          wordBreak: 'break-all',
        }}
      >
        json sent as: {json.text}
      </p>
      <p style={{ fontSize: 13.5, color: 'var(--ink-dim)', margin: '14px 0 0' }}>
        Notice what is <em style={{ color: 'var(--cyan)', fontStyle: 'normal' }}>not</em> on the
        wire: the words
        <code className="gx-kw" style={{ color: 'var(--ink)' }}>
          owner
        </code>
        ,
        <code className="gx-kw" style={{ color: 'var(--ink)' }}>
          balance_cents
        </code>
        ,
        <code className="gx-kw" style={{ color: 'var(--ink)' }}>
          currency
        </code>
        . Only their numbers survive. Rename them in your{' '}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86em' }}>.proto</span> and these
        bytes don't change by one bit.
      </p>
    </div>
  );
}

function FieldRow({ n, type, name, toggle, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          flexShrink: 0,
          width: 26,
          height: 26,
          borderRadius: 7,
          background: 'var(--amber-glow)',
          border: '1px solid var(--amber)',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--amber)',
        }}
      >
        {n}
      </div>
      <div style={{ flexShrink: 0, width: 116 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-bright)' }}>
          {name}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--cyan)' }}>
          {type}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
        {children}
        {toggle && (
          <button
            className={`gx-btn ${toggle.on ? 'on' : ''}`}
            style={{ padding: '6px 8px', fontSize: 9, flexShrink: 0 }}
            onClick={() => toggle.set((v) => !v)}
          >
            {toggle.on ? 'drop' : 'add'}
          </button>
        )}
      </div>
    </div>
  );
}

function SizeBar({ label, bytes, pct, color, glow }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span
        style={{
          flexShrink: 0,
          width: 64,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint2)',
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 22,
          background: '#060a0e',
          border: '1px solid var(--line)',
          borderRadius: 6,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${Math.max(pct, 3)}%`,
            height: '100%',
            background: glow,
            borderRight: `2px solid ${color}`,
            transition: 'width 0.35s cubic-bezier(.6,0,.4,1)',
          }}
        />
      </div>
      <span
        style={{
          flexShrink: 0,
          width: 40,
          textAlign: 'right',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color,
        }}
      >
        {bytes} B
      </span>
    </div>
  );
}
