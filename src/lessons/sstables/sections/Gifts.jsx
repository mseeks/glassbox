import { useState } from 'react';
import { HardDrive, Lock, Database, Layers, GitMerge, Snowflake, ChevronRight } from 'lucide-react';
import Section from '../components/Section.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import Seg from '../components/Seg.jsx';

// §VIII — what immutability gives, and the one bill it sends (write amplification),
// with a reads-vs-writes dial the reader can swing.
const GIFTS = [
  {
    ic: HardDrive,
    t: 'Sequential writes',
    d: 'A frozen file is written front to back, once. No scattered random writes — the disk’s favourite access pattern.',
  },
  {
    ic: Lock,
    t: 'Lock-free reads',
    d: 'Nothing ever changes, so readers need no latches and none of the crabbing a mutable tree requires. Concurrent reads are trivially safe.',
  },
  {
    ic: Database,
    t: 'Cache & checksum once',
    d: 'Memory-map it, checksum it, trust it forever. The file can’t rot out from under a cached copy.',
  },
  {
    ic: Layers,
    t: 'Snapshots & versions free',
    d: 'A snapshot is just the set of files that existed at a moment. Readers keep old files while compaction builds new ones beside them.',
  },
];
const LOADS = {
  write: {
    label: 'Write-heavy',
    verdict:
      'Immutability shines. Writes land sequentially and cheaply; you defer the cost to background compaction. This is the log-structured side of the dial.',
    lean: 'favours SSTables + a memtable',
  },
  mixed: {
    label: 'Mixed',
    verdict:
      'The dial sits in the middle. You tune block size, bloom-filter bits, and compaction strategy to balance the read path against write amplification.',
    lean: 'tune to taste',
  },
  read: {
    label: 'Read-heavy',
    verdict:
      'An in-place B-tree can win: one structure to consult instead of several stacked files, and no compaction rewrites. The cost moves to scattered writes.',
    lean: 'favours a B-tree',
  },
};

export default function Gifts() {
  const [load, setLoad] = useState('mixed');
  const L = LOADS[load];
  return (
    <Section id="gifts">
      <SectionHeading
        roman="VIII"
        kicker="the payoff"
        title="Everything frozen gives back"
        dek="Almost every virtue of a sorted string table traces to one fact: it is written once and never altered. The bill comes due in exactly one place."
      />
      <div className="sst-ledger">
        <div className="sst-ledger-col gifts">
          <div className="sst-ledger-lab">
            <Snowflake size={13} aria-hidden="true" /> what immutability gives
          </div>
          {GIFTS.map((g) => {
            const Ic = g.ic;
            return (
              <div key={g.t} className="sst-gift">
                <span className="sst-gift-ic">
                  <Ic size={16} aria-hidden="true" />
                </span>
                <div>
                  <div className="sst-gift-t">{g.t}</div>
                  <div className="sst-gift-d">{g.d}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="sst-ledger-col cost">
          <div className="sst-ledger-lab" style={{ color: 'var(--blood)' }}>
            <GitMerge size={13} aria-hidden="true" /> what it costs
          </div>
          <div className="sst-gift">
            <span className="sst-gift-ic cost">
              <GitMerge size={16} aria-hidden="true" />
            </span>
            <div>
              <div className="sst-gift-t">Write amplification</div>
              <div className="sst-gift-d">
                You can’t edit in place, so data is rewritten several times over its life as
                compaction merges runs. The same bytes are paid for more than once — quietly, in the
                background.
              </div>
            </div>
          </div>
          <div className="sst-dial">
            <div className="sst-tiny" style={{ marginBottom: 8 }}>
              the reads-vs-writes dial · pick your workload
            </div>
            <Seg
              ariaLabel="workload"
              value={load}
              onChange={setLoad}
              options={[
                { value: 'write', label: 'Write-heavy' },
                { value: 'mixed', label: 'Mixed' },
                { value: 'read', label: 'Read-heavy' },
              ]}
            />
            <p className="sst-dial-verdict">{L.verdict}</p>
            <div className="sst-dial-lean">
              <ChevronRight size={13} aria-hidden="true" /> {L.lean}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
