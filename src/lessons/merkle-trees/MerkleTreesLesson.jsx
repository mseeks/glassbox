import Nav, { TOC } from './components/Nav.jsx';
import { useScrollSpy } from '../../shared/useScrollSpy.js';
import { useScrollProgress } from '../../shared/useScrollProgress.js';
import Hero from './sections/Hero.jsx';
import Problem from './sections/Problem.jsx';
import Hash from './sections/Hash.jsx';
import Construction from './sections/Construction.jsx';
import Tamper from './sections/Tamper.jsx';
import Proof from './sections/Proof.jsx';
import Mathematics from './sections/Mathematics.jsx';
import Security from './sections/Security.jsx';
import Reconcile from './sections/Reconcile.jsx';
import Variants from './sections/Variants.jsx';
import Applications from './sections/Applications.jsx';
import Closing from './sections/Closing.jsx';
import './merkle-trees.css';

/* ══════════════════════════════════════════════════════════════════════════
   MERKLE TREES — A MASTERCLASS
   Aesthetic: engraved certificate of authenticity / banknote security printing.
   Green-black printer's ink · aged ivory · verdigris patina · antique gold seal.

   Composition root. The 12-hex toy hash, domain-separated leaf/node hashers,
   tree builder, root, and inclusion proofs live in ./engine; reusable UI
   primitives (Reveal, SectionHeader, Plate, MerkleTreeSVG, Nav) live in
   ./components; the seven interactive labs (AvalancheDemo, TreeBuilder,
   TamperLab, ProofLab, ScaleLab, DomainSepLab, ReconcileLab) live in ./labs;
   each section is its own file in ./sections. This shell just wires them and
   tracks scroll progress + active section for the sticky Nav.
   ══════════════════════════════════════════════════════════════════════════ */
// Stable id list for scroll-spy (TOC is a module constant, so this is too).
const SECTION_IDS = TOC.map(([id]) => id);

export default function MerkleTreesLesson() {
  const progress = useScrollProgress();
  const active = useScrollSpy(SECTION_IDS, { initial: 'problem', syncHash: true });

  return (
    <div className="mk-root">
      <Nav progress={progress} active={active} />
      <div className="mk-wrap">
        <Hero />
        <Problem />
        <hr className="mk-rule" style={{ margin: '40px auto' }} />
        <Hash />
        <hr className="mk-rule" style={{ margin: '40px auto' }} />
        <Construction />
        <hr className="mk-rule" style={{ margin: '40px auto' }} />
        <Tamper />
        <hr className="mk-rule" style={{ margin: '40px auto' }} />
        <Proof />
        <hr className="mk-rule" style={{ margin: '40px auto' }} />
        <Mathematics />
        <hr className="mk-rule" style={{ margin: '40px auto' }} />
        <Security />
        <hr className="mk-rule" style={{ margin: '40px auto' }} />
        <Reconcile />
        <hr className="mk-rule" style={{ margin: '40px auto' }} />
        <Variants />
        <hr className="mk-rule" style={{ margin: '40px auto' }} />
        <Applications />
        <hr className="mk-rule" style={{ margin: '40px auto' }} />
        <Closing />
      </div>
    </div>
  );
}
