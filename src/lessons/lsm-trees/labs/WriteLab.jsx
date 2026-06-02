import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { upsertMemtable, memtableFull, freezeSSTable } from '../engine/index.js';
import Figure from '../components/Figure.jsx';
import { STRATA, lightText } from '../components/Layer.jsx';

// §III — the write path live. Type a key/value (or seed): each put hits the
// WAL (sequential append) AND the sorted memtable. At capacity the memtable
// freezes into an immutable SSTable and a fresh memtable opens.
export default function WriteLab() {
  const CAP = 6;
  const [mem, setMem] = useState([]);
  const [wal, setWal] = useState(0);
  const [cores, setCores] = useState([]);
  const [k, setK] = useState('');
  const [v, setV] = useState('');
  const [flush, setFlush] = useState(false);
  const timers = useRef([]);

  const put = (key, value, tomb) => {
    if (!key) return;
    setWal((w) => w + 1);
    setMem((M) => {
      const next = upsertMemtable(M, key, value, tomb);
      if (memtableFull(next, CAP)) {
        timers.current.push(
          setTimeout(() => {
            setFlush(true);
            setCores((C) =>
              [freezeSSTable(next, () => Date.now() + Math.random()), ...C].slice(0, 5),
            );
            setMem([]);
            timers.current.push(setTimeout(() => setFlush(false), 680));
          }, 260),
        );
      }
      return next;
    });
  };
  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setMem([]);
    setWal(0);
    setCores([]);
    setFlush(false);
  };
  const seed = () => {
    reset();
    [
      ['ash', 2],
      ['bog', 5],
      ['cwm', 1],
      ['dale', 9],
    ].forEach((p, i) => timers.current.push(setTimeout(() => put(p[0], p[1]), i * 180)));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <Figure cap="lab · the write path" style={{ padding: '24px 22px 20px' }}>
      <div
        style={{
          display: 'flex',
          gap: 7,
          flexWrap: 'wrap',
          marginBottom: 16,
          alignItems: 'center',
        }}
      >
        <input
          className="inp"
          aria-label="Key"
          placeholder="key"
          value={k}
          onChange={(e) => setK(e.target.value)}
          style={{ width: 90 }}
        />
        <input
          className="inp"
          aria-label="Value"
          placeholder="value"
          value={v}
          onChange={(e) => setV(e.target.value)}
          style={{ width: 90 }}
        />
        <button
          className="btn btn-w"
          onClick={() => {
            put(k, v || '1');
            setK('');
            setV('');
          }}
        >
          <Plus size={12} /> put
        </button>
        <button
          className="btn"
          style={{ borderColor: 'var(--rule-soft)', color: 'var(--ink-2)' }}
          onClick={() => {
            put(k, '∅', true);
            setK('');
            setV('');
          }}
        >
          <Trash2 size={12} /> del
        </button>
        <button
          className="btn"
          style={{ borderColor: 'var(--rule)', color: 'var(--ink-3)' }}
          onClick={seed}
        >
          seed
        </button>
        <button
          className="btn"
          style={{ borderColor: 'var(--rule)', color: 'var(--ink-3)' }}
          onClick={reset}
          aria-label="reset"
        >
          <RotateCcw size={12} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="g2">
        <div className="fig-soft">
          <div
            className="tiny"
            style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}
          >
            <span>
              memtable · {mem.length}/{CAP}
            </span>
            <span style={{ color: mem.length >= CAP - 1 ? 'var(--writ)' : 'var(--ink-3)' }}>
              {mem.length >= CAP ? 'flushing' : 'open'}
            </span>
          </div>
          <div
            style={{
              minHeight: 152,
              border: '1px dashed var(--rule-soft)',
              padding: 7,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              background: flush ? 'rgba(227,170,51,0.16)' : 'transparent',
              transition: 'background 0.4s',
            }}
          >
            {mem.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  fontStyle: 'italic',
                  color: 'var(--ink-faint)',
                  fontSize: 13,
                  padding: 14,
                }}
              >
                empty · awaiting writes
              </div>
            )}
            {mem.map((m) => (
              <div
                key={m.k}
                className="rise m"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '4px 8px',
                  background: 'var(--paper-4)',
                  border: '1px solid var(--rule-soft)',
                  fontSize: 12,
                }}
              >
                <span style={{ color: 'var(--ink)' }}>{m.k}</span>
                <span style={{ color: m.tomb ? 'var(--ink-3)' : 'var(--writ)' }}>
                  {m.tomb ? '∅ tombstone' : `= ${m.v}`}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="fig-soft">
          <div
            className="tiny"
            style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}
          >
            <span>write-ahead log</span>
            <span style={{ color: 'var(--jade)' }}>{wal} appends</span>
          </div>
          <div
            style={{
              minHeight: 152,
              border: '1px solid var(--rule-soft)',
              background: '#0a0805',
              padding: 8,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              alignContent: 'flex-start',
            }}
          >
            {wal === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  fontStyle: 'italic',
                  color: 'var(--ink-faint)',
                  fontSize: 13,
                  padding: 14,
                  width: '100%',
                }}
              >
                no entries
              </div>
            )}
            {Array.from({ length: Math.min(wal, 72) }).map((_, i) => (
              <span
                key={i}
                style={{
                  width: 9,
                  height: 14,
                  borderRadius: 1,
                  background: i % 2 ? 'var(--writ)' : 'var(--writ-2)',
                  boxShadow: '0 0 4px rgba(227,88,44,0.3)',
                }}
              />
            ))}
          </div>
          <div className="depthmark" style={{ marginTop: 6 }}>
            one sequential append per write — never a seek
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div className="tiny" style={{ marginBottom: 8 }}>
          flushed sstables · newest first (left)
        </div>
        <div
          style={{
            border: '1px solid var(--rule-soft)',
            background: '#0a0805',
            padding: 10,
            minHeight: 80,
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
          }}
        >
          {cores.length === 0 && (
            <div
              style={{
                flex: 1,
                alignSelf: 'center',
                textAlign: 'center',
                fontStyle: 'italic',
                color: 'var(--ink-faint)',
                fontSize: 13,
              }}
            >
              fill the memtable to {CAP} keys to flush a stratum
            </div>
          )}
          {cores.map((c, i) => (
            <div
              key={c.id}
              className="rise"
              style={{
                minWidth: 96,
                background: STRATA[Math.min(i + 1, 5)],
                border: '1px solid rgba(0,0,0,0.4)',
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <span
                className="m"
                style={{
                  fontSize: 9.5,
                  color: lightText(i + 1) ? 'rgba(255,248,234,0.7)' : 'rgba(36,20,4,0.6)',
                }}
              >
                sst · {c.keys.length} keys
              </span>
              {c.keys.slice(0, 4).map((kk) => (
                <span
                  key={kk.k}
                  className="m"
                  style={{
                    fontSize: 10,
                    color: lightText(i + 1) ? 'rgba(255,248,234,0.92)' : '#241404',
                  }}
                >
                  {kk.k}
                  {kk.tomb ? '=∅' : `=${kk.v}`}
                </span>
              ))}
              <span
                className="m"
                style={{
                  fontSize: 8.5,
                  marginTop: 'auto',
                  color: lightText(i + 1) ? 'rgba(255,248,234,0.6)' : 'rgba(36,20,4,0.55)',
                }}
              >
                [{c.range[0]}…{c.range[1]}]
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: '1px solid var(--rule)',
          fontStyle: 'italic',
          fontFamily: 'Vollkorn',
          fontSize: 14,
          color: 'var(--ink-2)',
        }}
      >
        Each write hits the log (append) and the memtable (sorted insert). At capacity the memtable
        freezes into an immutable stratum and a fresh one opens. Notice deletes are just writes of
        <em> ∅</em> — exactly the tombstones from §I, now riding the same path.
      </div>
    </Figure>
  );
}
