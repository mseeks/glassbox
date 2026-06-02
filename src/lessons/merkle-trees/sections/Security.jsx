import { Reveal } from '../../../shared/reveal.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import DomainSepLab from '../labs/DomainSepLab.jsx';

// §7 — Why leaves and nodes must hash differently (the Bitcoin CVE-2012-2459 trap).
export default function Security() {
  return (
    <section className="mk-section">
      <SectionHeader
        id="security"
        kicker="The Subtle Danger"
        title="Why leaves and nodes must hash differently"
      />
      <Reveal base="mk-reveal" className="mk-prose">
        <p className="lead">
          A Merkle tree's safety reduces entirely to its hash function. There is a famous trap here,
          and it has nothing to do with breaking that hash. The trap is simpler. It comes from
          treating an internal node and a leaf as if they were the same kind of thing.
        </p>
        <p>
          An internal node is <span className="mk-code-inline">H(left ‖ right)</span>, a hash of two
          child hashes. Suppose a leaf is just <span className="mk-code-inline">H(data)</span>. Then
          an attacker can take the two children of a real internal node, glue them together into one
          blob, present that blob as a <em>leaf</em>, and watch it hash to the very same digest the
          honest node produced. The verifier is fooled. They cannot tell a forged leaf from a
          genuine subtree. This is the second-preimage trap behind a real Bitcoin vulnerability
          (CVE-2012-2459).
        </p>
      </Reveal>

      <Reveal base="mk-reveal">
        <DomainSepLab />
      </Reveal>

      <Reveal base="mk-reveal" className="mk-prose" style={{ marginTop: 20 }}>
        <p>
          The fix costs one byte. Prepend a different tag before hashing leaves (
          <span className="mk-code-inline">0x00</span>) versus internal nodes (
          <span className="mk-code-inline">0x01</span>), and the two can never again collapse onto
          the same digest. Certificate Transparency mandates exactly this. The general principle is
          worth carrying everywhere:{' '}
          <em>
            hash inputs need types. If two different things can be confused at the input of a hash,
            you have a vulnerability waiting.
          </em>
        </p>
        <p>
          And the deeper dependency runs further down. When SHA-1 was shown collidable in 2017,
          every Merkle structure built on it became suspect overnight. The hash function's collision
          resistance <em>is</em> the security.
        </p>
      </Reveal>
    </section>
  );
}
