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
      lede="Every TLS connection opens with a handshake. In a handful of messages it runs key exchange, then authentication, then integrity. Then it falls silent and encrypted."
    >
      <P>
        This is the assembly of everything so far. The <em>key shares</em> are Diffie–Hellman. The{' '}
        <em>CertificateVerify</em> is a signature. The <em>Certificate</em> carries the chain, and
        the traffic keys are grown from the shared secret, so each piece you have already met now
        snaps into place inside one short exchange. Step through it. Switch between the modern TLS
        1.3 and the older 1.2 to see what changed.
      </P>
      <HandshakeLab />
    </Section>
  );
}
