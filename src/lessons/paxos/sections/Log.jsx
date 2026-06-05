import Section from '../components/Section.jsx';
import MultiPaxosLog from '../labs/MultiPaxosLog.jsx';

// §VI — from a single decree to a whole replicated log: one Paxos instance per
// slot, and the Multi-Paxos optimization that makes it practical.
export default function Log() {
  return (
    <Section id="log" roman="VI">
      <div className="pax-rv">
        <p className="pax-kicker">Making it useful</p>
        <h2 className="pax-h2">From one decree to a whole legal code</h2>
        <p className="pax-prose">
          Agreeing on a single value is rarely the goal. What you usually want is an agreed{' '}
          <span className="pax-em">sequence</span> of commands — a log that drives identical copies
          of a service. The move is almost insultingly simple: run one independent Paxos instance
          per slot. Slot 0 decides the first command, slot 1 the next, and so on.
        </p>
        <p className="pax-prose">
          Done plainly, that's two round trips per command. The optimization that makes it practical
          — <span className="pax-strong">Multi-Paxos</span> — lets a stable leader run Phase 1 once
          for all future slots, after which each command costs a single round trip. Toggle it below.
        </p>
      </div>
      <div className="pax-rv">
        <MultiPaxosLog />
      </div>
    </Section>
  );
}
