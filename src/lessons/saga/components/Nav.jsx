import { scrollToId } from '../../../shared/useScrollSpy.js';
import { TOC } from '../engine/index.js';

// The proem's table of contents — the manuscript's index of cantos. The source
// rendered plain "#id" anchors and leaned on a global html{scroll-behavior}
// rule for the smooth scroll; that rule is dropped (it would leak to the shell),
// so each entry is a button that calls the shared, reduced-motion-aware
// scrollToId. Each button's visible label is its accessible name. This lesson
// has no scroll-spy rail by design, so the TOC maps over the engine's TOC directly.
export default function Nav() {
  return (
    <nav className="sg-toc" aria-label="contents">
      {TOC.map(([rn, tx, id]) => (
        <button key={id} type="button" onClick={() => scrollToId(id)}>
          <span className="rn">{rn}</span>
          <span className="tx">{tx}</span>
        </button>
      ))}
    </nav>
  );
}
