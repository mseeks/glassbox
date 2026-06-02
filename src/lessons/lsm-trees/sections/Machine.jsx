import Movement from '../components/Movement.jsx';
import Heading from '../components/Heading.jsx';
import Prose from '../components/Prose.jsx';
import Anatomy from '../labs/Anatomy.jsx';
import WriteLab from '../labs/WriteLab.jsx';

// §III — The machine. Memtable + log + immutable strata.
export default function Machine() {
  return (
    <Movement id="machine">
      <Heading
        n="III"
        kicker="the machine"
        title="Memtable, Log, Stratum"
        lede="Three parts turn the idea into a running engine. One catches writes in memory, one insures them on disk, and one preserves them forever as immutable strata."
      />
      <Anatomy />
      <div style={{ height: 28 }} />
      <Prose style={{ marginBottom: 26 }}>
        <p>
          Type below and watch a write travel. It lands in the <strong>memtable</strong> (kept
          sorted) and the <strong>log</strong> (appended). When the memtable fills, it freezes into
          one immutable <strong>SSTable</strong>, a finished stratum, and a new memtable opens. That
          flush is one big sequential write: the asymmetry of §II, banked.
        </p>
      </Prose>
      <WriteLab />
    </Movement>
  );
}
