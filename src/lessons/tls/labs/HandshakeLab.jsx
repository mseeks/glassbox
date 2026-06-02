import { useState, useEffect } from 'react';
import { Globe, Server, Lock, ChevronRight, Play, Pause } from 'lucide-react';
import LockBadge from '../components/LockBadge.jsx';

const HS = {
  1.3: {
    rtt: '1-RTT',
    steps: [
      {
        dir: '→',
        label: 'ClientHello',
        detail: 'cipher menu + the client’s ephemeral key share + a random nonce',
        kills: 'opens key exchange',
        prim: 'ECDHE',
        enc: false,
      },
      {
        dir: '←',
        label: 'ServerHello',
        detail:
          'chosen cipher + the server’s ephemeral key share — both sides can now derive the same secret',
        kills: 'Confidentiality',
        prim: 'ECDHE + HKDF',
        enc: false,
      },
      {
        dir: '←',
        label: '{Certificate}',
        detail: 'the server’s certificate chain — and in 1.3 it is already encrypted',
        kills: 'Authenticity',
        prim: 'X.509 chain',
        enc: true,
      },
      {
        dir: '←',
        label: '{CertificateVerify}',
        detail: 'a signature over everything said so far, made with the certificate’s private key',
        kills: 'Authenticity',
        prim: 'signature',
        enc: true,
      },
      {
        dir: '←',
        label: '{Finished}',
        detail:
          'a MAC over the whole transcript — proof not one byte of the negotiation was altered',
        kills: 'Integrity',
        prim: 'HMAC / HKDF',
        enc: true,
      },
      {
        dir: '→',
        label: '{Finished}',
        detail: 'the client’s matching MAC, sealing the handshake from both sides',
        kills: 'Integrity',
        prim: 'HMAC / HKDF',
        enc: true,
      },
      {
        dir: '⇄',
        label: 'Application Data',
        detail:
          'your HTTP request and the bank’s reply, encrypted under keys grown from the shared secret',
        kills: 'all three',
        prim: 'AES-GCM',
        enc: true,
      },
    ],
    note: 'Forward secrecy: the ephemeral key shares are thrown away after the handshake. Steal the server’s long-term private key a year from now and today’s recording stays unreadable.',
  },
  1.2: {
    rtt: '2-RTT',
    steps: [
      {
        dir: '→',
        label: 'ClientHello',
        detail: 'cipher menu + a random nonce',
        kills: '—',
        prim: '',
        enc: false,
      },
      {
        dir: '←',
        label: 'ServerHello · Certificate · ServerKeyExchange',
        detail:
          'cipher choice, the certificate in the clear, and the server’s signed ephemeral key share',
        kills: 'Authenticity',
        prim: 'cert + signature',
        enc: false,
      },
      {
        dir: '→',
        label: 'ClientKeyExchange · Finished',
        detail: 'the client’s key share, then a switch to encryption and a transcript MAC',
        kills: 'Confidentiality + Integrity',
        prim: 'DHE + HMAC',
        enc: false,
      },
      {
        dir: '←',
        label: 'Finished',
        detail: 'the server confirms with its own transcript MAC',
        kills: 'Integrity',
        prim: 'HMAC',
        enc: true,
      },
      {
        dir: '⇄',
        label: 'Application Data',
        detail: 'encrypted traffic — but only after two full round trips',
        kills: 'all three',
        prim: 'AES-GCM',
        enc: true,
      },
    ],
    note: 'Two round trips before any data, and the certificate travels in the clear. An older 1.2 option even let the client encrypt the secret straight to the server’s RSA key — fast, but with no forward secrecy, so 1.3 removed it.',
  },
};

