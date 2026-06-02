import { Reveal } from '../../../shared/reveal.jsx';
import SectionHeader from '../components/SectionHeader.jsx';

const APPS = [
  [
    'Git',
    'Every commit is a Merkle root over your file tree, chained to its parent. Change one byte of history and every later commit hash changes. That is why a repository can verify its own integrity.',
  ],
  [
    'Bitcoin & light wallets',
    'Each block header carries a Merkle root over its transactions. A light client trusts only headers and asks for a log-sized proof that its own transaction was included. It never downloads the chain.',
  ],
  [
    'Ethereum',
    'Three Patricia tries per block: state, transactions, receipts. The state root is a single commitment to every account on the network, enabling proofs about any slice of world state.',
  ],
  [
    'Certificate Transparency',
    'Public append-only logs of every TLS certificate. Browsers verify a certificate is logged, and that the log itself has not rewritten its own history, via two kinds of log-sized proof.',
  ],
  [
    'IPFS & content addressing',
    'Files are chunked, hashed, and woven into a Merkle DAG. The address you link to IS the root hash. The name of the data is also the proof of its integrity.',
  ],
  [
    'Database anti-entropy',
    'Replicated stores keep Merkle trees over their key ranges and reconcile divergence by exchanging roots and descending only into mismatches. Bandwidth stays proportional to the drift.',
  ],
];

// §10 — Where the seal is used in the wild.
export default function Applications() {
  return (
    <section className="mk-section">
      <SectionHeader id="applications" kicker="In the Wild" title="Where the seal is used" />
      <Reveal base="mk-reveal" className="mk-prose">
        <p className="lead">
          Once you can commit to a dataset in one fingerprint and prove any part in a logarithm, the
          same shape reappears across the whole field. It turns up in version control, blockchains,
          transparency logs, storage, and databases.
        </p>
      </Reveal>
      <Reveal base="mk-reveal">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            background: 'var(--line)',
            border: '1px solid var(--line)',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {APPS.map(([t, d]) => (
            <div key={t} className="mk-app-row">
              <div className="mk-display" style={{ fontSize: 19, color: 'var(--gold-bright)' }}>
                {t}
              </div>
              <div style={{ fontSize: 15.5, color: 'var(--paper-dim)', lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
