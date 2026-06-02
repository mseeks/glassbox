import { useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { bloomPositions } from '../engine/index.js';

export function CountingBFDemo() {
  const M = 32;
  const K = 3;
  const COLS = 16;
  const [counters, setCounters] = useState(() => new Array(M).fill(0));
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');
  const [pulse, setPulse] = useState({ positions: [], kind: null });

  async function insert() {
    const w = input.trim().toLowerCase();
    if (!w || items.includes(w)) return;
    const positions = bloomPositions(w, K, M);
    setPulse({ positions, kind: 'add' });
    setCounters((prev) => {
      const next = [...prev];
      for (const p of positions) next[p] = Math.min(15, next[p] + 1);
      return next;
    });
    setItems((prev) => [...prev, w]);
    setInput('');
    setTimeout(() => setPulse({ positions: [], kind: null }), 700);
  }

  async function remove(word) {
    const positions = bloomPositions(word, K, M);
    setPulse({ positions, kind: 'remove' });
    setCounters((prev) => {
      const next = [...prev];
      for (const p of positions) next[p] = Math.max(0, next[p] - 1);
      return next;
    });
    setItems((prev) => prev.filter((w) => w !== word));
    setTimeout(() => setPulse({ positions: [], kind: null }), 700);
  }

  function reset() {
    setCounters(new Array(M).fill(0));
    setItems([]);
    setInput('');
  }

  return (
    <div className="bf-panel" style={{ padding: '1.75rem' }}>
      <div className="flex items-baseline justify-between mb-1 flex-wrap gap-2">
        <div>
          <div
            className="bf-ui"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.25em',
              color: 'rgba(196, 181, 253, 0.7)',
              textTransform: 'uppercase',
            }}
          >
            Lab 04 · Counting BF
          </div>
          <div
            className="bf-display"
            style={{ fontSize: '1.5rem', color: '#f5e9d3', marginTop: '0.3rem' }}
          >
            Bits become counters
          </div>
        </div>
        <div className="bf-mono bf-mark-muted" style={{ fontSize: '0.75rem' }}>
          4-bit counters · supports deletion · 4× memory
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: '5px',
          padding: '1rem 0.85rem',
          background: 'rgba(10, 10, 15, 0.45)',
          borderRadius: '3px',
          margin: '1rem 0',
        }}
      >
        {counters.map((c, i) => {
          const isPulse = pulse.positions.includes(i);
          const intensity = c / 4;
          return (
            <div
              key={i}
              style={{
                aspectRatio: '1 / 1',
                borderRadius: '2px',
                background:
                  c === 0
                    ? '#1a1a24'
                    : `rgba(196, 181, 253, ${0.2 + Math.min(0.7, intensity * 0.7)})`,
                border: `1px solid ${c === 0 ? 'rgba(232, 222, 200, 0.08)' : 'rgba(196, 181, 253, 0.4)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: c === 0 ? '#3a3a44' : '#0a0a0f',
                transition: 'all 280ms ease',
                transform: isPulse ? 'scale(1.15)' : 'scale(1)',
                boxShadow: isPulse
                  ? pulse.kind === 'add'
                    ? '0 0 12px 3px rgba(94, 234, 212, 0.6)'
                    : '0 0 12px 3px rgba(251, 113, 133, 0.5)'
                  : 'none',
              }}
            >
              {c}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        <input
          className="bf-input flex-1"
          aria-label="Word to insert"
          placeholder="type a word…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') insert();
          }}
          style={{ minWidth: '10rem' }}
        />
        <button className="bf-btn primary" onClick={insert} disabled={!input.trim()}>
          <Plus style={{ width: 14, height: 14 }} /> Insert
        </button>
        <button className="bf-btn ghost" onClick={reset}>
          <RotateCcw style={{ width: 13, height: 13 }} /> Reset
        </button>
      </div>

      {items.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {items.map((w) => (
            <button
              key={w}
              onClick={() => remove(w)}
              className="bf-mono flex items-center gap-1"
              style={{
                fontSize: '0.75rem',
                padding: '0.25em 0.5em 0.25em 0.6em',
                background: 'rgba(196, 181, 253, 0.06)',
                color: '#ddd6fe',
                borderRadius: '2px',
                border: '1px solid rgba(196, 181, 253, 0.2)',
                cursor: 'pointer',
                transition: 'all 180ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(251, 113, 133, 0.1)';
                e.currentTarget.style.color = '#fda4af';
                e.currentTarget.style.borderColor = 'rgba(251, 113, 133, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(196, 181, 253, 0.06)';
                e.currentTarget.style.color = '#ddd6fe';
                e.currentTarget.style.borderColor = 'rgba(196, 181, 253, 0.2)';
              }}
            >
              {w} <Minus style={{ width: 10, height: 10 }} />
            </button>
          ))}
        </div>
      )}
      <div className="bf-ui bf-mark-muted mt-3" style={{ fontSize: '0.78rem', lineHeight: 1.55 }}>
        Click a chip to delete that item. Counters at its positions decrement. With plain bits,
        deletion would set a bit to zero — corrupting other items that share that position. With
        counters, the bit is only "cleared" when its count returns to zero.
      </div>
    </div>
  );
}
