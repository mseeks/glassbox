import { ChapterTitle, Prose, Section } from '../components/atoms.jsx';
import { VerdictLab } from '../labs/VerdictLab.jsx';

export const ChapterSix = () => (
  <Section id="ch6">
    <ChapterTitle
      number="VI"
      eyebrow="THE VERDICTS"
      title="Three outcomes of comparison"
      sub="What it means when one clock dominates, or when neither does."
    />
    <div style={{ maxWidth: 760 }}>
      <Prose dropcap>
        <p>
          Comparing two clocks is mechanical. Walk both arrays in parallel, and at each of the m
          positions note whether A's counter is less than, equal to, or greater than B's. After all
          m positions, one of three things will be true.
        </p>
        <p>
          <em>A is less-than-or-equal-to B in every position</em> (and strictly less somewhere). We
          call this "A is dominated by B." The verdict:{' '}
          <span style={{ color: '#b794f4' }}>A probably happened before B</span>. Probably. Because
          as we'll see in a moment, two concurrent clocks can sometimes look this way by accident.
        </p>
        <p>
          <em>The opposite: B is dominated by A.</em> Same verdict, reversed: B probably happened
          before A.
        </p>
        <p>
          <em>
            Neither dominates. There's some position where A is bigger, and some position where B is
            bigger.
          </em>{' '}
          The verdict: <span style={{ color: '#6ee7b7' }}>A and B are concurrent</span>. And this
          one is different from the other two, because the verdict is <em>exact</em>: there is no
          probabilistic uncertainty here, no false positive to worry about, and nothing whatsoever
          to second-guess in the answer the comparison just handed back. Exact. We'll spend the next
          chapter on why.
        </p>
      </Prose>
    </div>

    <div style={{ marginTop: 40 }}>
      <VerdictLab />
    </div>
  </Section>
);
