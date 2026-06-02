import Movement from '../components/Movement.jsx';
import Heading from '../components/Heading.jsx';
import Prose from '../components/Prose.jsx';
import AsymmetryFig from '../labs/AsymmetryFig.jsx';

// §II — Why bother. The disk has a grain.
export default function Why() {
  return (
    <Movement id="why" dark>
      <Heading
        n="II"
        kicker="why bother"
        title="The Disk Has a Grain"
        lede="The newest-wins pile is a lovely idea, but ideas need a reason to exist. Here is the reason, and it is physical: storage devices despise random writes and adore sequential ones."
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
            The classical way to keep sorted keys on disk is the <em>B-tree</em>: every key has a
            fixed home page, and a write seeks to that page, edits it, and writes it back. Reads are
            quick. But under heavy writes, the disk head spends its life leaping from page to page.
            A leap on spinning rust is a seek of milliseconds, while flash pays in hidden
            write-amplification as its controller rewrites whole erase blocks.
          </p>
          <p>
            A purely sequential write avoids all of that. The head simply continues from where it
            was. On a spinning disk this is the difference between roughly a hundred random writes
            per second and well over a thousand sequential ones; on flash the ratio differs but the
            asymmetry is identical and unavoidable.
          </p>
          <p>
            So the newest-wins pile turns out to be exactly what the hardware wants. Appending a
            note to the top of a pile <em>is</em> a sequential write. By refusing to update in
            place, the LSM tree stops fighting the medium, and pays for it later, on the read side,
            where §IV will find us.
          </p>
        </Prose>
        <AsymmetryFig />
      </div>
    </Movement>
  );
}
