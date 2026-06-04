import { ChapterTitle, Prose, PullQuote, Section } from '../components/atoms.jsx';

export const ChapterOne = () => (
  <Section id="ch1" narrow>
    <ChapterTitle
      number="I"
      eyebrow="THE QUESTION"
      title="Time, without a clock"
      sub="The reason a Bloom clock exists at all."
    />
    <Prose dropcap>
      <p>
        Two computers, somewhere on a network. Each one is busy: writing rows, sending messages,
        processing events. Now ask the most innocent-sounding question in distributed systems:{' '}
        <em>did this event happen before that one?</em>
      </p>
      <p>
        On a single machine the question is silly. The CPU has a clock, the operating system stamps
        events, and we trust the numbers. Across a network we don't get to be so casual. Wall clocks
        drift. NTP is approximate. Two machines might disagree about the current second, and so a
        timestamp from one cannot be compared with a timestamp from the other without lying a
        little.
      </p>
      <p>
        What we actually want isn't <em>when</em>. It's <em>order</em>. Specifically: the partial
        order Leslie Lamport defined in 1978 and which has carried the field ever since. Event A{' '}
        <em>happens before</em> event B if either A physically precedes B on the same machine, or A
        sent a message that B received, or there's a chain of such relationships from A to B.
        Anything else, meaning events with no such chain in either direction, is <em>concurrent</em>
        .
      </p>
      <p>
        That partial order is the bedrock of nearly everything interesting downstream: snapshot
        reads, conflict-free merges, debugging causality, ordering writes in a replicated log,
        deciding which version of a record is "newer" in a masterless store. Get the order wrong and
        the system either drops writes, invents fake conflicts, or, worst of all, silently corrupts
        state.
      </p>
    </Prose>

    <PullQuote accent="var(--bc-gold)">
      The question isn't <span style={{ color: 'var(--bc-gold)' }}>when</span>.
      <br />
      The question is <span style={{ color: 'var(--bc-gold)' }}>before</span>.
    </PullQuote>

    <Prose>
      <p>
        So: how does a machine, holding only its own local state, decide whether some event it just
        heard about came after one it already knew? It can't ask anyone. There is nobody it trusts
        about the absolute time. It has to do it with metadata it carried along with the event
        itself.
      </p>
      <p>
        The history of that metadata is the history of <em>logical clocks</em>. And the Bloom clock
        is one of the more recent and curious members of the family: a probabilistic instrument that
        gives up perfect answers in exchange for a property no other clock has. Its size never
        changes, no matter how many machines join the party.
      </p>
    </Prose>
  </Section>
);
