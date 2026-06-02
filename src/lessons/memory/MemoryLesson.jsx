import { useRevealRoot } from '../../shared/reveal.jsx';
import ChapterNav from './components/ChapterNav.jsx';
import Hero from './sections/Hero.jsx';
import Unit from './sections/Unit.jsx';
import Ingenuity from './sections/Ingenuity.jsx';
import Explosion from './sections/Explosion.jsx';
import Ocean from './sections/Ocean.jsx';
import Why from './sections/Why.jsx';
import Coda from './sections/Coda.jsx';
import './memory.css';

/* ════════════════════════════════════════════════════════════════════════
   THE WEIGHT OF MEMORY
   From one bit woven by hand to an ocean nobody can picture.
   Motif: the magnetic core — a ferrite ring threaded by a wire, one bit
   each, the literal fabric early memory was made of (Apollo's, by hand).
   Every visual transforms when you touch it; the transformation is the point.

   Composition root. Engine (KB/MB/PB constants + fmtBytes + charOf + PLACE)
   lives in ./engine; the magnetic-core motif, the abstract Sprite, the
   chapter nav, section heads, and the reveal-on-scroll hook live in
   ./components; the five interactive labs (WeaveByte, Cartridge,
   MemoryTimeline, ApolloSpeck, RememberHero) live in ./labs; the Hero +
   five chapters + Coda live in ./sections. This shell just wires them and
   attaches the reveal-on-scroll observer to the root.
   ════════════════════════════════════════════════════════════════════════ */
export default function MemoryLesson() {
  const root = useRevealRoot({ selector: '.rev' });
  return (
    <div className="mw" ref={root}>
      <ChapterNav />
      <Hero />

      {/* ── §01 THE BIT ── */}
      <div className="divider" />
      <Unit />

      {/* ── §02 THE SQUEEZE ── */}
      <div className="divider" />
      <Ingenuity />

      {/* ── §03 THE EXPLOSION ── */}
      <div className="divider" />
      <Explosion />

      {/* ── §04 THE OCEAN ── */}
      <div className="divider" />
      <Ocean />

      {/* ── §05 WHY ── */}
      <div className="divider" />
      <Why />

      {/* ── CODA ── */}
      <div className="divider" />
      <Coda />

      <div style={{ height: 40 }} />
    </div>
  );
}
