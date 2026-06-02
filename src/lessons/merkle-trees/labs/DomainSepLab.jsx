import { useMemo, useState } from 'react';
import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { hashLeaf, hashNode } from '../engine/index.js';
import Plate from '../components/Plate.jsx';

// The second-preimage trap (Bitcoin CVE-2012-2459): without domain separation,
// an attacker can present a leaf whose data is the concatenation of two child
// hashes, and it collides with the real internal node. Toggle to watch the
// 1-byte tag (0x00 leaves, 0x01 nodes) close the gap.
export default function DomainSepLab() {
  const [sep, setSep] = useState(false);
  const cL = useMemo(() => hashLeaf('left-child', sep), [sep]);
  const cR = useMemo(() => hashLeaf('right-child', sep), [sep]);
  const realNode = hashNode(cL, cR, sep);
  // attacker presents a *leaf* whose data is exactly the concatenation of the two child hashes
  const forgedLeaf = hashLeaf(cL + cR, sep);
  const collides = realNode === forgedLeaf;

  return (
    <Plate style={{ padding: 22 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div className="mk-mono" style={{ fontSize: 12, color: 'var(--paper-dim)' }}>
          domain separation
        </div>
        <button
          className={`mk-btn ${sep ? 'active' : 'cinnabar'}`}
          onClick={() => setSep((s) => !s)}
        >
          {sep ? (
            <>
              <ShieldCheck size={13} /> ON: leaves tagged 0x00, nodes 0x01
            </>
          ) : (
            <>
              <ShieldAlert size={13} /> OFF: same hash for both
            </>
          )}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        <div
          style={{
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
              color: 'var(--paper-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 6,
            }}
          >
            genuine internal node
          </div>
          <div className="mk-mono" style={{ fontSize: 12.5, color: 'var(--patina)' }}>
            H{sep ? '(0x01 ‖ ' : '('}
            <span style={{ color: 'var(--paper-dim)' }}>
              {cL.slice(0, 6)} ‖ {cR.slice(0, 6)}
            </span>
            ) = <span style={{ color: 'var(--gold-bright)' }}>{realNode.slice(0, 8)}</span>
          </div>
        </div>
        <div
          style={{
            background: 'var(--ink-2)',
            border: `1px solid ${collides ? 'var(--cinnabar)' : 'var(--line)'}`,
            borderRadius: 4,
            padding: '12px 14px',
          }}
        >
          <div
            className="mk-mono"
            style={{
              fontSize: 10.5,
              color: 'var(--paper-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 6,
            }}
          >
            attacker's forged leaf (data = the two child hashes glued)
          </div>
          <div className="mk-mono" style={{ fontSize: 12.5, color: 'var(--cinnabar)' }}>
            H{sep ? '(0x00 ‖ ' : '('}
            <span style={{ color: 'var(--paper-dim)' }}>{(cL + cR).slice(0, 13)}…</span>) ={' '}
            <span style={{ color: collides ? 'var(--cinnabar)' : 'var(--patina)' }}>
              {forgedLeaf.slice(0, 8)}
            </span>
          </div>
        </div>
      </div>

      <div
        className="mk-mono"
        style={{
          marginTop: 14,
          fontSize: 12.5,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: collides ? 'var(--cinnabar)' : 'var(--patina)',
        }}
      >
        {collides ? (
          <>
            <AlertTriangle size={15} /> COLLISION: the forged leaf and the real node share a digest.
            The structure can be spoofed.
          </>
        ) : (
          <>
            <ShieldCheck size={15} /> SAFE: the 1-byte tag makes leaf and node digests live in
            separate universes. No confusion possible.
          </>
        )}
      </div>
    </Plate>
  );
}
