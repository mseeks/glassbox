import { useEffect, useState } from 'react';
import { ArrowDown, Lock } from 'lucide-react';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import Plate from '../components/Plate.jsx';

// Hero — a compositor's sweep: a scan line descends and locks sorted key rows
// into a sealed forme. This is autoplay-on-mount JS motion, so under reduced
// motion it is delivered already set (all rows locked, no scanline).
const HERO_KEYS = [
  ['athens', '100'],
  ['berlin', '101'],
  ['cairo', '104'],
  ['delhi', '105'],
  ['geneva', '108'],
  ['kyoto', '111'],
  ['madrid', '114'],
  ['oslo', '120'],
];

export default function Hero() {
  const reduced = usePrefersReducedMotion();
  const [set, setSet] = useState(reduced ? HERO_KEYS.length : 0);
  useEffect(() => {
    if (reduced) {
      setSet(HERO_KEYS.length);
      return;
    }
    if (set >= HERO_KEYS.length) return;
    const t = setTimeout(() => setSet((s) => s + 1), set === 0 ? 420 : 170);
    return () => clearTimeout(t);
  }, [set, reduced]);
  const sealed = set >= HERO_KEYS.length;
  const ROW = 34;

  return (
    <header className="sst-hero">
      <div className="sst-shell">
        <div className="sst-hero-grid">
          <div className="sst-hero-lede">
            <div className="sst-kicker" style={{ marginBottom: 20 }}>
              sorted string tables · the immutable page
            </div>
            <h1 className="sst-h1">
              Set in order.
              <br />
              <span style={{ color: 'var(--blood)' }}>Locked</span> for good.
            </h1>
            <p className="sst-dek" style={{ marginTop: 22 }}>
              A file of sorted keys, written once and never altered. Almost everything good about it
              follows from that single refusal to change.
            </p>
            <div className="sst-hero-cue" aria-hidden="true">
              <span className="sst-tiny">read on</span>
              <ArrowDown size={15} />
            </div>
          </div>

          <div className="sst-hero-stage">
            <Plate
              cap="the forme · keys set in sorted order"
              capRight={sealed ? 'sealed' : 'setting…'}
            >
              <div className="sst-forme" style={{ '--row': `${ROW}px` }}>
                {!reduced && !sealed && (
                  <div className="sst-scanline" style={{ top: `calc(${set} * var(--row))` }} />
                )}
                {HERO_KEYS.map(([k, v], i) => {
                  const on = i < set;
                  return (
                    <div
                      key={k}
                      className={`sst-forme-row${on ? ' on' : ''}`}
                      style={{ height: ROW }}
                    >
                      <span className="fr-k">{k}</span>
                      <span className="fr-rule" />
                      <span className="fr-v">{v}</span>
                      <span className="fr-lock">
                        {on ? <Lock size={12} aria-hidden="true" /> : null}
                      </span>
                    </div>
                  );
                })}
                {sealed && (
                  <div className="sst-sealstamp">
                    <Lock size={13} aria-hidden="true" /> immutable
                  </div>
                )}
              </div>
            </Plate>
          </div>
        </div>
      </div>
    </header>
  );
}
