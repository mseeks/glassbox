import { SectionLabel } from '../components/SectionLabel.jsx';
import { ProofLab } from '../labs/ProofLab.jsx';

export function SectionThree() {
  return (
    <section className="section" id="s3">
      <SectionLabel num="3" label="The Proof, Walked" />
      <h2 className="h-section">
        Two nodes. One variable. A <em>forced</em> three-way choice.
      </h2>

      <p className="lede">
        The Gilbert-Lynch proof is short enough to hold in your head. Two replicas, both starting
        with x = 0. A client writes; the network breaks; a different client reads. The reading node
        has exactly three options. None of them preserves all of C, A, and P at once.
      </p>

      <p>
        Walk through it. Click through the setup, then choose what G2 should do when Bob asks for x.
        Each option illuminates one face of the theorem.
      </p>

      <div style={{ margin: '32px 0' }}>
        <ProofLab />
      </div>
      <div className="figure-caption" style={{ marginBottom: 36 }}>
        <strong>Fig. 3</strong> &nbsp; The Gilbert-Lynch proof, walked. Each branch sacrifices
        something.
      </div>

      <p>
        That&rsquo;s the whole theorem. Two valid options, one impossible. Lie a little, or close up
        shop. There is no third door.
      </p>

      <div className="pull">
        Either return what you have and risk being wrong, or refuse to answer and risk being silent.
        The network has already chosen for you.
      </div>
    </section>
  );
}
