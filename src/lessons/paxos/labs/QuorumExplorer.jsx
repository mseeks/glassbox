import { useState } from 'react';

// §II — pick any two quorums of five and watch what they must share. Two
// majorities of five (3 + 3 = 6 > 5) can never be disjoint: the overlapping
// legislator is the "witness" that carries memory between rounds.
export default function QuorumExplorer() {
  const N = 5;
  const [qa, setQa] = useState([true, true, true, false, false]);
  const [qb, setQb] = useState([false, false, true, true, true]);
  const tA = qa.filter(Boolean).length,
    tB = qb.filter(Boolean).length;
  const overlap = qa.map((v, i) => v && qb[i]);
  const nOver = overlap.filter(Boolean).length;
  const bothMaj = tA >= 3 && tB >= 3;
  const witnesses = overlap.map((v, i) => (v ? i + 1 : null)).filter((x) => x);

  const node = (i) => {
    const inA = qa[i],
      inB = qb[i];
    const c = inA && inB ? 'both' : inA ? 'a' : inB ? 'b' : '';
    const ang = (-90 + i * (360 / N)) * (Math.PI / 180);
    const left = 50 + 38 * Math.cos(ang),
      top = 50 + 38 * Math.sin(ang);
    return (
      <div key={i} className={`pax-node ${c}`} style={{ left: `${left}%`, top: `${top}%` }}>
        {i + 1}
        {inA && inB && <small style={{ color: '#3a2c08' }}>witness</small>}
      </div>
    );
  };

  return (
    <div className="pax-lab">
      <div className="pax-lab-h">
        <span className="pax-lab-t">The Witness</span>
      </div>
      <p className="pax-lab-sub">
        Choose any two quorums (each needs 3 of 5 to be a majority). Watch what they share.
      </p>
      <div className="pax-ringwrap">
        <div className="pax-ring">
          <div className="hub">
            5 legislators
            <br />
            in the chamber
          </div>
          {Array.from({ length: N }, (_, i) => node(i))}
        </div>
      </div>

      <div className="pax-qrow">
        <span className="pax-qlab" style={{ color: 'var(--aegean-deep)' }}>
          Quorum A
        </span>
        {qa.map((v, i) => (
          <button
            key={i}
            className={`pax-dot ${v ? 'aOn' : ''}`}
            aria-pressed={v}
            aria-label={`Quorum A · legislator ${i + 1}`}
            onClick={() => setQa((s) => s.map((x, j) => (j === i ? !x : x)))}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="pax-qrow">
        <span className="pax-qlab" style={{ color: 'var(--sea)' }}>
          Quorum B
        </span>
        {qb.map((v, i) => (
          <button
            key={i}
            className={`pax-dot ${v ? 'bOn' : ''}`}
            aria-pressed={v}
            aria-label={`Quorum B · legislator ${i + 1}`}
            onClick={() => setQb((s) => s.map((x, j) => (j === i ? !x : x)))}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="pax-readout">
        <span>
          Quorum A: <b>{tA}</b>
          {tA >= 3 ? ' ✓' : ' (need 3)'}
        </span>
        <span>
          Quorum B: <b>{tB}</b>
          {tB >= 3 ? ' ✓' : ' (need 3)'}
        </span>
        <span>
          shared: <b>{nOver ? witnesses.join(', ') : 'none'}</b>
        </span>
      </div>

      {bothMaj ? (
        <div className="pax-insight gold">
          Two majorities of five:{' '}
          <b className="pax-mono">
            {tA} + {tB} = {tA + tB} &gt; {N}
          </b>
          , so they <em>cannot</em> be separate. Legislator{witnesses.length > 1 ? 's' : ''}{' '}
          {witnesses.join(' & ')} sit{witnesses.length > 1 ? '' : 's'} in both — the{' '}
          <span className="pax-strong">witness</span> who carries memory from one quorum to the
          next. There is no way to make two majorities disjoint.
        </div>
      ) : (
        <div className="pax-insight">
          A quorum is a <span className="pax-strong">majority</span> — here, 3 of 5. Make both A and
          B majorities and try to keep them apart; you'll find you can't.
        </div>
      )}
    </div>
  );
}
