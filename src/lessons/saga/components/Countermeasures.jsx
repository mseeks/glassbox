import { COUNTERMEASURES } from '../engine/index.js';

// §VI figure — the small repertoire of moves that restore a sliver of isolation
// at a single hot spot without dragging the locks back: a semantic lock,
// commutative updates, a reread/version check, and pessimistic ordering.
export default function Countermeasures() {
  return (
    <div className="sg-cm-grid">
      {COUNTERMEASURES.map((c) => (
        <div className="sg-cm-card" key={c.h}>
          <h5>{c.h}</h5>
          <div className="sub">{c.s}</div>
          <p>{c.p}</p>
          <div className="ex sg-mono">{c.e}</div>
        </div>
      ))}
    </div>
  );
}
