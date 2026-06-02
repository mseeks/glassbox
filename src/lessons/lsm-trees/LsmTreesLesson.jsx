import Hero from './sections/Hero.jsx';
import Contents from './sections/Contents.jsx';
import OneIdea from './sections/OneIdea.jsx';
import Why from './sections/Why.jsx';
import Machine from './sections/Machine.jsx';
import Read from './sections/Read.jsx';
import Compact from './sections/Compact.jsx';
import Rum from './sections/Rum.jsx';
import Tomb from './sections/Tomb.jsx';
import Coda from './sections/Coda.jsx';
import './lsm-trees.css';

/* ════════════════════════════════════════════════════════════════════
   L S M   T R E E S  ·  a field manual for write-optimised storage
   ONE IDEA, carried the whole way down:
     Time becomes depth. The newest layer always wins.
   Dark edition — illuminated core samples against a night survey table.

   Composition root. The pure logic (resolveBorehole, upsert/freeze
   memtable, bloom verdict + read descent, the two compaction strategies,
   tombstone-storm math) lives in ./engine; the visual primitives
   (Shell, Movement, Heading, Prose, Figure, Note, Layer + STRATA) live
   in ./components; the eight interactive labs (Borehole, Asymmetry,
   Anatomy, Write, Read, Compact, RUM, Tomb) live in ./labs; the Hero,
   Contents survey, seven chapters and Coda live in ./sections.
   ════════════════════════════════════════════════════════════════════ */
export default function LsmTreesLesson() {
  return (
    <div className="lsm">
      <Hero />
      <Contents />
      <OneIdea />
      <Why />
      <Machine />
      <Read />
      <Compact />
      <Rum />
      <Tomb />
      <Coda />
    </div>
  );
}
