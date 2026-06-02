import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Pause, Play, Plus, RotateCcw } from 'lucide-react';
import { filterLoad, insertItem, makeFilter } from '../engine/index.js';

export function CliffLab() {
  const NB = 32,
    SL = 4;
  const CAP = NB * SL;
  const [filter, setFilter] = useState(() =>
    makeFilter({ numBuckets: NB, slotsPerBucket: SL, fpBits: 8, maxKicks: 100 }),
  );
  const [history, setHistory] = useState([]);
  const [auto, setAuto] = useState(false);
  const [count, setCount] = useState(0);
  const [verdict, setVerdict] = useState(null);

  const wordFor = (n) => `entity-${n.toString(36)}-${(n * 7919).toString(36).slice(0, 4)}`;

  const insertOne = useCallback(() => {
    if (verdict === 'failed') return;
    const copy = { ...filter, buckets: filter.buckets.map((b) => b.slice()) };
    const r = insertItem(copy, wordFor(count));
    setFilter(copy);
    setHistory((h) => [...h, { kicks: r.kicks || 0, success: r.success }]);
    setCount((c) => c + 1);
    if (!r.success) {
      setVerdict('failed');
      setAuto(false);
    }
  }, [filter, count, verdict]);

  useEffect(() => {
    if (!auto || verdict === 'failed') return;
    const id = setTimeout(insertOne, 95);
    return () => clearTimeout(id);
  }, [auto, insertOne, verdict]);

  function reset() {
    setFilter(makeFilter({ numBuckets: NB, slotsPerBucket: SL, fpBits: 8, maxKicks: 100 }));
    setHistory([]);
    setCount(0);
    setVerdict(null);
    setAuto(false);
  }

  const load = filterLoad(filter);

  const W = 760,
    H = 160,
    padL = 44,
    padR = 18,
    padT = 14,
    padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxY = Math.max(20, ...history.map((h) => h.kicks), 10);
  const xS = (i) => padL + (i / Math.max(120, history.length || 1)) * plotW;
  const yS = (k) => padT + (1 - k / maxY) * plotH;

  return (
    <div>
      {/* Big load meter */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 14,
          }}
        >
          <div className="cf-eyebrow">Load fraction</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <span
              style={{
                fontFamily: 'Fraunces',
                fontSize: 36,
                fontWeight: 400,
                lineHeight: 1,
                color:
                  verdict === 'failed'
                    ? 'var(--cuc)'
                    : load > 0.9
                      ? 'var(--cuc)'
                      : load > 0.7
                        ? 'var(--gold)'
                        : 'var(--text)',
                letterSpacing: '-0.02em',
              }}
            >
              {(load * 100).toFixed(1)}%
            </span>
            <span
              className="cf-mono"
              style={{ fontSize: 12, color: 'var(--text-mute)', letterSpacing: '0.06em' }}
            >
              {filter.items} / {CAP}
            </span>
          </div>
        </div>
        <div
          style={{
            position: 'relative',
            height: 38,
            background: 'var(--bg)',
            border: '1px solid var(--line-strong)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: `${load * 100}%`,
              background:
                verdict === 'failed'
                  ? 'var(--cuc)'
                  : 'linear-gradient(90deg, var(--text) 0%, var(--gold) 75%, var(--cuc) 100%)',
              transition: 'width 0.15s ease',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: -4,
              bottom: -4,
              left: '95%',
              width: 2,
              background: 'var(--cuc)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 4,
              top: -20,
              fontFamily: 'JetBrains Mono',
              fontSize: 9.5,
              color: 'var(--cuc)',
              letterSpacing: '0.18em',
              fontWeight: 600,
            }}
          >
            95% ▼
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          marginBottom: 28,
          flexWrap: 'wrap',
        }}
      >
        <button
          className="cf-btn"
          data-v="primary"
          onClick={insertOne}
          disabled={verdict === 'failed' || auto}
        >
          <Plus size={12} /> one
        </button>
        <button
          className="cf-btn"
          data-v={auto ? 'cuc' : null}
          onClick={() => setAuto((a) => !a)}
          disabled={verdict === 'failed'}
        >
          {auto ? <Pause size={12} /> : <Play size={12} />} {auto ? 'pause' : 'auto-fill'}
        </button>
        <button className="cf-btn" onClick={reset}>
          <RotateCcw size={12} /> reset
        </button>
        <div style={{ flex: 1 }} />
        <div
          className="cf-mono"
          style={{ fontSize: 11, color: 'var(--text-mute)', letterSpacing: '0.14em' }}
        >
          INSERTS <span style={{ color: 'var(--text)', fontWeight: 600 }}>{count}</span>
        </div>
        {history.length > 0 && (
          <div
            className="cf-mono"
            style={{ fontSize: 11, color: 'var(--text-mute)', letterSpacing: '0.14em' }}
          >
            PEAK CHAIN{' '}
            <span style={{ color: 'var(--cuc)', fontWeight: 600 }}>
              {Math.max(0, ...history.map((h) => h.kicks))}
            </span>
          </div>
        )}
      </div>

      <div className="cf-eyebrow" style={{ marginBottom: 10 }}>
        Eviction-chain length, per insertion
      </div>
      <div
        className="cf-cell-strip"
        style={{ '--strip-min': '600px', '--strip-min-sm': '520px', marginBottom: 24 }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{
            width: '100%',
            height: 'auto',
            background: 'var(--bg)',
            border: '1px solid var(--line)',
          }}
        >
          {[0, Math.floor(maxY / 2), maxY].map((t) => (
            <g key={t}>
              <line
                x1={padL}
                y1={yS(t)}
                x2={W - padR}
                y2={yS(t)}
                stroke="var(--line)"
                strokeWidth={0.5}
              />
              <text
                x={padL - 6}
                y={yS(t) + 3}
                textAnchor="end"
                fontFamily="JetBrains Mono"
                fontSize={9.5}
                fill="var(--text-mute)"
                letterSpacing="0.06em"
              >
                {t}
              </text>
            </g>
          ))}
          <line
            x1={padL}
            y1={padT}
            x2={padL}
            y2={H - padB}
            stroke="var(--line-strong)"
            strokeWidth={1}
          />
          <line
            x1={padL}
            y1={H - padB}
            x2={W - padR}
            y2={H - padB}
            stroke="var(--line-strong)"
            strokeWidth={1}
          />
          {history.map((h, i) => {
            const x = xS(i);
            const barW = Math.max(2, plotW / Math.max(120, history.length) - 1);
            const y = yS(h.kicks);
            const barH = H - padB - y;
            return (
              <rect
                key={i}
                x={x - barW / 2}
                y={y}
                width={barW}
                height={barH}
                fill={!h.success ? 'var(--cuc)' : h.kicks > 12 ? 'var(--gold)' : 'var(--text-2)'}
              />
            );
          })}
          <text
            x={padL + 8}
            y={padT + 12}
            fontFamily="JetBrains Mono"
            fontSize={10}
            fill="var(--text-mute)"
            letterSpacing="0.1em"
          >
            kicks per insertion
          </text>
        </svg>
      </div>

      {verdict === 'failed' ? (
        <div
          style={{
            background: 'var(--cuc)',
            color: 'var(--bg)',
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 18,
            marginTop: 8,
          }}
        >
          <AlertTriangle size={26} style={{ marginTop: 4, flexShrink: 0 }} />
          <div>
            <div
              className="cf-mono"
              style={{ fontSize: 10.5, letterSpacing: '0.3em', marginBottom: 10, fontWeight: 600 }}
            >
              INSERTION REFUSED
            </div>
            <div
              style={{
                fontFamily: 'Fraunces',
                fontStyle: 'italic',
                fontSize: 22,
                lineHeight: 1.32,
                fontWeight: 400,
              }}
            >
              After {count} items at {(load * 100).toFixed(1)}% load, the eviction chain exceeded
              its budget. In practice, this is the cue to rebuild the filter at greater capacity.
            </div>
          </div>
        </div>
      ) : history.length > 8 ? (
        <div
          style={{
            fontFamily: 'IBM Plex Serif',
            fontStyle: 'italic',
            fontSize: 14.5,
            color: 'var(--text-mute)',
            lineHeight: 1.55,
            maxWidth: 580,
          }}
        >
          Notice the chain stays tiny for most insertions — then begins spiking past ninety percent.
          There is no gentle degradation.
        </div>
      ) : null}
    </div>
  );
}
