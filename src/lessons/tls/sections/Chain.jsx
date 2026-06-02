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
        signed — by an authority your browser already trusts. Those authorities form a{' '}
        <em>chain</em>: a long-lived <strong>root</strong> baked into your device’s trust store
        signs an intermediate, which signs the site’s leaf certificate. Verifying the chain is just
        a series of signature checks, ending at a root you trusted from the start.
      </P>
      <P delay=".05s">
        Walk the chain link by link, then break it four different ways and watch the browser’s
        verdict.
      </P>
      <ChainOfTrustLab />
    </Section>
  );
}
