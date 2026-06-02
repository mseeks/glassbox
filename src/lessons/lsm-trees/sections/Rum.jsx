import Movement from '../components/Movement.jsx';
import Heading from '../components/Heading.jsx';
import Prose from '../components/Prose.jsx';
import RumLab from '../labs/RumLab.jsx';

// §VI — The trade you cannot escape. Read · Update · Memory.
export default function Rum() {
  return (
    <Movement id="rum" dark>
      <Heading
        n="VI"
        kicker="the trade you cannot escape"
        title="Read · Update · Memory"
        lede="The compaction choice from §V is one instance of a law that binds every storage structure ever built. You may favour two of three costs. The third always pays."
      />
      <Prose style={{ marginBottom: 26 }} dropcap>
        <p>
          Athanassoulis and colleagues named it in 2016: among <strong>read</strong>,
          <strong> update</strong>, and <strong>memory</strong> amplification, no structure
          minimises all three at once. Read-amp is the cost of looking; update-amp the cost of
          rewriting a byte over its life; memory-amp the extra storage carried in dead versions,
          tombstones, and indexes. They are not independent; they lie on a surface.
        </p>
        <p>
          Leveled compaction leans toward the read corner, size-tiered toward update; a raw,
          never-compacted log abandons both rewriting and memory discipline and pays brutally on
          reads. Drag the point and feel the surface push back. Workload tells you which corner you
          want; the surface tells you the toll.
        </p>
      </Prose>
      <RumLab />
    </Movement>
  );
}
