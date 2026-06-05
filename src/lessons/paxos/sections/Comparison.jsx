import Section from '../components/Section.jsx';
import Compare from '../labs/Compare.jsx';

// §VII — Paxos in context, beside Raft and the wider Paxos family.
export default function Comparison() {
  return (
    <Section id="compare" roman="VII">
      <div className="pax-rv">
        <p className="pax-kicker">In context</p>
        <h2 className="pax-h2">Paxos and its more famous cousin, Raft</h2>
        <p className="pax-prose">
          Raft was designed years later as a deliberately{' '}
          <span className="pax-em">understandable</span> consensus algorithm — and in the common
          leader-based case, Multi-Paxos and Raft are nearly the same machine. The honest
          differences are about structure and emphasis, not raw speed.
        </p>
      </div>
      <div className="pax-rv">
        <Compare />
      </div>
      <div className="pax-rv">
        <p className="pax-prose" style={{ marginTop: 16 }}>
          The deepest contrast:{' '}
          <span className="pax-strong">Raft decides who's in charge first</span>, which makes the
          logging itself trivial;{' '}
          <span className="pax-strong">Paxos decides each value directly</span> and treats
          leadership as a mere speed optimization. That's why Raft reads like a recipe and Paxos
          reads like a proof — and why so much research lives in the Paxos family, each variant
          renegotiating a specific cost.
        </p>
        <div className="pax-fam">
          <span>Multi-Paxos</span>
          <span>Fast Paxos</span>
          <span>Flexible Paxos</span>
          <span>EPaxos (leaderless)</span>
          <span>Zab</span>
          <span>Viewstamped Replication</span>
        </div>
      </div>
    </Section>
  );
}
