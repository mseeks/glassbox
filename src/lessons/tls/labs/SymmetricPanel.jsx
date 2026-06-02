import { useState, useMemo } from 'react';
import { keystreamXor } from '../engine/index.js';
import Row from '../components/Row.jsx';
import Channel from '../components/Channel.jsx';

// §2 — a real reversible keystream XOR standing in for AES-GCM: scramble with
// the key, unscramble with the key; the wire carries only noise.
export default function SymmetricPanel() {
  const [text, setText] = useState('meet me at noon');
  const [key, setKey] = useState('s3cret');
  const [wrongKey, setWrongKey] = useState(false);

  const cipher = useMemo(() => keystreamXor(text, key), [text, key]);
  const recvKey = wrongKey ? key + '!' : key; // flip the recipient's key
  const recovered = useMemo(() => {
    const bytes = keystreamXor(text, key); // ciphertext on the wire
    const back = keystreamXor(String.fromCharCode(...bytes), recvKey); // decrypt = same op with recipient key
    return String.fromCharCode(...back);
  }, [text, key, recvKey]);

  const hex = cipher.map((b) => b.toString(16).padStart(2, '0')).join(' ');
  const printable = (str) => str.replace(/[^\x20-\x7e]/g, '·');

  return (
    <div className="tls-panel tls-rv" style={{ padding: 18 }}>
      <div className="tls-grid2" style={{ gap: 12, marginBottom: 14 }}>
        <div>
          <label
            className="tls-mono"
            style={{ fontSize: 10.5, letterSpacing: '.14em', color: 'var(--bone-faint)' }}
          >
            MESSAGE
          </label>
          <input
            className="tls-input"
            aria-label="Message to encrypt"
            style={{ marginTop: 6 }}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div>
          <label
            className="tls-mono"
            style={{ fontSize: 10.5, letterSpacing: '.14em', color: 'var(--brass)' }}
          >
            SHARED KEY (both sides hold it)
          </label>
          <input
            className="tls-input"
            aria-label="Shared key"
            style={{ marginTop: 6, borderColor: 'var(--brass-deep)' }}
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>
      </div>

      <div className="tls-inset" style={{ padding: 14 }}>
        <Row label="YOU ENCRYPT" color="var(--bone-dim)">
          <span style={{ color: 'var(--bone)' }}>{text || ' '}</span>
        </Row>
        <div style={{ margin: '8px 0' }}>
          <Channel tone="sealed" label="ON THE WIRE" />
        </div>
        <Row label="EAVESDROPPER SEES" color="var(--verm)">
          <span
            className="tls-mono"
            style={{ fontSize: 12, color: 'var(--steel)', wordBreak: 'break-all' }}
          >
            {hex}
          </span>
        </Row>
        <div style={{ margin: '8px 0' }}>
          <Channel tone="sealed" />
        </div>
        <Row label="BANK DECRYPTS" color={wrongKey ? 'var(--verm)' : 'var(--aqua)'}>
          <span style={{ color: wrongKey ? 'var(--verm-bright)' : 'var(--aqua-bright)' }}>
            {printable(recovered) || ' '}
          </span>
        </Row>
      </div>

      <button
        className={`tls-segbtn ${wrongKey ? 'on-verm' : ''}`}
        style={{ marginTop: 12 }}
        onClick={() => setWrongKey((v) => !v)}
      >
        {wrongKey ? 'recipient has the WRONG key' : "flip the recipient's key"}
      </button>
      <p className="tls-prose" style={{ fontSize: 12.5, marginTop: 10, lineHeight: 1.5 }}>
        The reader on the wire holds only noise. The right key turns it back into words. The wrong
        key yields garbage. This is a real reversible keystream standing in for{' '}
        <strong>AES-GCM</strong>, which TLS actually uses, and which also attaches an{' '}
        <em>authentication tag</em> so any tampering is caught. We'll see real tamper-detection
        shortly.
      </p>
    </div>
  );
}
