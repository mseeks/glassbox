import { StateMachineInteractive } from '../labs/StateMachineInteractive.jsx';

export function Section04() {
  return (
    <section className="swim-section" id="s04">
      <div className="swim-page">
        <div className="swim-section-header">
          <span className="swim-section-number">§ 04</span>
          <h2 className="swim-section-title">
            The <em>three states</em>
          </h2>
        </div>

        <div className="swim-prose swim-mid" style={{ marginBottom: 40 }}>
          <p className="swim-lede">
            The original SWIM had only two states. The protocol's most useful refinement, SWIM+S,
            adds a third in between.
          </p>
          <p>
            In pure SWIM, a probe either succeeds (alive) or fails (dead). Two outcomes, no middle.
            This forces a hard tradeoff between the probe timeout and the false-positive rate: too
            short and slow nodes are falsely declared dead; too long and detection crawls. The fix
            is an intermediate state, <strong style={{ color: 'var(--suspect)' }}>SUSPECT</strong>.
            It lets the protocol be aggressive about <em>noticing</em> and conservative about{' '}
            <em>committing</em>.
          </p>
          <p>
            When a probe round fails, the node is marked suspect and the suspicion is gossipped out.
            That mark is not a verdict. The accused node, on hearing this rumour, can refute it by
            broadcasting <code>alive(i+1)</code>: a fresh assertion with a higher incarnation
            number, which we'll meet next. If no refutation arrives within a suspicion timeout, the
            suspect is upgraded to <strong style={{ color: 'var(--dead)' }}>DEAD</strong> and that
            fact propagates. Death is absorbing. Once confirmed, the only way back is to rejoin
            under a new identity.
          </p>
        </div>

        <StateMachineInteractive />
      </div>
    </section>
  );
}
