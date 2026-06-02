import React, { useState } from 'react';

// Single operation node on the timeline
function HBOp({ x, y, label, accent, badge }) {
  return (
    <div
      className={`hb-op ${accent ? 'hb-op-' + accent : ''}`}
      style={{ left: x + '%', top: y + 'px' }}
    >
      <div className="hb-op-label">{label}</div>
      {badge && (
        <div className={`hb-op-badge hb-op-badge-${badge.kind}`}>
          <span className="hb-op-badge-icon">{badge.kind === 'ok' ? '✓' : '⚠'}</span>
          {badge.text}
        </div>
      )}
    </div>
  );
}

export function Ch07HappensBefore() {
  const [sync, setSync] = useState('none');
  const showZones = sync !== 'none';

  // Operation labels per mode
  const labels = {
    none: {
      t1: ['data = 42', 'flag = true'],
      t2: ['while (!flag) {}', 'read data'],
    },
    'release-acquire': {
      t1: ['data = 42', 'flag.store(Release)'],
      t2: ['flag.load(Acquire)', 'read data'],
    },
    mutex: {
      t1: ['data = 42', 'mu.unlock()'],
      t2: ['mu.lock()', 'read data'],
    },
  };

  const t1 = labels[sync].t1;
  const t2 = labels[sync].t2;

  // Geometry: percentages for x, pixels for y. The track area starts after the
  // thread-label gutter, so all coordinates here are relative to that.
  const t1y = 130; // T1 lane center (px from top of diagram)
  const t2y = 290; // T2 lane center (px)
  const t1Op1x = 16; // % across track
  const t1Op2x = 42; // release lives here
  const t2Op1x = 58; // acquire lives here
  const t2Op2x = 84;
  const containerH = 420; // px

  // Arrow path endpoints (just outside the op boxes)
  const arrowStartY = t1y + 22;
  const arrowEndY = t2y - 22;

  return (
    <section className="section">
      <div className="section-num">07.04 · the fix</div>
      <h2 className="section-title">
        <em>Happens-before</em>, made visible.
      </h2>
      <p className="prose">
        The cure isn't to forbid reordering. That would cripple performance. The cure is to
        introduce <strong>specific points where ordering must be preserved</strong>. Synchronization
        primitives create these points. The relationship they create is called{' '}
        <strong>happens-before</strong>: if A happens-before B, then B is guaranteed to see A's
        effects.
      </p>
      <p className="prose">
        Below, thread 1 prepares <code>data</code> and then publishes a flag. Thread 2 waits for the
        flag and reads <code>data</code>. Toggle the synchronization to watch what becomes{' '}
        <em>guaranteed</em>, and what doesn't.
      </p>

      <div className="hb-card">
        <div className="hb-toggle-row">
          <div className="hb-time-axis">
            <span>time</span>
            <svg width="60" height="8" viewBox="0 0 60 8">
              <path
                d="M0 4 H50 M44 1 L50 4 L44 7"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            className="mode-toggle"
            style={{ padding: '4px' }}
            role="group"
            aria-label="Synchronization mode"
          >
            <button
              className={`mode-btn ${sync === 'none' ? 'active' : ''}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.78rem' }}
              aria-pressed={sync === 'none'}
              onClick={() => setSync('none')}
            >
              No sync
            </button>
            <button
              className={`mode-btn ${sync === 'release-acquire' ? 'active' : ''}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.78rem' }}
              aria-pressed={sync === 'release-acquire'}
              onClick={() => setSync('release-acquire')}
            >
              Release / Acquire
            </button>
            <button
              className={`mode-btn ${sync === 'mutex' ? 'active' : ''}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.78rem' }}
              aria-pressed={sync === 'mutex'}
              onClick={() => setSync('mutex')}
            >
              Mutex
            </button>
          </div>
        </div>

        <div className="hb-scroll">
          <div className="hb-diagram" style={{ height: containerH + 'px' }}>
            {/* Thread name labels — left gutter */}
            <div className="hb-thread-name" style={{ top: t1y + 'px' }}>
              Thread 1
            </div>
            <div className="hb-thread-name" style={{ top: t2y + 'px' }}>
              Thread 2
            </div>

            {/* Track area — everything below is relative to this */}
            <div className="hb-tracks">
              {/* Zone backgrounds (only when sync exists) */}
              {showZones && (
                <React.Fragment key={'zones-' + sync}>
                  <div
                    className="hb-zone hb-zone-publish"
                    style={{
                      left: '0%',
                      width: '50%',
                      top: t1y - 50 + 'px',
                      height: '100px',
                    }}
                  >
                    <div className="hb-zone-tag hb-zone-tag-top">
                      publish zone · propagates forward
                    </div>
                  </div>
                  <div
                    className="hb-zone hb-zone-receive"
                    style={{
                      left: '50%',
                      width: '50%',
                      top: t2y - 50 + 'px',
                      height: '100px',
                    }}
                  >
                    <div className="hb-zone-tag hb-zone-tag-bottom">
                      receive zone · observes the publish
                    </div>
                  </div>
                </React.Fragment>
              )}

              {/* Track lines */}
              <div className="hb-line" style={{ top: t1y + 'px' }} />
              <div className="hb-line" style={{ top: t2y + 'px' }} />

              {/* Arrow SVG (curve only — arrowhead is a separate non-scaling element) */}
              {showZones && (
                <svg
                  key={'arrow-' + sync}
                  className="hb-arrow-svg"
                  viewBox={`0 0 100 ${containerH}`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="hbArrowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="50%" stopColor="#6ee7b7" />
                      <stop offset="100%" stopColor="#5eead4" />
                    </linearGradient>
                  </defs>
                  {/* Halo */}
                  <path
                    d={`M ${t1Op2x} ${arrowStartY} C ${t1Op2x} ${(arrowStartY + arrowEndY) / 2}, ${t2Op1x} ${(arrowStartY + arrowEndY) / 2}, ${t2Op1x} ${arrowEndY}`}
                    stroke="#6ee7b7"
                    strokeWidth="10"
                    strokeOpacity="0.14"
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Main arrow */}
                  <path
                    d={`M ${t1Op2x} ${arrowStartY} C ${t1Op2x} ${(arrowStartY + arrowEndY) / 2}, ${t2Op1x} ${(arrowStartY + arrowEndY) / 2}, ${t2Op1x} ${arrowEndY}`}
                    stroke="url(#hbArrowGrad)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              )}

              {/* Arrowhead — separate HTML element so it isn't aspect-distorted */}
              {showZones && (
                <div
                  className="hb-arrowhead"
                  style={{
                    left: t2Op1x + '%',
                    top: arrowEndY + 'px',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M 8 14 L 1 2 L 15 2 Z" fill="#5eead4" />
                  </svg>
                </div>
              )}

              {/* synchronizes-with label */}
              {showZones && (
                <div
                  className="hb-sw-label"
                  key={'swl-' + sync}
                  style={{
                    left: (t1Op2x + t2Op1x) / 2 + '%',
                    top: (t1y + t2y) / 2 + 'px',
                  }}
                >
                  synchronizes-with
                </div>
              )}

              {/* Operations on T1 */}
              <HBOp x={t1Op1x} y={t1y} label={t1[0]} />
              <HBOp x={t1Op2x} y={t1y} label={t1[1]} accent={showZones ? 'release' : null} />

              {/* Operations on T2 */}
              <HBOp x={t2Op1x} y={t2y} label={t2[0]} accent={showZones ? 'acquire' : null} />
              <HBOp
                x={t2Op2x}
                y={t2y}
                label={t2[1]}
                badge={
                  showZones
                    ? { text: 'sees data = 42', kind: 'ok' }
                    : { text: 'data unknowable', kind: 'warn' }
                }
              />
            </div>
          </div>
        </div>

        {/* Annotation card */}
        <div className={`hb-annot hb-annot-${sync}`} key={'annot-' + sync}>
          {sync === 'none' && (
            <React.Fragment>
              <strong className="rose">No happens-before edge exists.</strong> Thread 2 has no
              guarantee about anything Thread 1 did. The compiler and CPU may reorder writes across
              the threads as they please. Even after Thread 2 sees <code>flag == true</code>, the
              value of <code>data</code> may still be stale or default-valued. That is the classic
              publication race.
            </React.Fragment>
          )}
          {sync === 'release-acquire' && (
            <React.Fragment>
              <strong className="emerald">Edge established.</strong> The release-store
              synchronizes-with the acquire-load that observes its value.{' '}
              <em>
                Everything in the publish zone is now guaranteed visible to everything in the
                receive zone
              </em>
              . That includes the write of <code>data = 42</code>, even though it's not the variable
              being synchronized on.
            </React.Fragment>
          )}
          {sync === 'mutex' && (
            <React.Fragment>
              <strong className="emerald">Same edge, friendlier API.</strong> Mutex unlock acts as a
              release; the next lock on the same mutex acts as an acquire. The publish zone →
              receive zone guarantee comes for free, with no atomics, no ordering parameters, no
              reasoning required. This is why "use a mutex" is the standard advice.
            </React.Fragment>
          )}
        </div>
      </div>

      <p className="prose">
        The arrow is the guarantee. When you cannot trace an arrow from A to B through these
        primitives, you cannot assume B sees A. When you can, you can. That is the entire game.
      </p>
    </section>
  );
}
