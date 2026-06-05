import Nav from '../components/Nav.jsx';
import Prose from '../components/Prose.jsx';
import Callout from '../components/Callout.jsx';

// Proem — the title plate. The illuminated frontispiece: the SAGA titling, the
// opening drop-capped prose, the idea in one line, and the manuscript's index
// of cantos. The whole proem reveals on scroll as one block (as in the source).
export default function Hero() {
  return (
    <header
      className="sg-wrap"
      style={{ paddingTop: 'clamp(64px,11vh,116px)', paddingBottom: '26px' }}
    >
      <div className="sg-rv">
        <p className="sg-hero-sub">A chronicle of distributed transactions</p>
        <h1 className="sg-hero-title">SAGA</h1>
        <div style={{ maxWidth: '60ch', marginTop: '28px' }}>
          <Prose drop>
            <p>
              Every checkout is a small epic. An order is opened, a card is charged, stock is set
              aside, a courier is booked — four deeds that must stand or fall together. Inside one
              database this is routine: wrap them in a single transaction and the engine guarantees
              all-or-nothing. Split those deeds across four independent services, each with its own
              database, and that guarantee evaporates. There is no shared transaction to roll back,
              no single engine holding the outcome.
            </p>
            <p>
              A <span className="sg-em">saga</span> is the answer the field arrived at: stop
              pretending the four deeds are one instant, and tell them instead as a{' '}
              <em>sequence</em> — each step committing on its own, each carrying a way to be undone
              if a later step fails. The name is not an acronym. It is the old word for a long tale
              told in episodes, and when the hero’s journey goes wrong, the closing chapters narrate
              the undoing.
            </p>
          </Prose>
        </div>
        <Callout kind="key" label="the idea in one line">
          A saga trades a single atomic <em>instant</em> for an atomic <em>outcome</em> — a chain of
          local commits, each with a compensating transaction ready to answer it, converging on “all
          done” or “all undone.”
        </Callout>
        <Nav />
      </div>
    </header>
  );
}
