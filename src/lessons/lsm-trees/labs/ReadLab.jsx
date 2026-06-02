import { useEffect, useRef, useState } from 'react';
import { Check, X as XIcon, Search, Filter } from 'lucide-react';
import { readDescent } from '../engine/index.js';
import Figure from '../components/Figure.jsx';
import { STRATA, lightText } from '../components/Layer.jsx';

const READ_LV = [
  { name: 'memtable', keys: ['fox', 'ivy', 'owl'], surface: true },
  { name: 'L0', keys: ['ant', 'bat', 'cod', 'elm'] },
  { name: 'L1', keys: ['ash', 'bee', 'dale', 'elk', 'fern', 'gorse'] },
  { name: 'L2', keys: ['birch', 'crag', 'dell', 'fen', 'heath', 'larch', 'moor', 'reed'] },
  {
    name: 'L3',
    keys: [
      'alder',
      'bracken',
      'clover',
      'dune',
      'ember',
      'gully',
      'hollow',
      'ledge',
      'marsh',
      'quarry',
      'ridge',
      'scree',
    ],
  },
];

// §IV — the descent. Drill from the surface (memtable) through the layered
// SSTables, newest-first. A Bloom filter on each stratum answers "no" for
// free; the drill only opens what it can't be sure isn't there.
export default function ReadLab() {
  const [q, setQ] = useState('');
  const [trace, setTrace] = useState([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const timers = useRef([]);

  const run = (key) => {
    if (!key) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setQ(key);
    setBusy(true);
    setDone(null);
    setTrace([]);
    const resolved = readDescent(READ_LV, key);
    let i = 0;
    const step = () => {
      setTrace(resolved.trace.slice(0, i + 1));
      const last = resolved.trace[i];
      if (last.hit) {
        setBusy(false);
        setDone({ found: true, at: last.name });
        return;
      }
      if (i >= resolved.trace.length - 1) {
        setBusy(false);
        setDone({ found: false });
        return;
      }
      i++;
      timers.current.push(setTimeout(step, 580));
    };
    timers.current.push(setTimeout(step, 160));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const samples = ['fox', 'cod', 'bracken', 'willow'];
  const skipped = trace.filter((t) => t.skipped).length;
  const opened = trace.filter((t) => t.opened).length;

  return (
    <Figure cap="lab · the descent" style={{ padding: '24px 22px 20px' }}>
      <div
        style={{
          display: 'flex',
          gap: 7,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <span className="tiny">drill for:</span>
        {samples.map((s) => (
          <button key={s} className="btn btn-i" disabled={busy} onClick={() => run(s)}>
            {s}
          </button>
        ))}
        <input
          className="inp"
          aria-label="Key to look up"
          placeholder="key"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !busy && run(q)}
          style={{ width: 92 }}
          disabled={busy}
        />
        <button className="btn" disabled={busy || !q} onClick={() => run(q)}>
          <Search size={12} /> read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {READ_LV.map((lv, i) => {
          const t = trace[i];
          const reached = !!t;
          let verdict = null;
          if (t?.bloom === 'no') verdict = 'bloom: definitely not here';
          if (t?.bloom === 'maybe') verdict = 'bloom: maybe, open it';
          if (t?.bloom === 'fp') verdict = 'bloom: maybe (false positive)';
          return (
            <div
              key={lv.name}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                opacity: reached ? 1 : 0.4,
                transition: 'opacity 0.3s',
              }}
            >
              {/* drill rail */}
              <div style={{ width: 16, position: 'relative', flex: 'none' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 7,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: reached ? 'var(--instr-2)' : 'var(--rule)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 3,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    border: `2px solid ${reached ? 'var(--instr)' : 'var(--rule-soft)'}`,
                    background: t?.hit ? 'var(--writ)' : reached ? 'var(--instr)' : 'var(--paper)',
                    boxShadow: t?.hit
                      ? '0 0 8px rgba(227,88,44,0.8)'
                      : reached
                        ? '0 0 6px rgba(84,180,200,0.6)'
                        : 'none',
                    transition: 'all 0.3s',
                  }}
                />
              </div>
              <div
                className="serif"
                style={{
                  width: 74,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: 10,
                  fontStyle: 'italic',
                  fontSize: 13.5,
                  color: 'var(--ink-3)',
                }}
              >
                {lv.name}
              </div>
              <div
                style={{
                  flex: 1,
                  background: STRATA[Math.min(i, 5)],
                  border: '1px solid rgba(0,0,0,0.4)',
                  padding: '9px 13px',
                  opacity: t?.skipped ? 0.34 : 1,
                  transition: 'all 0.4s',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {lv.keys.map((key) => (
                    <span
                      key={key}
                      className="m"
                      style={{
                        fontSize: 10.5,
                        padding: '1px 5px',
                        background: t?.hit && key === q ? 'var(--writ)' : 'rgba(0,0,0,0.22)',
                        color:
                          t?.hit && key === q
                            ? '#fff'
                            : lightText(i)
                              ? 'rgba(255,248,234,0.92)'
                              : '#241404',
                      }}
                    >
                      {key}
                    </span>
                  ))}
                </div>
                {verdict && (
                  <div
                    className="serif"
                    style={{
                      marginTop: 6,
                      fontStyle: 'italic',
                      fontSize: 11.5,
                      color: lightText(i) ? 'rgba(255,248,234,0.85)' : 'rgba(36,20,4,0.72)',
                    }}
                  >
                    {verdict}
                  </div>
                )}
              </div>
              <div
                style={{ width: 92, paddingLeft: 11, display: 'flex', alignItems: 'center' }}
                className="m"
              >
                {t?.skipped && (
                  <span
                    style={{
                      color: 'var(--jade)',
                      display: 'flex',
                      gap: 4,
                      alignItems: 'center',
                      fontSize: 11,
                    }}
                  >
                    <Filter size={11} /> skip
                  </span>
                )}
                {t?.hit && (
                  <span
                    style={{
                      color: 'var(--writ)',
                      display: 'flex',
                      gap: 4,
                      alignItems: 'center',
                      fontSize: 11,
                    }}
                  >
                    <Check size={11} /> found
                  </span>
                )}
                {t?.opened && !t?.hit && !lv.surface && (
                  <span
                    style={{
                      color: 'var(--gold)',
                      display: 'flex',
                      gap: 4,
                      alignItems: 'center',
                      fontSize: 11,
                    }}
                  >
                    <XIcon size={11} /> miss
                  </span>
                )}
                {t?.opened && !t?.hit && lv.surface && (
                  <span style={{ color: 'var(--ink-3)', fontSize: 11 }}>checked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: '12px 15px',
          background: done?.found ? 'rgba(227,88,44,0.12)' : 'var(--paper-3)',
          border: `1px solid ${done?.found ? 'var(--writ)' : 'var(--rule-soft)'}`,
          fontStyle: 'italic',
          fontFamily: 'Vollkorn',
          fontSize: 14.5,
          color: 'var(--ink)',
        }}
      >
        {!trace.length && 'pick a key. the read drills from the surface down, newest stratum first'}
        {done?.found && (
          <>
            <strong style={{ fontStyle: 'normal' }}>
              found "{q}" at {done.at}.
            </strong>{' '}
            {skipped > 0 && `${skipped} level(s) skipped by Bloom. `}opened {opened} of{' '}
            {READ_LV.length}.
          </>
        )}
        {done && !done.found && (
          <>
            <strong style={{ fontStyle: 'normal' }}>not found.</strong> {skipped} level(s) skipped
            by Bloom; the drill paid only for strata Bloom couldn't rule out.
          </>
        )}
      </div>
    </Figure>
  );
}
