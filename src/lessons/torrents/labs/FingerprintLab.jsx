import { useMemo, useState } from 'react';
import { AlertTriangle, RotateCcw, Boxes, ShieldCheck, X, KeyRound } from 'lucide-react';
import { sha, diffChars, infohashOf, corruptByte, ORIG_PIECE } from '../engine/index.js';

// Show the received digest `b` against the expected `a`, painting differing
// characters coral — the avalanche effect. diffChars does the comparison.
function HashDiff({ a, b }) {
  return (
    <span>
      {diffChars(a, b).map((c, i) => (
        <span
          key={i}
          style={{
            color: c.same ? 'var(--signal-2)' : 'var(--coral-2)',
            background: c.same ? 'transparent' : 'rgba(244,113,93,0.16)',
          }}
        >
          {c.ch}
        </span>
      ))}
    </span>
  );
}

// §02 — content addressing. Hash the bytes you received; if the fingerprint
// matches the one named in the .torrent, keep the piece — you trust the math,
// never the stranger. Tampering also shifts the infohash of the whole torrent.
export default function FingerprintLab() {
  const expected = useMemo(() => sha(ORIG_PIECE), []);
  const [recv, setRecv] = useState(ORIG_PIECE);
  const got = useMemo(() => sha(recv), [recv]);
  const ok = got === expected;
  const infohash = useMemo(() => infohashOf(recv), [recv]);
  return (
    <div>
      <div className="tor-between" style={{ marginBottom: 12 }}>
        <div className="tor-figlabel" style={{ margin: 0 }}>
          <Boxes size={13} aria-hidden="true" />
          <b>piece #0x104C</b> received from a stranger
        </div>
        <div className="tor-row" style={{ gap: 8 }}>
          <button className="tor-btn" onClick={() => setRecv((r) => corruptByte(r))}>
            <AlertTriangle size={14} aria-hidden="true" />
            Corrupt a byte
          </button>
          <button className="tor-btn" onClick={() => setRecv(ORIG_PIECE)} disabled={ok}>
            <RotateCcw size={14} aria-hidden="true" />
            Restore
          </button>
        </div>
      </div>
      <textarea
        className="tor-textarea"
        value={recv}
        onChange={(e) => setRecv(e.target.value)}
        spellCheck={false}
        aria-label="Received piece bytes — edit to corrupt the piece"
      />

      <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <div>
          <div className="tor-figlabel" style={{ marginBottom: 6 }}>
            SHA-256 of the bytes you received
          </div>
          <div className="tor-hashbox" style={{ color: ok ? 'var(--signal-2)' : 'var(--coral-2)' }}>
            <HashDiff a={expected} b={got} />
          </div>
        </div>
        <div>
          <div className="tor-figlabel" style={{ marginBottom: 6 }}>
            the fingerprint listed in the .torrent for this piece
          </div>
          <div className="tor-hashbox tor-dim">{expected}</div>
        </div>
        <div className="tor-between" style={{ marginTop: 2 }}>
          {ok ? (
            <span className="tor-badge tor-ok">
              <ShieldCheck size={15} aria-hidden="true" />
              VERIFIED — keep the piece
            </span>
          ) : (
            <span className="tor-badge tor-bad">
              <X size={15} aria-hidden="true" />
              REJECTED — discard, distrust the peer
            </span>
          )}
          <div className="tor-chip">
            <KeyRound size={11} style={{ color: 'var(--gold)' }} aria-hidden="true" />
            infohash&nbsp;
            <span style={{ color: ok ? 'var(--gold-2)' : 'var(--coral-2)' }}>
              {infohash.slice(0, 16)}…
            </span>
          </div>
        </div>
      </div>
      <div className="tor-figcap" style={{ marginTop: 14 }}>
        Change a single character and the whole fingerprint scrambles — that's the avalanche effect.
        You never have to trust the stranger; you trust the math. Notice the{' '}
        <span style={{ color: 'var(--gold-2)' }}>infohash</span> — the hash of all the
        piece-fingerprints together — shifts too. Tampering anywhere changes the name of the whole
        torrent.
      </div>
    </div>
  );
}
