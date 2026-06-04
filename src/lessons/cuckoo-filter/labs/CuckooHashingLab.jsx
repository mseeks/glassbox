import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { fnv1a32, mix32 } from '../engine/index.js';

function makeHashTable(numSlots = 11) {
  return { slots: new Array(numSlots).fill(null), numSlots };
}
function tableHashes(key, numSlots) {
  const h1 = mix32(fnv1a32('p:' + key)) % numSlots;
  let h2 = mix32(fnv1a32('q:' + key)) % numSlots;
  if (h2 === h1) h2 = (h2 + 1 + (mix32(fnv1a32('r:' + key)) % (numSlots - 1))) % numSlots;
  return [h1, h2];
}
function tableInsert(table, key, maxKicks = 40) {
  const [h1, h2] = tableHashes(key, table.numSlots);
  const trace = [{ kind: 'compute', key, h1, h2 }];
  if (table.slots[h1] === null) {
    table.slots[h1] = key;
    trace.push({ kind: 'placed', slot: h1, key });
    return { success: true, trace };
  }
  if (table.slots[h2] === null) {
    table.slots[h2] = key;
    trace.push({ kind: 'placed', slot: h2, key });
    return { success: true, trace };
  }
  trace.push({ kind: 'both-full' });
  let cur = key;
  let target = Math.random() < 0.5 ? h1 : h2;
  for (let k = 0; k < maxKicks; k++) {
    const ev = table.slots[target];
    table.slots[target] = cur;
    trace.push({ kind: 'kick', slot: target, placed: cur, kicked: ev });
    cur = ev;
    const [a, b] = tableHashes(cur, table.numSlots);
    const next = a === target ? b : a;
    if (table.slots[next] === null) {
      table.slots[next] = cur;
      trace.push({ kind: 'placed', slot: next, key: cur, afterEvict: true });
      return { success: true, trace };
    }
    target = next;
  }
  trace.push({ kind: 'failed' });
  return { success: false, trace };
}

