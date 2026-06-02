import { Reveal } from '../../../shared/reveal.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import TamperLab from '../labs/TamperLab.jsx';

// §4 — Tamper-evidence: one change, felt at the top.
export default function Tamper() {
  return (
    <section className="mk-section">
      <SectionHeader id="tamper" kicker="Tamper-Evidence" title="One change, felt at the top" />
      <Reveal base="mk-reveal" className="mk-prose">
        <p className="lead">
          Click any leaf to forge its value. Watch the altered fingerprint climb its lineage, rising
          through the parent, then the grandparent, then the root, until the seal at the top finally
          breaks and the forgery announces itself. The root knew.{' '}
          <em>You cannot touch a leaf without the root knowing.</em>
        </p>
      </Reveal>

      <Reveal base="mk-reveal">
        <TamperLab />
      </Reveal>

      <Reveal base="mk-reveal" className="mk-prose" style={{ marginTop: 20 }}>
        <p>
          This is what people mean by <em>tamper-evident</em>. The root is a commitment. Publish it
          once. Pin it to a noticeboard, a newspaper, or a blockchain, and the entire dataset
          beneath it freezes. Any later edit, anywhere, produces a root that no longer matches the
          one you trusted.
        </p>
      </Reveal>
    </section>
  );
}
