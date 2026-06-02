import Head from '../components/Head.jsx';
import RememberHero from '../labs/RememberHero.jsx';

// §05 — Why it grew. Each leap unlocked a kind: each new category of content
// is heavier than the last.
export default function Why() {
  return (
    <section id="why">
      <div className="wrap">
        <Head num="05" kicker="Why it grew, what it cost" title="Each leap unlocked a kind." />
        <div className="rev">
          <p className="lead" style={{ marginBottom: 18 }}>
            More memory was never just "more room." Each thousandfold leap unlocked a whole new{' '}
            <em className="term">category</em> of thing a computer could do. Each new kind of
            content is far heavier than the last.
          </p>
        </div>
        <div className="rev" style={{ margin: '4px 0 26px' }}>
          <RememberHero />
        </div>
        <div className="rev">
          <div className="callout">
            <span style={{ fontSize: 16 }}>
              The whole story in one line: a modern phone keeps about{' '}
              <strong style={{ color: 'var(--amber-hi)' }}>100,000 times</strong> the working memory
              that landed humans on the Moon. We now spend more of it animating a single button than
              the Apollo computer had for the entire descent to the lunar surface.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
