import { useState, useMemo } from 'react';
import { Shield, ShieldAlert, ArrowDown, Eye, EyeOff, Zap, Check, Skull } from 'lucide-react';
import { strBytes, sha256Words, wordsToHex, forgeExtension } from '../engine/index.js';
import Figure from '../components/Figure.jsx';

// 32 bytes, "known" only to the server in the scenario.
const SECRET = strBytes('SUPER_SECRET_KEY_32CHARS_LONG!!!');

function bytesToHexDots(bytes, max = 16) {
  let s = '';
  for (let i = 0; i < bytes.length && i < max; i++) s += bytes[i].toString(16).padStart(2, '0');
  if (bytes.length > max) s += '…';
  return s;
}

export default function LengthExtensionLab() {
  const msg = 'user=guest&role=viewer';
  const msgBytes = useMemo(() => strBytes(msg), []);
  const macWords = useMemo(() => sha256Words(new Uint8Array([...SECRET, ...msgBytes])), [msgBytes]);
  const macHex = wordsToHex(macWords);

  const [ext, setExt] = useState('&role=admin');
  const [forged, setForged] = useState(null);
  const [revealSecret, setRevealSecret] = useState(false);

  const doForge = () => {
    const extBytes = strBytes(ext);
    const { forgedHex, glue } = forgeExtension(macWords, SECRET.length, msgBytes, extBytes);
    // independent ground truth: server hashing secret || msg || glue || ext
    const real = wordsToHex(
      sha256Words(new Uint8Array([...SECRET, ...msgBytes, ...glue, ...extBytes])),
    );
    setForged({ forgedHex, glue, real, match: forgedHex === real, extBytes });
  };

  return (
    <Figure
      label="Fig. 5 · The attack"
      title="Forging a signature without knowing the secret"
      foot={
        <>
          The attacker never learns a single byte of the secret, only its <em>length</em>. Because
          the digest
          <em> is</em> the final state of the assembly line, the attacker simply restarts the line
          from there and keeps stamping. The "glue" bytes are the original padding, now sitting in
          the middle of a longer, validly-signed message. This is not a flaw in SHA-256's mixing; it
          is a flaw in using it raw as <code className="ic">H(secret ‖ msg)</code>.
        </>
      }
    >
      {/* server side */}
      <div
        style={{
          border: '1px solid var(--line)',
          borderRadius: 10,
          padding: '13px 14px',
          background: 'var(--panel)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
          <Shield size={14} style={{ color: 'var(--steel)' }} />
          <span style={{ fontFamily: 'var(--slab)', fontWeight: 600, color: 'var(--bone)' }}>
            The server
          </span>
          <span className="chip ste" style={{ marginLeft: 'auto' }}>
            signs with a secret
          </span>
        </div>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 12.5,
            color: 'var(--bone-dim)',
            lineHeight: 1.9,
          }}
        >
          <div>
            secret&nbsp;={' '}
            <span
              role="button"
              tabIndex={0}
              aria-label={revealSecret ? 'Hide secret' : 'Reveal secret'}
              aria-pressed={revealSecret}
              style={{ color: 'var(--steel)' }}
              onClick={() => setRevealSecret((r) => !r)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setRevealSecret((r) => !r);
                }
              }}
            >
              {revealSecret ? '"SUPER_SECRET_KEY_32CHARS_LONG!!!"' : '•••••••••••••••• (32 bytes)'}
            </span>
            <span
              role="button"
              tabIndex={0}
              aria-label={revealSecret ? 'Hide secret' : 'Reveal secret'}
              aria-pressed={revealSecret}
              style={{ cursor: 'pointer', marginLeft: 6, color: 'var(--bone-faint)' }}
              onClick={() => setRevealSecret((r) => !r)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setRevealSecret((r) => !r);
                }
              }}
            >
              {revealSecret ? <EyeOff size={11} /> : <Eye size={11} />}
            </span>
          </div>
          <div>
            message = <span style={{ color: 'var(--bone)' }}>"{msg}"</span>
          </div>
          <div>tag&nbsp;&nbsp;&nbsp;&nbsp;= H(secret ‖ message)</div>
          <div style={{ color: 'var(--copper-bright)', wordBreak: 'break-all' }}>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= {macHex}
          </div>
        </div>
      </div>

      <ArrowDown
        size={18}
        style={{ color: 'var(--cerise)', display: 'block', margin: '10px auto' }}
      />

      {/* attacker side */}
      <div
        style={{
          border: '1px solid rgba(245,71,111,0.35)',
          borderRadius: 10,
          padding: '13px 14px',
          background: 'rgba(245,71,111,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <ShieldAlert size={14} style={{ color: 'var(--cerise)' }} />
          <span style={{ fontFamily: 'var(--slab)', fontWeight: 600, color: 'var(--bone)' }}>
            The attacker
          </span>
          <span className="chip cer" style={{ marginLeft: 'auto' }}>
            knows tag, message, secret-length only
          </span>
        </div>
        <label className="field-label" style={{ color: 'var(--cerise)' }}>
          append this to the message
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="field"
            aria-label="Text to append to the message"
            value={ext}
            maxLength={40}
            spellCheck={false}
            onChange={(e) => {
              setExt(e.target.value);
              setForged(null);
            }}
          />
          <button className="btn primary" onClick={doForge} style={{ flexShrink: 0 }}>
            <Zap size={13} /> Forge
          </button>
        </div>

        {forged && (
          <div style={{ marginTop: 12, fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.8 }}>
            <div style={{ color: 'var(--bone-faint)' }}>
              forged message = message ‖{' '}
              <span style={{ color: 'var(--steel)' }} title="original padding">
                glue({bytesToHexDots(forged.glue, 6)})
              </span>{' '}
              ‖ <span style={{ color: 'var(--cerise-bright)' }}>"{ext}"</span>
            </div>
            <div style={{ marginTop: 6, color: 'var(--bone-dim)' }}>
              forged tag ={' '}
              <span style={{ color: 'var(--cerise-bright)', wordBreak: 'break-all' }}>
                {forged.forgedHex}
              </span>
            </div>
            <div style={{ color: 'var(--bone-dim)' }}>
              server tag ={' '}
              <span style={{ color: 'var(--bone)', wordBreak: 'break-all' }}>{forged.real}</span>
            </div>
            <div
              style={{
                marginTop: 9,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 11px',
                borderRadius: 8,
                background: forged.match ? 'rgba(245,71,111,0.12)' : 'var(--jade-glow)',
                border: '1px solid ' + (forged.match ? 'var(--cerise)' : 'var(--jade)'),
              }}
            >
              {forged.match ? (
                <Skull size={14} style={{ color: 'var(--cerise)' }} />
              ) : (
                <Check size={14} style={{ color: 'var(--jade)' }} />
              )}
              <span
                style={{
                  color: forged.match ? 'var(--cerise-bright)' : 'var(--jade)',
                  fontWeight: 600,
                  fontFamily: 'var(--sans)',
                }}
              >
                {forged.match ? 'The server accepts the forgery. Tags match exactly.' : 'No match.'}
              </span>
            </div>
          </div>
        )}
      </div>
    </Figure>
  );
}
