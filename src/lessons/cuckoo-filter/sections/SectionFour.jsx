import { Figure } from '../components/Figure.jsx';
import { P } from '../components/P.jsx';
import { PageBlock } from '../components/PageBlock.jsx';
import { Rule } from '../components/Rule.jsx';
import { SectionHead } from '../components/SectionHead.jsx';
import { XorPactLab } from '../labs/XorPactLab.jsx';

export function SectionFour() {
  return (
    <section className="cf-section">
      <SectionHead num="04" eyebrow="The XOR identity" title="The" italic="pact" />

      <PageBlock>
        <P size="lead">
          The two homes of a fingerprint are bound to one another. Pick either and the other is
          determined; the fingerprint carries enough information to make the journey.
        </P>
        <P>
          To go from the first bucket to the second, take the exclusive-or with a hash of the
          fingerprint. To go from the second back to the first, take the exclusive-or with{' '}
          <em>the same hash</em>. There is only one operation; the same operation undoes itself.
        </P>
      </PageBlock>

      <Figure
        label="Fig. 2"
        title="The pact in motion"
        foot={
          <>
            Tap any bucket to set the primary; the partner follows. Try a few words to see how
            fingerprint and bucket combine.
          </>
        }
      >
        <XorPactLab />
      </Figure>

      <PageBlock>
        <P>
          With this in hand, cuckoo's logic survives the loss of keys. During an eviction, the
          algorithm looks at the fingerprint to be displaced, computes its other bucket from its
          current bucket and itself, and proceeds. Nothing more is needed. The fingerprint is its
          own ticket.
        </P>
      </PageBlock>

      <Rule />
    </section>
  );
}
