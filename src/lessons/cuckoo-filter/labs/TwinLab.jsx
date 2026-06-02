import { useEffect, useMemo, useState } from 'react';
import {
  altIndex,
  deleteByLookup,
  fingerprintOf,
  fpHex,
  indexOf,
  insertItem,
  makeFilter,
} from '../engine/index.js';

export function TwinLab() {
  const NB = 16; // power of two: altIndex must be its own inverse for the trick to hold
  const FP_BITS = 5;

  // Find a real collision pair in the vocabulary. A fresh filter stores the
  // first item in its PRIMARY bucket (iA), so for deleting "b" to erase "a"'s
  // trace — and for looking "b" up to hit it — iA must be one of b's two
  // candidate buckets. (Overlap on a's *alternate* bucket iA2 would not, since
  // a's fingerprint never lands there.)
  const pair = useMemo(() => {
    const vocab = [
      'apple',
      'beech',
      'cherry',
      'dawn',
      'elm',
      'fig',
      'grove',
      'hazel',
      'ivy',
      'jade',
      'knot',
      'lake',
      'moss',
      'nest',
      'oak',
      'plum',
      'quince',
      'reed',
      'sage',
      'thorn',
      'vine',
      'wave',
      'yew',
      'zest',
      'arrow',
      'brook',
      'coast',
      'dune',
      'echo',
      'fawn',
      'gulf',
      'heath',
      'isle',
      'jut',
      'kelp',
      'lichen',
      'mist',
      'nook',
      'onyx',
      'peat',
      'quartz',
      'rune',
      'silt',
      'tide',
      'umber',
      'vale',
      'wisp',
      'xeno',
      'yarrow',
      'zinc',
      'azure',
      'blaze',
      'crest',
      'drift',
      'ember',
      'frost',
      'glade',
      'heron',
      'inlet',
      'juno',
      'knoll',
      'loam',
      'marsh',
      'nimbus',
      'orca',
      'plain',
      'quay',
      'ridge',
      'snow',
      'tarn',
      'umbra',
      'vault',
      'willow',
      'yonder',
      'zephyr',
      'aster',
      'bramble',
      'calix',
      'derry',
      'eyrie',
      'fjord',
      'gust',
      'holm',
      'inkle',
      'juneberry',
      'kerf',
      'larkspur',
      'meadow',
      'noyade',
      'osprey',
      'pintail',
      'quag',
      'ramble',
      'sedge',
    ];
    for (let i = 0; i < vocab.length; i++) {
      for (let j = i + 1; j < vocab.length; j++) {
        const a = vocab[i],
          b = vocab[j];
        const fpA = fingerprintOf(a, FP_BITS);
        const fpB = fingerprintOf(b, FP_BITS);
        if (fpA !== fpB) continue;
        const iA = indexOf(a, NB);
        const iB = indexOf(b, NB),
          iB2 = altIndex(iB, fpB, NB);
        if (iB === iA || iB2 === iA) return { a, b, fp: fpA };
      }
    }
    return { a: 'elm', b: 'ivy', fp: fingerprintOf('elm', FP_BITS) };
  }, []);

  const { a, b } = pair;
  const aFp = fingerprintOf(a, FP_BITS);
  const aI1 = indexOf(a, NB);
  const aI2 = altIndex(aI1, aFp, NB);
  const bFp = fingerprintOf(b, FP_BITS);
  const bI1 = indexOf(b, NB);
  const bI2 = altIndex(bI1, bFp, NB);

  const [step, setStep] = useState(0);
  const [filter, setFilter] = useState(() =>
    makeFilter({ numBuckets: NB, slotsPerBucket: 4, fpBits: FP_BITS }),
  );

  useEffect(() => {
    const f = makeFilter({ numBuckets: NB, slotsPerBucket: 4, fpBits: FP_BITS });
    if (step >= 1) insertItem(f, a);
    if (step >= 3) deleteByLookup(f, b);
    setFilter(f);
  }, [step, a, b]);

  const steps = [
    {
      title: 'Two items, one fingerprint',
      body: (
        <>
          The vocabulary has been searched until a collision was found. <em>"{a}"</em> and{' '}
          <em>"{b}"</em> hash to the same fingerprint at overlapping candidate buckets. To the
          filter, they are indistinguishable.
        </>
      ),
    },
    {
      title: (
        <>
          Insert <em>"{a}"</em>
        </>
      ),
      body: (
        <>
          The fingerprint{' '}
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13 }}>{fpHex(aFp, FP_BITS)}</span>{' '}
          takes residence in one of <em>"{a}"</em>'s candidate buckets — {aI1} or {aI2}. The filter
          does not — cannot — know whose fingerprint this is.
        </>
      ),
    },
    {
      title: (
        <>
          Lookup <em>"{b}"</em>
        </>
      ),
      body: (
        <>
          <em>"{b}"</em> was never inserted. But its fingerprint matches the trace <em>"{a}"</em>{' '}
          left behind. The filter answers <em>probably yes</em>. The application checks the
          authoritative store, finds nothing, and dismisses the false positive. No harm.
        </>
      ),
    },
    {
      title: (
        <>
          Delete <em>"{b}"</em>
        </>
      ),
      body: (
        <>
          Now the application asks the filter to forget <em>"{b}"</em>. The filter searches for a
          matching fingerprint, finds one, erases it. But the fingerprint it erased was the trace
          left by <em>"{a}"</em>.
        </>
      ),
    },
    {
      title: (
        <>
          Lookup <em>"{a}"</em> &nbsp;—&nbsp;{' '}
          <span style={{ color: 'var(--cuc)' }}>false negative</span>
        </>
      ),
      body: (
        <>
          <em>"{a}"</em> is still genuinely present in the authoritative store. Its trace in the
          filter has been erased. The filter answers <em>definitely no</em>, and the application
          skips a record that exists. This is the failure the structure was built to prevent.
        </>
      ),
    },
  ];
  const cur = steps[step];

  return (
    <div>
      <div className="cf-cols cf-cols-lab-narrow">
        <div>
          <div className="cf-eyebrow" style={{ marginBottom: 12 }}>
            {NB} buckets · 4 slots · 5-bit fingerprints
          </div>
          <div className="cf-cell-strip">
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${NB}, 1fr)`, gap: 5 }}>
              {filter.buckets.map((bucket, bi) => {
                const isA = step >= 1 && (bi === aI1 || bi === aI2);
                const isB = step >= 2 && step < 4 && (bi === bI1 || bi === bI2);
                const hl = step >= 1 && (isA || isB);
                return (
                  <div key={bi} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div
                      className="cf-mono"
                      style={{
                        fontSize: 9,
                        textAlign: 'center',
                        letterSpacing: '0.12em',
                        color: hl ? 'var(--cuc)' : 'var(--text-mute)',
                        fontWeight: hl ? 700 : 400,
                      }}
                    >
                      {bi.toString().padStart(2, '0')}
                    </div>
                    <div
                      style={{
                        padding: 2,
                        gap: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        border: hl ? '1.5px solid var(--cuc)' : '1px solid var(--line)',
                        background: hl ? 'var(--cuc-wash)' : 'transparent',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {bucket.map((bfp, si) => (
                        <div
                          key={si}
                          style={{
                            aspectRatio: '1',
                            background: bfp === 0 ? 'var(--bg)' : 'var(--bg-3)',
                            color: bfp === 0 ? 'var(--text-faint)' : 'var(--text)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'JetBrains Mono',
                            fontSize: 9.5,
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                            animation: bfp !== 0 ? 'cf-arrive 0.4s ease' : 'none',
                          }}
                        >
                          {bfp === 0 ? '·' : fpHex(bfp, FP_BITS)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cf-cols cf-cols-half" style={{ marginTop: 24 }}>
            <div
              style={{
                padding: '16px 18px',
                border: '1px solid var(--cuc)',
                background: 'var(--bg)',
              }}
            >
              <div
                style={{
                  fontFamily: 'Fraunces',
                  fontStyle: 'italic',
                  fontSize: 18,
                  color: 'var(--cuc)',
                  marginBottom: 8,
                  fontWeight: 400,
                }}
              >
                "{a}"
              </div>
              <div
                className="cf-mono"
                style={{
                  fontSize: 11,
                  lineHeight: 1.8,
                  color: 'var(--text-mute)',
                  letterSpacing: '0.06em',
                }}
              >
                fp <span style={{ color: 'var(--text)' }}>{fpHex(aFp, FP_BITS)}</span>
                <br />
                buckets{' '}
                <span style={{ color: 'var(--text)' }}>
                  {aI1}, {aI2}
                </span>
              </div>
            </div>
            <div
              style={{
                padding: '16px 18px',
                border: '1px solid var(--steel)',
                background: 'var(--bg)',
              }}
            >
              <div
                style={{
                  fontFamily: 'Fraunces',
                  fontStyle: 'italic',
                  fontSize: 18,
                  color: 'var(--steel)',
                  marginBottom: 8,
                  fontWeight: 400,
                }}
              >
                "{b}"
              </div>
              <div
                className="cf-mono"
                style={{
                  fontSize: 11,
                  lineHeight: 1.8,
                  color: 'var(--text-mute)',
                  letterSpacing: '0.06em',
                }}
              >
                fp <span style={{ color: 'var(--text)' }}>{fpHex(bFp, FP_BITS)}</span>
                <br />
                buckets{' '}
                <span style={{ color: 'var(--text)' }}>
                  {bI1}, {bI2}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="cf-eyebrow cf-eyebrow-cuc" style={{ marginBottom: 14 }}>
            STEP {step + 1} OF {steps.length}
          </div>
          <h3
            style={{
              fontFamily: 'Fraunces',
              fontWeight: 400,
              fontSize: 28,
              lineHeight: 1.15,
              margin: '0 0 20px',
              letterSpacing: '-0.018em',
              color: step === 4 ? 'var(--cuc)' : 'var(--text)',
            }}
          >
            {cur.title}
          </h3>
          <div className="cf-body" style={{ fontSize: 16, lineHeight: 1.6 }}>
            {cur.body}
          </div>

          {step === 4 && (
            <div
              style={{
                marginTop: 24,
                background: 'var(--cuc)',
                color: 'var(--bg)',
                padding: '18px 22px',
              }}
            >
              <div
                className="cf-mono"
                style={{ fontSize: 10, letterSpacing: '0.3em', marginBottom: 8, fontWeight: 600 }}
              >
                THE FORBIDDEN FAILURE
              </div>
              <div
                style={{
                  fontFamily: 'Fraunces',
                  fontStyle: 'italic',
                  fontSize: 17,
                  lineHeight: 1.4,
                  fontWeight: 400,
                }}
              >
                False negatives are the failure mode the structure exists to prevent.
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className="cf-btn"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              ← back
            </button>
            <button
              className="cf-btn"
              data-v="primary"
              disabled={step >= steps.length - 1}
              onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            >
              next →
            </button>
            <button className="cf-btn" onClick={() => setStep(0)}>
              restart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
