import { useEffect, useState } from 'react';
import { Reveal } from '../../../shared/reveal.jsx';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';

// Hero — the card-catalog cabinet. On mount the open drawer auto-cycles; under
// reduced motion we skip the interval and hold a single drawer open.
const DRAWER_LABELS = [
  ['Aaa', 'Cor'],
  ['Cos', 'Fitz'],
  ['Fla', 'Hum'],
  ['Hun', 'Lov'],
  ['Low', 'Out'],
  ['Ova', 'Sla'],
  ['Sle', 'Vel'],
  ['Vem', 'Zyz'],
  ['REF', ''],
];

export default function Hero() {
  const [open, setOpen] = useState(4);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (reduced) return; // reduced motion: hold the drawer open, no auto-cycling
    const id = setInterval(() => setOpen((o) => (o + 1) % 9), 2600);
    return () => clearInterval(id);
  }, [reduced]);
  return (
    <header className="bt-hero bt-wrap">
      <Reveal base="bt-rev">
        <div className="bt-kicker" style={{ textAlign: 'center' }}>
          The structure under every database
        </div>
      </Reveal>
      <Reveal base="bt-rev" delay={0.08}>
        <h1
          className="bt-display"
          style={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 'clamp(46px,12vw,92px)',
            lineHeight: 0.92,
            letterSpacing: '-.02em',
            margin: '.18em 0 .1em',
          }}
        >
          The B&#8209;Tree
        </h1>
      </Reveal>
      <Reveal base="bt-rev" delay={0.15}>
        <p
          className="bt-lead"
          style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto', color: 'var(--ink-2)' }}
        >
          A century before databases, librarians built one out of oak and index cards. Here is how
          it works, and why it stayed perfectly balanced through a billion filings.
        </p>
      </Reveal>
      <Reveal base="bt-rev" delay={0.23} style={{ marginTop: 34 }}>
        <div className="bt-cabinet" role="img" aria-label="A library card-catalog cabinet">
          {DRAWER_LABELS.map(([a, b], i) => (
            <div
              key={i}
              className={`bt-drawer ${open === i ? 'open' : ''}`}
              onMouseEnter={() => setOpen(i)}
            >
              <div className="bt-drawer-label">{b ? `${a}–${b}` : a}</div>
              <div className="bt-knob" />
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal base="bt-rev" delay={0.3}>
        <p
          className="bt-mono"
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--ink-3)',
            marginTop: 22,
            letterSpacing: '.06em',
          }}
        >
          ↓ &nbsp;pull a drawer
        </p>
      </Reveal>
    </header>
  );
}
