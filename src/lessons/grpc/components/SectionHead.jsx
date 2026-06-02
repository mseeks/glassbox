import { Reveal } from '../../../shared/reveal.jsx';
import Eyebrow from './Eyebrow.jsx';

// Reveal-on-scroll section header: mono tag eyebrow, display title, optional
// lede. Uses the shared Reveal (base class `gx-fade`) so reduced-motion is
// handled by the shell's global CSS.
export default function SectionHead({ tag, title, lede }) {
  return (
    <Reveal base="gx-fade" style={{ marginBottom: 28 }}>
      <Eyebrow>{tag}</Eyebrow>
      <h2 className="gx-h2">{title}</h2>
      {lede && <p className="gx-lede">{lede}</p>}
    </Reveal>
  );
}
