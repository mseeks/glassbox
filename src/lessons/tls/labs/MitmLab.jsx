import { useState } from 'react';
import { Globe, Server, Eye, PenLine, UserMinus, ArrowRight } from 'lucide-react';
import { modpow, DH_P, DH_G, MSG, MSG_TAMPERED } from '../engine/index.js';
import LockBadge from '../components/LockBadge.jsx';
import Channel from '../components/Channel.jsx';

// §4 — the gap in key exchange: an attacker runs one exchange with the client
// and another with the server, sitting in the middle of two "secure" channels.
export default function MitmLab() {
  const [mitm, setMitm] = useState(false);
  const K1 = modpow(modpow(DH_G, 9n, DH_P), 6n, DH_P); // client ↔ attacker
  const K2 = modpow(modpow(DH_G, 4n, DH_P), 15n, DH_P); // attacker ↔ server
  const Kee = modpow(modpow(DH_G, 6n, DH_P), 15n, DH_P); // honest client ↔ server

  return (
    <div className="tls-panel tls-rv" style={{ padding: 18 }}>
      <button
        className={`tls-segbtn ${mitm ? 'on-verm' : ''}`}
        style={{
          width: '100%',
          justifyContent: 'center',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          padding: 10,
          marginBottom: 14,
        }}
        onClick={() => setMitm((v) => !v)}
      >
        {mitm ? <UserMinus size={14} /> : <ArrowRight size={14} />}
        {mitm ? 'a man-in-the-middle is on the wire' : 'insert a man-in-the-middle'}
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* CLIENT */}
        <div className="tls-party">
          <div className="nm">
            <Globe size={13} />
            CLIENT
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <LockBadge state="sealed" size={18} />
            <div>
              <div className="tls-mono" style={{ fontSize: 12, color: 'var(--aqua-bright)' }}>
                shares secret = {mitm ? K1.toString() : Kee.toString()}
              </div>
              <div style={{ fontSize: 13, color: 'var(--bone)' }}>sends "{MSG}"</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '6px 0 6px 22px' }}>
          <Channel
            tone={mitm ? 'sealed' : 'sealed'}
            label={mitm ? 'sealed to the attacker' : 'sealed end-to-end'}
          />
        </div>

        {/* ATTACKER (only when present) */}
        {mitm && (
          <>
            <div
              className="tls-party"
              style={{ borderColor: 'var(--verm)', background: 'var(--wash-verm-06)' }}
            >
              <div className="nm" style={{ color: 'var(--verm)' }}>
                <UserMinus size={13} />
                MAN IN THE MIDDLE
              </div>
              <div className="tls-mono" style={{ fontSize: 11.5, color: 'var(--verm-bright)' }}>
                holds K1 = {K1.toString()} <span style={{ color: 'var(--bone-faint)' }}>and</span>{' '}
                K2 = {K2.toString()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <Eye size={13} style={{ color: 'var(--verm)' }} />
                <span style={{ fontSize: 13, color: 'var(--bone)' }}>reads: "{MSG}"</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <PenLine size={13} style={{ color: 'var(--verm)' }} />
                <span style={{ fontSize: 13, color: 'var(--verm-bright)' }}>
                  rewrites → "{MSG_TAMPERED}"
                </span>
              </div>
            </div>
            <div style={{ padding: '6px 0 6px 22px' }}>
              <Channel tone="sealed" label="sealed to the attacker" />
            </div>
          </>
        )}

        {/* SERVER */}
        <div className="tls-party">
          <div className="nm">
            <Server size={13} />
            SERVER
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <LockBadge state="sealed" size={18} />
            <div>
              <div className="tls-mono" style={{ fontSize: 12, color: 'var(--aqua-bright)' }}>
                shares secret = {mitm ? K2.toString() : Kee.toString()}
              </div>
              <div style={{ fontSize: 13, color: mitm ? 'var(--verm-bright)' : 'var(--bone)' }}>
                receives "{mitm ? MSG_TAMPERED : MSG}"
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="tls-inset"
        style={{
          marginTop: 14,
          padding: 13,
          borderColor: mitm ? 'var(--verm-deep)' : 'var(--line-soft)',
        }}
      >
        <p className="tls-prose" style={{ fontSize: 13.5, margin: 0, lineHeight: 1.55 }}>
          {mitm ? (
            <>
              Both padlocks are shut. Both ends believe the channel is private, and it <em>is</em>,
              to the attacker. The two secrets ({K1.toString()} and {K2.toString()}) never match,
              yet neither side can tell. Diffie–Hellman proved they agreed a secret with{' '}
              <em>whoever answered</em>. It never checked <strong>who</strong> answered.
            </>
          ) : (
            <>
              One shared secret ({Kee.toString()}), held end to end, but only because nobody chose
              to sit in the middle and split the exchange in two. Nothing here{' '}
              <strong>proved who was on the other side.</strong> Flip the switch above.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