// §7 — step through a TLS handshake, switching between TLS 1.3 and 1.2. The
// "play" loop only runs after the user presses play, so it isn't gated by
// prefers-reduced-motion (per the lesson convention for user-started motion).
export default function HandshakeLab() {
  const [ver, setVer] = useState('1.3');
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const data = HS[ver];
  const N = data.steps.length;
  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [ver]);
  useEffect(() => {
    if (!playing) return;
    if (step >= N) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [playing, step, N]);

  const finished = step >= N;
  const cur = step > 0 && step <= N ? data.steps[step - 1] : null;

  return (
    <div className="tls-panel tls-rv" style={{ padding: 18 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div className="tls-seg">
          <button
            className={`tls-segbtn ${ver === '1.3' ? 'on' : ''}`}
            onClick={() => setVer('1.3')}
          >
            TLS 1.3
          </button>
          <button
            className={`tls-segbtn ${ver === '1.2' ? 'on' : ''}`}
            onClick={() => setVer('1.2')}
          >
            TLS 1.2
          </button>
        </div>
        <span
          className="tls-chip"
          style={{ borderColor: 'var(--brass-deep)', color: 'var(--brass-bright)', fontSize: 11 }}
        >
          {data.rtt} to first byte
        </span>
      </div>

      {/* columns header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px 8px' }}>
        <span
          className="tls-mono"
          style={{ fontSize: 11, letterSpacing: '.14em', color: 'var(--bone-faint)' }}
        >
          <Globe size={12} /> CLIENT
        </span>
        <span
          className="tls-mono"
          style={{ fontSize: 11, letterSpacing: '.14em', color: 'var(--bone-faint)' }}
        >
          SERVER <Server size={12} />
        </span>
      </div>

      {/* transcript */}
      <div className="tls-inset" style={{ padding: '12px 12px', minHeight: 150 }}>
        {data.steps.map((m, i) => {
          const shown = i < step;
          const isApp = m.dir === '⇄';
          const align = m.dir === '→' ? 'flex-start' : m.dir === '←' ? 'flex-end' : 'center';
          const col = isApp ? 'var(--aqua)' : m.dir === '→' ? 'var(--bone-dim)' : 'var(--brass)';
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: align,
                opacity: shown ? 1 : 0.18,
                transition: 'opacity .4s',
                margin: '5px 0',
              }}
            >
              <span
                className="tls-chip"
                style={{
                  fontSize: 11.5,
                  maxWidth: '88%',
                  borderColor: shown ? (isApp ? 'var(--aqua)' : 'var(--line)') : 'var(--line-soft)',
                  background: isApp && shown ? 'rgba(70,214,198,.08)' : 'var(--ink-2)',
                  color: col,
                }}
              >
                {m.enc && <Lock size={11} style={{ flex: 'none' }} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.dir === '→' ? '→ ' : m.dir === '←' ? '← ' : '⇄ '}
                  {m.label}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {/* controls */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}
      >
        <button
          className="tls-btn ghost"
          disabled={step === 0}
          onClick={() => {
            setStep((s) => Math.max(0, s - 1));
            setPlaying(false);
          }}
        >
          prev
        </button>
        <button
          className="tls-btn"
          disabled={finished}
          onClick={() => {
            setStep((s) => Math.min(N, s + 1));
            setPlaying(false);
          }}
        >
          <ChevronRight size={14} />
          next
        </button>
        <button
          className="tls-btn ghost"
          onClick={() => {
            if (finished) setStep(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? 'pause' : finished ? 'replay' : 'play'}
        </button>
        <span
          className="tls-mono"
          style={{ fontSize: 11, color: 'var(--bone-faint)', marginLeft: 'auto' }}
        >
          {Math.min(step, N)} / {N}
        </span>
      </div>

      {/* current step detail OR finish */}
      <div className="tls-inset" style={{ marginTop: 12, padding: 14, minHeight: 92 }}>
        {!finished && cur && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 7,
                flexWrap: 'wrap',
              }}
            >
              <span
                className="tls-mono"
                style={{ fontSize: 13, color: cur.enc ? 'var(--aqua-bright)' : 'var(--bone)' }}
              >
                {cur.enc && '🔒 '}
                {cur.label}
              </span>
              {cur.kills !== '—' && (
                <span
                  className="tls-chip"
                  style={{
                    fontSize: 10,
                    borderColor: 'var(--aqua-deep)',
                    color: 'var(--aqua-bright)',
                  }}
                >
                  defends: {cur.kills}
                </span>
              )}
              {cur.prim && (
                <span
                  className="tls-chip"
                  style={{
                    fontSize: 10,
                    borderColor: 'var(--brass-deep)',
                    color: 'var(--brass-bright)',
                  }}
                >
                  {cur.prim}
                </span>
              )}
            </div>
            <p className="tls-prose" style={{ fontSize: 13.5, margin: 0, lineHeight: 1.55 }}>
              {cur.detail}
            </p>
          </>
        )}
        {!finished && !cur && (
          <p className="tls-prose" style={{ fontSize: 13.5, margin: 0 }}>
            Step through the messages, or press play. Braces{' '}
            <span className="tls-mono">{'{ }'}</span> mark what is already encrypted.
          </p>
        )}
        {finished && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <LockBadge state="sealed" animate />
            <div>
              <div
                className="tls-mono"
                style={{ fontSize: 13, color: 'var(--aqua-bright)', marginBottom: 4 }}
              >
                connection secured
              </div>
              <p className="tls-prose" style={{ fontSize: 12.5, margin: 0, lineHeight: 1.5 }}>
                {data.note}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
