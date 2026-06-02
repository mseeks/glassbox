import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Play, RotateCcw } from 'lucide-react';
import { authPath, buildTree, treeRoot } from '../engine/index.js';
import Plate from '../components/Plate.jsx';
import MerkleTreeSVG from '../components/MerkleTreeSVG.jsx';

// The centerpiece: an inclusion proof. Pick a leaf; the gold nodes are the
// siblings handed to the verifier, the green path is what they recompute.
// If the recomputed root matches the trusted one, the leaf is proven to
// belong — with no access to the rest of the tree.
export default function ProofLab() {
  const data = useMemo(
    () => ['tx-A1', 'tx-B2', 'tx-C3', 'tx-D4', 'tx-E5', 'tx-F6', 'tx-G7', 'tx-H8'],
    [],
  );
  const levels = useMemo(() => buildTree(data), [data]);
  const trusted = treeRoot(levels);
  const [target, setTarget] = useState(4);
  const [vstep, setVstep] = useState(-1); // -1 idle; 0..depth verifying
  const timer = useRef(null);

  const path = useMemo(() => authPath(levels, target), [levels, target]);
  const depth = levels.length - 1;

  // ancestor indices of target at each level (the nodes the verifier recomputes)
  const ancestorIdx = (L) => target >> L;

  const run = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    setVstep(0);
    let s = 0;
    timer.current = setInterval(() => {
      s += 1;
      setVstep(s);
      if (s >= depth) {
        clearInterval(timer.current);
        timer.current = null;
      }
    }, 800);
  }, [depth]);

  useEffect(() => () => timer.current && clearInterval(timer.current), []);
  const pick = (i) => {
    setTarget(i);
    setVstep(-1);
    if (timer.current) clearInterval(timer.current);
  };

  const siblingSet = useMemo(() => {
    const m = new Map();
    path.forEach((p) => m.set(`${p.level}:${p.siblingIdx}`, p));
    return m;
  }, [path]);

  const verified = vstep >= depth;

  // build the recompute log up to current vstep
  const log = useMemo(() => {
    const out = [];
    out.push({ k: 'leaf', txt: `H( ${data[target]} )`, val: levels[0][target].hash.slice(0, 6) });
    for (let L = 0; L < depth; L++) {
      const selfIdx = target >> L;
      const sib = path[L];
      const parentHash = levels[L + 1][selfIdx >> 1].hash.slice(0, 6);
      const selfH = levels[L][selfIdx].hash.slice(0, 6);
      const sibH = levels[L][sib.siblingIdx].hash.slice(0, 6);
      const [a, b] = sib.side === 'left' ? [sibH, selfH] : [selfH, sibH];
      out.push({ k: 'node', txt: `H( ${a} ‖ ${b} )`, val: parentHash, done: vstep > L });
    }
    return out;
  }, [target, vstep, levels, path, depth, data]);

  return (
    <Plate style={{ padding: '24px 16px 16px' }}>
      <MerkleTreeSVG
        levels={levels}
        width={760}
        levelGap={84}
        scrollMinWidth={660}
        onLeafClick={pick}
        labelOf={(i) => data[i]}
        rootSeal={verified ? 'ok' : null}
        stateOf={(L, i) => {
          const isRoot = L === levels.length - 1;
          if (isRoot) return verified ? 'recompute' : 'path';
          if (L === 0 && i === target) return 'target';
          if (siblingSet.has(`${L}:${i}`)) return 'sibling';
          if (i === ancestorIdx(L)) return vstep >= L && vstep >= 0 ? 'recompute' : 'path';
          return 'idle';
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
          proving <span style={{ color: 'var(--gold-bright)' }}>{data[target]}</span> · proof =
          <span style={{ color: 'var(--patina)' }}> {depth} sibling hashes</span> for {data.length}{' '}
          leaves
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="mk-btn" onClick={() => pick(target)} disabled={vstep === -1}>
            <RotateCcw size={12} /> Reset
          </button>
          <button className="mk-btn gold" onClick={run}>
            <Play size={12} /> Run proof
          </button>
        </div>
      </div>

      {/* recompute ledger */}
      <div
        style={{
          marginTop: 14,
          background: 'var(--ink-2)',
          border: '1px solid var(--line)',
          borderRadius: 4,
          padding: '12px 14px',
        }}
      >
        <div
          className="mk-mono"
          style={{
            fontSize: 10.5,
            letterSpacing: '0.14em',
            color: 'var(--paper-faint)',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          verifier's recomputation
        </div>
        {log.map((l, i) => {
          const active = i === 0 ? true : vstep >= 0 && vstep >= i - 1;
          return (
            <div
              key={i}
              className="mk-mono"
              style={{
                fontSize: 12.5,
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                padding: '2px 0',
                opacity: active ? 1 : 0.32,
                transition: 'opacity 0.4s',
              }}
            >
              <span style={{ color: l.k === 'leaf' ? 'var(--gold-bright)' : 'var(--patina)' }}>
                {l.txt}
              </span>
              <span style={{ color: 'var(--paper-faint)' }}>→</span>
              <span style={{ color: 'var(--paper-dim)' }}>{l.val}</span>
            </div>
          );
        })}
        {verified && (
          <div
            className="mk-mono"
            style={{
              fontSize: 12.5,
              marginTop: 8,
              paddingTop: 8,
              borderTop: '1px solid var(--line)',
              color: 'var(--gold-bright)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Check size={14} /> computed root {trusted.slice(0, 6)} matches the trusted root.{' '}
            {data[target]} is proven to belong.
          </div>
        )}
      </div>
    </Plate>
  );
}
