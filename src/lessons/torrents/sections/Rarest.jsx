import { SectionHeader } from '../components/Section.jsx';
import { LabFrame } from '../components/widgets.jsx';
import RarestLab from '../labs/RarestLab.jsx';

// §08 — which piece comes next: rarest-first keeps the swarm alive.
export default function Rarest() {
  return (
    <section id="rarest" className="tor-section">
      <div className="tor-wrap">
        <SectionHeader n="08" kicker="Rarest-first" title="Which piece comes {}" em="next" />
        <div className="tor-prose tor-rv">
          <p>
            Out of all the pieces you still lack, which do you request next? Not in order — then the
            start of every file becomes a spot everyone fights over. And not at random either. The
            default is <strong>rarest-first</strong>: look across your peers, find the piece the
            fewest of them have, and grab that one.
          </p>
          <p>
            Two reasons, both about keeping the swarm alive. <em>Survival</em>: if a piece exists on
            only one seeder and it vanishes, the file dies — so spread the scarce pieces before
            their only holder disappears. And <em>liquidity</em>: scattering variety means almost
            everyone holds something someone else wants, so trading never stalls. Watch a rare
            piece's fate under each strategy:
          </p>
        </div>
      </div>
      <div className="tor-wrap-wide">
        <LabFrame label="Piece availability" sub="rarest-first vs in-order">
          <RarestLab />
        </LabFrame>
      </div>
    </section>
  );
}
