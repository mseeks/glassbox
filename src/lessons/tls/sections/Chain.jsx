import Section from '../components/Section.jsx';
import P from '../components/P.jsx';
import ChainOfTrustLab from '../labs/ChainOfTrustLab.jsx';

// §6 · The chain of trust — certificates and certificate authorities.
export default function Chain() {
  return (
    <Section
      id="chain"
      tag="§ 06 · The chain of trust"
      title="Who vouches for the key?"
      lede="Signatures only relocated the problem: anyone can make a keypair, so which public key actually belongs to the bank?"
    >
      <P>
        A <strong>certificate</strong> binds a public key to a name, and that binding is itself
        signed by an authority your browser already trusts. Those authorities form a <em>chain</em>.
        A long-lived <strong>root</strong> baked into your device's trust store signs an
        intermediate, the intermediate signs the site's leaf certificate, and your browser follows
        the links upward, confirming each signature before it trusts the next, until it arrives at a
        root it already carries. So verifying the chain is just a series of signature checks. The
        trust was anchored all along.
      </P>
      <P delay=".05s">
        Walk the chain link by link, then break it four different ways and watch the browser's
        verdict.
      </P>
      <ChainOfTrustLab />
    </Section>
  );
}
