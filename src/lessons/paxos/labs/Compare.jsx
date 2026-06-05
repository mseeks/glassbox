import { useState } from 'react';

// §VII — Paxos beside its more famous cousin, Raft. Tap a side to emphasize it.
const ROWS = [
  [
    'Who may write',
    'Any proposer, any time — no required boss.',
    'Only the elected leader; others route through it.',
  ],
  [
    'Agree one entry',
    'Two-phase majority vote, with the binding rule.',
    'Leader appends, replicates to a majority, commits.',
  ],
  [
    'When two compete',
    'Rivals can livelock; a leader is a bolt-on cure.',
    'An election settles it once, up front.',
  ],
  [
    'Shape of the log',
    'Independent slots; gaps allowed; fill any order.',
    "One gap-free copy; the leader's log is the truth.",
  ],
];

export default function Compare() {
  const [focus, setFocus] = useState('both');
  return (
    <div>
      <div className="pax-ctrls" style={{ marginTop: 0, marginBottom: 4 }}>
        <div className="pax-seg">
          <button className={focus === 'pax' ? 'on' : ''} onClick={() => setFocus('pax')}>
            Paxos
          </button>
          <button className={focus === 'both' ? 'on' : ''} onClick={() => setFocus('both')}>
            Both
          </button>
          <button className={focus === 'raft' ? 'on' : ''} onClick={() => setFocus('raft')}>
            Raft
          </button>
        </div>
        <span className="pax-counter">tap to emphasize one side</span>
      </div>
      <div className="pax-cmp">
        <div className="pax-cmp-row head">
          <div className="pax-cmp-c task">task</div>
          <div className="pax-cmp-c col-pax">Paxos</div>
          <div className="pax-cmp-c col-raft">Raft</div>
        </div>
        {ROWS.map(([t, p, r], k) => (
          <div className="pax-cmp-row" key={k}>
            <div className="pax-cmp-c task">{t}</div>
            <div
              className={`pax-cmp-c col-pax${focus === 'raft' ? ' dim' : ''}`}
              style={{ fontFamily: 'Newsreader, serif', fontWeight: 400, color: 'var(--ink)' }}
            >
              {p}
            </div>
            <div
              className={`pax-cmp-c col-raft${focus === 'pax' ? ' dim' : ''}`}
              style={{ fontFamily: 'Newsreader, serif', fontWeight: 400, color: 'var(--ink)' }}
            >
              {r}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
