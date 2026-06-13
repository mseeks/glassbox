// Closing — the single idea, the one distinction worth carrying away, and three
// "where to go next" pointers. Mirrors the original closing block verbatim: a
// plain `chapter foot` section (the original attached no reveal observer here).
import LessonLink from '../../../shared/LessonLink.jsx';

export default function Closing() {
  return (
    <section className="chapter foot">
      <div className="endmark">The single idea</div>
      <div className="pull" style={{ borderColor: 'var(--brass)', marginTop: 18 }}>
        The rarest run of leading zeros betrays how many distinct things you've seen. Split that
        hash across a bank of registers, combine their runs with a harmonic mean, and you trade a
        sliver of accuracy for <em>fixed memory and effortless merging</em>. One sketch, billions
        counted.
      </div>
      <p style={{ marginTop: 24 }}>
        One distinction worth carrying away. Some sketches give a <em className="k">one-sided</em>{' '}
        guarantee. <LessonLink to="bloom-filters">A Bloom filter</LessonLink> is never wrong when it
        says "no." HyperLogLog is different. Its error is <strong>two-sided and relative</strong>,
        roughly plus or minus a percent in either direction, with no hard verdict at all. That is
        the right shape of error for a count. Recognizing which shape a problem wants is half of
        choosing the right tool.
      </p>
      <h3
        style={{
          fontFamily: 'var(--disp)',
          fontWeight: 600,
          textTransform: 'uppercase',
          fontSize: 'clamp(22px,4vw,32px)',
          color: 'var(--truth)',
          margin: '2.4rem 0 0',
        }}
      >
        Where to go next
      </h3>
      <div className="nexts">
        <div className="nx">
          <h4>MinHash + LSH</h4>
          <p>
            Estimates how much two sets <b>overlap</b> rather than how big they are, the natural
            partner for exactly the intersections that HyperLogLog can't do well on its own.
          </p>
        </div>
        <div className="nx">
          <h4>Count&ndash;Min Sketch</h4>
          <p>
            Trades distinctness for <b>frequency</b>: not how many distinct items, but how often
            each one appears. The heavy-hitter finder.
          </p>
        </div>
        <div className="nx">
          <h4>t-digest</h4>
          <p>
            Approximate <b>quantiles</b> in a stream: medians and tail percentiles. Together these
            three summarize a firehose you can never store.
          </p>
        </div>
      </div>
      <div className="sig">
        Built as an instrument: a real MurmurHash3 + HyperLogLog engine drives every reading on this
        page.
      </div>
    </section>
  );
}
