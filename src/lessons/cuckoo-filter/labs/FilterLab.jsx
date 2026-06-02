import { useEffect, useState } from 'react';
import { ArrowRight, Plus, RotateCcw } from 'lucide-react';
import {
  altIndex,
  fingerprintOf,
  filterLoad,
  fpHex,
  indexOf,
  insertItem,
  makeFilter,
} from '../engine/index.js';
import { Stat } from '../components/Stat.jsx';

const PRESETS = [
  'amber',
  'birch',
  'cedar',
  'dune',
  'ember',
  'fern',
  'grove',
  'hazel',
  'iris',
  'juno',
  'kelp',
  'larch',
  'moss',
  'nova',
  'orchid',
  'plume',
  'quill',
  'rook',
  'sable',
  'thorn',
  'vine',
  'willow',
  'yarrow',
  'zest',
];

export function FilterLab() {
  const NB = 16;
  const SL = 4;
  const FP_BITS = 8;

  const [filter, setFilter] = useState(() =>
    makeFilter({ numBuckets: NB, slotsPerBucket: SL, fpBits: FP_BITS, maxKicks: 90 }),
  );
  const [mode, setMode] = useState('insert');
  const [text, setText] = useState('');
  const [queue, setQueue] = useState([]);
  const [view, setView] = useState({
    i1: null,
    i2: null,
    fp: null,
    focusB: null,
    focusS: null,
    matchB: null,
    matchS: null,
  });
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [presetIdx, setPresetIdx] = useState(0);

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
    }, 600);
    return () => clearTimeout(id);
  }, [queue]);

  function apply(step) {
    if (step.kind === 'header') {
      setLog((L) => [...L, { tone: 'h', text: step.text }]);
      setView({
        i1: null,
        i2: null,
        fp: null,
        focusB: null,
        focusS: null,
        matchB: null,
        matchS: null,
      });
    } else if (step.kind === 'compute') {
      setView((v) => ({ ...v, i1: step.i1, i2: step.i2, fp: step.fp, matchB: null, matchS: null }));
      setLog((L) => [
        ...L,
        { tone: 'c', text: `fp = ${fpHex(step.fp, FP_BITS)}, buckets ${step.i1}, ${step.i2}` },
      ]);
    } else if (step.kind === 'placed') {
      setFilter((f) => {
        const buckets = f.buckets.map((b) => b.slice());
        buckets[step.bucket][step.slot] = step.fp;
        return { ...f, buckets, items: f.items + 1 };
      });
      setView((v) => ({ ...v, focusB: step.bucket, focusS: step.slot }));
      setLog((L) => [
        ...L,
        {
          tone: 'p',
          text: step.afterEvict
            ? `chain → bucket ${step.bucket}·${step.slot}`
            : `placed → bucket ${step.bucket}·${step.slot}`,
        },
      ]);
    } else if (step.kind === 'both-full') {
      setLog((L) => [...L, { tone: 'w', text: 'both buckets full → eviction begins' }]);
    } else if (step.kind === 'evict') {
      setFilter((f) => {
        const buckets = f.buckets.map((b) => b.slice());
        buckets[step.bucket][step.slot] = step.placed;
        return { ...f, buckets };
      });
      setView((v) => ({ ...v, focusB: step.bucket, focusS: step.slot, fp: step.kicked }));
      setLog((L) => [
        ...L,
        {
          tone: 'k',
          text: `${fpHex(step.kicked, FP_BITS)} displaced from ${step.bucket}·${step.slot}`,
        },
      ]);
    } else if (step.kind === 'failed') {
      setLog((L) => [...L, { tone: 'f', text: 'kick budget exhausted → REFUSED' }]);
    } else if (step.kind === 'lookup-match') {
      setView((v) => ({ ...v, matchB: step.bucket, matchS: step.slot }));
      setLog((L) => [
        ...L,
        { tone: 'p', text: `match at ${step.bucket}·${step.slot} → probably yes` },
      ]);
    } else if (step.kind === 'lookup-miss') {
      setLog((L) => [...L, { tone: 'c', text: 'no match → definitely no' }]);
    } else if (step.kind === 'delete-found') {
      setFilter((f) => {
        const buckets = f.buckets.map((b) => b.slice());
        buckets[step.bucket][step.slot] = 0;
        return { ...f, buckets, items: Math.max(0, f.items - 1) };
      });
      setView((v) => ({ ...v, focusB: step.bucket, focusS: step.slot }));
      setLog((L) => [...L, { tone: 'p', text: `erased ${step.bucket}·${step.slot}` }]);
    } else if (step.kind === 'delete-miss') {
      setLog((L) => [...L, { tone: 'c', text: 'fingerprint not present → nothing erased' }]);
    }
  }

  function doInsert(item) {
    if (!item || running) return;
    const copy = { ...filter, buckets: filter.buckets.map((b) => b.slice()) };
    const r = insertItem(copy, item);
    setQueue([{ kind: 'header', text: `▸ insert("${item}")` }, ...r.trace]);
  }
  function doLookup(item) {
    if (!item || running) return;
    const fp = fingerprintOf(item, FP_BITS);
    const i1 = indexOf(item, NB);
    const i2 = altIndex(i1, fp, NB);
    const steps = [
      { kind: 'header', text: `▸ lookup("${item}")` },
      { kind: 'compute', fp, i1, i2 },
    ];
    const s1 = filter.buckets[i1].indexOf(fp);
    const s2 = filter.buckets[i2].indexOf(fp);
    if (s1 !== -1) steps.push({ kind: 'lookup-match', bucket: i1, slot: s1 });
    else if (s2 !== -1) steps.push({ kind: 'lookup-match', bucket: i2, slot: s2 });
    else steps.push({ kind: 'lookup-miss' });
    setQueue(steps);
  }
  function doDelete(item) {
    if (!item || running) return;
    const fp = fingerprintOf(item, FP_BITS);
    const i1 = indexOf(item, NB);
    const i2 = altIndex(i1, fp, NB);
    const steps = [
      { kind: 'header', text: `▸ delete("${item}")` },
      { kind: 'compute', fp, i1, i2 },
    ];
    const s1 = filter.buckets[i1].indexOf(fp);
    if (s1 !== -1) steps.push({ kind: 'delete-found', bucket: i1, slot: s1 });
    else {
      const s2 = filter.buckets[i2].indexOf(fp);
      if (s2 !== -1) steps.push({ kind: 'delete-found', bucket: i2, slot: s2 });
      else steps.push({ kind: 'delete-miss' });
    }
    setQueue(steps);
  }
  function go() {
    const item = text.trim().toLowerCase();
    if (!item) return;
    if (mode === 'insert') doInsert(item);
    else if (mode === 'lookup') doLookup(item);
    else doDelete(item);
    setText('');
  }
  function fillSeveral() {
    if (running) return;
    let cur = { ...filter, buckets: filter.buckets.map((b) => b.slice()) };
    const items = PRESETS.slice(presetIdx, presetIdx + 8);
    const steps = [];
    for (const it of items) {
      steps.push({ kind: 'header', text: `▸ insert("${it}")` });
      const r = insertItem(cur, it);
      steps.push(...r.trace);
    }
    setPresetIdx((p) => p + items.length);
    setQueue(steps);
  }
  function reset() {
    setFilter(makeFilter({ numBuckets: NB, slotsPerBucket: SL, fpBits: FP_BITS, maxKicks: 90 }));
    setQueue([]);
    setLog([]);
    setPresetIdx(0);
    setView({
      i1: null,
      i2: null,
      fp: null,
      focusB: null,
      focusS: null,
      matchB: null,
      matchS: null,
    });
  }

  const load = filterLoad(filter);

  return (
    <div>
      {/* Stats strip */}
      <div className="cf-filter-stats">
        <div className="cf-filter-stats-inner">
          <Stat label="items" value={filter.items} />
          <Stat label="capacity" value={NB * SL} />
          <Stat label="load" value={`${(load * 100).toFixed(0)}%`} />
          <Stat label="fp bits" value={FP_BITS} />
        </div>
        <button className="cf-btn" onClick={reset} disabled={running}>
          <RotateCcw size={12} /> reset
        </button>
      </div>

      {/* Filter grid */}
      <div className="cf-eyebrow" style={{ marginBottom: 12 }}>
        {NB} buckets &nbsp;·&nbsp; {SL} slots each &nbsp;·&nbsp; cell = 8-bit fingerprint
      </div>
      <div className="cf-cell-strip">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${NB}, 1fr)`,
            gap: 5,
            marginBottom: 28,
          }}
        >
          {filter.buckets.map((bucket, bi) => {
            const isCand = view.i1 === bi || view.i2 === bi;
            const isFocusB = view.focusB === bi;
            return (
              <div key={bi} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div
                  style={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: 9,
                    textAlign: 'center',
                    color: isCand ? 'var(--cuc)' : 'var(--text-mute)',
                    fontWeight: isCand ? 700 : 400,
                    letterSpacing: '0.12em',
                  }}
                >
                  {bi.toString(16).toUpperCase()}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    padding: 2,
                    border: isCand ? '1.5px solid var(--cuc)' : '1px solid var(--line)',
                    background: isCand ? 'var(--cuc-wash)' : 'transparent',
                    transition: 'all 0.25s ease',
                  }}
                >
                  {bucket.map((fp, si) => {
                    const isMatch = view.matchB === bi && view.matchS === si;
                    const isFocus = isFocusB && view.focusS === si;
                    return (
                      <div
                        key={si}
                        style={{
                          aspectRatio: '1.1',
                          background:
                            fp === 0
                              ? 'var(--bg)'
                              : isMatch
                                ? 'var(--gold)'
                                : isFocus
                                  ? 'var(--cuc)'
                                  : 'var(--bg-3)',
                          color:
                            fp === 0
                              ? 'var(--text-faint)'
                              : isMatch || isFocus
                                ? 'var(--bg)'
                                : 'var(--text)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'JetBrains Mono',
                          fontSize: 9.5,
                          fontWeight: fp === 0 ? 400 : 600,
                          transition: 'all 0.25s ease',
                          animation: isFocus || isMatch ? 'cf-arrive 0.45s ease' : 'none',
                          border: '1px solid transparent',
                        }}
                      >
                        {fp === 0 ? '·' : fpHex(fp, FP_BITS)}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls + trace */}
      <div className="cf-cols cf-cols-lab-tight">
        <div>
          <div className="cf-eyebrow" style={{ marginBottom: 10 }}>
            Operation
          </div>
          <div className="cf-seg" style={{ marginBottom: 22 }}>
            {['insert', 'lookup', 'delete'].map((k) => (
              <button
                key={k}
                className="cf-seg-item"
                data-active={mode === k}
                onClick={() => setMode(k)}
              >
                {k}
              </button>
            ))}
          </div>

          <div className="cf-eyebrow" style={{ marginBottom: 10 }}>
            Item
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <input
              className="cf-input"
              aria-label="Item to insert, look up, or delete"
              placeholder="enter any word"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') go();
              }}
              disabled={running}
            />
            <button
              className="cf-btn"
              data-v="primary"
              onClick={go}
              disabled={running || !text.trim()}
              aria-label="Run operation on item"
            >
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="cf-eyebrow" style={{ marginBottom: 8 }}>
            Or pick a word
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 18 }}>
            {PRESETS.slice(0, 12).map((p) => (
              <button key={p} className="cf-chip" onClick={() => setText(p)}>
                {p}
              </button>
            ))}
          </div>

          <button
            className="cf-btn"
            data-v="cuc"
            onClick={fillSeveral}
            disabled={running || presetIdx >= PRESETS.length}
          >
            <Plus size={12} /> insert eight at once
          </button>
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
              height: 300,
              overflowY: 'auto',
              fontFamily: 'JetBrains Mono',
              fontSize: 12,
              lineHeight: 1.7,
            }}
          >
            {log.length === 0 && (
              <div style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>(nothing yet)</div>
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
                  marginTop: entry.tone === 'h' ? 4 : 0,
                }}
              >
                {entry.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
