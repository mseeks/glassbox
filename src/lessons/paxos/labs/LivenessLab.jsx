import { useState } from 'react';
import { scLeader, scLivelock } from '../engine/index.js';
import Walkthrough from '../components/Walkthrough.jsx';

// §V — the F-L-P limit, made tangible. Two rivals livelock forever; a single
// leader settles in one pass. Safety never wavers in either case — only progress.
export default function LivenessLab() {
  const [leader, setLeader] = useState(false);
  return (
    <div className="pax-lab">
      <div className="pax-lab-h">
        <span className="pax-lab-t">{leader ? 'One Leader' : 'The Duel'}</span>
        <div className="pax-seg">
          <button className={leader ? '' : 'on'} onClick={() => setLeader(false)}>
            Two rivals
          </button>
          <button className={leader ? 'on' : ''} onClick={() => setLeader(true)}>
            Elect a leader
          </button>
        </div>
      </div>
      <p className="pax-lab-sub">
        {leader
          ? 'Funnel every proposal through one distinguished proposer. No one out-bids anyone.'
          : 'Two proposers race. Step through, or press Play, and watch nothing get carved.'}
      </p>
      <Walkthrough
        build={leader ? scLeader : scLivelock}
        scenarioKey={leader ? 'leader' : 'livelock'}
        autoplayable={!leader}
        footnote={
          leader
            ? 'With a single leader, the protocol settles in one pass. Safety was never in question — only progress was, and a leader restores it.'
            : "Each Prepare poisons the other's pending Accept, forever. This kind of non-termination is exactly what the F-L-P result proves no deterministic protocol can always avoid: in a network that can delay messages without bound, none can promise consensus always finishes. Paxos keeps correctness and gives up only the guarantee of progress."
        }
      />
    </div>
  );
}
