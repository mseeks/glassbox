import { useScrollProgress } from '../../shared/useScrollProgress.js';
import Rule from './components/Rule.jsx';
import Hero from './sections/Hero.jsx';
import Properties from './sections/Properties.jsx';
import Family from './sections/Family.jsx';
import Assembly from './sections/Assembly.jsx';
import ARX from './sections/ARX.jsx';
import LengthExtension from './sections/LengthExtension.jsx';
import Sponge from './sections/Sponge.jsx';
import Variants from './sections/Variants.jsx';
import Pitfalls from './sections/Pitfalls.jsx';
import Coda from './sections/Coda.jsx';
import './sha.css';

/* ════════════════════════════════════════════════════════════════════════
   SHA — THE ONE-WAY MACHINE
   An interactive lesson on the Secure Hash Algorithms.
   Aesthetic: an engineer's plate. Warm near-black, molten copper, cool steel,
   cerise for danger. Slab display (Zilla Slab), Hanken Grotesk body,
   JetBrains Mono for digests.

   Composition root. The real SHA-256 core — digest, per-block & per-round
   state, popcount, and the length-extension forgery — lives in ./engine,
   where it is pure and unit-tested against the NIST FIPS 180-4 vectors.
   Each <Section /> contributes prose + a lab from ./labs; the lean shell
   here just wires them and tracks scroll progress for the top rail.
   ════════════════════════════════════════════════════════════════════════ */
export default function ShaLesson() {
  const progress = useScrollProgress();

  return (
    <div className="sha-root">
      <div className="sha-rail" style={{ width: progress + '%' }} />
      <Hero />
      <Rule />
      <Properties />
      <Rule />
      <Family />
      <Assembly />
      <ARX />
      <LengthExtension />
      <Sponge />
      <Variants />
      <Pitfalls />
      <Coda />
    </div>
  );
}
