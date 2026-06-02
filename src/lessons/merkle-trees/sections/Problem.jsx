import { Reveal } from '../../../shared/reveal.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import Plate from '../components/Plate.jsx';

// §1 — Trust at scale, on a budget. Pure prose; the two questions every
// Merkle-style structure exists to answer.
export default function Problem() {
  return (
    <section className="mk-section">
      <SectionHeader id="problem" kicker="The Problem" title="Trust at scale, on a budget" />
      <Reveal base="mk-reveal" className="mk-prose">
        <p className="lead">
          You hold something large. A folder of files, a ledger of transactions, the entire state of
          a database. You want to answer two deceptively simple questions, and you want to answer
          them <em>cheaply</em>.
        </p>
      </Reveal>

      <Reveal base="mk-reveal">
        <div className="mk-grid-cards" style={{ margin: '8px 0 26px' }}>
          <Plate>
            <div className="mk-tag" style={{ marginBottom: 10, display: 'inline-block' }}>
              Question One
            </div>
            <h3 className="mk-h3">Has anything changed?</h3>
            <p style={{ margin: 0, color: 'var(--paper-dim)' }}>
              Given two copies of the dataset, has even a single byte drifted apart? And can you
              tell without shipping the whole thing across the wire to compare?
            </p>
          </Plate>
          <Plate>
            <div className="mk-tag" style={{ marginBottom: 10, display: 'inline-block' }}>
              Question Two
            </div>
            <h3 className="mk-h3">Does this piece belong?</h3>
            <p style={{ margin: 0, color: 'var(--paper-dim)' }}>
              Is <em>this exact item</em> truly part of the dataset? And can I{' '}
              <strong>prove</strong> it to someone who doesn't hold the dataset at all?
            </p>
          </Plate>
        </div>
      </Reveal>

      <Reveal base="mk-reveal" className="mk-prose">
        <p>
          The lazy answer to both is "ship everything and compare." That costs bandwidth and time
          proportional to the whole dataset. It is hopeless when the dataset is a blockchain, a
          global certificate log, or a multi-terabyte database shard.
        </p>
        <p>
          A cleverer first move: hash the entire dataset into one small digest. Now Question One is
          free. Equal digests mean equal data. But Question Two collapses. Knowing
          <span className="mk-code-inline"> H(everything) = 7f3a…</span> tells you nothing about
          whether one specific record is inside. The digest is a single opaque pebble; it has no
          seams you can pry open to inspect a part.
        </p>
        <div className="mk-marginalia">
          The whole idea of a Merkle tree is to hash the dataset <em>with structure</em>, so the
          same fingerprint that answers "did anything change?" also becomes a witness for "is this
          piece inside?" The cost grows only with the <em>logarithm</em> of the dataset's size.
        </div>
        <p>Structure is nearly free. The payoff is enormous. That trade is the entire subject.</p>
      </Reveal>
    </section>
  );
}
