import { useRef, useState } from 'react';
import {
  Plus,
  Eye,
  RotateCcw,
  Sparkles,
  Check,
  AlertTriangle,
  Target,
  ArrowRight,
} from 'lucide-react';
import { bloomPositions, falsePositiveRate } from '../engine/index.js';

const SANDBOX_WORDS = [
  'apple',
  'bread',
  'chair',
  'dragon',
  'engine',
  'forest',
  'garden',
  'horizon',
  'island',
  'jungle',
  'kettle',
  'lantern',
  'mountain',
  'needle',
  'ocean',
  'pencil',
  'quartz',
  'river',
  'sunset',
  'tiger',
  'umbrella',
  'violin',
  'window',
  'xylophone',
  'yacht',
  'zebra',
  'anchor',
  'bridge',
  'cloud',
  'desert',
  'ember',
  'feather',
  'glacier',
  'harbor',
  'ivory',
  'jasper',
  'kite',
  'ladder',
  'mirror',
  'nest',
  'orchard',
  'prism',
  'quill',
  'ribbon',
  'silver',
  'thunder',
  'urchin',
  'valley',
  'willow',
  'yarrow',
  'amber',
  'blossom',
  'candle',
  'dune',
  'echo',
  'fern',
  'grove',
  'hollow',
  'indigo',
  'journey',
  'kernel',
  'lichen',
  'meadow',
  'nimbus',
  'onyx',
  'petal',
  'quiet',
  'ravine',
  'spruce',
  'tundra',
  'tide',
  'clover',
  'frost',
  'heron',
  'linen',
  'moss',
  'nightfall',
  'opal',
  'plume',
  'reed',
  'sapphire',
  'thistle',
  'wisp',
  'almond',
  'birch',
  'cedar',
  'dawn',
  'eclipse',
  'fawn',
  'gull',
  'hazel',
  'iris',
  'jade',
  'larch',
  'marsh',
  'nectar',
  'olive',
  'poppy',
  'quince',
  'rust',
];

