import { useCallback, useMemo, useState } from 'react';
import { ArrowDown, RotateCcw, Search } from 'lucide-react';
import { buildTree } from '../engine/index.js';
import Plate from '../components/Plate.jsx';
import MerkleTreeSVG from '../components/MerkleTreeSVG.jsx';

// Reconciliation by halving: two replicas, one drifted record. Compare roots
// (mismatch), descend into the half whose hashes disagree, recurse. Localizes
// the difference in O(log N) comparisons instead of shipping both datasets.
export default function ReconcileLab() {
  const A = useMemo(() => ['k0=a', 'k1=b', 'k2=c', 'k3=d', 'k4=e', 'k5=f', 'k6=g', 'k7=h'], []);
  const B = useMemo(() => ['k0=a', 'k1=b', 'k2=c', 'k3=d', 'k4=e', 'k5=X', 'k6=g', 'k7=h'], []); // differs at idx 5
  const lvA = useMemo(() => buildTree(A), [A]);
  const lvB = useMemo(() => buildTree(B), [B]);
  const depth = lvA.length - 1;

  const eq = useCallback((L, i) => lvA[L][i].hash === lvB[L][i].hash, [lvA, lvB]);

  // BFS: which nodes get examined (descend only into mismatches)
  const examined = useMemo(() => {
    const set = new Set([`${depth}:0`]);
    const q = [{ L: depth, i: 0 }];
    while (q.length) {
      const { L, i } = q.shift();
      if (L === 0) continue;
      if (!eq(L, i)) {
        const node = lvA[L][i];
        [node.l, node.r].forEach((ci) => {
          if (!set.has(`${L - 1}:${ci}`)) {
            set.add(`${L - 1}:${ci}`);
            q.push({ L: L - 1, i: ci });
          }
        });
      }
    }
    return set;
  }, [depth, eq, lvA]);

  const [step, setStep] = useState(1); // root revealed as a mismatch from the start; descend to localize
  const revealedLevel = useCallback((L) => depth - L < step, [depth, step]);
  const done = step > depth;

  const comparisons = useMemo(() => {
    let c = 0;
    examined.forEach((key) => {
      const L = +key.split(':')[0];
      if (revealedLevel(L)) c++;
    });
    return c;
  }, [examined, revealedLevel]);

  return (
    <Plate style={{ padding: '24px 16px 16px' }}>
      <MerkleTreeSVG
        levels={lvA}
        width={760}
        levelGap={84}
        dimEdges
        scrollMinWidth={660}
        labelOf={(i) => A[i].split('=')[0]}
        stateOf={(L, i) => {
          if (!examined.has(`${L}:${i}`)) return 'dim';
          if (!revealedLevel(L)) return 'idle';
          return eq(L, i) ? 'match' : 'mismatch';
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 8,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div className="mk-mono" style={{ fontSize: 12, color: 'var(--paper-dim)' }}>
          <span style={{ color: 'var(--patina)' }}>green = equal (pruned)</span> ·{' '}
          <span style={{ color: 'var(--cinnabar)' }}>red = differs (descend)</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="mk-btn" onClick={() => setStep(1)}>
            <RotateCcw size={12} /> Reset
          </button>
          <button
            className="mk-btn gold"
            onClick={() => setStep((s) => Math.min(depth + 1, s + 1))}
            disabled={done}
          >
            <ArrowDown size={12} /> Descend
          </button>
        </div>
      </div>
      {done && (
        <div
          className="mk-mono"
          style={{
            marginTop: 12,
            fontSize: 12.5,
            color: 'var(--gold-bright)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Search size={14} /> located the drifted record (k5) in {comparisons} comparisons, never
          shipping the other seven
        </div>
      )}
    </Plate>
  );
}
