import { Figure } from '../components/Figure.jsx';
import { P } from '../components/P.jsx';
import { PageBlock } from '../components/PageBlock.jsx';
import { PullQuote } from '../components/PullQuote.jsx';
import { Rule } from '../components/Rule.jsx';
import { SectionHead } from '../components/SectionHead.jsx';
import { TwinLab } from '../labs/TwinLab.jsx';

export function SectionEight() {
  return (
    <section className="cf-section">
      <SectionHead num="08" eyebrow="What you must not do" title="The" italic="hazard" />

      <PageBlock>
        <P size="lead">
          There is a single delicate operation. Deletion. The fingerprint, by virtue of being short,
          occasionally agrees between two items that have nothing else in common. Two distinct words
          can produce the same fingerprint at the same candidate buckets. The filter, having
          discarded the keys, cannot tell which one it has stored.
        </P>
        <P>
          For a lookup this hardly matters. The filter answers <em>probably yes</em>, the
          application consults the source of truth, the imposter is sent away. The false positive is
          the price of being small.
        </P>
        <P>
          Deletion has no such redress. Ask the filter to forget an item it never knew, and it will
          search for a matching fingerprint, find one placed there by some <em>other</em> item, and
          erase it. The structure has now removed a genuine entry while honoring a phantom request.
          The next lookup of that genuine item answers <em>definitely no</em>. That is a false
          negative, the very failure the cuckoo filter exists to prevent.
        </P>
      </PageBlock>

      <PullQuote>
        Delete only what you have <span className="cuc">actually inserted</span>.
      </PullQuote>

      <PageBlock>
        <P>
          The discipline is usually painless. An application that uses a filter already maintains an
          authoritative store; it asks the filter to decline membership quickly, and removes entries
          from the filter only in step with removals from the store. The filter follows; it does not
          lead.
        </P>
      </PageBlock>

      <Figure
        label="Fig. 6"
        title="The hazard, in five steps"
        foot={
          <>
            The vocabulary is searched live for a real collision pair; the steps walk through how it
            can erase a genuine entry.
          </>
        }
      >
        <TwinLab />
      </Figure>

      <Rule />
    </section>
  );
}
