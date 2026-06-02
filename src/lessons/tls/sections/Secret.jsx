import Section from '../components/Section.jsx';
import P from '../components/P.jsx';
import SymmetricPanel from '../labs/SymmetricPanel.jsx';

// §2 · The shared secret — symmetric encryption, and the key-exchange problem.
export default function Secret() {
  return (
    <Section
      id="secret"
      tag="§ 02 · The shared secret"
      title="Scrambling is the easy part."
      lede="If both sides already hold the same key, confidentiality is almost free: scramble with the key, unscramble with the key, and the wire carries noise."
    >
      <SymmetricPanel />
      <P delay=".05s">
        So encryption itself is the easy half — <em>provided you both already share a key.</em> But
        you and the bank have never met. You share no secret, and the only channel to deliver one is
        the very wire the eavesdropper is reading. Send the key in the clear and it’s copied;
        encrypt it first and you need a key to do that — which you don’t have yet. This circularity
        is the <strong>key-exchange problem</strong>, and for most of history it had no clever
        answer.
      </P>
    </Section>
  );
}
