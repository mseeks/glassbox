import { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { buildTree } from '../engine/index.js';
import Plate from '../components/Plate.jsx';
import MerkleTreeSVG from '../components/MerkleTreeSVG.jsx';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';

// Hero — opening animation engraves four documents into a sealed root.
export default function Hero() {
  const data = useMemo(() => ['deed', 'lease', 'title', 'grant'], []);
  const levels = useMemo(() => buildTree(data), [data]);
  const [step, setStep] = useState(0); // 0 leaves, 1 mid, 2 root edges, 3 seal
  const [sealed, setSealed] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setStep(2);
      setSealed(true);
      return;
    } // jump to the sealed end state
    const t1 = setTimeout(() => setStep(1), 900);
    const t2 = setTimeout(() => setStep(2), 1700);
    const t3 = setTimeout(() => {
      setStep(2);
      setSealed(true);
    }, 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [reduced]);

  return (
    <header style={{ paddingTop: 92, paddingBottom: 30 }}>
      <div className="mk-section" style={{ textAlign: 'center' }}>
        <div className="mk-kicker" style={{ justifyContent: 'center', marginBottom: 18 }}>
          Ralph C. Merkle · 1979
        </div>
        <h1
          className="mk-display"
          style={{
            fontSize: 'clamp(44px, 9vw, 92px)',
            lineHeight: 0.98,
            margin: '0 0 14px',
            letterSpacing: '-0.01em',
          }}
        >
          Merkle Trees
        </h1>
        <p
          className="mk-display"
          style={{
            fontSize: 'clamp(17px, 3vw, 23px)',
            color: 'var(--paper-dim)',
            fontStyle: 'italic',
            maxWidth: 640,
            margin: '0 auto 8px',
          }}
        >
          One small fingerprint. It vouches for an entire dataset, and out of it you can draw a
          receipt the size of a whisper, the proof that any single piece of that dataset truly
          belongs.
        </p>
      </div>

      <div className="mk-section" style={{ maxWidth: 640, marginTop: 30 }}>
        <Plate style={{ padding: '26px 18px 16px' }}>
          <MerkleTreeSVG
            levels={levels}
            width={560}
            levelGap={86}
            visibleLevels={step >= 2 ? 2 : step}
            rootSeal={sealed ? 'ok' : null}
            labelOf={(i) => data[i]}
            stateOf={(L) => (sealed && L === levels.length - 1 ? 'path' : 'idle')}
          />
          <div
            className="mk-mono"
            style={{
              textAlign: 'center',
              fontSize: 11,
              color: 'var(--paper-faint)',
              letterSpacing: '0.12em',
              marginTop: 8,
            }}
          >
            FOUR DOCUMENTS · HASHED IN PAIRS · SEALED UNDER ONE ROOT
          </div>
        </Plate>
      </div>

      <div className="mk-section" style={{ textAlign: 'center', marginTop: 26 }}>
        <button
          className="mk-btn gold"
          onClick={() => {
            document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Begin <ChevronRight size={14} />
        </button>
      </div>
    </header>
  );
}
