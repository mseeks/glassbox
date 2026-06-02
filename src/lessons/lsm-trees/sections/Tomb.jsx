import Movement from '../components/Movement.jsx';
import Heading from '../components/Heading.jsx';
import Prose from '../components/Prose.jsx';
import TombLab from '../labs/TombLab.jsx';

// §VII — The weight of the dead. Tombstones, and the bill they quietly run up.
export default function Tomb() {
  return (
    <Movement id="tomb">
      <Heading
        n="VII"
        kicker="the weight of the dead"
        title="Tombstones"
        lede="We met them in §I as a layer that says 'nothing.' Here is the bill they quietly run up: the one failure mode every LSM operator learns to fear by name."
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: 40,
          alignItems: 'start',
        }}
        className="g2"
      >
        <Prose dropcap>
          <p>
            Because nothing is ever erased in place, a delete cannot remove the old value. Older
            strata still hold it. So a delete writes a tombstone, a marker that shadows everything
            beneath it. During reads it behaves like any value; during compaction it is carried
            forward; and it may only be dropped once no older copy of its key survives below.
          </p>
          <p>
            That last condition is the trap. Workloads that delete heavily, such as TTL expiry,
            queue-like consumption, or time-series eviction, mint tombstones faster than compaction
            can retire them. Reads then wade through long runs of dead markers before reaching live
            data. Cassandra operators call it a <em>tombstone storm</em>, and it has taken down real
            clusters.
          </p>
          <p>
            The cure is everywhere the same: compact more aggressively where deletes concentrate, or
            design the workload so the dead can actually be buried: partition by time and drop whole
            strata at once, rather than tombstoning key by key.
          </p>
        </Prose>
        <TombLab />
      </div>
    </Movement>
  );
}
