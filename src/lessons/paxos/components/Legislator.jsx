import { fmt } from '../engine/index.js';

// One acceptor's card in a walkthrough: who it is, what it just did this step
// (the badge + role line), and its remembered state (highest promise, last
// vote, and the decree it holds). `status` comes from the engine's statusFor.
export default function Legislator({ a, status, witness }) {
  const cls = ['pax-leg', status, witness ? 'witness' : ''].join(' ').trim();
  const badge =
    status === 'prep' ? (
      <span className="badge bPrep">PREP</span>
    ) : status === 'vote' ? (
      <span className="badge bVote">VOTE</span>
    ) : status === 'reject' ? (
      <span className="badge bRej">NO</span>
    ) : null;
  const role =
    status === 'promise'
      ? 'promised'
      : status === 'vote'
        ? 'voted'
        : status === 'reject'
          ? 'rejected'
          : status === 'prep'
            ? 'asked'
            : ' ';
  return (
    <div className={cls}>
      {badge}
      <div className="who">{a.id + 1}</div>
      <div className="role">{role}</div>
      <div className="st">
        <span className="k">prom </span>
        {fmt(a.promised)}
      </div>
      <div className="st">
        <span className="k">vote </span>
        {fmt(a.acceptedN)}
      </div>
      <div className="v">{a.acceptedV || ' '}</div>
    </div>
  );
}
