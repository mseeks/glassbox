import { Reveal } from '../../../shared/reveal.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import ReconcileLab from '../labs/ReconcileLab.jsx';

// §8 — Reconciliation by halving.
export default function Reconcile() {
  return (
    <section className="mk-section">
      <SectionHeader id="reconcile" kicker="Reconciliation" title="Two replicas, one difference" />
      <Reveal base="mk-reveal" className="mk-prose">
        <p className="lead">
          Two machines each hold a copy of the same data. After a network hiccup, one record drifted
          apart. They must find <em>which</em>, without shipping their whole datasets to each other.
        </p>
        <p>
          They compare roots. Different. So they compare the two children, keep only the half whose
          hashes disagree, and recurse. Each step throws away half the search space. It's Twenty
          Questions, where every answer eliminates a whole subtree.
        </p>
      </Reveal>

      <Reveal base="mk-reveal">
        <ReconcileLab />
      </Reveal>

      <Reveal base="mk-reveal" className="mk-prose" style={{ marginTop: 20 }}>
        <p>
          With eight leaves the saving looks modest. The point is the shape: to localize a
          difference among a <em>million</em> records, you exchange on the order of forty hashes,
          not a million records. This is how distributed databases reconcile diverged replicas in
          the background. Bandwidth stays proportional to how much actually changed, not to how much
          data exists.
        </p>
      </Reveal>
    </section>
  );
}