export function Sandbox() {
  const M = 96;
  const COLS = 12;
  const [k, setK] = useState(3);
  const [bits, setBits] = useState(() => new Array(M).fill(false));
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState('insert');
  const [insertInput, setInsertInput] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [anim, setAnim] = useState({ type: null, positions: [], step: -1, failedAt: -1 });
  const [lastResult, setLastResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const insertRef = useRef(null);
  const queryRef = useRef(null);

  const setBitCount = bits.filter((b) => b).length;
  const n = items.length;
  const loadFactor = setBitCount / M;
  const theoreticalFPR = falsePositiveRate(M, n, k);

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function doInsert(rawWord) {
    const word = (rawWord || '').trim().toLowerCase();
    if (!word || busy) return;
    if (items.includes(word)) {
      setLastResult({ kind: 'duplicate', word });
      setTimeout(() => setLastResult(null), 2400);
      return;
    }
    setBusy(true);
    setLastResult(null);
    const positions = bloomPositions(word, k, M);
    for (let i = 0; i < positions.length; i++) {
      setAnim({ type: 'inserting', positions, step: i, failedAt: -1 });
      await sleep(280);
    }
    setBits((prev) => {
      const next = [...prev];
      for (const p of positions) next[p] = true;
      return next;
    });
    setItems((prev) => [...prev, word]);
    setAnim({ type: 'inserted', positions, step: positions.length, failedAt: -1 });
    setLastResult({ kind: 'inserted', word, positions });
    await sleep(800);
    setAnim({ type: null, positions: [], step: -1, failedAt: -1 });
    setInsertInput('');
    setBusy(false);
  }

  async function doQuery(rawWord) {
    const word = (rawWord || '').trim().toLowerCase();
    if (!word || busy) return;
    setBusy(true);
    setLastResult(null);
    const positions = bloomPositions(word, k, M);
    setAnim({ type: 'querying', positions, step: 0, failedAt: -1 });
    await sleep(700);
    let failedAt = -1;
    for (let i = 0; i < positions.length; i++) {
      if (!bits[positions[i]]) {
        failedAt = i;
        break;
      }
    }
    const allSet = failedAt === -1;
    const wasInserted = items.includes(word);
    let verdict;
    if (!allSet) verdict = 'no';
    else if (wasInserted) verdict = 'tp';
    else verdict = 'fp';
    setAnim({ type: 'queried', positions, step: positions.length, failedAt });
    setLastResult({ kind: 'queried', word, positions, verdict, wasInserted, failedAt });
    await sleep(2800);
    setAnim({ type: null, positions: [], step: -1, failedAt: -1 });
    setBusy(false);
  }

  function reset() {
    setBits(new Array(M).fill(false));
    setItems([]);
    setLastResult(null);
    setAnim({ type: null, positions: [], step: -1, failedAt: -1 });
    setInsertInput('');
    setQueryInput('');
  }

  async function prefill() {
    if (busy) return;
    setBusy(true);
    const seed = [
      'raven',
      'willow',
      'copper',
      'meadow',
      'frost',
      'glacier',
      'ember',
      'tide',
      'spruce',
      'jasper',
      'lichen',
      'tundra',
    ];
    let currentBits = [...bits];
    let currentItems = [...items];
    for (const w of seed) {
      if (currentItems.includes(w)) continue;
      const positions = bloomPositions(w, k, M);
      for (const p of positions) currentBits[p] = true;
      currentItems.push(w);
      setBits([...currentBits]);
      setItems([...currentItems]);
      await sleep(70);
    }
    setBusy(false);
  }

  async function findFalsePositive() {
    if (busy || n === 0) return;
    setBusy(true);
    const candidates = SANDBOX_WORDS.filter((w) => !items.includes(w));
    let found = null;
    for (const w of candidates) {
      const positions = bloomPositions(w, k, M);
      if (positions.every((p) => bits[p])) {
        found = w;
        break;
      }
    }
    setBusy(false);
    if (found) {
      setQueryInput(found);
      setMode('query');
      await sleep(180);
      doQuery(found);
    } else {
      setLastResult({ kind: 'no-fp' });
      setTimeout(() => setLastResult(null), 3500);
    }
  }

  function bitClass(idx) {
    let cls = 'bf-bit';
    if (bits[idx]) cls += ' set';
    if (anim.type === 'inserting' && anim.positions.includes(idx)) {
      const posIdx = anim.positions.indexOf(idx);
      if (posIdx <= anim.step) cls += ' set-just';
      else cls += ' highlight';
    }
    if (anim.type === 'querying' && anim.positions.includes(idx)) {
      cls += ' checking';
    }
    if (anim.type === 'queried' && anim.positions.includes(idx)) {
      const posIdx = anim.positions.indexOf(idx);
      if (anim.failedAt !== -1 && posIdx === anim.failedAt) {
        cls += ' highlight-rose';
      } else if (bits[idx]) {
        cls += ' highlight-amber';
      } else {
        cls += ' highlight-rose';
      }
    }
    return cls;
  }

  const renderVerdict = () => {
    if (!lastResult)
      return (
        <div className="bf-mono bf-mark-muted" style={{ fontSize: '0.82rem', opacity: 0.5 }}>
          &ndash;
        </div>
      );
    if (lastResult.kind === 'duplicate') {
      return (
        <div className="bf-ui" style={{ color: 'var(--bf-ink-muted)', fontSize: '0.88rem' }}>
          <span className="bf-mono bf-mark-amber">"{lastResult.word}"</span> already inserted
        </div>
      );
    }
    if (lastResult.kind === 'inserted') {
      return (
        <div className="bf-ui" style={{ fontSize: '0.88rem', color: 'var(--bf-emerald-ink)' }}>
          inserted <span className="bf-mono bf-mark-amber">"{lastResult.word}"</span> at positions{' '}
          <span className="bf-mono">[{lastResult.positions.join(', ')}]</span>
        </div>
      );
    }
    if (lastResult.kind === 'no-fp') {
      return (
        <div className="bf-ui bf-mark-muted" style={{ fontSize: '0.85rem' }}>
          Tried 100 words. None of them collided. Insert more items first. False positives get
          common as the filter fills up.
        </div>
      );
    }
    if (lastResult.kind === 'queried') {
      const { word, positions, verdict, failedAt } = lastResult;
      return (
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <span className="bf-mono bf-mark-amber" style={{ fontSize: '0.95rem' }}>
              "{word}"
            </span>
            <ArrowRight style={{ width: 14, height: 14, color: 'var(--bf-ink-muted)' }} />
            {verdict === 'no' && (
              <span className="bf-verdict bf-verdict-no">
                <Check style={{ width: 12, height: 12 }} /> Definitely not
              </span>
            )}
            {verdict === 'tp' && (
              <span className="bf-verdict bf-verdict-tp">
                <Check style={{ width: 12, height: 12 }} /> Probably yes · True positive
              </span>
            )}
            {verdict === 'fp' && (
              <span className="bf-verdict bf-verdict-fp">
                <AlertTriangle style={{ width: 12, height: 12 }} /> Probably yes · False positive
              </span>
            )}
          </div>
          <div className="bf-ui bf-mark-muted" style={{ fontSize: '0.8rem', lineHeight: 1.65 }}>
            {verdict === 'no' && (
              <>
                checked <span className="bf-mono">[{positions.join(', ')}]</span>. Position{' '}
                <span className="bf-mono bf-mark-rose">{positions[failedAt]}</span> was zero, so the
                answer is final. No work needed at the source of truth.
              </>
            )}
            {verdict === 'tp' && (
              <>
                all k=<span className="bf-mono">{k}</span> bits set. The filter is right this time.
                The word was in fact inserted.
              </>
            )}
            {verdict === 'fp' && (
              <>
                all k=<span className="bf-mono">{k}</span> bits at{' '}
                <span className="bf-mono">[{positions.join(', ')}]</span> happened to be set by
                other items. The filter would forward this query to the real source, which would
                return "not found." Wasted work, but never a wrong answer.
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bf-panel" style={{ padding: '2rem 1.75rem' }}>
      <div className="flex items-baseline justify-between mb-1 flex-wrap gap-2">
        <div>
          <div
            className="bf-ui"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.25em',
              color: 'var(--bf-violet-eyebrow)',
              textTransform: 'uppercase',
            }}
          >
            Lab 01
          </div>
          <div
            className="bf-display"
            style={{ fontSize: '1.85rem', color: 'var(--bf-ink-head)', marginTop: '0.3rem' }}
          >
            The Sandbox
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="bf-spec-pill">m = {M}</span>
          <span className="bf-spec-pill">k = {k}</span>
          <span className="bf-spec-pill">n = {n}</span>
          <span className="bf-spec-pill">load = {(loadFactor * 100).toFixed(1)}%</span>
          <span
            className="bf-spec-pill"
            style={{
              color: n > 0 ? 'var(--bf-violet-ink)' : 'var(--bf-ink-muted)',
              borderColor: n > 0 ? 'var(--bf-violet-line-3)' : undefined,
            }}
          >
            FPR ≈ {n === 0 ? '–' : (theoreticalFPR * 100).toFixed(2) + '%'}
          </span>
        </div>
      </div>
      <div className="bf-body-italic bf-mark-muted mt-2 mb-6" style={{ fontSize: '0.92rem' }}>
        A real Bloom filter. Insert items, watch bits flip. Query items, watch them get checked.
        Every yes is provisional; every no is final.
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: '5px',
          padding: '1.25rem 1rem 1rem',
          background: 'var(--bf-well)',
          borderRadius: '3px',
          marginBottom: '1.25rem',
          position: 'relative',
        }}
      >
        {bits.map((_, i) => (
          <div key={i} className={bitClass(i)} style={{ position: 'relative' }}>
            {anim.type && anim.positions.includes(i) && (
              <div
                style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '0.58rem',
                  color:
                    anim.type === 'queried' &&
                    anim.failedAt !== -1 &&
                    anim.positions.indexOf(i) === anim.failedAt
                      ? 'var(--bf-rose-ink)'
                      : 'var(--bf-teal-ink)',
                  fontFamily: 'JetBrains Mono, monospace',
                  opacity: 0.9,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  fontWeight: 600,
                }}
              >
                h{anim.positions.indexOf(i) + 1}
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="bf-mono bf-mark-muted flex justify-between px-2"
        style={{ fontSize: '0.62rem', marginTop: '-0.5rem', marginBottom: '1.25rem', opacity: 0.5 }}
      >
        <span>0</span>
        <span>{Math.floor(M / 4)}</span>
        <span>{Math.floor(M / 2)}</span>
        <span>{Math.floor((M * 3) / 4)}</span>
        <span>{M - 1}</span>
      </div>

      <div className="flex gap-1 mb-3" style={{ borderBottom: '1px solid var(--bf-line-1)' }}>
        <button
          className="bf-ui"
          style={{
            background: 'none',
            border: 'none',
            color: mode === 'insert' ? 'var(--bf-violet-ink)' : 'var(--bf-ink-muted)',
            borderBottom:
              mode === 'insert' ? '2px solid var(--bf-violet)' : '2px solid transparent',
            padding: '0.6em 1em',
            fontSize: '0.85rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
          onClick={() => setMode('insert')}
        >
          <Plus
            style={{
              width: 14,
              height: 14,
              display: 'inline',
              marginRight: 4,
              verticalAlign: 'middle',
            }}
          />{' '}
          Insert
        </button>
        <button
          className="bf-ui"
          style={{
            background: 'none',
            border: 'none',
            color: mode === 'query' ? 'var(--bf-teal-ink)' : 'var(--bf-ink-muted)',
            borderBottom:
              mode === 'query' ? '2px solid var(--bf-teal-ink)' : '2px solid transparent',
            padding: '0.6em 1em',
            fontSize: '0.85rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
          onClick={() => setMode('query')}
        >
          <Eye
            style={{
              width: 14,
              height: 14,
              display: 'inline',
              marginRight: 4,
              verticalAlign: 'middle',
            }}
          />{' '}
          Query
        </button>
      </div>

      {mode === 'insert' ? (
        <div className="flex gap-2 mb-3 flex-wrap">
          <input
            ref={insertRef}
            className="bf-input flex-1"
            aria-label="Word to insert"
            placeholder="type a word and press enter…"
            value={insertInput}
            onChange={(e) => setInsertInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') doInsert(insertInput);
            }}
            disabled={busy}
            style={{ minWidth: '12rem' }}
          />
          <button
            className="bf-btn primary"
            onClick={() => doInsert(insertInput)}
            disabled={busy || !insertInput.trim()}
          >
            <Plus style={{ width: 14, height: 14 }} /> Insert
          </button>
          <button className="bf-btn ghost" onClick={prefill} disabled={busy}>
            <Sparkles style={{ width: 14, height: 14 }} /> Pre-fill
          </button>
        </div>
      ) : (
        <div className="flex gap-2 mb-3 flex-wrap">
          <input
            ref={queryRef}
            className="bf-input flex-1"
            aria-label="Word to query"
            placeholder="type a word and press enter…"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') doQuery(queryInput);
            }}
            disabled={busy}
            style={{ minWidth: '12rem' }}
          />
          <button
            className="bf-btn accent"
            onClick={() => doQuery(queryInput)}
            disabled={busy || !queryInput.trim()}
          >
            <Eye style={{ width: 14, height: 14 }} /> Query
          </button>
          <button
            className="bf-btn ghost"
            onClick={findFalsePositive}
            disabled={busy || n === 0}
            title="Search the dictionary for a query that triggers a false positive"
          >
            <Target style={{ width: 14, height: 14 }} /> Find a false positive
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-5 flex-wrap items-center">
        <button className="bf-btn ghost" onClick={reset} disabled={busy}>
          <RotateCcw style={{ width: 13, height: 13 }} /> Reset
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <span className="bf-ui bf-mark-muted" style={{ fontSize: '0.78rem' }}>
            k =
          </span>
          {[1, 2, 3, 4, 5, 6, 7].map((kk) => {
            // k is a build-time parameter: changing it after items are inserted
            // would hash lookups with a different number of bits than insertion
            // used, manufacturing a *false negative* — the one failure a Bloom
            // filter must never produce. Lock k once the filter is non-empty.
            const locked = busy || n > 0;
            return (
              <button
                key={kk}
                onClick={() => setK(kk)}
                disabled={locked}
                aria-pressed={k === kk}
                aria-label={`Set k to ${kk} hash functions`}
                title={
                  n > 0
                    ? 'Reset to change k. k is fixed once items are inserted.'
                    : `${kk} hash functions`
                }
                className="bf-mono"
                style={{
                  width: 26,
                  height: 26,
                  background: k === kk ? 'var(--bf-violet-fill-2)' : 'transparent',
                  border: `1px solid ${k === kk ? 'var(--bf-violet-line-5)' : 'var(--bf-line-strong)'}`,
                  color: k === kk ? 'var(--bf-violet-ink)' : 'var(--bf-ink-muted)',
                  borderRadius: '2px',
                  cursor: locked ? 'not-allowed' : 'pointer',
                  // The locked alternatives stay dimmed to read as inactive, but
                  // the digit is information the reader parses — keep enough
                  // opacity that the (deepened) ink clears AA on light paper.
                  opacity: locked && k !== kk ? 0.75 : 1,
                  fontSize: '0.78rem',
                }}
              >
                {kk}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="bf-panel"
        style={{ padding: '0.85rem 1rem', minHeight: '3rem', background: 'var(--bf-well-soft)' }}
      >
        {renderVerdict()}
      </div>

      {n > 0 && (
        <div className="mt-4">
          <div
            className="bf-ui bf-mark-muted mb-2"
            style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}
          >
            Inserted ({n})
          </div>
          <div className="flex gap-2 flex-wrap">
            {items.map((item) => (
              <span
                key={item}
                className="bf-mono"
                style={{
                  fontSize: '0.78rem',
                  padding: '0.2em 0.55em',
                  background: 'var(--bf-violet-fill)',
                  color: 'var(--bf-violet-ink)',
                  borderRadius: '2px',
                  border: '1px solid var(--bf-violet-line-2)',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
