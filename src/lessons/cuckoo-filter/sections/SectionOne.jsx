import { P } from '../components/P.jsx';
import { PageBlock } from '../components/PageBlock.jsx';
import { PullQuote } from '../components/PullQuote.jsx';
import { Rule } from '../components/Rule.jsx';
import { SectionHead } from '../components/SectionHead.jsx';

export function SectionOne() {
  return (
    <section className="cf-section">
      <SectionHead
        num="01"
        eyebrow="The problem"
        title="Membership, and its"
        italic="discontents"
      />

      <PageBlock>
        <P size="lead">
          You have a set. Perhaps a list of compromised passwords; perhaps the keys stored on this
          particular page of disk; perhaps the URLs you've already crawled. The question you ask of
          it is the smallest question a set can field: <em>is this one in it?</em>
        </P>
        <P>
          Answering exactly requires keeping the set in full. Answering cheaply requires giving
          something up. A filter is the structure that takes this bargain seriously: it spends a
          handful of bits per entry and, in exchange, allows itself to be occasionally — but only in
          one direction — wrong.
        </P>
      </PageBlock>

      <PullQuote>
        It may say <span className="cuc">yes</span> when the answer is no.
        <br />
        It must never say no when the answer is yes.
      </PullQuote>

      <PageBlock>
        <P>
          That asymmetry — false positives tolerated, false negatives forbidden — defines the entire
          family. Stand a filter in front of an authoritative store: when it answers <em>no</em>,
          the store is spared the query. When it answers <em>yes</em>, the store is checked; the
          filter may have been mistaken, but no genuine entry is overlooked.
        </P>
        <P>
          Most filters can only grow. Items enter, never leave. The cuckoo filter is the rare
          structure that supports deletion as a first-class operation, alongside membership. Its
          central trick is borrowed from a hash table whose authors named it for a brood-parasitic
          bird.
        </P>
      </PageBlock>

      <Rule />
    </section>
  );
}
