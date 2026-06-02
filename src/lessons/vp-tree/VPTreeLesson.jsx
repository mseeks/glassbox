import { useScrollSpy } from '../../shared/useScrollSpy.js';
import Nav, { SECTIONS } from './components/Nav.jsx';
import Masthead from './sections/Masthead.jsx';
import S1 from './sections/s1.jsx';
import S2 from './sections/s2.jsx';
import S3 from './sections/s3.jsx';
import S4 from './sections/s4.jsx';
import S5 from './sections/s5.jsx';
import S6 from './sections/s6.jsx';
import S7 from './sections/s7.jsx';
import './vp-tree.css';

/* ════════════════════════════════════════════════════════════════
   VANTAGE-POINT TREES — an acoustic-ranging field instrument.
   Aesthetic: a sonar scope. Abyss-blue background, ping-aqua ink,
   amber landmarks, coral pruning.

   Composition root. The VP-tree engine (buildTree / nnSearch /
   layoutTree / the ND curse engine) lives in ./engine; reusable
   visuals (Scope, TreeDiagram, Crosshair, SecHead, Nav) + the C
   palette and clientToScope helpers live in ./components; the five
   labs live in ./labs (BuildLab + SearchLab share one FIELD/TREE via
   ./labs/shared-field.js); the masthead plus seven chapters live in
   ./sections. This shell just wires them and tracks the active
   chapter via the shared scroll-spy.
   ════════════════════════════════════════════════════════════════ */
const SECTION_IDS = SECTIONS.map((s) => s.id);

export default function VPTreeLesson() {
  const active = useScrollSpy(SECTION_IDS, { rootMargin: '-45% 0px -45% 0px' });
  return (
    <div className="vp-root">
      <Masthead />

      <Nav active={active} />

      <main className="vp-wrap">
        <S1 />
        <S2 />
        <S3 />
        <S4 />
        <S5 />
        <S6 />
        <S7 />
      </main>
    </div>
  );
}
