import { useEffect, useState } from 'react';
import { PARTS } from './PartsData.js';

export function PartRail() {
  const [activePart, setActivePart] = useState(0);

  useEffect(() => {
    const updateActivePart = () => {
      const threshold = window.innerHeight * 0.42;
      const nextActive = PARTS.reduce((current, _part, index) => {
        const section = document.getElementById(`chapter-${index + 1}`);
        if (!section) return current;
        return section.getBoundingClientRect().top <= threshold ? index : current;
      }, 0);
      setActivePart(nextActive);
    };

    const updateActivePartFromHash = () => {
      const match = window.location.hash.match(/^#chapter-(\d+)$/);
      if (!match) return;
      const index = Number(match[1]) - 1;
      if (index >= 0 && index < PARTS.length) setActivePart(index);
    };

    updateActivePart();
    window.addEventListener('scroll', updateActivePart, { passive: true });
    window.addEventListener('resize', updateActivePart);
    window.addEventListener('hashchange', updateActivePartFromHash);
    return () => {
      window.removeEventListener('scroll', updateActivePart);
      window.removeEventListener('resize', updateActivePart);
      window.removeEventListener('hashchange', updateActivePartFromHash);
    };
  }, []);

  return (
    <nav className="part-rail" aria-label="Lesson parts">
      {PARTS.map((part, i) => (
        <a
          key={part.num}
          className={`part-rail-link ${activePart === i ? 'active' : ''}`}
          href={`#chapter-${i + 1}`}
          aria-label={`Part ${i + 1}: ${part.title}`}
          aria-current={activePart === i ? 'location' : undefined}
          title={`${part.num} · ${part.title}`}
        >
          {part.num}
        </a>
      ))}
    </nav>
  );
}
