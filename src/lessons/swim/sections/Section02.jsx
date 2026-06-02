import { DecouplingDiagram } from '../components/DecouplingDiagram.jsx';

export function Section02() {
  return (
    <section className="swim-section" id="s02">
      <div className="swim-page">
        <div className="swim-section-header">
          <span className="swim-section-number">§ 02</span>
          <h2 className="swim-section-title">
            The <em>decoupling</em>
          </h2>
        </div>

        <div className="swim-prose swim-mid" style={{ marginBottom: 48 }}>
          <p className="swim-lede">
            SWIM's first idea is structural. Before any algorithm, it makes a clean cut between two
            questions that earlier protocols tangled together.
          </p>
          <p>
            <em>Is X alive?</em> is a local question. One node can answer it with one probe.{' '}
            <em>How does that answer reach everyone?</em> is a global question, and entirely
            different machinery is appropriate for it. Coupling the two is what forces O(N²) loads:
            if you learn X is dead only by missing its heartbeat, you must hear from X directly, and
            so must everyone else.
          </p>
          <p>
            Separate them, and each piece becomes independently bounded. SWIM keeps failure
            detection cheap by probing only one peer per round, and keeps dissemination cheap by
            riding for free on the probe traffic. Two cheap mechanisms, one packet stream.
          </p>
        </div>

        <DecouplingDiagram />
      </div>
    </section>
  );
}
