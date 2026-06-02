import { Figure } from '../components/Figure.jsx';
import { P } from '../components/P.jsx';
import { PageBlock } from '../components/PageBlock.jsx';
import { Rule } from '../components/Rule.jsx';
import { SectionHead } from '../components/SectionHead.jsx';
import { CliffLab } from '../labs/CliffLab.jsx';

export function SectionSeven() {
  return (
    <section className="cf-section">
      <SectionHead num="07" eyebrow="Saturation" title="The" italic="cliff" />

      <PageBlock>
        <P size="lead">
          There is no slope from fine to broken. To ordinary inspection, the cuckoo filter operates
          identically at ninety-percent capacity and ninety-eight; only the eviction chains, hidden
          in the procedure, lengthen. Then, at some load near its theoretical ceiling, an insertion
          arrives that cannot find a vacancy in any number of attempts. The chain loops; the kick
          budget runs out; the filter returns a refusal.
        </P>
        <P>
          The behavior is, properly understood, a virtue. A filter that quietly degrades, admitting
          items and storing them imperfectly, gives the application no warning. A filter that{' '}
          <em>refuses</em> announces the breach: build a larger one. The failure is loud and
          legible, and it is recoverable. Nothing is silently dropped. Nothing is admitted that the
          filter cannot honor.
        </P>
      </PageBlock>

      <Figure
        label="Fig. 5"
        title="Watch it fill until it will not"
        foot={
          <>Twenty-four buckets, four slots each. Press auto-fill and observe the chain lengths.</>
        }
      >
        <CliffLab />
      </Figure>

      <Rule />
    </section>
  );
}
