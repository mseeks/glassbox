import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Link2,
  ScrollText,
  Globe,
  ArrowDown,
  Check,
  X,
  ChevronRight,
} from 'lucide-react';
import LockBadge from '../components/LockBadge.jsx';
import Verdict from '../components/Verdict.jsx';

const TRUST_STORE = ['ISRG Root X1', 'DigiCert Global', 'GlobalSign R3', 'Sectigo'];
const CHAIN_SCENARIOS = {
  valid: { firstFail: -1, leafName: 'yourbank.com', expired: false, rootTrusted: true, err: null },
  expired: {
    firstFail: 3,
    leafName: 'yourbank.com',
    expired: true,
    rootTrusted: true,
    err: "ERR_CERT_DATE_INVALID: the certificate's validity period has passed.",
  },
  wrongdomain: {
    firstFail: 3,
    leafName: 'othersite.com',
    expired: false,
    rootTrusted: true,
    err: 'ERR_CERT_COMMON_NAME_INVALID: this certificate is for othersite.com, not yourbank.com.',
  },
  untrustedroot: {
    firstFail: 0,
    leafName: 'yourbank.com',
    expired: false,
    rootTrusted: false,
    err: 'ERR_CERT_AUTHORITY_INVALID: the chain ends at a root your browser does not trust.',
  },
};

