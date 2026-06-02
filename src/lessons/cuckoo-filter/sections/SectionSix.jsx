import { Figure } from '../components/Figure.jsx';
import { P } from '../components/P.jsx';
import { PageBlock } from '../components/PageBlock.jsx';
import { Rule } from '../components/Rule.jsx';
import { SectionHead } from '../components/SectionHead.jsx';
import { MathLab } from '../labs/MathLab.jsx';

export function SectionSix() {
  return (
    <section className="cf-section">
      <SectionHead num="06" eyebrow="What the numbers say" title="The" italic="mathematics" />

      <PageBlock>
        <P size="lead">
          A lookup inspects eight slots in all, four per candidate bucket. A false positive occurs
          when one of those slots happens to hold the same fingerprint as the queried item, despite
          that item never being inserted. The probability is bounded above by:
        </P>

        <div
          className="cf-eqbox"
          style={{
            margin: '28px 0 32px',
            background: 'var(--bg-1)',
            border: '1px solid var(--line)',
            fontFamily: 'JetBrains Mono',
            fontSize: 19,
            lineHeight: 1.9,
            textAlign: 'center',
          }}
        >
          <span style={{ color: 'var(--text)' }}>fpr</span> ≤{' '}
          <span
            style={{
              display: 'inline-block',
              verticalAlign: 'middle',
              textAlign: 'center',
              margin: '0 8px',
            }}
          >
            <span
              style={{ display: 'block', borderBottom: '1px solid var(--text)', padding: '0 14px' }}
            >
              2b
            </span>
            <span style={{ display: 'block', padding: '0 14px' }}>
              2<sup>f</sup>
            </span>
          </span>
        </div>

        <P>
          Linear in the bucket width <em>b</em>; exponential in the fingerprint bits <em>f</em>.
          Each additional bit halves the false-positive rate, while doubling the bucket width
          doubles it. Remarkably, the formula is independent of how full the table is. The error
          rate stays essentially flat as the structure fills. It does not drift.
        </P>
        <P>
          Storage is the other number that matters. At load <em>α</em> (the fraction of slots in
          use), the filter spends about <em>f / α</em> bits per item. Eight-bit fingerprints at
          ninety-five-percent load: about nine bits per entry, with a three-percent false-positive
          rate. Twelve-bit fingerprints at the same load: thirteen bits, with an error of one part
          in five hundred.
        </P>
      </PageBlock>

      <Figure
        label="Fig. 4"
        title="The error rate, falling geometrically"
        foot={<>Move the sliders; watch the rate fall by half with each added bit.</>}
      >
        <MathLab />
      </Figure>

      <Rule />
    </section>
  );
}
