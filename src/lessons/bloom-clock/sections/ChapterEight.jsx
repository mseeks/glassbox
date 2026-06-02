import { ChapterTitle, Code, Prose, Section } from '../components/atoms.jsx';
import { FPRMath } from '../labs/FPRMath.jsx';
import { SaturationDemo } from '../labs/SaturationDemo.jsx';

export const ChapterEight = () => (
  <Section id="ch8">
    <ChapterTitle
      number="VIII"
      eyebrow="WEIGHT & SATURATION"
      title="The cost of carrying time"
      sub="How the probabilistic error scales, and where the structure breaks."
    />
    <div style={{ maxWidth: 760 }}>
      <Prose dropcap>
        <p>
          The false-positive rate of a Bloom clock isn't a constant. It's a function of three
          things: the size of the array m, the number of hash functions k, and the <em>weight</em>{' '}
          of the clocks being compared. Weight is just the total number of events the clock has
          absorbed, meaning its own local events plus everything that has ever been merged into it
          from elsewhere across the cluster. Light clocks are sharp. Heavy clocks blur together.
        </p>
        <p>
          The intuition is identical to a Bloom filter. A fresh filter with one inserted element is
          almost certainly distinguishable from a fresh filter with a different element. The same
          filter with a million elements is mostly ones, and any query, true or false, looks
          indistinguishable from another. For Bloom clocks the same dynamic applies, except the
          "elements" are <em>events</em>, and there's no upper bound on how many can pile up unless
          we explicitly do something about it.
        </p>
      </Prose>
    </div>

    <div style={{ marginTop: 40 }}>
      <FPRMath />
    </div>

    <div style={{ maxWidth: 760, marginTop: 56 }}>
      <Prose>
        <p>
          The math is one thing; watching it happen is another. Below, two timelines do completely
          independent work. Their clocks should remain "concurrent" forever: that's the ground
          truth. Press <Code>begin</Code> and watch the observed false-positive rate climb as both
          clocks fill up.
        </p>
      </Prose>
    </div>

    <div style={{ marginTop: 40 }}>
      <SaturationDemo />
    </div>

    <div style={{ maxWidth: 760, marginTop: 40 }}>
      <Prose>
        <p>
          This is the cliff every Bloom-style structure has. The structure is sized for a certain
          expected load; below it, errors are rare; past it, errors dominate. A Bloom filter is
          different: there you know up-front roughly how many items you'll insert, so you can size
          accordingly. A Bloom clock keeps accumulating <em>time</em>. Left alone forever, every
          Bloom clock saturates.
        </p>
        <p>So we have to fight back. The next chapter is about how.</p>
      </Prose>
    </div>
  </Section>
);
