import Head from '../components/Head.jsx';
import Cartridge from '../labs/Cartridge.jsx';

// §02 — A whole world in a shoebox. The age of scarcity.
export default function Ingenuity() {
  return (
    <section id="ingenuity">
      <div className="wrap">
        <Head num="02" kicker="The age of scarcity" title="A whole world in a shoebox." />
        <div className="rev">
          <p className="lead" style={{ marginBottom: 16 }}>
            When every byte is precious, programmers become magicians. The entire{' '}
            <strong>Super Mario Bros.</strong> cartridge packed its whole world, every enemy, all
            the music, and the game code itself into about <strong>40 kilobytes</strong>. That is
            smaller than one screenshot of the game taken on a phone today.
          </p>
          <p style={{ marginBottom: 24 }}>
            <strong>Prince of Persia</strong> (1989) is the legend. To save precious memory, its
            creator built the entire enemy guard out of the hero's <em className="term">own</em>{' '}
            animation frames, the same pixels simply mirrored and recoloured at runtime. No second
            set of art. Almost no extra bytes. The trick below is exactly that idea. Toggle it off
            and the game stops fitting.
          </p>
        </div>
        <div className="rev">
          <Cartridge />
        </div>
      </div>
    </section>
  );
}
