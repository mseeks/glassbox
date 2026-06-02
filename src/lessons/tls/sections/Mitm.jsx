import Section from '../components/Section.jsx';
import P from '../components/P.jsx';
import MitmLab from '../labs/MitmLab.jsx';

// §4 · The crack — the man-in-the-middle gap in unauthenticated key exchange.
export default function Mitm() {
  return (
    <Section
      id="mitm"
      tag="§ 04 · The crack"
      title="Secret — but with whom?"
      lede="Key exchange has a gaping hole, and finding it is the whole reason the second half of TLS exists."
    >
      <P>
        Diffie–Hellman proves you agreed a secret with <em>whoever answered</em>. It never checks{' '}
        <strong>who</strong> answered. So an attacker on the wire can run one exchange with you and
        a separate one with the bank, sitting in the middle of two perfectly “secure” channels —
        reading and rewriting everything.
      </P>
      <MitmLab />
      <P delay=".05s">
        Confidentiality with the wrong party is no confidentiality at all. We need a way for the
        bank to <strong>prove its identity</strong> over the wire.
      </P>
    </Section>
  );
}
