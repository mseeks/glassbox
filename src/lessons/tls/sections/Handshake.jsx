import Section from '../components/Section.jsx';
import P from '../components/P.jsx';
import HandshakeLab from '../labs/HandshakeLab.jsx';

// §7 · The handshake — assembling key exchange, authentication, and integrity.
export default function Handshake() {
  return (
    <Section
      id="handshake"
      tag="§ 07 · The handshake"
      title="Putting it together."
      lede="Every TLS connection opens with a handshake that runs key exchange, authentication, and integrity in a handful of messages — then falls silent and encrypted."
    >
      <P>
        This is the assembly of everything so far: the <em>key shares</em> are Diffie–Hellman, the{' '}
        <em>CertificateVerify</em> is a signature, the <em>Certificate</em> is the chain, and the
        traffic keys are grown from the shared secret. Step through it, and switch between the
        modern TLS 1.3 and the older 1.2 to see what changed.
      </P>
      <HandshakeLab />
    </Section>
  );
}
