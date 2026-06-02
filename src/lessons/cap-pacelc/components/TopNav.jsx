import { scrollToId } from '../../../shared/useScrollSpy.js';

/* ════════════════════════════════════════════════════════════════════════
   STICKY NAV — at-a-glance section map at the top of the page.
   ════════════════════════════════════════════════════════════════════════ */
export function TopNav() {
  const items = [
    { id: 's1', label: '§ 1 question' },
    { id: 's2', label: '§ 2 letters' },
    { id: 's3', label: '§ 3 proof' },
    { id: 's4', label: '§ 4 P' },
    { id: 's5', label: '§ 5 CP/AP' },
    { id: 's6', label: '§ 6 lattice' },
    { id: 's7', label: '§ 7 PACELC' },
    { id: 's8', label: '§ 8 quadrants' },
    { id: 's9', label: '§ 9 quorum' },
    { id: 's10', label: '§ 10 myths' },
    { id: 's11', label: '§ 11 wider' },
  ];
  return (
    <nav className="topnav">
      <div className="topnav-inner">
        <span className="topnav-brand">CAP / PACELC</span>
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className="topnav-link"
            onClick={() => scrollToId(it.id)}
            style={{
              background: 'none',
              border: 'none',
              font: 'inherit',
              lineHeight: 'inherit',
              textAlign: 'left',
            }}
          >
            {it.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
