import Section from '../components/Section.jsx';
import P from '../components/P.jsx';
import ThreatLab from '../labs/ThreatLab.jsx';

// §1 · The open wire — three distinct threats on plain HTTP.
export default function Wire() {
  return (
    <Section
      id="wire"
      tag="§ 01 · The open wire"
      title="Three ways to lose."
      lede="Type https and your bytes cross your router, your ISP, and a dozen backbone machines you neither own nor trust. Plain HTTP is a postcard."
    >
      <P>
        Every hand a postcard passes through can read it, rewrite it, or drop in a forgery. Those
        are three <strong>distinct</strong> threats, and TLS answers each with its own mechanism, so
        hold them apart. An <em>eavesdropper</em> reads it. That breaks confidentiality. A{' '}
        <em>vandal</em> alters it in flight, breaking integrity. An <em>impostor</em> who answers in
        the bank's place breaks authenticity.
      </P>
      <P delay=".05s">
        Pick an attack below, watch it land on plain HTTP, then seal the channel and watch it fail.
      </P>
      <ThreatLab />
      <P delay=".05s">
        TLS defeats all three at once. The rest of this lesson is the machinery that makes that
        possible, assembled one piece at a time, from a shared secret up through certificates and
        the handshake itself.
      </P>
    </Section>
  );
}
