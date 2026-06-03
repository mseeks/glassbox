import { useState } from 'react';
import { ICONS } from '../components/Callout.jsx';

// Three schema changes an old client might meet from a new server: a free rename,
// a backward-compatible field add, and the cardinal sin of reusing a tag number.
const EVO = {
  rename: {
    btn: 'rename field 2',
    v2: [
      ['1', 'string', 'owner'],
      ['2', 'int64', 'balance_minor', 'ren'],
    ],
    verdict: 'ok',
    title: 'Perfectly compatible.',
    body: (
      <>
        The name lives only in your source code. Never on the wire. Field <b>2</b> is still an
        <code className="gx-kw" style={{ color: 'var(--ink)' }}>
          int64
        </code>
        . The bytes are byte-for-byte identical, so the old client decodes flawlessly and never
        knows.
      </>
    ),
  },
  add: {
    btn: 'add field 4',
    v2: [
      ['1', 'string', 'owner'],
      ['2', 'int64', 'balance_cents'],
      ['4', 'bool', 'frozen', 'new'],
    ],
    verdict: 'ok',
    title: 'Backward compatible.',
    body: (
      <>
        The old client receives a tag for field <b>4</b> it has never heard of. Per the spec it
        <b> skips the unknown field</b> (good libraries even preserve it on re-serialize). New
        servers and old clients coexist: the basis of rolling deploys.
      </>
    ),
  },
  reuse: {
    btn: 'reuse number 2',
    v2: [
      ['1', 'string', 'owner'],
      ['2', 'string', 'region', 'sin'],
    ],
    verdict: 'warn',
    title: 'Silent corruption. The cardinal sin.',
    body: (
      <>
        Field <b>2</b> was deleted and its{' '}
        <em style={{ color: 'var(--coral)', fontStyle: 'normal' }}>number reused</em> for a new
        type. The old client still ships{' '}
        <code className="gx-kw" style={{ color: 'var(--ink)' }}>
          0x10
        </code>{' '}
        (field 2, <b>varint</b>); the new server reads field 2 expecting a <b>string</b> (
        <code className="gx-kw" style={{ color: 'var(--ink)' }}>
          0x12
        </code>
        ). Type mismatch: a decode error or garbage, with <b>no warning</b>. Always{' '}
        <code className="gx-kw" style={{ color: 'var(--ink)' }}>
          reserved 2;
        </code>{' '}
        a retired number.
      </>
    ),
  },
};

export default function EvolutionLab() {
  const [change, setChange] = useState('rename');
  const e = EVO[change];
  const v1 = [
    ['1', 'string', 'owner'],
    ['2', 'int64', 'balance_cents'],
  ];

  return (
    <div className="gx-panel pad" style={{ marginTop: 22 }}>
      <div className="gx-panel-label">
        <span className="dot" />
        schema evolution · old client ↔ new server
      </div>

      <div className="gx-seg" style={{ marginBottom: 18 }}>
        {Object.keys(EVO).map((k) => (
          <button
            key={k}
            className={`gx-btn ${change === k ? 'on' : ''}`}
            onClick={() => setChange(k)}
          >
            {EVO[k].btn}
          </button>
        ))}
      </div>

      <div className="evo-grid">
        <SchemaCard title="v1 · old client" fields={v1} />
        <div className="evo-arrow">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--ink-faint2)"
            strokeWidth="1.6"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>
        <SchemaCard title="v2 · new server" fields={e.v2} />
      </div>

      <div className={`gx-callout ${e.verdict}`} style={{ marginBottom: 0 }}>
        {ICONS[e.verdict]}
        <div>
          <b style={{ display: 'block', marginBottom: 3 }}>{e.title}</b>
          <span style={{ fontSize: 14 }}>{e.body}</span>
        </div>
      </div>
    </div>
  );
}

function SchemaCard({ title, fields }) {
  const color = { ren: 'var(--cyan)', new: 'var(--mint)', sin: 'var(--coral)' };
  return (
    <div
      style={{
        background: '#060a0e',
        border: '1px solid var(--line)',
        borderRadius: 10,
        padding: 13,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9.5,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint2)',
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'grid', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        {fields.map((f, i) => {
          const flag = f[3];
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                color: flag ? color[flag] : 'var(--ink)',
              }}
            >
              <span style={{ color: 'var(--amber)', width: 14 }}>{f[0]}</span>
              <span style={{ color: flag ? color[flag] : 'var(--cyan)' }}>{f[1]}</span>
              <span>{f[2]}</span>
              {flag === 'new' && <span style={{ fontSize: 9, color: 'var(--mint)' }}>← added</span>}
              {flag === 'sin' && (
                <span style={{ fontSize: 9, color: 'var(--coral)' }}>← reused!</span>
              )}
              {flag === 'ren' && (
                <span style={{ fontSize: 9, color: 'var(--cyan)' }}>← renamed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
