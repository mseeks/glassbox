import { useCallback } from 'react';
import { useRevealRoot } from '../../shared/reveal.jsx';
import { useScrollSpy, scrollToId } from '../../shared/useScrollSpy.js';
import { useScrollProgress } from '../../shared/useScrollProgress.js';
import Nav, { NAV } from './components/Nav.jsx';
import Hero from './sections/Hero.jsx';
import PlateProblem from './sections/PlateProblem.jsx';
import PlateGuessing from './sections/PlateGuessing.jsx';
import PlateAnatomy from './sections/PlateAnatomy.jsx';
import PlateSearchInsert from './sections/PlateSearchInsert.jsx';
import PlateTraversal from './sections/PlateTraversal.jsx';
import PlateBalance from './sections/PlateBalance.jsx';
import PlateRotation from './sections/PlateRotation.jsx';
import PlateHeap from './sections/PlateHeap.jsx';
import PlateCoda from './sections/PlateCoda.jsx';
import './binary-trees.css';

/* ════════════════════════════════════════════════════════════════════════
   BINARY TREES — "the drafting table"
   A structural study of the binary tree in ten plates. World: warm blueprint
   vellum, graphite, blueprint-blue structure, red-pencil path. Type: Syne
   (display) · Newsreader (serif body) · JetBrains Mono (annotation).

   Composition root. The real binary-search tree, min-heap, traversals, layout
   geometry, rotations, and example datasets all live in ./engine; the reusable
   atoms (Nav, Plate, TreeSVG, Legend, SearchPanel, useStepper) in ./components;
   the interactive labs in ./labs; the hero, eight plates, and coda in
   ./sections. This shell wires them, attaching the shared reveal-on-scroll
   observer to the root and the shared scroll-spy + reading-progress to the rail.
   The prefix is bst- (the b-trees lesson already owns bt-).
   ════════════════════════════════════════════════════════════════════════ */
const NAV_IDS = NAV.map((s) => s.id);

export default function BinaryTreesLesson() {
  const rootRef = useRevealRoot({ selector: '.bst-rv', inClass: 'bst-in' });
  const active = useScrollSpy(NAV_IDS, { rootMargin: '-42% 0px -52% 0px' });
  const progress = useScrollProgress();

  const jump = useCallback((id) => scrollToId(id), []);

  return (
    <div className="bst-root" ref={rootRef}>
      <Nav active={active} progress={progress} onJump={jump} />
      <Hero />
      <PlateProblem />
      <PlateGuessing />
      <PlateAnatomy />
      <PlateSearchInsert />
      <PlateTraversal />
      <PlateBalance />
      <PlateRotation />
      <PlateHeap />
      <PlateCoda />
    </div>
  );
}
