import { Database, Layers, AlignLeft, Filter, HardDrive, GitMerge } from 'lucide-react';
import Section from '../components/Section.jsx';
import SectionHeading from '../components/SectionHeading.jsx';

// §X — where the SSTable sits among its neighbours, where to go next, and the
// sources. Broad-audience framing: general structures, no personalised links.
const FAMILY = [
  {
    ic: Database,
    t: 'The B-tree',
    d: 'The mutable cousin. It edits pages in place and stays read-optimised — the other end of the reads-versus-writes dial.',
  },
  {
    ic: Layers,
    t: 'The LSM tree',
    d: 'The system these files live inside: a memtable on top, levels of sorted tables beneath, compaction running underneath it all.',
  },
  {
    ic: AlignLeft,
    t: 'Tries & FSTs',
    d: 'Push prefix-sharing all the way and a block index becomes a finite-state transducer — a denser static index over sorted keys.',
  },
  {
    ic: Filter,
    t: 'The bloom filter',
    d: 'The doorman in section VI. A tiny probabilistic set that answers ‘definitely not’ or ‘maybe’, never a false ‘no’.',
  },
  {
    ic: HardDrive,
    t: 'The memory hierarchy',
    d: 'Blocks exist because a disk charges per trip, not per byte. The whole design is an argument with that one fact.',
  },
  {
    ic: GitMerge,
    t: 'Merge sort',
    d: 'Compaction is external merge sort wearing a database hat — the same k-way streaming merge that sorts data too big for memory.',
  },
];
const NEXT = [
  {
    t: (
      <>
        The <b>full read path</b>: how a get checks the memtable, then each level newest-first,
        stopping at the first hit — and how the bloom filters keep that cheap.
      </>
    ),
  },
  {
    t: (
      <>
        The <b>bloom-bit budget</b>: spending more filter bits on the levels you probe most. The{' '}
        <i>Monkey</i> work and RocksDB’s tuning live here.
      </>
    ),
  },
  {
    t: (
      <>
        The <b>compaction strategies</b> — leveled, tiered, FIFO — and how each trades write
        amplification against read and space amplification.
      </>
    ),
  },
  {
    t: (
      <>
        The <b>static index frontier</b>: succinct structures and finite-state transducers that
        shrink the index itself, as Lucene and others do.
      </>
    ),
  },
];

export default function Family() {
  return (
    <Section id="family">
      <SectionHeading
        roman="X"
        kicker="the field"
        title="Where this sits"
        dek="A sorted string table is one idea in a small, tightly related family. Knowing its neighbours is what turns a trick into an instinct."
      />

      <div className="sst-fam">
        {FAMILY.map((f) => {
          const Ic = f.ic;
          return (
            <div key={f.t} className="sst-gift">
              <span
                className="sst-gift-ic"
                style={{
                  background: 'var(--steel-wash)',
                  color: 'var(--steel)',
                  borderColor: 'var(--steel)',
                }}
              >
                <Ic size={16} aria-hidden="true" />
              </span>
              <div>
                <div className="sst-gift-t">{f.t}</div>
                <div className="sst-gift-d">{f.d}</div>
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="sst-h3" style={{ marginBottom: 14 }}>
        Where to go next
      </h3>
      <div className="sst-next">
        {NEXT.map((n, i) => (
          <div key={i} className="sst-next-item">
            <span className="sst-next-n">{i + 1}</span>
            <span className="sst-next-t">{n.t}</span>
          </div>
        ))}
      </div>

      <p className="sst-coda">
        A sealed page keeps two promises: it is in order, and it will not change its story. The
        index, the filter, the merge — every part of the machine is just a way of trusting those two
        promises a little harder.
      </p>

      <div className="sst-colophon">
        <div className="sst-colophon-lab">colophon · sources</div>
        <p className="sst-cite">
          <b>Chang, Dean, Ghemawat, et al.</b> “Bigtable: A Distributed Storage System for
          Structured Data.” OSDI, 2006 — where the SSTable was named.
        </p>
        <p className="sst-cite">
          <b>O’Neil, Cheng, Gawlick &amp; O’Neil.</b> “The Log-Structured Merge-Tree (LSM-Tree).”
          Acta Informatica, 1996.
        </p>
        <p className="sst-cite">
          <b>Dayan, Athanassoulis &amp; Idreos.</b> “Monkey: Optimal Navigable Key-Value Store.”
          SIGMOD, 2017 — on budgeting bloom bits.
        </p>
        <p className="sst-cite">
          <b>Google LevelDB</b> &amp; <b>Facebook RocksDB</b> — the open-source lineage these ideas
          ship in today.
        </p>
      </div>
    </Section>
  );
}
