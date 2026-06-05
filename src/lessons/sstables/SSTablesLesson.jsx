import { useCallback } from 'react';
import { useRevealRoot } from '../../shared/reveal.jsx';
import { useScrollSpy, scrollToId } from '../../shared/useScrollSpy.js';
import { useScrollProgress } from '../../shared/useScrollProgress.js';
import Nav, { NAV } from './components/Nav.jsx';
import Hero from './sections/Hero.jsx';
import Brief from './sections/Brief.jsx';
import Slab from './sections/Slab.jsx';
import LookupLab from './labs/LookupLab.jsx';
import BuildLab from './labs/BuildLab.jsx';
import CompressLab from './labs/CompressLab.jsx';
import SkipLab from './labs/SkipLab.jsx';
import MergeLab from './labs/MergeLab.jsx';
import Gifts from './sections/Gifts.jsx';
import Marriage from './sections/Marriage.jsx';
import Family from './sections/Family.jsx';
import './sstables.css';

/* ════════════════════════════════════════════════════════════════════════
   SORTED STRING TABLES — set in order, locked for good.
   A letterpress type-specimen. Cool bone stock · oxblood spot · steel-indigo
   structure · sage for what is kept · graphite for the dead. Type: Bodoni Moda
   (display) · Archivo (body) · JetBrains Mono (the press voice).

   Composition root. The real format machine (build, the blocked/flat lookup
   traces, a working bloom, the k-way merge with tombstones, prefix coding, and
   every sample dataset) lives in ./engine; the reusable atoms (Nav, Section,
   Plate, SectionHeading, Seg, Stat, Rec, PlayBar, usePlayer) in ./components;
   the five interactive labs in ./labs; the hero, the prose chapters, and the
   colophon in ./sections. This shell wires them, attaching the shared
   reveal-on-scroll observer to the root and the shared scroll-spy +
   reading-progress to the rail.
   ════════════════════════════════════════════════════════════════════════ */
const NAV_IDS = NAV.map((s) => s.id);

export default function SSTablesLesson() {
  const rootRef = useRevealRoot({ selector: '.sst-reveal', inClass: 'in' });
  const active = useScrollSpy(NAV_IDS, { rootMargin: '-45% 0px -45% 0px' });
  const progress = useScrollProgress();

  const jump = useCallback((id) => scrollToId(id), []);

  return (
    <div className="sst-root" ref={rootRef}>
      <div className="sst-progress" style={{ width: `${progress}%` }} aria-hidden="true" />
      <Nav active={active} onJump={jump} />
      <div className="sst-page">
        <Hero />
        <Brief />
        <Slab />
        <LookupLab />
        <BuildLab />
        <CompressLab />
        <SkipLab />
        <MergeLab />
        <Gifts />
        <Marriage />
        <Family />
      </div>
    </div>
  );
}
