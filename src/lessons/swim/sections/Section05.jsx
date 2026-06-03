import { IncarnationConflict } from '../labs/IncarnationConflict.jsx';

export function Section05() {
  return (
    <section className="swim-section" id="s05">
      <div className="swim-page">
        <div className="swim-section-header">
          <span className="swim-section-number">§ 05</span>
          <h2 className="swim-section-title">
            The <em>incarnation number</em>
          </h2>
        </div>

        <div className="swim-prose swim-mid" style={{ marginBottom: 36 }}>
          <p className="swim-lede">
            The cluster gossips contradictions: alive here, suspect there, dead somewhere else. So
            it needs a rule for which voice to believe. The incarnation number is that rule.
          </p>
          <p>
            Each node has a private, monotonically increasing counter that only it can advance. When
            it joins, it is at incarnation 0. When it hears itself suspected, it increments to 1 and
            gossips <code>alive(1)</code>. The cluster's rule is then simple:{' '}
            <em>higher incarnation overrides lower</em>. At equal incarnation, suspect overrides
            alive, and dead overrides both. Dead is absorbing. No message can resurrect a
            confirmed-dead member.
          </p>
          <p>
            This is the minimum machinery needed to make a gossip protocol converge in the presence
            of disagreement. Only the subject itself can speak for its own liveness; only its own
            counter can prove that a refutation is fresh rather than stale. The four scenarios below
            show the rule in operation.
          </p>
        </div>

        <IncarnationConflict />

        <div className="swim-rule" />

        <table className="swim-table" style={{ maxWidth: 800 }}>
          <thead>
            <tr>
              <th style={{ width: 240 }}>Current view</th>
              <th style={{ width: 240 }}>Incoming message</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="label">alive(i)</td>
              <td className="swim-mono">alive(j), j &gt; i</td>
              <td>overwrite → alive(j)</td>
            </tr>
            <tr>
              <td className="label">alive(i)</td>
              <td className="swim-mono">suspect(j), j ≥ i</td>
              <td>overwrite → suspect(j)</td>
            </tr>
            <tr>
              <td className="label">suspect(i)</td>
              <td className="swim-mono">alive(j), j &gt; i</td>
              <td>overwrite → alive(j)</td>
            </tr>
            <tr>
              <td className="label">suspect(i)</td>
              <td className="swim-mono">suspect(j), j &gt; i</td>
              <td>overwrite → suspect(j)</td>
            </tr>
            <tr>
              <td className="label">any</td>
              <td className="swim-mono">dead(j)</td>
              <td>
                overwrite → dead(j) <span style={{ color: 'var(--brass)' }}>· absorbing</span>
              </td>
            </tr>
            <tr>
              <td className="label">dead(i)</td>
              <td className="swim-mono">anything</td>
              <td>
                <span style={{ color: 'var(--ink-faint)' }}>discarded</span>
              </td>
            </tr>
            <tr>
              <td className="label">any</td>
              <td className="swim-mono">_(j), j &lt; current_i</td>
              <td>
                <span style={{ color: 'var(--ink-faint)' }}>discarded (stale)</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
