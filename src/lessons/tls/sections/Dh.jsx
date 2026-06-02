import Section from '../components/Section.jsx';
import P from '../components/P.jsx';
import DiffieHellmanLab from '../labs/DiffieHellmanLab.jsx';

// §3 · Agreeing in the open — Diffie–Hellman key exchange.
export default function Dh() {
  return (
    <Section
      id="dh"
      tag="§ 03 · Agreeing in the open"
      title="A secret built in public."
      lede="In 1976, Diffie and Hellman showed two strangers can agree on a secret while shouting across a room where everyone records every word."
    >
      <P>
        The trick is an operation that is easy to do and effectively impossible to undo. Picture
        mixing paint. Everyone agrees on a public base colour, each side privately stirs in a secret
        colour and sends the blend, and each then stirs its own secret into the blend it received,
        so both arrive at the same final mixture. Yet a listener holding the base and both public
        blends can't reach it. Separating one paint back out of a blend is the hard part.
      </P>
      <P delay=".05s">
        Drag each side's secret and watch both ends derive the identical secret in lockstep, then
        make the eavesdropper try to break it.
      </P>
      <DiffieHellmanLab />
    </Section>
  );
}
