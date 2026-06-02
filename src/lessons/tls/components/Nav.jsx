import { Lock, ChevronDown, X } from 'lucide-react';

// The section navigation: a left rail on wide screens, a sticky top bar +
// full-screen sheet on narrow ones. Active section + smooth-scroll are driven
// by the shared useScrollSpy / scrollToId in the composition root.
export const NAV = [
  { id: 'wire', n: '01', t: 'The open wire' },
  { id: 'secret', n: '02', t: 'The shared secret' },
  { id: 'dh', n: '03', t: 'Agreeing in the open' },
  { id: 'mitm', n: '04', t: 'The crack' },
  { id: 'sign', n: '05', t: 'Proof of identity' },
  { id: 'chain', n: '06', t: 'The chain of trust' },
  { id: 'handshake', n: '07', t: 'The handshake' },
  { id: 'coda', n: '08', t: 'Coda' },
];

export default function Nav({ active, onJump, sheetOpen, setSheetOpen }) {
  const cur = NAV.find((s) => s.id === active);
  return (
    <>
      <nav className="tls-rail" aria-label="sections">
        {NAV.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={active === s.id ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              onJump(s.id);
            }}
          >
            <span className="dot" />
            <span className="lbl">
              {s.n} · {s.t}
            </span>
          </a>
        ))}
      </nav>

      <div className="tls-topbar">
        <span className="ttl">
          <Lock size={13} />
          <span>TLS · {cur ? `${cur.n} ${cur.t}` : 'The sealed channel'}</span>
        </span>
        <button
          className="tls-menubtn"
          aria-label="Open sections menu"
          onClick={() => setSheetOpen(true)}
        >
          <ChevronDown size={13} />
          sections
        </button>
      </div>

      {sheetOpen && (
        <div className="tls-sheet" onClick={() => setSheetOpen(false)}>
          <button
            className="tls-sheetclose"
            aria-label="Close sections menu"
            onClick={() => setSheetOpen(false)}
          >
            <X size={13} />
            close
          </button>
          {NAV.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={active === s.id ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                onJump(s.id);
              }}
            >
              <span className="n">{s.n}</span>
              <span className="t">{s.t}</span>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
