import { useRevealRoot } from '../../shared/reveal.jsx';
import Hero from './sections/Hero.jsx';
import BrokenPromise from './sections/BrokenPromise.jsx';
import TemptingDetour from './sections/TemptingDetour.jsx';
import Inversion from './sections/Inversion.jsx';
import WalkingTheTale from './sections/WalkingTheTale.jsx';
import Price from './sections/Price.jsx';
import CountermeasuresSection from './sections/CountermeasuresSection.jsx';
import TwoWays from './sections/TwoWays.jsx';
import WhenToReach from './sections/WhenToReach.jsx';
import Coda from './sections/Coda.jsx';
import './saga.css';

/* ════════════════════════════════════════════════════════════════════════
   THE SAGA PATTERN — an illuminated chronicle of distributed transactions.
   How a system too large to share one database keeps an atomic outcome:
   a chain of local commits, each with a compensating transaction ready to
   undo it. World: a medieval illuminated manuscript — vellum + iron-gall ink,
   burnished gold (the saga thread), rubric vermilion (compensation), verdigris
   (a forward commit), lapis (orchestration). Type: Marcellus (titling) · Cardo
   (reading) · JetBrains Mono (the engineering voice, via --font-mono).

   Composition root. The three state machines that drive the labs (the saga
   executor, the two-phase-commit machine, the lost-update interleave) and the
   figure/table datasets live in ./engine; the reusable atoms (Canto, Prose,
   Callout, PullQuote, Panel, Divider, the static figures, and the proem's
   contents Nav) in ./components; the four interactive labs in ./labs; the
   proem, the eight cantos, and the colophon in ./sections. This shell wires
   them and attaches the shared reveal-on-scroll observer to the root.
   ════════════════════════════════════════════════════════════════════════ */
export default function SagaLesson() {
  const rootRef = useRevealRoot({ selector: '.sg-rv', inClass: 'sg-in' });

  return (
    <div className="sg-root" ref={rootRef}>
      <Hero />
      <BrokenPromise />
      <TemptingDetour />
      <Inversion />
      <WalkingTheTale />
      <Price />
      <CountermeasuresSection />
      <TwoWays />
      <WhenToReach />
      <Coda />
    </div>
  );
}
