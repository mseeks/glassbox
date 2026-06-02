import { LoadComparison } from '../labs/LoadComparison.jsx';

export function Section01() {
  return (
    <section className="swim-section" id="s01">
      <div className="swim-page">
        <div className="swim-section-header">
          <span className="swim-section-number">§ 01</span>
          <h2 className="swim-section-title">
            The <em>question</em>
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 56,
            alignItems: 'start',
          }}
          className="swim-grid-stack"
        >
          <div className="swim-prose">
            <p className="swim-lede">
              You have a thousand machines. They need to know which of them are still alive. How do
              you ask?
            </p>
            <p>
              The naive answer is <em>everyone pings everyone</em>. Every node, every second, sends
              a heartbeat to every other. It works, technically. It also burns N·(N−1) messages each
              round. At a thousand nodes that is a million packets a second across the cluster —
              before anything useful has happened.
            </p>
            <p>
              The second naive answer is <em>elect a watcher</em>. One node pings all others;
              everyone reports to it. The arithmetic looks better — O(N) — but now the watcher is a
              single point of failure, a hot spot for traffic, and the cluster needs a way to
              reliably detect <em>its</em> demise. The problem has not been solved; it has been
              recursed.
            </p>
            <p>
              SWIM does neither. Every node performs{' '}
              <strong>a constant amount of work per round, independent of N</strong>. Try each
              strategy below and watch the cost.
            </p>
          </div>
          <div>
            <LoadComparison />
          </div>
        </div>
      </div>
    </section>
  );
}
