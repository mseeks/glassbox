import { SectionHeader } from '../components/Section.jsx';
import { LabFrame } from '../components/widgets.jsx';
import V2Lab from '../labs/V2Lab.jsx';

// §09 — version 2 & magnets: the whole tower from one hash (Merkle tree + magnet).
export default function V2() {
  return (
    <section id="v2" className="tor-section">
      <div className="tor-wrap">
        <SectionHeader
          n="09"
          kicker="Version 2 · magnets"
          title="The whole tower from one {}"
          em="hash"
        />
        <div className="tor-prose tor-rv">
          <p>
            The second version of BitTorrent is almost exactly the natural endpoint of everything so
            far. It replaces the aging SHA-1 with <strong>SHA-256</strong>, and instead of a flat
            list of fingerprints it builds a <strong>Merkle tree</strong> per file — a tree of
            hashes whose single root commits to the entire file.
          </p>
          <p>
            That one change pays for itself: you can verify any piece with a tiny proof, fetch
            fingerprints lazily, and deduplicate identical files across torrents. And{' '}
            <strong>magnet links</strong> take content addressing to its conclusion — the infohash
            itself becomes the whole address, with no .torrent file at all. Tap a piece to see its
            proof, then resolve a magnet from nothing but a hash:
          </p>
        </div>
      </div>
      <div className="tor-wrap-wide">
        <LabFrame label="v2 integrity" sub="Merkle proof + magnet">
          <V2Lab />
        </LabFrame>
      </div>
    </section>
  );
}
