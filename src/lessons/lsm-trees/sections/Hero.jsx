import { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import Shell from '../components/Shell.jsx';
import Figure from '../components/Figure.jsx';
import Layer from '../components/Layer.jsx';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useInViewport } from '../../../shared/useInViewport.js';

// Hero — six strata stacked into a "core sample", with sediment-drops
// falling from the surface every 640ms to suggest that the column is still
// accumulating. The depth axis on the right marks the ~10× growth per level
// that makes "time becomes depth" literally true.
export default function Hero() {
  const reduced = usePrefersReducedMotion();
  const [vpRef, inView] = useInViewport();
  const [drops, setDrops] = useState([]);
  const tk = useRef(0);
  useEffect(() => {
    if (reduced || !inView) return; // ambient falling-sediment loop — purely decorative; pause off-screen, leave the static column
    const id = setInterval(() => {
      tk.current++;
      setDrops((d) => [
        ...d.slice(-9),
        { id: tk.current + Math.random(), x: 10 + Math.random() * 78 },
      ]);
    }, 640);
    return () => clearInterval(id);
  }, [reduced, inView]);

  const bands = [
    { fill: 'var(--s1)', h: 26, label: 'L0', sub: 'minutes ago' },
    { fill: 'var(--s2)', h: 34, label: 'L1', sub: 'hours' },
    { fill: 'var(--s3)', h: 46, label: 'L2', sub: 'days' },
    { fill: 'var(--s4)', h: 64, label: 'L3', sub: 'weeks' },
    { fill: 'var(--s5)', h: 92, label: 'L4', sub: 'months' },
    { fill: 'var(--s6)', h: 116, label: 'L5', sub: 'the deep past' },
  ];

  return (
    <header ref={vpRef} style={{ padding: '56px 0 40px' }}>
      <Shell>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
          <span className="tiny">field manual · no. IX</span>
          <span className="tiny">write-optimised storage</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.55fr) minmax(0,1fr)',
            gap: 48,
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          <div>
            <div className="kicker" style={{ marginBottom: 18 }}>
              the log-structured merge-tree
            </div>
            <h1
              className="d"
              style={{
                fontSize: 'clamp(46px, 8.5vw, 104px)',
                fontWeight: 800,
                lineHeight: 0.9,
                letterSpacing: '-0.04em',
                margin: '0 0 26px',
                color: 'var(--ink)',
              }}
            >
              Time
              <br />
              becomes
              <br />
              <span style={{ color: 'var(--writ)', textShadow: '0 0 38px rgba(227,88,44,0.45)' }}>
                depth.
              </span>
            </h1>
            <p
              className="serif"
              style={{
                fontSize: 'clamp(18px,2.6vw,24px)',
                fontStyle: 'italic',
                color: 'var(--ink-3)',
                lineHeight: 1.4,
                maxWidth: 540,
                margin: 0,
              }}
            >
              A storage engine that never erases and never overwrites. It only ever lays a newer
              layer of data on top of the old. To read, you drill down and take the first thing you
              hit. Every other idea in this manual follows from that.
            </p>
            <div style={{ marginTop: 30, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="#one" className="btn btn-w">
                <ArrowDown size={13} /> begin the descent
              </a>
              <a href="#contents" className="btn btn-i">
                the survey
              </a>
            </div>
          </div>

          <div>
            <Figure cap="core sample · still accumulating" style={{ padding: '22px 20px 18px' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    inset: '0 0 auto 0',
                    height: 40,
                    pointerEvents: 'none',
                    zIndex: 3,
                  }}
                >
                  {drops.map((d) => (
                    <span
                      key={d.id}
                      style={{
                        position: 'absolute',
                        left: `${d.x}%`,
                        top: 0,
                        width: 5,
                        height: 9,
                        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                        background: 'var(--writ)',
                        boxShadow: '0 0 9px rgba(227,88,44,0.7)',
                        animation: 'drop 1.35s ease-in forwards',
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 0 }}>
                  <div style={{ flex: 1, paddingTop: 40 }}>
                    <div
                      style={{
                        height: 30,
                        border: '1.5px dashed var(--rule-soft)',
                        background:
                          'repeating-linear-gradient(45deg, transparent 0 6px, rgba(227,88,44,0.10) 6px 7px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 12px',
                        marginBottom: 6,
                      }}
                    >
                      <span className="m" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>
                        surface · memory
                      </span>
                      <span className="m" style={{ fontSize: 10, color: 'var(--writ)' }}>
                        now
                      </span>
                    </div>
                    {bands.map((b, i) => (
                      <Layer key={i} {...b} idx={i} />
                    ))}
                  </div>
                  {/* depth axis — each level ~10× larger than the last */}
                  <div style={{ width: 40, marginLeft: 8, marginTop: 40, position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        background: 'linear-gradient(180deg, var(--instr-2), transparent)',
                      }}
                    />
                    {['×1', '×10', '×100', '×1k', '×10k', '×100k'].map((lbl, i) => (
                      <span
                        key={i}
                        style={{
                          position: 'absolute',
                          left: 7,
                          top: `${[6, 17, 31, 50, 74, 92][i]}%`,
                          whiteSpace: 'nowrap',
                          transform: 'translateY(-50%)',
                        }}
                        className="depthmark"
                      >
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: '1px solid var(--rule)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span className="depthmark">↑ shallow · new</span>
                <span className="depthmark">deep · old · larger ↓</span>
              </div>
            </Figure>
          </div>
        </div>
      </Shell>
    </header>
  );
}
