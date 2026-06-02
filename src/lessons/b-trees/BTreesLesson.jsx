import { BookOpen } from 'lucide-react';
import { useScrollProgress } from '../../shared/useScrollProgress.js';
import Hero from './sections/Hero.jsx';
import Problem from './sections/Problem.jsx';
import Anatomy from './sections/Anatomy.jsx';
import Search from './sections/Search.jsx';
import Balance from './sections/Balance.jsx';
import Split from './sections/Split.jsx';
import BPlusTrees from './sections/BPlusTrees.jsx';
import Tradeoff from './sections/Tradeoff.jsx';
import Family from './sections/Family.jsx';
import Onward from './sections/Onward.jsx';
import './b-trees.css';

/* ════════════════════════════════════════════════════════════════════════
   THE B-TREE — an interactive lesson
   World: a mid-century library card catalog. A drawer is a node/page; the
   guide cards with raised tabs are separator keys; pulling the drawer behind
   a tab is following a pointer. The card catalog is a physical B-tree.
   Type: Zilla Slab (display) · Libre Franklin (body) · JetBrains Mono (keys).

   Composition root. The pure B-tree/B+ engine (BTree / BPlus / buildLayout /
   levelsFor / heightOf / countOf / cloneTree) lives in ./engine; reusable
   visuals (TreeSVG, Section, SectionHead, Callout, useScrollProgress) live in
   ./components; the eight labs live in ./labs; Hero plus the nine chapter
   sections live in ./sections. This shell just wires them.
   ════════════════════════════════════════════════════════════════════════ */
export default function BTreesLesson() {
  const progress = useScrollProgress();
  return (
    <div className="bt-root">
      <div className="bt-grain" />
      <div className="bt-progress" style={{ width: `${progress}%` }} />

      <Hero />

      <Problem />
      <Anatomy />
      <Search />
      <Balance />
      <Split />
      <BPlusTrees />
      <Tradeoff />
      <Family />
      <Onward />

      <footer
        className="bt-wrap"
        style={{
          padding: '30px 22px 70px',
          borderTop: '1px solid var(--rule)',
          textAlign: 'center',
        }}
      >
        <BookOpen size={20} style={{ color: 'var(--oak-2)', marginBottom: 10 }} />
        <p
          className="bt-mono"
          style={{
            fontSize: 11.5,
            color: 'var(--ink-3)',
            letterSpacing: '.04em',
            lineHeight: 1.7,
            maxWidth: 460,
            margin: '0 auto',
          }}
        >
          Filed in the card catalog &mdash; a structure that was a B-tree long before it had the
          name.
          <br />
          Set in Zilla Slab, Libre Franklin, and JetBrains Mono.
        </p>
      </footer>
    </div>
  );
}
