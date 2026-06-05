import { Fragment } from 'react';
import { Pencil, FileText, BookMarked, ArrowRight, GitMerge } from 'lucide-react';
import Section from '../components/Section.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import Plate from '../components/Plate.jsx';

// §IX — the whiteboard, the press, the bound book: keep the mutable structure
// in memory, freeze it into an immutable one when it touches the disk.
const MARRIAGE = [
  {
    ic: Pencil,
    tag: 'memtable',
    state: 'mutable',
    where: 'in memory',
    tone: 'steel',
    d: 'A sorted, editable index where mutation is cheap. Edits and deletes land here instantly.',
  },
  {
    ic: FileText,
    tag: 'flush',
    state: 'freeze',
    where: 'the press',
    tone: 'blood',
    d: 'When it fills, it is written out — once, sequentially — and never touched again.',
  },
  {
    ic: BookMarked,
    tag: 'SSTable',
    state: 'immutable',
    where: 'on disk',
    tone: 'sage',
    d: 'Sorted keys, frozen. Fast indexed reads, with none of the write cost of editing in place.',
  },
];

export default function Marriage() {
  return (
    <Section id="marriage">
      <SectionHeading
        roman="IX"
        kicker="the synthesis"
        title="The whiteboard and the book"
        dek="A log-structured store is a marriage: keep the mutable sorted structure where mutation is free, and freeze it into an immutable one the instant it touches the medium that hates change."
      />

      <Plate cap="memtable → flush → sstable" capRight="compaction is the publisher">
        <div className="sst-flow">
          {MARRIAGE.map((m, idx) => {
            const Ic = m.ic;
            const tone =
              m.tone === 'steel'
                ? 'var(--steel)'
                : m.tone === 'blood'
                  ? 'var(--blood)'
                  : 'var(--sage)';
            return (
              <Fragment key={m.tag}>
                <div className="sst-flow-card" style={{ borderTopColor: tone }}>
                  <span className="sst-flow-ic" style={{ color: tone }}>
                    <Ic size={20} aria-hidden="true" />
                  </span>
                  <div className="sst-flow-tag" style={{ color: tone }}>
                    {m.tag}
                  </div>
                  <div className="sst-flow-state">
                    {m.state} · {m.where}
                  </div>
                  <p className="sst-flow-d">{m.d}</p>
                </div>
                {idx < MARRIAGE.length - 1 && (
                  <div className="sst-flow-arrow" aria-hidden="true">
                    <ArrowRight size={18} />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
        <div className="sst-flow-loop">
          <GitMerge size={15} aria-hidden="true" />
          <span>
            Many books, merged into a new edition — the old ones retired once no reader needs them.
            To edit a printed book you don’t scribble in it; you print a new edition.
          </span>
        </div>
      </Plate>

      <p className="sst-pull">
        Keep the mutable thing in memory, where mutation is free. Freeze it on disk, where mutation
        is ruin. The whole design is that one sentence.
      </p>
    </Section>
  );
}
