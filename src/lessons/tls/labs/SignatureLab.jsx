import { useState } from 'react';
import { Globe, KeyRound, Hash, PenLine, AlertTriangle, RotateCcw } from 'lucide-react';
import { modpow, rsaHash, rsaSign, RSA } from '../engine/index.js';
import Row from '../components/Row.jsx';
import Verdict from '../components/Verdict.jsx';

// Pick a random signature-sized number. Uses Math.random, so it stays here in
// the lab rather than in the pure engine.
function randBig(max) {
  return BigInt(1 + Math.floor(Math.random() * (Number(max) - 2)));
}

// §5 — RSA signatures: sign with the private key, verify with the public key.
// Sign a message, tamper with it, then try to forge a signature without the key.
export default function SignatureLab() {
  const [message, setMessage] = useState('I am the real bank.');
  const [signedSig, setSignedSig] = useState(null);
  const [signedMsg, setSignedMsg] = useState(null);
  const [forged, setForged] = useState(null);

  const activeSig = forged !== null ? forged : signedSig;
  const h = rsaHash(message);
  const recomputed = activeSig !== null ? modpow(activeSig, RSA.e, RSA.n) : null;
  const verified = activeSig !== null && recomputed === h;
  const edited =
    signedSig !== null && forged === null && signedMsg !== null && message !== signedMsg;

  const sign = () => {
    setSignedSig(rsaSign(message));
    setSignedMsg(message);
    setForged(null);
  };
  const guess = () => setForged(randBig(RSA.n));
  const reset = () => {
    setSignedSig(null);
    setSignedMsg(null);
    setForged(null);
  };

  return (
    <div className="tls-panel tls-rv" style={{ padding: 18 }}>
      {/* keys */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <span className="tls-chip" style={{ borderColor: 'var(--aqua-deep)' }}>
          <Globe size={12} style={{ color: 'var(--aqua)' }} /> public key&nbsp;
          <b style={{ color: 'var(--aqua-bright)' }}>
            e={RSA.e.toString()}, n={RSA.n.toString()}
          </b>
        </span>
        <span className="tls-chip" style={{ borderColor: 'var(--brass-deep)' }}>
          <KeyRound size={12} style={{ color: 'var(--brass)' }} /> private key&nbsp;
          <b style={{ color: 'var(--brass-bright)' }}>d = ••••</b> (only the bank has it)
        </span>
      </div>

      <label
        className="tls-mono"
        style={{ fontSize: 10.5, letterSpacing: '.14em', color: 'var(--bone-faint)' }}
      >
        SERVER'S MESSAGE
      </label>
      <input
        className="tls-input"
        aria-label="Server's message to sign"
        style={{ marginTop: 6 }}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div
        className="tls-mono"
        style={{ fontSize: 11.5, color: 'var(--bone-faint)', marginTop: 7 }}
      >
        <Hash size={11} style={{ verticalAlign: 'middle' }} /> hash(message) ={' '}
        <b style={{ color: edited ? 'var(--verm-bright)' : 'var(--bone-dim)' }}>{h.toString()}</b>
        <span style={{ color: 'var(--bone-faint)' }}> (real TLS hashes with SHA-256)</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '14px 0' }}>
        <button className="tls-btn" onClick={sign}>
          <PenLine size={14} />
          Sign with private key
        </button>
        {signedSig !== null && (
          <button className="tls-btn ghost" onClick={guess}>
            <AlertTriangle size={14} />
            Forge (no private key)
          </button>
        )}
        {(signedSig !== null || forged !== null) && (
          <button className="tls-btn ghost" onClick={reset}>
            <RotateCcw size={14} />
            Reset
          </button>
        )}
      </div>

      {activeSig !== null && (
        <div className="tls-inset" style={{ padding: 14 }}>
          <Row label="SIGNATURE ON WIRE" color={forged !== null ? 'var(--verm)' : 'var(--brass)'}>
            <span
              className="tls-mono"
              style={{
                fontSize: 13,
                color: forged !== null ? 'var(--verm-bright)' : 'var(--brass-bright)',
              }}
            >
              {activeSig.toString()} {forged !== null ? '(a wild guess)' : '= hash^d mod n'}
            </span>
          </Row>
          <div style={{ height: 1, background: 'var(--line-soft)', margin: '11px 0' }} />
          <div
            className="tls-mono"
            style={{ fontSize: 12.5, color: 'var(--bone-dim)', lineHeight: 1.8 }}
          >
            verify: signature<sup>e</sup> mod n ={' '}
            <b style={{ color: 'var(--bone)' }}>{recomputed.toString()}</b>
            <br />
            compare to hash(message) = <b style={{ color: 'var(--bone)' }}>{h.toString()}</b>
          </div>
          <div style={{ marginTop: 10 }}>
            <Verdict ok={verified} />
          </div>
          {!verified && (
            <p
              className="tls-prose"
              style={{ fontSize: 12.5, marginTop: 8, lineHeight: 1.5, color: 'var(--verm-bright)' }}
            >
              {forged !== null
                ? 'No private key, so the best you can do is guess. For the real 2048-bit key there are more candidates than atoms in the universe.'
                : 'The message changed after signing, so its hash no longer matches what was signed. The forgery is caught.'}
            </p>
          )}
          {verified && (
            <p className="tls-prose" style={{ fontSize: 12.5, marginTop: 8, lineHeight: 1.5 }}>
              Only the holder of the private key could have produced this, and the message is
              unaltered. <strong>Authenticity and integrity, in one move.</strong>
            </p>
          )}
        </div>
      )}

      <p className="tls-prose" style={{ fontSize: 13, marginTop: 14, lineHeight: 1.6 }}>
        The catch: an attacker can generate <em>their own</em> keypair and sign just as validly with
        it, so a good signature only proves "I hold the private key behind <strong>this</strong>{' '}
        public key." It relocates the question. No longer <em>is this message authentic?</em> but{' '}
        <em>whose public key is this, really?</em> A certificate answers exactly that.
      </p>
    </div>
  );
}
