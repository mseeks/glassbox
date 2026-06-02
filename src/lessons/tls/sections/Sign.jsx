import Section from '../components/Section.jsx';
import P from '../components/P.jsx';
import SignatureLab from '../labs/SignatureLab.jsx';

// §5 · Proof of identity — public-key signatures.
export default function Sign() {
  return (
    <Section
      id="sign"
      tag="§ 05 · Proof of identity"
      title="Sign with one key, check with the other."
      lede="The public-key keypair has a second mode — run the asymmetry backwards and you get a signature."
    >
      <P>
        The <strong>private key produces</strong> a signature; the{' '}
        <strong>public key verifies</strong> it. Only the holder of the private key could have
        produced one that checks out, and verifying reveals nothing about the private key. You don’t
        sign the whole message — you sign its <em>hash</em>, a short fingerprint — so a single
        altered byte changes the hash and breaks the signature. Authenticity and integrity in one
        move.
      </P>
      <P delay=".05s">
        Sign a message, then tamper with it, then try to forge a signature without the private key.
      </P>
      <SignatureLab />
    </Section>
  );
}
