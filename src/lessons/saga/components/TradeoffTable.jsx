import { TRADEOFFS } from '../engine/index.js';

// §VIII figure — the honest ledger of costs, property by property, for
// two-phase commit beside the saga.
export default function TradeoffTable() {
  return (
    <div className="sg-tt-wrap sg-scrollx">
      <table className="sg-tt">
        <thead>
          <tr>
            <th>property</th>
            <th className="twopc">two-phase commit</th>
            <th className="saga">saga</th>
          </tr>
        </thead>
        <tbody>
          {TRADEOFFS.map((r) => (
            <tr key={r[0]}>
              <th>{r[0]}</th>
              <td>{r[1]}</td>
              <td>{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
