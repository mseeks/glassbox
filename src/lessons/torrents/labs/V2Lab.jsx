import { useMemo, useState } from 'react';
import {
  GitBranch,
  Magnet,
  Compass,
  Share2,
  ShieldCheck,
  Boxes,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { buildMerkle, merkleProof, magnetSteps } from '../engine/index.js';

// The Merkle tree over eight piece hashes. Tap a piece and the proof lights up:
// the gold "recompute path" to the root and the teal sibling hashes a peer hands
// you. The tree and the per-leaf authentication path come from the engine.
function MerkleTree() {
  const tree = useMemo(() => buildMerkle(), []);
  const [sel, setSel] = useState(3);
  const proof = useMemo(() => merkleProof(tree, sel), [tree, sel]);
  const { pathLeaf, pathL1, pathL2, sibLeaf, sibL1, sibL2, siblings, root } = proof;
  const W = 560,
    H = 300;
  const xLeaf = (i) => 44 + i * ((W - 88) / 7),
    yLeaf = 246;
  const xL1 = (j) => (xLeaf(2 * j) + xLeaf(2 * j + 1)) / 2,
    yL1 = 174;
  const xL2 = (j) => (xL1(2 * j) + xL1(2 * j + 1)) / 2,
    yL2 = 104;
  const xRoot = (xL2(0) + xL2(1)) / 2,
    yRoot = 44;
  const node = (x, y, role, r = 8, k) => {
    const fill =
      role === 'path' ? 'var(--gold)' : role === 'sib' ? 'var(--signal)' : 'var(--faint-2)';
    const glow = role === 'path' ? 'var(--gold)' : role === 'sib' ? 'var(--signal)' : 'none';
    return (
      <circle
        key={k}
        cx={x}
        cy={y}
        r={r}
        fill={fill}
        opacity={role === 'none' ? 0.5 : 0.95}
        style={{
          filter: glow !== 'none' ? `drop-shadow(0 0 6px ${glow})` : 'none',
          transition: 'all .3s',
        }}
      />
    );
  };
  const edge = (x1, y1, x2, y2, hot, k) => (
    <line
      key={k}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={hot ? 'var(--gold)' : 'var(--line-2)'}
      strokeWidth={hot ? 2 : 1}
      opacity={hot ? 0.85 : 0.5}
      style={{ transition: '.3s' }}
    />
  );
  return (
    <div>
      <div className="tor-figlabel" style={{ marginBottom: 8 }}>
        <GitBranch size={13} aria-hidden="true" />
        <b>Merkle tree</b> · tap a piece to see its proof
      </div>
      <div className="tor-svgwrap">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="group"
          aria-label="merkle tree over eight piece hashes"
        >
          {[0, 1, 2, 3].map((j) => (
            <g key={'el' + j}>
              {edge(xLeaf(2 * j), yLeaf, xL1(j), yL1, pathL1 === j && pathLeaf === 2 * j, 'a')}
              {edge(
                xLeaf(2 * j + 1),
                yLeaf,
                xL1(j),
                yL1,
                pathL1 === j && pathLeaf === 2 * j + 1,
                'b',
              )}
            </g>
          ))}
          {[0, 1].map((j) => (
            <g key={'e1' + j}>
              {edge(xL1(2 * j), yL1, xL2(j), yL2, pathL2 === j && pathL1 === 2 * j, 'a')}
              {edge(xL1(2 * j + 1), yL1, xL2(j), yL2, pathL2 === j && pathL1 === 2 * j + 1, 'b')}
            </g>
          ))}
          {edge(xL2(0), yL2, xRoot, yRoot, pathL2 === 0, 'r0')}
          {edge(xL2(1), yL2, xRoot, yRoot, pathL2 === 1, 'r1')}
          {node(xRoot, yRoot, 'path', 11)}
          <circle
            cx={xRoot}
            cy={yRoot}
            r="16"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.8"
          />
          <text x={xRoot} y={yRoot - 22} textAnchor="middle" fontSize="9.5" fill="var(--gold-2)">
            root commitment
          </text>
          {[0, 1].map((j) =>
            node(xL2(j), yL2, pathL2 === j ? 'path' : sibL2 === j ? 'sib' : 'none', 8, 'l2' + j),
          )}
          {[0, 1, 2, 3].map((j) =>
            node(xL1(j), yL1, pathL1 === j ? 'path' : sibL1 === j ? 'sib' : 'none', 8, 'l1' + j),
          )}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <g
              key={'lf' + i}
              style={{ cursor: 'pointer' }}
              onClick={() => setSel(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSel(i);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Show proof for piece ${i}`}
              aria-pressed={sel === i}
            >
              <rect
                x={xLeaf(i) - 15}
                y={yLeaf - 13}
                width="30"
                height="26"
                rx="5"
                fill="transparent"
              />
              {node(xLeaf(i), yLeaf, pathLeaf === i ? 'path' : sibLeaf === i ? 'sib' : 'none')}
              <text
                x={xLeaf(i)}
                y={yLeaf + 24}
                textAnchor="middle"
                fontSize="8.5"
                fill={
                  pathLeaf === i
                    ? 'var(--gold-2)'
                    : sibLeaf === i
                      ? 'var(--signal-2)'
                      : 'var(--faint)'
                }
              >
                p{i}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div
        className="tor-row"
        style={{ gap: 16, marginTop: 4, fontSize: 11.5, fontFamily: 'var(--font-mono)' }}
      >
        <span style={{ color: 'var(--gold-2)' }}>● recompute path</span>
        <span style={{ color: 'var(--signal-2)' }}>● proof you're handed</span>
        <span style={{ color: 'var(--faint)' }}>● untouched</span>
      </div>
      <div
        style={{
          marginTop: 14,
          padding: '12px 14px',
          background: 'var(--void)',
          borderRadius: 10,
          border: '1px solid var(--line)',
        }}
      >
        <div style={{ fontSize: 13, color: 'var(--star)', marginBottom: 8 }}>
          To prove <b style={{ color: 'var(--gold-2)' }}>piece {sel}</b> belongs to this file, a
          peer sends the piece plus just <b>3</b> sibling hashes:
        </div>
        <div style={{ display: 'grid', gap: 5 }}>
          {siblings.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--signal-2)',
                  minWidth: 54,
                }}
              >
                {s.lvl}
              </span>
              <span
                style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--mist)' }}
              >
                {s.h.slice(0, 24)}…
              </span>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'baseline',
              marginTop: 4,
              paddingTop: 8,
              borderTop: '1px solid var(--line)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--gold-2)',
                minWidth: 54,
              }}
            >
              = root
            </span>
            <span
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--gold-2)' }}
            >
              {root.slice(0, 24)}…
            </span>
          </div>
        </div>
      </div>
      <div className="tor-figcap" style={{ marginTop: 14 }}>
        Hash the piece, fold in each sibling on the way up, and you rebuild the{' '}
        <span style={{ color: 'var(--gold-2)' }}>root</span>. If it matches the root named by the
        magnet link, the piece is authentic — proven with only <b>3</b> hashes, not all 8. For a
        file of a million pieces that's about <b>20</b> hashes. This is what version 2 buys by
        hashing with SHA-256 in a tree instead of keeping one flat list.
      </div>
    </div>
  );
}

// Map the engine's icon keys to lucide components (the engine stays JSX-free).
const ICONS = {
  magnet: Magnet,
  compass: Compass,
  share: Share2,
  verify: ShieldCheck,
  pieces: Boxes,
};

// Resolving a magnet link from nothing but a hash, step by step. The step text
// and mono one-liners come from the engine; the icons are chosen here.
function MagnetResolve() {
  const steps = useMemo(() => magnetSteps(), []);
  const [step, setStep] = useState(0);
  return (
    <div>
      <div className="tor-between" style={{ marginBottom: 14 }}>
        <div className="tor-figlabel" style={{ margin: 0 }}>
          <Magnet size={13} aria-hidden="true" />
          <b>resolving a magnet link</b>
        </div>
        <div className="tor-row" style={{ gap: 8 }}>
          <button
            className="tor-btn"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Back
          </button>
          <button
            className="tor-btn tor-primary"
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            disabled={step === steps.length - 1}
          >
            <ArrowRight size={14} aria-hidden="true" />
            Next
          </button>
          <button
            className="tor-btn"
            onClick={() => setStep(0)}
            disabled={step === 0}
            aria-label="Restart from the first step"
          >
            <RotateCcw size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {steps.map((s, i) => {
          const Icon = ICONS[s.icon];
          const on = i === step;
          const done = i < step;
          return (
            <div
              key={i}
              onClick={() => setStep(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setStep(i);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Step ${i + 1}`}
              aria-current={on ? 'step' : undefined}
              style={{
                cursor: 'pointer',
                display: 'flex',
                gap: 13,
                alignItems: 'flex-start',
                padding: '13px 15px',
                borderRadius: 11,
                transition: '.25s',
                background: on ? 'var(--signal-dim)' : 'transparent',
                border: `1px solid ${on ? 'rgba(84,210,193,0.4)' : 'var(--line)'}`,
                opacity: on || done ? 1 : 0.5,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  background: on
                    ? 'rgba(84,210,193,0.18)'
                    : done
                      ? 'var(--gold-dim)'
                      : 'var(--panel-2)',
                  color: on ? 'var(--signal-2)' : done ? 'var(--gold-2)' : 'var(--faint)',
                  border: `1px solid ${on ? 'rgba(84,210,193,0.4)' : done ? 'rgba(236,185,95,0.3)' : 'var(--line-2)'}`,
                }}
              >
                {done ? (
                  <ShieldCheck size={15} aria-hidden="true" />
                ) : (
                  <Icon size={15} aria-hidden="true" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: on ? 'var(--star)' : 'var(--mist)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: on ? 'var(--signal-2)' : 'var(--faint)',
                      marginRight: 8,
                    }}
                  >
                    {i + 1}
                  </span>
                  {s.t}
                </div>
                {on && (
                  <>
                    <div style={{ fontSize: 13, color: '#c3cad8', lineHeight: 1.55, marginTop: 5 }}>
                      {s.d}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11.5,
                        color: 'var(--signal-2)',
                        marginTop: 8,
                        wordBreak: 'break-all',
                        background: 'var(--void)',
                        padding: '7px 10px',
                        borderRadius: 7,
                        border: '1px solid var(--line)',
                      }}
                    >
                      {s.mono}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="tor-figcap" style={{ marginTop: 14 }}>
        Every layer — discovery, metadata, each piece — is checked against the infohash you began
        with. A string of about <b>sixty-four characters</b> bootstraps a complete, self-verifying
        download of a file held by strangers. The bottom turtle is content addressing, all the way
        down.
      </div>
    </div>
  );
}

// §09 — the v2 lab: the Merkle proof and the magnet-resolve walkthrough together.
export default function V2Lab() {
  return (
    <div>
      <MerkleTree />
      <div
        style={{
          height: 1,
          background: 'linear-gradient(90deg,transparent,var(--line-2),transparent)',
          margin: '26px 0',
        }}
      />
      <MagnetResolve />
    </div>
  );
}
