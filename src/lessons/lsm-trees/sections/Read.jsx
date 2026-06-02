import Movement from '../components/Movement.jsx';
import Heading from '../components/Heading.jsx';
import Prose from '../components/Prose.jsx';
import Note from '../components/Note.jsx';
import ReadLab from '../labs/ReadLab.jsx';

// §IV — The cost of never erasing. The read path and the Bloom gatekeeper.
export default function Read() {
  return (
    <Movement id="read" dark>
      <Heading
        n="IV"
        kicker="the cost of never erasing"
        title="Reading Means Drilling"
        lede="Cheap writes were not free. The bill arrives here. A key may live in any stratum, so a read drills downward, newest first, until it strikes. Two devices keep that drill from going too deep."
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.1fr)',
          gap: 40,
          alignItems: 'start',
        }}
        className="g2"
      >
        <Prose dropcap>
          <p>
            To read a key the engine checks the memtable, then descends through the SSTables
            newest-first, stopping the instant it strikes the key, because §I guarantees the first
            hit is the freshest. The danger is the descent itself: without help, a miss could mean
            opening every stratum on disk.
          </p>
          <p>
            The first help is internal: each SSTable is sorted, with a sparse index, so finding a
            key inside one is cheap. The second is the hero of the read path, a{' '}
            <strong>Bloom filter</strong>
            on each stratum: a tiny fingerprint that answers one question,{' '}
            <em>could this file possibly hold key K?</em> It is honest about "no" (a no is final)
            and only occasionally over-eager about "maybe."
          </p>
          <p>
            Because any given key lives in just one stratum, almost every level a read visits is a
            <em> miss</em>, and Bloom lets the drill skip straight past it without touching disk.
            The deepest, most-consulted strata earn the largest filters. Watch the skips fire as you
            drill.
          </p>
        </Prose>
        <ReadLab />
      </div>
      <Note h="what bloom cannot do">
        A Bloom filter answers only <em>"is this exact key possibly present?"</em> It is blind to
        ranges. Ask it <em>"any key between alder and birch?"</em> and it cannot help, so range
        scans must still open every stratum whose key span overlaps the query. Bloom is a
        point-lookup hero, and nothing more.
      </Note>
    </Movement>
  );
}
