import { NEXT } from '../engine/index.js';
import Prose from '../components/Prose.jsx';
import Divider from '../components/Divider.jsx';

// Colophon — the tale, and where it goes next. Gathers the whole arc, then the
// reading list and a closing line. The id stays "colophon" so the proem's TOC
// would still anchor here if it pointed at it.
export default function Coda() {
  return (
    <section className="sg-canto" id="colophon" style={{ paddingBottom: '92px' }}>
      <div className="sg-wrap">
        <div className="sg-rv">
          <Divider />
          <div className="sg-colophon-label">Colophon · the tale, and where it goes next</div>
        </div>
        <div className="sg-rv">
          <div style={{ maxWidth: '64ch', margin: '26px auto 0', textAlign: 'left' }}>
            <Prose>
              <p>
                Gather the whole arc. A saga gives up the single atomic instant that one database
                hands you for free, and rebuilds an atomic <em>outcome</em> from a sequence of local
                commits, each answered by a compensation. It surrenders isolation, then buys back
                slivers of it by hand where anomalies would bite. It is eventually consistent and
                highly available, conducted by choreography or by a durable orchestrator — and it
                holds together only when every action is idempotent.
              </p>
              <p>
                It is not the right tool everywhere, and it asks more of you than a transaction ever
                did. But where a system is too large to share one database and too important to stop
                when a piece of it fails, the saga is how the work still gets told from beginning to
                end — and, when it must, gracefully untold.
              </p>
            </Prose>
          </div>
        </div>
        <div className="sg-rv">
          <div style={{ maxWidth: '64ch', margin: '30px auto 0' }}>
            <div className="sg-numeral" style={{ color: 'var(--gold)' }}>
              where the tale goes next
            </div>
            <div style={{ marginTop: '16px', display: 'grid', gap: '2px' }}>
              {NEXT.map(([t, g]) => (
                <div className="sg-next-row" key={t}>
                  <span className="nt">{t}</span>
                  <span className="nd">{g}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="sg-rv">
          <p className="sg-colophon-close">
            Here the chronicle of the saga ends — a pattern that learned to keep its promises not by
            freezing the world, but by always knowing how to set it right.
          </p>
        </div>
      </div>
    </section>
  );
}
