import { Chapter } from '../components/Chapter.jsx';

const LABEL_STYLE = {
  fontSize: '0.72rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
};

const NEXT = [
  [
    'The original paper.',
    "Burton Bloom's 1970 note, “Space/Time Trade-offs in Hash Coding with Allowable Errors,” " +
      'is four pages and still the clearest derivation of the bound you tuned in the math lab.',
  ],
  [
    'The sketch family, formally.',
    'HyperLogLog, Count-Min, and MinHash all trade exactness for bounded error in bounded space. ' +
      'Read them as one toolkit and the membership filter stops looking like a special case.',
  ],
  [
    'Filters inside an LSM tree.',
    'Trace one point lookup through RocksDB or Cassandra: the filter is what lets a read skip whole ' +
      'SSTables it knows it can ignore. The amplification math is where the savings become money.',
  ],
  [
    'The succinct-structures frontier.',
    'Quotient, cuckoo, and ribbon filters push toward the information-theoretic floor for ' +
      'approximate membership. That floor, and how close each design sits to it, is the open question.',
  ],
];

export function Coda() {
  return (
    <Chapter num="11" title="Coda" anchor="coda">
      <p className="bf-ui bf-mark-muted" style={{ ...LABEL_STYLE, marginBottom: '0.75rem' }}>
        The one idea
      </p>
      <div className="bf-pullquote" style={{ marginTop: 0 }}>
        A Bloom filter is never the answer to a question. It is a fast way to know you can skip{' '}
        <em>asking</em> the real answer.
      </div>
      <p>
        The real answer always lives somewhere else: in the SSTable, the cache, the database, the
        source of truth. The filter only ever says <strong>definitely not</strong> &mdash; trust it,
        skip the lookup &mdash; or <strong>probably yes</strong> &mdash; don't trust it, go check.
        Hold that asymmetry in mind and every variant in the family falls into place. They are all,
        every one of them, ways to skip work with one-sided error in bounded space.
      </p>

      <p
        className="bf-ui bf-mark-muted"
        style={{ ...LABEL_STYLE, marginTop: '3rem', marginBottom: '0.75rem' }}
      >
        Where to go next
      </p>
      {NEXT.map(([title, body]) => (
        <p key={title}>
          <strong>{title}</strong> {body}
        </p>
      ))}
    </Chapter>
  );
}
