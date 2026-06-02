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
        lede="Three parts turn the idea into a running engine. One catches writes in memory. One insures them on disk. And one preserves them forever, as immutable strata that never change once written."
      />
      <Anatomy />
      <div style={{ height: 28 }} />
      <Prose style={{ marginBottom: 26 }}>
        <p>
          Type below and watch a write travel. It lands in two places at once: the{' '}
          <strong>memtable</strong>, kept sorted, and the <strong>log</strong>, appended. When the
          memtable fills, it freezes into one immutable <strong>SSTable</strong>, a finished
          stratum, and a fresh memtable opens to catch the next writes. That flush is one big
          sequential write. The asymmetry of §II, banked.
        </p>
      </Prose>
      <WriteLab />
    </Movement>
  );
}
