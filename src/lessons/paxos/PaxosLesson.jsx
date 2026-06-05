import { useCallback } from 'react';
import { useRevealRoot } from '../../shared/reveal.jsx';
import { useScrollSpy, scrollToId } from '../../shared/useScrollSpy.js';
import { useScrollProgress } from '../../shared/useScrollProgress.js';
import Nav, { NAV } from './components/Nav.jsx';
import Hero from './sections/Hero.jsx';
import Problem from './sections/Problem.jsx';
import Witness from './sections/Witness.jsx';
import Phases from './sections/Phases.jsx';
import Binding from './sections/Binding.jsx';
import Liveness from './sections/Liveness.jsx';
import Log from './sections/Log.jsx';
import Comparison from './sections/Comparison.jsx';
import Coda from './sections/Coda.jsx';
import './paxos.css';

/* ════════════════════════════════════════════════════════════════════════
   PAXOS — THE PART-TIME PARLIAMENT
   How a scattered assembly agrees on one decree and can never take it back.
   World: a Greek island chamber carving law in marble. Aegean blue for
   structure, sea-teal for the engine, gold for what is chosen, terracotta for
   rejection. Type: Cinzel (titling) · Newsreader (body) · JetBrains Mono (ledger).

   Composition root. The real single-decree Paxos machine (the Sim, the ballot
   order, the four recorded scenarios, statusFor / fmt) lives in ./engine; the
   reusable atoms (Nav, Section, Legislator, Walkthrough) in ./components; the
   four interactive labs in ./labs; the hero, the eight chapters, and the coda
   in ./sections. This shell wires them, attaching the shared reveal-on-scroll
   observer to the root and the shared scroll-spy + reading-progress to the rail.
   ════════════════════════════════════════════════════════════════════════ */
const NAV_IDS = NAV.map((s) => s.id);

export default function PaxosLesson() {
  const rootRef = useRevealRoot({ selector: '.pax-rv', inClass: 'pax-in' });
  const active = useScrollSpy(NAV_IDS, { rootMargin: '-45% 0px -50% 0px' });
  const progress = useScrollProgress();

  const jump = useCallback((id) => scrollToId(id), []);

  return (
    <div className="pax-root" ref={rootRef}>
      <div className="pax-progress" style={{ width: `${progress}%` }} aria-hidden="true" />
      <Nav active={active} onJump={jump} />
      <Hero />
      <main className="pax-wrap">
        <Problem />
        <Witness />
        <Phases />
        <Binding />
        <Liveness />
        <Log />
        <Comparison />
        <Coda />
      </main>
      <div className="pax-foot">
        ◈ &nbsp; consensus on a single value, and everything it makes possible &nbsp; ◈
      </div>
    </div>
  );
}
