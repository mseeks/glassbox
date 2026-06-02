import { P } from '../components/P.jsx';
import { PageBlock } from '../components/PageBlock.jsx';
import { PullQuote } from '../components/PullQuote.jsx';
import { Rule } from '../components/Rule.jsx';
import { SectionHead } from '../components/SectionHead.jsx';

export function SectionThree() {
  return (
    <section className="cf-section">
      <SectionHead num="03" eyebrow="From keys to fingerprints" title="Anonymous" italic="traces" />

      <PageBlock>
        <P size="lead">
          A cuckoo hash table is space-honest. To store a twenty-byte URL it spends twenty bytes.
          The filter wants a different bargain: it wants to spend a handful of <em>bits</em> per
          entry.
        </P>
        <P>
          So it throws the keys away. In each slot it places a short hash of the key — a{' '}
          <strong>fingerprint</strong>. Eight bits is typical; twelve gives more precision. The key
          itself, once the fingerprint is recorded, is discarded entirely.
        </P>
        <P>
          The moment we drop the keys, the eviction cascade falls apart. To displace a resident, the
          algorithm needs that resident's other home. The other home was computed from{' '}
          <em>its key</em>. But there is no key now — only a fingerprint, which contains a fraction
          of the information. Staring at a fingerprint in a bucket, the algorithm has no idea where
          to send it next.
        </P>
      </PageBlock>

      <PullQuote>
        Where, with no key, do you send a <span className="cuc">fingerprint</span>?
      </PullQuote>

      <PageBlock>
        <P>
          The cuckoo filter's central trick: define the alternate bucket not as an independent hash,
          but as the primary bucket combined with a hash of the fingerprint. The combining operation
          is the exclusive-or.
        </P>

        <div
          className="cf-eqbox"
          style={{
            margin: '32px 0 36px',
            background: 'var(--bg-1)',
            border: '1px solid var(--line)',
            fontFamily: 'JetBrains Mono',
            fontSize: 16,
            lineHeight: 2.4,
            textAlign: 'center',
          }}
        >
          <div style={{ color: 'var(--text)' }}>
            i<span style={{ fontSize: '0.7em', verticalAlign: 'sub' }}>1</span>
            &nbsp;=&nbsp; hash(item) <span style={{ color: 'var(--text-mute)' }}>&nbsp;mod m</span>
          </div>
          <div style={{ color: 'var(--text)' }}>
            i<span style={{ fontSize: '0.7em', verticalAlign: 'sub' }}>2</span>
            &nbsp;=&nbsp; i<span style={{ fontSize: '0.7em', verticalAlign: 'sub' }}>1</span>{' '}
            <span style={{ color: 'var(--cuc)', fontWeight: 600, fontSize: '1.15em' }}>⊕</span>{' '}
            hash(fp) <span style={{ color: 'var(--text-mute)' }}>&nbsp;mod m</span>
          </div>
        </div>

        <P>
          XOR is its own inverse. Apply it twice with the same operand and you return where you
          started. From either bucket, knowing the fingerprint, the other bucket can be recovered
          without the key. The fingerprint, alone, carries enough information to make the round
          trip.
        </P>
      </PageBlock>

      <PageBlock>
        <P>
          One small cost is paid. Because the two candidate buckets are related instead of
          independent, the table's natural ability to absorb collisions weakens. The remedy is
          structural: instead of one slot per bucket, give each bucket <em>four</em>. A fingerprint
          may rest in any of four slots in either of two buckets — eight seats in total. Four
          eight-bit fingerprints fit comfortably within a single cache line, which lookup, when we
          get to it, will exploit.
        </P>
      </PageBlock>

      <Rule />
    </section>
  );
}
