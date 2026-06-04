import { useMemo } from 'react';
import { useScrollSpy } from '../../../shared/useScrollSpy.js';

export function TOC() {
  const items = useMemo(
    () => [
      { id: 's01', label: '01 · The question' },
      { id: 's02', label: '02 · Decoupling' },
      { id: 's03', label: '03 · The probe' },
      { id: 's04', label: '04 · Three states' },
      { id: 's05', label: '05 · Incarnations' },
      { id: 's06', label: '06 · Infection' },
      { id: 's07', label: '07 · In motion' },
      { id: 's08', label: '08 · Properties' },
      { id: 's09', label: '09 · In practice' },
      { id: 's10', label: '10 · Context' },
    ],
    [],
  );
  const ids = useMemo(() => items.map((it) => it.id), [items]);
  const active = useScrollSpy(ids, { rootMargin: '-30% 0px -60% 0px', syncHash: true });

  return (
    <nav
      className="swim-toc-fixed"
      style={{
        position: 'fixed',
        left: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
        display: 'none',
      }}
    >
      {items.map((it) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          style={{
            display: 'block',
            textDecoration: 'none',
            fontFamily: 'JetBrains Mono',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '5px 10px',
            color: active === it.id ? 'var(--brass)' : 'var(--ink-label)',
            borderLeft: active === it.id ? '1px solid var(--brass)' : '1px solid var(--border)',
            transition: 'all 0.25s',
          }}
        >
          {it.label}
        </a>
      ))}
    </nav>
  );
}
