import { SectionHeader } from '../components/Section.jsx';
import { LabFrame } from '../components/widgets.jsx';
import FingerprintLab from '../labs/FingerprintLab.jsx';

// §02 — content addressing: the name is the proof. Hashing answers both "what
// am I asking for?" and "are these bytes garbage?" at once.
export default function Naming() {
  return (
    <section id="naming" className="tor-section">
      <div className="tor-wrap">
        <SectionHeader n="02" kicker="Content addressing" title="The name is the {}" em="proof" />
        <div className="tor-prose tor-rv">
          <p>
            The moment a file is assembled from chunks sent by strangers, two hard questions appear
            — and most of BitTorrent is the answer to them. First, what am I even asking for? I need
            a name for this exact file that strangers and I can agree on. Second, when a stranger
            sends me bytes, how do I know they aren't garbage, or malware, or a corrupted block?
          </p>
          <p>
            Both are answered the same way: by hashing. Split the file into fixed-size pieces and
            run each through a <span className="tor-tk">hash</span> function, which crushes any
            input into a short, fixed-length fingerprint. Collect those fingerprints into a small
            bundle of metadata — that bundle is the <strong>.torrent</strong> — and hash that too.
            The result is the <strong>infohash</strong>: one fingerprint that uniquely names the
            whole thing.
          </p>
        </div>
        <div className="tor-pull tor-rv">
          The identifier is derived from the content, so it{' '}
          <span className="tor-t">cannot lie</span> about what it points to.
        </div>
        <div className="tor-prose tor-rv">
          <p>
            This dissolves the trust problem entirely. You never trust the stranger — you hash the
            bytes that arrived and check the fingerprint. Match, keep it; mismatch, discard it and
            stop trusting that peer. Try corrupting a single byte:
          </p>
        </div>
      </div>
      <div className="tor-wrap-wide">
        <LabFrame label="Verify a received piece" sub="live SHA-256">
          <FingerprintLab />
        </LabFrame>
      </div>
    </section>
  );
}
