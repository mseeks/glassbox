import { AsymmetryVisualization } from '../components/AsymmetryVisualization.jsx';
import { ChapterTitle, Prose, PullQuote, Section } from '../components/atoms.jsx';

export const ChapterSeven = () => (
  <Section id="ch7" narrow>
    <ChapterTitle
      number="VII"
      eyebrow="THE ASYMMETRY"
      title="One side certain, one side fuzzy"
      sub="The mathematical reason the Bloom clock is safe to deploy at all."
    />
    <Prose dropcap>
      <p>
        Stop and notice: the comparison gives a probabilistic answer in one direction and an{' '}
        <em>exact</em> answer in the other. That asymmetry isn't an engineering choice or a
        parameter to tune. It's a mathematical consequence of how the merge works. And it's the
        entire reason a probabilistic causality structure can be deployed in production at all.
      </p>
      <p>
        Here's the argument in full. Suppose A really did happen before B. Then somewhere in the
        causal chain between them, A's clock got merged into B's — possibly directly, possibly
        through intermediaries, but somewhere. The merge operation is pointwise max. After the
        merge, B's clock dominates A's in every position, and every subsequent operation B performs
        only adds to its counters (max with new things, or local increments). The counters never
        shrink. So at the end: B[i] ≥ A[i] at every position i. That domination is permanent and
        unavoidable.
      </p>
      <p>
        Now <em>contrapose</em>. If we ever see A[i] {'>'} B[i] anywhere — even a single position —
        then A cannot have happened before B. The contrapositive of a true statement is a true
        statement. This isn't probability. This is algebra.
      </p>
    </Prose>

    <PullQuote accent="#6ee7b7">
      "Concurrent" is a mathematical certainty.
      <br />
      "Before" is an educated guess.
    </PullQuote>

    <Prose>
      <p>
        Run the logic the other way. If A and B are concurrent — neither caused the other — their
        counters accumulated independently. Maybe their increments landed on entirely disjoint
        positions; maybe they overlapped a lot. There's no guarantee about how they relate
        component-wise. They might happen to be ordered, with A dominated by B everywhere just by
        luck of the hash. They might be incomparable. The relationship between concurrent clocks is
        statistical, not structural.
      </p>
      <p>
        So when we see "neither dominates" — some positions where A wins, some where B wins — we
        know with certainty they must be concurrent. (If A → B, A couldn't be bigger anywhere. If B
        → A, B couldn't be bigger anywhere. So neither can be true.)
      </p>
      <p>
        And when we see one dominates — A dominated by B everywhere — it's either because A really
        did happen before B, or because they're concurrent and the independence happened to favor B.
        We can't distinguish from inside the structure. That's the probabilistic error. And it only
        ever goes one way.
      </p>
    </Prose>

    <div style={{ margin: '56px 0' }}>
      <AsymmetryVisualization />
    </div>

    <Prose>
      <p>
        This asymmetric error is the single most important property of the Bloom clock and the thing
        you need to internalize before deploying one. The practical consequence is concrete: when
        the structure reports concurrent, you can trust it absolutely — split the data, run the
        conflict resolution code, do whatever you do when two writes race. When it reports A → B,
        you should treat that as a strong hint but not a load-bearing guarantee, because a small
        fraction of those reports will be lies.
      </p>
      <p>
        In most real systems the cost of a false positive — believing A caused B when actually they
        were concurrent — is unnecessary serialization. You process B as if it depended on A when it
        didn't, costing you a parallelism opportunity but not correctness. You almost never get the
        opposite failure — treating a real dependency as concurrent — because that failure isn't
        possible.
      </p>
      <p>
        Every variant we look at in the rest of this masterclass is, in some way, a knob on how
        often that one-sided error fires. The asymmetry itself is fixed.
      </p>
    </Prose>
  </Section>
);
