import { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, ShieldAlert } from 'lucide-react';
import { buildTree, treeRoot } from '../engine/index.js';
import Plate from '../components/Plate.jsx';
import MerkleTreeSVG from '../components/MerkleTreeSVG.jsx';

// Click any leaf to forge its value; the change propagates up the lineage
// (parent, grandparent, root) until the seal breaks. You cannot touch a
// leaf without the root knowing.
export default function TamperLab() {
  const original = useMemo(() => ['€100', '€250', '€80', '€500'], []);
  const [data, setData] = useState(original);
  const [tampered, setTampered] = useState(null); // leaf idx
  const [cracking, setCracking] = useState(false);
  const crackTimer = useRef(null);

  const levels = useMemo(() => buildTree(data), [data]);
  const cleanRoot = useMemo(() => treeRoot(buildTree(original)), [original]);
  const curRoot = treeRoot(levels);
  const broken = curRoot !== cleanRoot;

  // which nodes lie on the path from the tampered leaf to the root?
  const onPath = useMemo(() => {
    if (tampered == null) return new Set();
    const s = new Set();
    let idx = tampered;
    for (let L = 0; L < levels.length; L++) {
      s.add(`${L}:${idx}`);
      idx = idx >> 1;
    }
    return s;
  }, [tampered, levels]);

  const tamper = (i) => {
    const amounts = ['€999', '€000', '€750', '€1', '€420'];
    const next = data.slice();
    next[i] = amounts[(amounts.indexOf(data[i]) + 1) % amounts.length] || amounts[0];
    setData(next);
    setTampered(i);
    setCracking(true);
    if (crackTimer.current) clearTimeout(crackTimer.current);
    crackTimer.current = setTimeout(() => setCracking(false), 450);
  };
  const reset = () => {
    setData(original);
    setTampered(null);
  };
  useEffect(() => () => crackTimer.current && clearTimeout(crackTimer.current), []);

  return (
    <Plate className={cracking ? 'mk-cracking' : ''} style={{ padding: '24px 16px 16px' }}>
      <MerkleTreeSVG
        levels={levels}
        width={560}
        levelGap={88}
        onLeafClick={tamper}
        labelOf={(i) => data[i]}
        rootSeal={broken ? 'bad' : 'ok'}
        stateOf={(L, i) => {
          const isRoot = L === levels.length - 1;
          if (isRoot) return broken ? 'tamper' : 'path';
          if (onPath.has(`${L}:${i}`)) return 'tamper';
          return 'idle';
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span className="mk-mono" style={{ fontSize: 11.5 }}>
            <span style={{ color: 'var(--paper-faint)' }}>trusted root </span>
            <span style={{ color: 'var(--gold)' }}>{cleanRoot.slice(0, 8)}</span>
          </span>
          <span className="mk-mono" style={{ fontSize: 11.5 }}>
            <span style={{ color: 'var(--paper-faint)' }}>current root </span>
            <span style={{ color: broken ? 'var(--cinnabar)' : 'var(--patina)' }}>
              {curRoot.slice(0, 8)}
            </span>
          </span>
        </div>
        <button className="mk-btn gold" onClick={reset}>
          <RotateCcw size={13} /> Restore
        </button>
      </div>
      {broken && (
        <div
          className="mk-mono"
          style={{
            marginTop: 12,
            fontSize: 12.5,
            color: 'var(--cinnabar)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <ShieldAlert size={15} /> the roots no longer match. Something below was altered, and
          anyone who holds the trusted root can tell at a glance. The forgery is exposed.
        </div>
      )}
    </Plate>
  );
}
