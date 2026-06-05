import { CVR_ROLLBACK, CVR_COMPENSATION } from '../engine/index.js';

// §III figure — the distinction everyone gets wrong: a rollback rewinds
// uncommitted state inside one database; a compensation is a brand-new forward
// transaction that semantically negates an already-committed one.
export default function CompensationVsRollback() {
  const [v3, v2, v1] = CVR_ROLLBACK;
  const [charge, refund] = CVR_COMPENSATION;
  return (
    <div className="sg-cvr">
      <div className="sg-cvr-col roll">
        <h5>rollback — a rewind</h5>
        <div className="sg-cvr-tl">
          <span className="sg-cvr-node">{v3}</span>
          <span aria-hidden="true">→</span>
          <span className="sg-cvr-node" style={{ textDecoration: 'line-through', opacity: 0.5 }}>
            {v2}
          </span>
          <span aria-hidden="true">→</span>
          <span className="sg-cvr-node" style={{ borderColor: 'var(--ink)' }}>
            {v1}
          </span>
        </div>
        <p>
          Inside one database, abort discards uncommitted changes as if they never happened — the
          prior state is still there to return to. Across services, every step has already{' '}
          <b style={{ fontStyle: 'normal', color: 'var(--ink)' }}>committed</b> and become visible.
          There is nothing left to rewind.
        </p>
      </div>
      <div className="sg-cvr-col comp">
        <h5>compensation — a new chapter</h5>
        <div className="sg-cvr-tl">
          <span className="sg-cvr-node">{charge}</span>
          <span style={{ color: 'var(--vermilion)' }} aria-hidden="true">
            →
          </span>
          <span
            className="sg-cvr-node"
            style={{ borderColor: 'var(--vermilion)', color: 'var(--vermilion)' }}
          >
            {refund}
          </span>
        </div>
        <p>
          A compensation is a brand-new forward transaction that <b>semantically negates</b> an
          earlier one. You never un-charge a card — you issue a refund. The charge stays in the
          ledger forever; the refund is the chapter that answers it.
        </p>
      </div>
    </div>
  );
}
