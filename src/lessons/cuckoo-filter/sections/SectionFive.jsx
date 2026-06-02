import { Figure } from '../components/Figure.jsx';
import { P } from '../components/P.jsx';
import { PageBlock } from '../components/PageBlock.jsx';
import { Rule } from '../components/Rule.jsx';
import { SectionHead } from '../components/SectionHead.jsx';
import { FilterLab } from '../labs/FilterLab.jsx';

function Op({ n, verb, body }) {
  return (
    <div style={{ paddingTop: 16, borderTop: '1px solid var(--cuc)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
        <span
          className="cf-mono"
          style={{ fontSize: 11, color: 'var(--cuc)', letterSpacing: '0.2em' }}
        >
          {n.toUpperCase()}.
        </span>
        <span
          style={{
            fontFamily: 'Fraunces',
            fontSize: 26,
            fontWeight: 400,
            letterSpacing: '-0.012em',
            color: 'var(--text)',
          }}
        >
          {verb}
        </span>
      </div>
      <div className="cf-body" style={{ fontSize: 15, lineHeight: 1.55 }}>
        {body}
      </div>
    </div>
  );
}

export function SectionFive() {
  return (
    <section className="cf-section">
      <SectionHead num="05" eyebrow="What the filter does" title="Three" italic="operations" />

      <PageBlock>
        <P size="lead">
          With the pact in place, the operations are mechanical. Each begins by computing the
          fingerprint of the item and its two candidate buckets. What follows depends on the verb.
        </P>
      </PageBlock>

      <div className="cf-page" style={{ marginTop: 12 }}>
        <div className="cf-block-wide">
          <div className="cf-cols cf-cols-3">
            <Op
              n="i"
              verb="Insert"
              body="Place the fingerprint in the first vacant slot of either candidate bucket. If both are full, evict a resident at random; the displaced fingerprint walks to its partner; the cascade continues until a vacancy is found or the kick budget is exhausted."
            />
            <Op
              n="ii"
              verb="Lookup"
              body={
                <>
                  Inspect both candidate buckets. If the fingerprint is present in either, answer{' '}
                  <em>probably yes</em>. Otherwise, answer <em>definitely no</em>.
                </>
              }
            />
            <Op
              n="iii"
              verb="Delete"
              body="Inspect both candidate buckets; if the fingerprint is found, erase it. Mark the slot empty. The item is no longer counted as present."
            />
          </div>
        </div>
      </div>

      <Figure
        label="Fig. 3"
        title="The filter, attended in full"
        foot={
          <>
            Sixteen buckets, four slots each, eight-bit fingerprints. Try inserting eight words at
            once and watch the eviction cascade. Then look up something you haven't inserted.
          </>
        }
      >
        <FilterLab />
      </Figure>

      <PageBlock>
        <P>
          Notice what a lookup costs. At most two bucket reads, sixty-four bits each at this
          fingerprint width, for a definite answer. In production code, the two candidate buckets
          are deliberately laid out so they fall in adjacent cache lines. The filter trades a tiny
          probability of being wrong for an answer that almost never leaves the processor's L1.
        </P>
      </PageBlock>

      <Rule />
    </section>
  );
}