export function CuckooHashingLab() {
  const NSLOTS = 11;
  const KEYS = useMemo(
    () => ['ash', 'birch', 'cedar', 'dune', 'elm', 'fern', 'grove', 'hazel', 'iris', 'juno'],
    [],
  );
  const [table, setTable] = useState(() => makeHashTable(NSLOTS));
  const [pending, setPending] = useState(KEYS);
  const [queue, setQueue] = useState([]);
  const [view, setView] = useState({ key: null, h1: null, h2: null, focus: null });
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (queue.length === 0) {
      setRunning(false);
      return;
    }
    setRunning(true);
    const id = setTimeout(() => {
      const [step, ...rest] = queue;
      apply(step);
      setQueue(rest);
    }, 700);
    return () => clearTimeout(id);
  }, [queue]);

  function apply(step) {
    if (step.kind === 'header') {
      setLog((L) => [...L, { tone: 'h', text: step.text }]);
      setView({ key: step.key, h1: null, h2: null, focus: null });
    } else if (step.kind === 'compute') {
      setView((v) => ({ ...v, key: step.key, h1: step.h1, h2: step.h2 }));
      setLog((L) => [...L, { tone: 'c', text: `candidates → slots ${step.h1}, ${step.h2}` }]);
    } else if (step.kind === 'placed') {
      setTable((t) => {
        const slots = t.slots.slice();
        slots[step.slot] = step.key;
        return { ...t, slots };
      });
      setView((v) => ({ ...v, focus: step.slot }));
      setLog((L) => [
        ...L,
        {
          tone: 'p',
          text: step.afterEvict
            ? `chain resolved at slot ${step.slot}`
            : `placed at slot ${step.slot}`,
        },
      ]);
    } else if (step.kind === 'both-full') {
      setLog((L) => [...L, { tone: 'w', text: 'both occupied → eviction' }]);
    } else if (step.kind === 'kick') {
      setTable((t) => {
        const slots = t.slots.slice();
        slots[step.slot] = step.placed;
        return { ...t, slots };
      });
      setView((v) => ({ ...v, focus: step.slot, key: step.kicked }));
      setLog((L) => [
        ...L,
        { tone: 'k', text: `"${step.placed}" → slot ${step.slot}; "${step.kicked}" displaced` },
      ]);
    } else if (step.kind === 'failed') {
      setLog((L) => [...L, { tone: 'f', text: 'kick budget exhausted, refused' }]);
    }
  }

  function next() {
    if (running || pending.length === 0) return;
    const [k, ...rest] = pending;
    const copy = { slots: table.slots.slice(), numSlots: table.numSlots };
    const r = tableInsert(copy, k);
    setQueue([{ kind: 'header', text: `insert("${k}")`, key: k }, ...r.trace]);
    setPending(rest);
  }
  function reset() {
    setTable(makeHashTable(NSLOTS));
    setPending(KEYS);
    setQueue([]);
    setLog([]);
    setView({ key: null, h1: null, h2: null, focus: null });
  }

  return (
    <div>
      {/* Slot strip */}
      <div className="cf-eyebrow" style={{ marginBottom: 14 }}>
        Table: 11 slots, each key has two candidates
      </div>
      <div className="cf-cell-strip" style={{ '--strip-min': '520px', '--strip-min-sm': '460px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${NSLOTS}, 1fr)`,
            gap: 6,
            marginBottom: 28,
          }}
        >
          {table.slots.map((slot, i) => {
            const isCand = view.h1 === i || view.h2 === i;
            const isFocus = view.focus === i;
            return (
              <div
                key={i}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 6 }}
              >
                <div
                  style={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: 9,
                    textAlign: 'center',
                    color: isCand ? 'var(--cuc)' : 'var(--text-mute)',
                    letterSpacing: '0.16em',
                    fontWeight: isCand ? 600 : 400,
                  }}
                >
                  {i.toString().padStart(2, '0')}
                </div>
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '0.85',
                    background:
                      slot === null ? 'transparent' : isFocus ? 'var(--cuc)' : 'var(--bg-2)',
                    color:
                      slot === null ? 'var(--text-faint)' : isFocus ? 'var(--bg)' : 'var(--text)',
                    border: isCand
                      ? '1.5px solid var(--cuc)'
                      : `1px solid ${slot === null ? 'var(--line)' : 'var(--line-2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 11,
                    fontWeight: 500,
                    transition: 'all 0.25s ease',
                    animation: isFocus ? 'cf-arrive 0.45s ease' : 'none',
                    padding: 4,
                    textAlign: 'center',
                    wordBreak: 'break-all',
                    position: 'relative',
                  }}
                >
                  {slot || '·'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls + trace */}
      <div className="cf-cols cf-cols-lab">
        <div>
          <div className="cf-eyebrow" style={{ marginBottom: 10 }}>
            Inserting
          </div>
          {view.key && view.h1 !== null ? (
            <div
              style={{
                padding: '16px 18px',
                border: '1px solid var(--line-strong)',
                background: 'var(--bg)',
              }}
            >
              <div
                style={{
                  fontFamily: 'Fraunces',
                  fontStyle: 'italic',
                  fontSize: 22,
                  color: 'var(--cuc)',
                  fontWeight: 400,
                }}
              >
                "{view.key}"
              </div>
              <div
                className="cf-mono"
                style={{
                  fontSize: 11,
                  color: 'var(--text-mute)',
                  marginTop: 8,
                  letterSpacing: '0.06em',
                }}
              >
                CANDIDATES → <span style={{ color: 'var(--text)' }}>{view.h1}</span>{' '}
                <span style={{ color: 'var(--text-faint)' }}>·</span>{' '}
                <span style={{ color: 'var(--text)' }}>{view.h2}</span>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '16px 18px',
                border: '1px dashed var(--line)',
                background: 'transparent',
                color: 'var(--cf-label-faint)',
                fontFamily: 'IBM Plex Serif',
                fontStyle: 'italic',
                fontSize: 14,
              }}
            >
              press{' '}
              <span className="cf-mono" style={{ fontSize: 11, color: 'var(--text-mute)' }}>
                INSERT NEXT
              </span>{' '}
              to begin
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            <button
              className="cf-btn"
              data-v="primary"
              onClick={next}
              disabled={running || pending.length === 0}
            >
              <ChevronRight size={12} /> insert next
            </button>
            <button className="cf-btn" onClick={reset} disabled={running}>
              <RotateCcw size={12} /> reset
            </button>
          </div>

          <div
            className="cf-mono"
            style={{
              fontSize: 10.5,
              color: 'var(--text-mute)',
              marginTop: 18,
              letterSpacing: '0.16em',
            }}
          >
            <span style={{ color: 'var(--text)' }}>{KEYS.length - pending.length}</span> PLACED
            &nbsp;·&nbsp; <span style={{ color: 'var(--text)' }}>{pending.length}</span> REMAINING
          </div>
        </div>

        <div>
          <div className="cf-eyebrow" style={{ marginBottom: 10 }}>
            Trace
          </div>
          <div
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--line)',
              padding: '14px 18px',
              height: 200,
              overflowY: 'auto',
              fontFamily: 'JetBrains Mono',
              fontSize: 12,
              lineHeight: 1.7,
            }}
          >
            {log.length === 0 && (
              <div style={{ color: 'var(--cf-label-faint)', fontStyle: 'italic' }}>
                (nothing yet)
              </div>
            )}
            {log.map((entry, i) => (
              <div
                key={i}
                style={{
                  color:
                    entry.tone === 'h'
                      ? 'var(--cuc)'
                      : entry.tone === 'k'
                        ? 'var(--cuc-deep)'
                        : entry.tone === 'p'
                          ? 'var(--ok)'
                          : entry.tone === 'w'
                            ? 'var(--gold)'
                            : entry.tone === 'f'
                              ? 'var(--cuc)'
                              : 'var(--text-2)',
                  fontWeight: entry.tone === 'h' ? 600 : 400,
                }}
              >
                {entry.tone === 'h' ? '▸ ' : '  '}
                {entry.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
