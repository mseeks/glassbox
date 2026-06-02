import { Reveal } from '../../../shared/reveal.jsx';
import { Callout as KitCallout } from '../../../shared/lesson-kit/index.js';

// Inset callout — a labelled aside used by sections to highlight a key
// take-away, revealed on scroll. Structure comes from the shared lesson kit;
// the bespoke look (brass bar, italic body, 700 mono label) is pinned via the
// --lk-* token contract on .bt-root plus a small scoped override in b-trees.css.
export default function Callout({ title, children }) {
  return (
    <Reveal base="bt-rev">
      <KitCallout label={title}>{children}</KitCallout>
    </Reveal>
  );
}
