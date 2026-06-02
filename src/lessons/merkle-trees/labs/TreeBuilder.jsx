import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { buildTree } from '../engine/index.js';
import Plate from '../components/Plate.jsx';
import MerkleTreeSVG from '../components/MerkleTreeSVG.jsx';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';

// The tree being engraved level-by-level: 8 leaves → 4 → 2 → 1 root.
// Auto-plays when scrolled into view (intersection observer on the plate).
export default function TreeBuilder() {
  const data = useMemo(
    () => [
      'Alice→Bob',
      'Bob→Carol',
      'Carol→Dan',
      'Dan→Eve',
      'Eve→Finn',
      'Finn→Gail',
      'Gail→Hugo',
      'Hugo→Ada',
    ],
    [],
  );
  const levels = useMemo(() => buildTree(data), [data]);
  const [step, setStep] = useState(0); // 0..levels.length-1 levels revealed
  const playing = useRef(false);
  const timer = useRef(null);
  const plateRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  const play = useCallback(() => {
    if (playing.current) return;
    playing.current = true;
    setStep(0);
    let s = 0;
    const tick = () => {
      s += 1;
      setStep(s);
      if (s < levels.length - 1) timer.current = setTimeout(tick, 850);
      else playing.current = false;
    };
    timer.current = setTimeout(tick, 600);
  }, [levels.length]);

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Autostart is ambient: under reduced motion show the finished tree, no level-by-level build.
    if (reduced) {
      setStep(levels.length - 1);
      return;
    }
    const el = plateRef.current;
    if (!el || !('IntersectionObserver' in window)) {
      play();
      return;
    }
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          play();
          ob.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [play, reduced, levels.length]);

  const labels = [
    'leaves: H(each transaction)',
    'pair & hash → ¼ remain',
    'pair & hash → ½ way',
    'one root commits to all 8',
  ];

  return (
    <div ref={plateRef}>
      <Plate style={{ padding: '24px 16px 14px' }}>
        <MerkleTreeSVG
          levels={levels}
          width={760}
          levelGap={84}
          visibleLevels={step}
          scrollMinWidth={660}
          labelOf={(i) => (data[i].length > 9 ? data[i].slice(0, 8) + '…' : data[i])}
          stateOf={(L) => (L === step && step > 0 ? 'recompute' : 'idle')}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 10,
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div
            className="mk-mono"
            style={{ fontSize: 12, color: 'var(--patina)', letterSpacing: '0.08em' }}
          >
            {step < labels.length ? labels[step] : labels[labels.length - 1]}
          </div>
          <button className="mk-btn" onClick={play}>
            <RotateCcw size={13} /> Replay
          </button>
        </div>
      </Plate>
    </div>
  );
}