// §6 — walk the certificate chain link by link, then break it four ways and
// watch the browser's verdict. Stepping is user-initiated, so no motion gating.
export default function ChainOfTrustLab() {
  const [scenario, setScenario] = useState('valid');
  const [revealed, setRevealed] = useState(0);
  const sc = CHAIN_SCENARIOS[scenario];
  useEffect(() => setRevealed(0), [scenario]);

  const maxReveal = sc.firstFail === -1 ? 4 : sc.firstFail + 1;
  const done = revealed >= maxReveal;
  const allGood = done && sc.firstFail === -1;

  // status for a given link index: 'ok' | 'fail' | 'pending'
  const linkState = (i) => {
    if (i >= revealed) return 'pending';
    return i === sc.firstFail ? 'fail' : 'ok';
  };
  const dotColor = (st) =>
    st === 'ok' ? 'var(--aqua)' : st === 'fail' ? 'var(--verm)' : 'var(--line)';

  const StatusDot = ({ i }) => {
    const st = linkState(i);
    return (
      <span
        style={{
          display: 'inline-flex',
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: `1.5px solid ${dotColor(st)}`,
          alignItems: 'center',
          justifyContent: 'center',
          background:
            st === 'ok'
              ? 'rgba(70,214,198,.14)'
              : st === 'fail'
                ? 'rgba(240,100,77,.14)'
                : 'transparent',
          flex: 'none',
        }}
      >
        {st === 'ok' && <Check size={11} style={{ color: 'var(--aqua)' }} />}
        {st === 'fail' && <X size={11} style={{ color: 'var(--verm)' }} />}
      </span>
    );
  };

  const Arrow = ({ i, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0 7px 9px' }}>
      <ArrowDown size={15} style={{ color: dotColor(linkState(i)) }} />
      <StatusDot i={i} />
      <span
        className="tls-mono"
        style={{ fontSize: 10.5, letterSpacing: '.06em', color: 'var(--bone-faint)' }}
      >
        {label}
      </span>
    </div>
  );

  const Cert = ({ icon: Ic, subject, issuer, note, noteColor, accent }) => (
    <div className="tls-inset" style={{ padding: 13, borderColor: accent || 'var(--line-soft)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <Ic size={16} style={{ color: accent || 'var(--bone-dim)', flex: 'none' }} />
        <div style={{ minWidth: 0 }}>
          <div className="tls-mono" style={{ fontSize: 13, color: 'var(--bone)' }}>
            {subject}
          </div>
          <div className="tls-mono" style={{ fontSize: 10.5, color: 'var(--bone-faint)' }}>
            issued by {issuer}
          </div>
        </div>
      </div>
      {note && (
        <div
          className="tls-mono"
          style={{ fontSize: 11, color: noteColor || 'var(--bone-faint)', marginTop: 7 }}
        >
          {note}
        </div>
      )}
    </div>
  );

  return (
    <div className="tls-panel tls-rv" style={{ padding: 18 }}>
      <div className="tls-seg" style={{ marginBottom: 12 }}>
        {[
          ['valid', 'Valid chain'],
          ['expired', 'Expired leaf'],
          ['wrongdomain', 'Wrong domain'],
          ['untrustedroot', 'Untrusted root'],
        ].map(([k, l]) => (
          <button
            key={k}
            className={`tls-segbtn ${scenario === k ? (k === 'valid' ? 'on' : 'on-verm') : ''}`}
            onClick={() => setScenario(k)}
          >
            {l}
          </button>
        ))}
      </div>

      {/* trust store */}
      <div
        style={{
          display: 'flex',
          gap: 7,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <span
          className="tls-mono"
          style={{ fontSize: 10, letterSpacing: '.12em', color: 'var(--bone-faint)' }}
        >
          YOUR TRUST STORE:
        </span>
        {TRUST_STORE.map((r) => (
          <span
            key={r}
            className="tls-chip"
            style={{
              fontSize: 10.5,
              padding: '3px 8px',
              borderColor: sc.rootTrusted && r === 'ISRG Root X1' ? 'var(--aqua)' : 'var(--line)',
              color:
                sc.rootTrusted && r === 'ISRG Root X1' ? 'var(--aqua-bright)' : 'var(--bone-faint)',
            }}
          >
            {r}
          </span>
        ))}
      </div>

      {/* the chain */}
      <Cert
        icon={ShieldCheck}
        subject="ISRG Root X1"
        issuer="itself (self-signed root)"
        note={sc.rootTrusted ? '✓ present in your trust store' : '✗ NOT in your trust store'}
        noteColor={sc.rootTrusted ? 'var(--aqua)' : 'var(--verm)'}
        accent={
          linkState(0) === 'fail'
            ? 'var(--verm)'
            : linkState(0) === 'ok'
              ? 'var(--aqua-deep)'
              : undefined
        }
      />
      <Arrow i={1} label="root's signature over the intermediate" />
      <Cert
        icon={Link2}
        subject="Let's Encrypt R10"
        issuer="ISRG Root X1"
        accent={linkState(1) === 'ok' ? 'var(--aqua-deep)' : undefined}
      />
      <Arrow i={2} label="intermediate's signature over the leaf" />
      <Cert
        icon={ScrollText}
        subject={sc.leafName}
        issuer="Let's Encrypt R10"
        note={sc.expired ? 'validity: expired 2024' : 'validity: 2026 · ✓ in date'}
        noteColor={sc.expired ? 'var(--verm)' : 'var(--bone-faint)'}
        accent={
          linkState(3) === 'fail'
            ? 'var(--verm)'
            : linkState(2) === 'ok'
              ? 'var(--aqua-deep)'
              : undefined
        }
      />
      <Arrow i={3} label={`leaf must match the name you typed & be in date`} />
      <div
        className="tls-inset"
        style={{
          padding: 11,
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          borderColor: linkState(3) === 'fail' ? 'var(--verm)' : 'var(--line-soft)',
        }}
      >
        <Globe size={15} style={{ color: 'var(--bone-dim)' }} />
        <span className="tls-mono" style={{ fontSize: 12, color: 'var(--bone-dim)' }}>
          browser requested: <b style={{ color: 'var(--bone)' }}>yourbank.com</b>
        </span>
      </div>

      {/* control + verdict */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}
      >
        <button
          className="tls-btn"
          disabled={done}
          onClick={() => setRevealed((r) => Math.min(r + 1, maxReveal))}
        >
          <ChevronRight size={14} />
          {revealed === 0 ? 'verify the chain' : 'verify next link'}
        </button>
        <LockBadge state={!done ? 'open' : allGood ? 'sealed' : 'broken'} animate={allGood} />
        {done &&
          (allGood ? (
            <Verdict ok okText="CHAIN TRUSTED" />
          ) : (
            <Verdict ok={false} noText="CONNECTION REFUSED" />
          ))}
      </div>
      {done && !allGood && (
        <p
          className="tls-mono"
          style={{ fontSize: 12, color: 'var(--verm-bright)', marginTop: 10, lineHeight: 1.5 }}
        >
          {sc.err}
        </p>
      )}

      <p className="tls-prose" style={{ fontSize: 12.5, marginTop: 14, lineHeight: 1.6 }}>
        Trust flows <em>downward</em> by signatures, from a root your browser already carries to the
        site's leaf. Break any link and the padlock turns red. That leaf is{' '}
        <strong>domain-validated</strong>: the issuer (here, Let's Encrypt over the ACME protocol)
        only checked that the requester controls the domain, and it vouched for nothing about the
        company behind it. Certificates are cheap. So the defence against a wrongly-issued one is
        publicity. Every certificate gets written to public, append-only{' '}
        <strong>Certificate Transparency</strong> logs that owners watch for names they never
        requested.
      </p>
    </div>
  );
}
