import { useState } from 'react';
import { Eye, PenLine, UserMinus, Radio, Lock, Unlock, Globe, Server } from 'lucide-react';
import { threatState, MSG, MSG_TAMPERED } from '../engine/index.js';
import LockBadge from '../components/LockBadge.jsx';
import Verdict from '../components/Verdict.jsx';

// §1 — pick a wire attack, watch it land on plain HTTP, then seal the channel.
export default function ThreatLab() {
  const [attack, setAttack] = useState('read');
  const [sealed, setSealed] = useState(false);
  const s = threatState(attack, sealed);
  const Icon = s.icon;
  const tone = sealed ? 'sealed' : attack === 'none' ? 'exposed' : 'broken';
  const wireColor =
    tone === 'sealed' ? 'var(--aqua)' : tone === 'broken' ? 'var(--verm)' : 'var(--steel)';

  const attacks = [
    ['read', 'Eavesdrop', Eye],
    ['tamper', 'Tamper', PenLine],
    ['impersonate', 'Impersonate', UserMinus],
    ['none', 'No attack', Radio],
  ];

  return (
    <div className="tls-panel tls-rv" style={{ padding: 18 }}>
      {/* CONTROLS — sit directly above the wire so both are visible together */}
      <div className="tls-seg" style={{ marginBottom: 8 }}>
        {attacks.map(([k, label]) => (
          <button
            key={k}
            className={`tls-segbtn ${attack === k ? 'on-verm' : ''}`}
            onClick={() => setAttack(k)}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        className={`tls-segbtn ${sealed ? 'on' : ''}`}
        style={{
          width: '100%',
          justifyContent: 'center',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          padding: '10px',
        }}
        onClick={() => setSealed((v) => !v)}
      >
        {sealed ? <Lock size={14} /> : <Unlock size={14} />}{' '}
        {sealed ? 'TLS ON · channel sealed' : 'TLS OFF · tap to seal the channel'}
      </button>

      {/* WIRE — compact vertical diagram */}
      <div className="tls-inset" style={{ marginTop: 14, padding: '16px 14px' }}>
        {/* sender */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Globe size={16} style={{ color: 'var(--bone-dim)' }} />
          <span
            className="tls-mono"
            style={{ fontSize: 10.5, letterSpacing: '.14em', color: 'var(--bone-faint)' }}
          >
            YOU SEND
          </span>
          <span className="tls-chip" style={{ fontFamily: "'Schibsted Grotesk'", fontSize: 13 }}>
            {sealed ? (
              <span className="tls-mono" style={{ color: 'var(--aqua)', fontSize: 11 }}>
                9f·a3·1c·77·e0·b2 …
              </span>
            ) : (
              MSG
            )}
          </span>
        </div>

        <div style={{ height: 10, borderLeft: `2px dashed ${wireColor}`, marginLeft: 7 }} />

        {/* on the wire */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            borderRadius: 7,
            background:
              tone === 'broken'
                ? 'rgba(240,100,77,.08)'
                : tone === 'sealed'
                  ? 'rgba(70,214,198,.06)'
                  : 'transparent',
            border: `1px solid ${tone === 'exposed' ? 'var(--line-soft)' : wireColor}`,
          }}
        >
          <Icon size={16} style={{ color: wireColor, flex: 'none' }} />
          <span
            className="tls-mono"
            style={{
              fontSize: 10.5,
              letterSpacing: '.1em',
              color: 'var(--bone-faint)',
              flex: 'none',
            }}
          >
            ON THE WIRE
          </span>
          <span style={{ fontSize: 13, color: wireColor }}>{s.wire}</span>
        </div>

        <div style={{ height: 10, borderLeft: `2px dashed ${wireColor}`, marginLeft: 7 }} />

        {/* receiver */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Server
            size={16}
            style={{ color: s.okResp ? 'var(--bone-dim)' : 'var(--verm)', flex: 'none' }}
          />
          <span
            className="tls-mono"
            style={{
              fontSize: 10.5,
              letterSpacing: '.14em',
              color: s.okResp ? 'var(--bone-faint)' : 'var(--verm)',
            }}
          >
            {s.responder} {!s.okResp && '✗'} RECEIVES
          </span>
          <span
            className="tls-chip"
            style={{
              fontFamily: "'Schibsted Grotesk'",
              fontSize: 13,
              borderColor: s.arrived === MSG_TAMPERED ? 'var(--verm)' : 'var(--line)',
              color: s.arrived === MSG_TAMPERED ? 'var(--verm-bright)' : 'var(--bone)',
            }}
          >
            {s.arrived}
          </span>
        </div>
      </div>

      {/* STATUS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
        <LockBadge state={s.lock} animate={sealed} />
        <div style={{ flex: 1 }}>
          {s.property && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                className="tls-mono"
                style={{ fontSize: 11, letterSpacing: '.1em', color: 'var(--bone-dim)' }}
              >
                {s.property.toUpperCase()}
              </span>
              <Verdict ok={s.held === true} okText="HELD" noText="BROKEN" />
            </div>
          )}
          <div className="tls-prose" style={{ fontSize: 13.5, lineHeight: 1.5 }}>
            {s.note}
          </div>
        </div>
      </div>
    </div>
  );
}
