import React, { useEffect, useMemo, useState } from 'react';
import { Play, ChevronRight, Search, CornerDownRight } from 'lucide-react';
import { guessSeq, pct } from '../engine/index.js';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useStepper } from '../components/useStepper.js';
import Legend from '../components/Legend.jsx';

// §02 — the higher-or-lower game. The optimal strategy guesses the midpoint and
// halves the unknown each turn; the run comes from the engine's guessSeq. When
// it finishes, the chain of guesses is laid out to reveal it was a search tree
// all along. Autoplays on mount per target; gated under reduced motion.
export default function GuessLab() {
  const reduced = usePrefersReducedMotion();
  const [target, setTarget] = useState(73);
  const g = useMemo(() => guessSeq(target), [target]);
  const { i, playing, play, step, reset, atEnd } = useStepper(g.length, 760);
  useEffect(() => {
    reset();
    if (reduced) return;
    const t = setTimeout(() => play(), 150);
    return () => clearTimeout(t);
    // Restart + autoplay only when the target changes. play() re-identifies on
    // every step, so listing it would retrigger this reset mid-animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reduced]);
  const cur = g[i];
  return (
    <div className="bst-lab">
      <div className="bst-lab-head">
        <span className="bst-lab-tag">
          <Search aria-hidden="true" />
          higher or lower
        </span>
      </div>
      <div className="bst-lab-body">
        <p className="bst-note">
          Pick a secret number. The optimal strategy never guesses 1, 2, 3… it guesses the middle
          and halves the unknown each time.
        </p>
        <div className="bst-controls" style={{ marginBottom: 14 }}>
          <span className="bst-foot">secret:</span>
          <div className="bst-chiprow">
            {[73, 50, 12, 99, 38].map((v) => (
              <button
                key={v}
                className={`bst-chip ${target === v ? 'on' : ''}`}
                onClick={() => setTarget(v)}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="bst-btn red" onClick={play} disabled={playing}>
            <Play aria-hidden="true" />
            {atEnd ? 'replay' : 'play'}
          </button>
          <button className="bst-btn ghost" onClick={step} disabled={atEnd}>
            <ChevronRight aria-hidden="true" />
            step
          </button>
        </div>
        {/* range bar */}
        <div style={{ position: 'relative', height: 54, marginTop: 8 }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 18,
              height: 18,
              background: 'var(--paper-2)',
              border: '1px solid var(--line)',
              borderRadius: 3,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 18,
              height: 18,
              left: `${pct(cur.lo)}%`,
              width: `${pct(cur.hi) - pct(cur.lo)}%`,
              background: 'var(--blue-wash-20)',
              borderLeft: '1.5px solid var(--blue)',
              borderRight: '1.5px solid var(--blue)',
              transition: 'all .5s',
            }}
          />
          {/* target marker */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              height: 34,
              left: `${pct(target)}%`,
              width: 0,
              borderLeft: '1.5px dashed var(--ink-3)',
            }}
          />
          <div
            className="bst-foot"
            style={{
              position: 'absolute',
              top: 0,
              left: `${pct(target)}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {atEnd ? target : '?'}
          </div>
          {/* past guesses */}
          {g.slice(0, i).map((q, k) => (
            <div
              key={k}
              style={{
                position: 'absolute',
                top: 18,
                height: 18,
                left: `${pct(q.mid)}%`,
                width: 0,
                borderLeft: '1px solid var(--ink-3)',
                opacity: 0.7,
              }}
            />
          ))}
          {/* current guess */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              height: 26,
              left: `${pct(cur.mid)}%`,
              width: 0,
              borderLeft: '2.4px solid var(--red)',
              transition: 'left .5s',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 38,
              left: `${pct(cur.mid)}%`,
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--red)',
              transition: 'left .5s',
            }}
          >
            {cur.mid}
          </div>
          <div className="bst-foot" style={{ position: 'absolute', top: -2, left: 0 }}>
            1
          </div>
          <div className="bst-foot" style={{ position: 'absolute', top: -2, right: 0 }}>
            100
          </div>
        </div>
        <Legend
          items={[
            { c: 'var(--red)', t: 'this guess' },
            { c: 'var(--blue-wash-55)', t: 'still possible' },
            { c: 'var(--dim)', t: 'eliminated' },
          ]}
        />
        <div className="bst-cap">
          {!atEnd ? (
            <>
              Guess <b>{i + 1}</b>: is it <b>{cur.mid}</b>? &nbsp;→&nbsp;{' '}
              {cur.cmp < 0 ? 'too high, go lower' : 'too low, go higher'}. Half the remaining
              numbers <span className="hot">vanish</span>.
            </>
          ) : (
            <>
              Cornered <b>{target}</b> in <span className="hot">{g.length} guesses</span> out of
              100. Each answer threw away half of what was left.
            </>
          )}
        </div>
        {/* reveal: the questions form a tree */}
        {atEnd && (
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--hair)' }}>
            <div className="bst-foot" style={{ marginBottom: 10 }}>
              every guess was a question — chain them and you have a search tree:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
              {g.map((q, k) => (
                <React.Fragment key={k}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 600,
                      border: `1.8px solid ${q.cmp === 0 ? 'var(--sage)' : 'var(--ink)'}`,
                      background: q.cmp === 0 ? 'var(--sage)' : 'var(--panel)',
                      color: q.cmp === 0 ? 'var(--paper)' : 'var(--ink)',
                    }}
                  >
                    {q.mid}
                  </div>
                  {k < g.length - 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 9.5,
                          color: 'var(--blue-deep)',
                          letterSpacing: '.04em',
                        }}
                      >
                        {q.cmp < 0 ? 'left' : 'right'}
                      </span>
                      <CornerDownRight
                        size={14}
                        style={{ color: 'var(--blue)', transform: 'rotate(-45deg)' }}
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
