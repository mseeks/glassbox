import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import {
  emptyCompaction,
  sizeTieredStep,
  leveledStep,
  readAmpSizeTiered,
  readAmpLeveled,
  writeAmp,
} from '../engine/index.js';
import Figure from '../components/Figure.jsx';
import { STRATA } from '../components/Layer.jsx';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useInViewport } from '../../../shared/useInViewport.js';

// Module-level file-id counter — every flushed file gets a unique id used as
// a React key. Two CompactLab instances would share the counter, which is
// fine.
let _fid = 1;
const mkfile = (size) => ({ id: _fid++, size });

// One strategy column — files per level plus the read/write-amp readout. Kept
// at module scope so it isn't recreated (and its subtree remounted) on every
// CompactLab render; all inputs arrive via props.
const Panel = ({ title, sub, data, ra, wa, waColor, raColor }) => {
  const fresh = Date.now() - data.flashAt < 480;
  return (
    <div>
      <div className="d" style={{ fontSize: 18, fontWeight: 700 }}>
        {title}
      </div>
      <div
        className="serif"
        style={{ fontStyle: 'italic', fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 12 }}
      >
        {sub}
      </div>
      {[0, 1, 2].map((i) => {
        const ring = fresh && data.flash === i;
        return (
          <div key={i} style={{ marginBottom: 5 }}>
            <div className="tiny" style={{ marginBottom: 3 }}>
              L{i} · {data.L[i].length} file{data.L[i].length !== 1 ? 's' : ''}
            </div>
            <div
              style={{
                display: 'flex',
                gap: 3,
                alignItems: 'center',
                minHeight: 24,
                background: '#0a0805',
                padding: 4,
                border: `1px solid ${ring ? 'var(--gold)' : 'var(--rule-soft)'}`,
                boxShadow: ring ? '0 0 14px rgba(227,170,51,0.5)' : 'none',
                transition: 'box-shadow 0.3s, border-color 0.3s',
              }}
            >
              {data.L[i].length === 0 && (
                <span
                  className="m"
                  style={{ fontSize: 9, color: 'var(--ink-faint)', paddingLeft: 4 }}
                >
                  ·
                </span>
              )}
              {data.L[i].map((f) => (
                <div
                  key={f.id}
                  style={{
                    width: Math.max(12, Math.min(f.size * 7, 140)),
                    height: 15,
                    background: STRATA[i + 1],
                    border: '1px solid rgba(0,0,0,0.4)',
                    transformOrigin: 'center',
                    animation: 'pop 0.4s ease-out',
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
      <div
        style={{
          marginTop: 10,
          padding: '9px 11px',
          background: 'var(--paper-3)',
          border: '1px solid var(--rule-soft)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }} className="m">
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>read amp · files/lookup</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: raColor }}>{ra}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }} className="m">
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>write amp · measured</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: waColor }}>{wa.toFixed(1)}×</span>
        </div>
      </div>
    </div>
  );
};

// §V — compaction, two strategies side by side, real counters. Same write
// stream feeds both; the read- and write-amplification numbers diverge in
// the direction RUM (§VI) makes inevitable.
export default function CompactLab() {
  const reduced = usePrefersReducedMotion();
  const [vpRef, inView] = useInViewport();
  const [run, setRun] = useState(false);
  const [t, setT] = useState(0);
  const blank = emptyCompaction;
  const [st, setSt] = useState(blank);
  const [lv, setLv] = useState(blank);
  const [, force] = useState(0); // for flash fade re-render

  const reset = () => {
    setRun(false);
    setT(0);
    setSt(blank());
    setLv(blank());
  };
  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => setT((x) => x + 1), 640);
    return () => clearInterval(id);
  }, [run]);
  // gentle re-render so flash rings fade even when paused mid-merge — this is
  // an always-on ambient loop, so skip it under reduced motion and pause it
  // while scrolled off-screen (the user-driven run loop below is left alone)
  useEffect(() => {
    if (reduced || !inView) return;
    const id = setInterval(() => force((x) => x + 1), 250);
    return () => clearInterval(id);
  }, [reduced, inView]);

  useEffect(() => {
    if (t === 0) return;
    const now = Date.now();
    setSt((s) => sizeTieredStep(s, mkfile, now));
    setLv((s) => leveledStep(s, mkfile, now));
  }, [t]);

  const stRA = readAmpSizeTiered(st.L);
  const lvRA = readAmpLeveled(lv.L);
  const stWA = writeAmp(st.written, st.ingested);
  const lvWA = writeAmp(lv.written, lv.ingested);

  return (
    <div ref={vpRef}>
      <Figure
        cap="lab · two strategies, one write stream, real counters"
        style={{ padding: '24px 22px 20px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', gap: 7 }}>
            <button className="btn btn-w" onClick={() => setRun(!run)}>
              {run ? <Pause size={12} /> : <Play size={12} />}
              {run ? 'pause' : 'run'}
            </button>
            <button
              className="btn"
              style={{ borderColor: 'var(--rule-soft)', color: 'var(--ink-3)' }}
              onClick={reset}
              aria-label="reset"
            >
              <RotateCcw size={12} />
            </button>
          </div>
          <span className="m" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            {st.ingested} units ingested · t={t}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }} className="g2">
          <Panel
            title="size-tiered"
            sub="merge same-size files; hoard, then collapse"
            data={st}
            ra={stRA}
            wa={stWA}
            waColor="var(--jade)"
            raColor="var(--writ)"
          />
          <Panel
            title="leveled"
            sub="one sorted run per level; rewrite on overflow"
            data={lv}
            ra={lvRA}
            wa={lvWA}
            waColor="var(--writ)"
            raColor="var(--jade)"
          />
        </div>
        <div
          style={{
            marginTop: 16,
            padding: '12px 15px',
            background: 'rgba(227,170,51,0.09)',
            borderLeft: '3px solid var(--gold)',
            fontStyle: 'italic',
            fontFamily: 'Vollkorn',
            fontSize: 14,
            color: 'var(--ink)',
          }}
        >
          The same units flow into both. Size-tiered keeps write-amp low but lets files pile up, so
          a lookup may probe several; leveled keeps one run per level, so a lookup probes few. The
          price? Rewriting the same bytes many times to hold that order. Watch the two numbers
          diverge. The trade, measured, not asserted.
        </div>
      </Figure>
    </div>
  );
}
