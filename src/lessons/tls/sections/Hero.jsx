import { useState, useEffect } from 'react';
import { Globe, Server } from 'lucide-react';
import Channel from '../components/Channel.jsx';
import LockBadge from '../components/LockBadge.jsx';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';

// Hero — the channel toggles sealed<->open on mount via setInterval. Gated by
// prefers-reduced-motion: when reduced, hold a fixed sealed frame instead of
// autoplaying.
export default function Hero() {
  const reduced = usePrefersReducedMotion();
  const [sealed, setSealed] = useState(false);
  useEffect(() => {
    if (reduced) {
      setSealed(true); // reduced motion: render a fixed sealed frame, no toggling
      return;
    }
    const t = setInterval(() => setSealed((s) => !s), 2600);
    return () => clearInterval(t);
  }, [reduced]);
  return (
    <header className="tls-padtop" style={{ paddingTop: 'max(74px, 9vh)', paddingBottom: 56 }}>
      <div className="tls-wrap">
        <div className="tls-eyebrow tls-rv tls-in">
          <span className="tls-dash" />
          IETF · RFC 8446 · how HTTPS keeps a secret
        </div>
        <h1
          className="tls-display tls-rv tls-in"
          style={{ fontSize: 'clamp(44px,9vw,92px)', marginTop: 22, transitionDelay: '.05s' }}
        >
          The sealed
          <br />
          <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--aqua)' }}>
            channel.
          </span>
        </h1>
        <p
          className="tls-lede tls-rv tls-in"
          style={{ marginTop: 26, maxWidth: 590, transitionDelay: '.12s' }}
        >
          Two strangers who have never met, on a wire that dozens of unknown machines can read and
          rewrite, build a private room. Nobody can read it. Nobody can tamper with it unseen, and
          it provably reaches the right party. This is how.
        </p>

        <div
          className="tls-panel tls-rv tls-in"
          style={{ marginTop: 40, padding: '22px 22px', transitionDelay: '.2s' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                className="tls-mono"
                style={{ fontSize: 11, color: 'var(--bone-faint)', letterSpacing: '.16em' }}
              >
                YOU
              </div>
              <Globe size={18} style={{ color: 'var(--bone-dim)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <Channel
                tone={sealed ? 'sealed' : 'exposed'}
                label={sealed ? 'ENCRYPTED' : 'PLAINTEXT'}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Server size={18} style={{ color: 'var(--bone-dim)' }} />
              <div
                className="tls-mono"
                style={{ fontSize: 11, color: 'var(--bone-faint)', letterSpacing: '.16em' }}
              >
                BANK
              </div>
              <LockBadge state={sealed ? 'sealed' : 'open'} animate={sealed} />
            </div>
          </div>
          <div
            className="tls-mono"
            style={{
              fontSize: 11,
              color: sealed ? 'var(--aqua)' : 'var(--bone-faint)',
              marginTop: 14,
              transition: 'color .4s',
            }}
          >
            {sealed
              ? 'https://  ·  anyone on the path sees only noise'
              : 'http://  ·  every hop can read and alter the message'}
          </div>
        </div>

        <p
          className="tls-prose tls-rv tls-in"
          style={{ marginTop: 26, maxWidth: 660, fontSize: 14.5, transitionDelay: '.26s' }}
        >
          A note on the name. <strong>SSL</strong> is the dead ancestor (Netscape, mid-90s, all
          broken). The living protocol is
          <strong> TLS</strong>: Transport Layer Security, now TLS 1.3. Everyone still says "SSL"
          out of habit. Throughout, we mean TLS.
        </p>
      </div>
    </header>
  );
}
