import Section from '../components/Section.jsx';

// §I — the consensus problem, framed as a part-time island assembly that must
// never contradict itself.
export default function Problem() {
  return (
    <Section id="problem" roman="I">
      <div className="pax-rv">
        <p className="pax-kicker">The problem</p>
        <h2 className="pax-h2">An assembly that must never contradict itself</h2>
        <p className="pax-prose pax-lead">
          Picture the legislators of a small island. They govern by passing decrees, but they are{' '}
          <span className="pax-em">part-time</span>: members wander in and out of the chamber, and
          messengers carrying votes are slow, get lost, or arrive out of order. No one is in charge.
        </p>
        <p className="pax-prose">
          Despite all that, one rule is sacred:{' '}
          <span className="pax-strong">
            once a decree is on the books, it can never be contradicted.
          </span>{' '}
          Two legislators must never come away believing two different things were passed. This is
          the <span className="pax-em">consensus problem</span> — agreeing on a single value when
          parts of the system can fail and no message can be trusted to arrive.
        </p>
        <p className="pax-prose">
          Strip it to three promises any solution must keep. First, only a decree someone actually
          proposed can pass. Second, at most one decree is ever chosen. Third, once chosen, no one
          ever sees a different one. The middle two are the whole game:{' '}
          <span className="pax-strong">never disagree.</span>
        </p>
        <p className="pax-prose pax-soft">
          The obvious fix — appoint one clerk to decide — fails the moment that clerk steps out: the
          assembly freezes, waiting on a single point of failure. Paxos needs no single clerk. Its
          trick begins with one humble idea about majorities.
        </p>
      </div>
    </Section>
  );
}
