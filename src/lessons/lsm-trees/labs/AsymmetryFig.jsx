import { useEffect, useMemo, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { seqPos, randPos, cellRC } from '../engine/index.js';
import Figure from '../components/Figure.jsx';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useInViewport } from '../../../shared/useInViewport.js';

const COLS = 20,
  ROWS = 6,
  NCELLS = COLS * ROWS;
// Representative static frame under reduced motion: the head is partway through
// its first sweep, so the trail and the diverging counters are already legible.
const STATIC_T = 14;

// §II — the disk has a grain. Two toy heads on the same platter: one sweeps
// sequentially (LSM-style append), one leaps randomly (B-tree-style in-place).
// The throughput counters diverge because every leap is a seek.
export default function AsymmetryFig() {
  const reduced = usePrefersReducedMotion();
  const [vpRef, inView] = useInViewport();
  const [mode, setMode] = useState('append');
  const [run, setRun] = useState(true);
  const [t, setT] = useState(reduced ? STATIC_T : 0);
  useEffect(() => {
    // Autoplay-on-mount sweep — suppress under reduced motion and hold a
    // representative static frame (head partway, counters already diverged).
    if (reduced) {
      setT(STATIC_T);
      return;
    }
    // Pause the sweep while off-screen (the last frame stays put); resume on
    // return. The play/pause `run` toggle still gates it as before.
    if (!run || !inView) return;
    const id = setInterval(() => setT((x) => x + 1), 150);
    return () => clearInterval(id);
  }, [run, reduced, inView]);
  const switchMode = (m) => {
    setMode(m);
    setT(reduced ? STATIC_T : 0);
  };

  const head = mode === 'append' ? seqPos(t, NCELLS) : randPos(t, NCELLS);
  // recent writes (for trail). append: all cells up to head in this pass. random: last 16 positions.
  const recent = useMemo(() => {
    if (mode === 'append') return new Set(Array.from({ length: head }, (_, i) => i));
    const s = new Set();
    for (let j = Math.max(0, t - 15); j <= t; j++) s.add(randPos(j, NCELLS));
    return s;
  }, [mode, t, head]);
  const prev = mode === 'inplace' && t > 0 ? randPos(t - 1, NCELLS) : null;

  const ops = mode === 'append' ? t * 12 : t;
  const seeks = mode === 'append' ? 0 : t;

  const hp = cellRC(head, COLS),
    pp = prev != null ? cellRC(prev, COLS) : null;

  return (
    <div ref={vpRef}>
      <Figure cap="figure · the disk has a grain" style={{ padding: '24px 22px 18px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className={`btn ${mode === 'append' ? 'btn-on' : ''}`}
              onClick={() => switchMode('append')}
            >
              append · lsm
            </button>
            <button
              className={`btn ${mode === 'inplace' ? 'btn-on' : ''}`}
              onClick={() => switchMode('inplace')}
            >
              in-place · b-tree
            </button>
          </div>
          <button
            className="btn"
            style={{ borderColor: 'var(--rule-soft)', color: 'var(--ink-3)' }}
            onClick={() => setRun(!run)}
          >
            {run ? <Pause size={12} /> : <Play size={12} />}
            {run ? 'pause' : 'run'}
          </button>
        </div>

        <div
          style={{
            position: 'relative',
            background: 'var(--lsm-well)',
            padding: 12,
            border: '1px solid var(--rule-soft)',
          }}
        >
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS},1fr)`, gap: 3 }}>
              {Array.from({ length: NCELLS }).map((_, i) => {
                const isHead = i === head;
                const isRecent = recent.has(i);
                return (
                  <div
                    key={i}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 1,
                      background: isHead
                        ? 'var(--writ)'
                        : isRecent
                          ? mode === 'append'
                            ? 'rgba(215,161,75,0.85)'
                            : 'rgba(227,88,44,0.30)'
                          : 'var(--lsm-sheen)',
                      boxShadow: isHead ? '0 0 10px var(--glow-writ-strong)' : 'none',
                      transition: mode === 'append' ? 'background 0.12s' : 'none',
                    }}
                  />
                );
              })}
            </div>
            {/* leap connector for in-place */}
            {mode === 'inplace' && pp && (
              <svg
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}
                viewBox={`0 0 ${COLS} ${ROWS}`}
                preserveAspectRatio="none"
              >
                <line
                  x1={pp.c + 0.5}
                  y1={pp.r + 0.5}
                  x2={hp.c + 0.5}
                  y2={hp.r + 0.5}
                  stroke="var(--writ)"
                  strokeWidth="0.06"
                  strokeDasharray="0.2 0.15"
                  opacity="0.7"
                />
              </svg>
            )}
          </div>
          <div style={{ marginTop: 8, textAlign: 'right' }} className="m">
            <span style={{ fontSize: 10, color: 'var(--instr-3)' }}>
              {mode === 'append'
                ? 'head sweeps in one direction: no seeks'
                : 'head leaps across the platter: a seek every write'}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div className="tiny">throughput · writes done</div>
            <div
              className="d m"
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: mode === 'append' ? 'var(--jade)' : 'var(--writ)',
              }}
            >
              {ops}
            </div>
            <div className="depthmark">
              {mode === 'append' ? '≈ 1200 writes/s sequential' : '≈ 100 writes/s random'}
            </div>
          </div>
          <div>
            <div className="tiny">seeks paid</div>
            <div
              className="d m"
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: mode === 'append' ? 'var(--jade)' : 'var(--writ)',
              }}
            >
              {seeks}
            </div>
            <div className="depthmark">
              {mode === 'append' ? 'append never seeks' : 'one seek per write'}
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 12,
            fontStyle: 'italic',
            fontFamily: 'Vollkorn',
            fontSize: 13.5,
            color: 'var(--ink-2)',
          }}
        >
          Same platter, same head. Writing along the grain lets it run. Writing across the grain
          makes it leap, and leaping is where the milliseconds go.
        </div>
      </Figure>
    </div>
  );
}
