import { useRevealRoot } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import Rule from '../components/Rule.jsx';
import DiffusionLab from '../labs/DiffusionLab.jsx';

export default function ARX() {
  const ref = useRevealRoot();
  return (
    <section ref={ref}>
      <div className="sha-wrap">
        <SectionHead
          num="04"
          eyebrow="SHA-2 · the mixer"
          title="Add, rotate,"
          italic="XOR"
          lede={
            <>
              Inside each stamp, SHA-2 leans on three humble operations, often called the
              <span className="kw"> ARX</span> trinity. Stack sixty-four rounds of them on top of
              one another and a single changed bit becomes an output you would never recognize.
            </>
          }
        />

        <div className="reveal" style={{ display: 'grid', gap: 10, margin: '20px 0' }}>
          {[
            [
              'Addition (mod 2³²)',
              'Carries ripple from low bits to high, smearing influence across positions. This is the lone source of true non-linearity.',
              'var(--copper)',
            ],
            [
              'Rotation',
              'Cyclically shifts bits so no bit ever stays in its home neighborhood. Pure rearrangement, but it guarantees mixing reaches everywhere.',
              'var(--steel)',
            ],
            [
              'XOR',
              'The cheap glue: fast, reversible bit-blending that ties the other two together each round.',
              'var(--jade)',
            ],
          ].map(([n, d, t]) => (
            <div
              key={n}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'baseline',
                padding: '12px 14px',
                border: '1px solid var(--line)',
                borderRadius: 10,
                borderLeft: `3px solid ${t}`,
                background: 'var(--panel)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--slab)',
                  fontWeight: 600,
                  fontSize: 16,
                  color: t,
                  minWidth: 130,
                }}
              >
                {n}
              </span>
              <span style={{ fontSize: 14.5, color: 'var(--bone-dim)', lineHeight: 1.55 }}>
                {d}
              </span>
            </div>
          ))}
        </div>

        <p className="body">
          Think of it as kneading dough. Each round folds the loaf, redistributing whatever is
          already there. No single fold does much. Sixty-four folds make the dough uniform. The
          visual below is the <em>real</em> compression, run on two inputs that differ by a single
          bit, with each of the 256 working bits drawn as it diverges round by round.
        </p>

        <DiffusionLab />
      </div>
      <Rule />
    </section>
  );
}
