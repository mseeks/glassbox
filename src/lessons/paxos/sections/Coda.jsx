import Section from '../components/Section.jsx';

// §VIII — the one idea to carry away, and where to go next.
const NEXT = [
  [
    'i',
    'The TLA+ specification',
    "Lamport's own formal spec — the cleanest way to see the core invariant proven rather than argued.",
  ],
  [
    'ii',
    'F-L-P, in full',
    'Derive the impossibility once, and every “we escape it with…” claim becomes concrete instead of a slogan.',
  ],
  [
    'iii',
    'Leaderless consensus (EPaxos)',
    'What you buy by dropping the single leader: non-conflicting commands committing in one round trip, no bottleneck.',
  ],
  [
    'iv',
    'Flexible quorums',
    'You only need the two quorums to overlap — not both to be majorities. Tune latency against fault tolerance.',
  ],
];

export default function Coda() {
  return (
    <Section id="coda" roman="VIII">
      <div className="pax-rv">
        <p className="pax-kicker">The one idea</p>
        <h2 className="pax-h2">What to carry away</h2>
        <div className="pax-coda">
          <p className="pax-prose pax-lead" style={{ marginBottom: 14 }}>
            Strip everything else and one sentence remains:{' '}
            <span className="pax-em">
              a decree may be chosen only once a majority is bound to it, and any later majority is
              forced to honor what the witness remembers.
            </span>
          </p>
          <p className="pax-prose" style={{ marginBottom: 0 }}>
            Every other rule — the rising ballots, the two phases, the leader — exists to feed that
            one guarantee the right information. The two phases consult the witness; the binding
            rule obeys it; the leader keeps proposers from squabbling long enough to make progress.
            Quorum overlap does the real work; the rest is bookkeeping in its service.
          </p>
        </div>
        <p className="pax-kicker" style={{ marginTop: 30 }}>
          Where to go next
        </p>
        <div className="pax-next">
          {NEXT.map(([n, t, d]) => (
            <div className="ni" key={n}>
              <span className="nn">{n}</span>
              <div>
                <span className="nt">{t}</span>
                <div className="nd">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
