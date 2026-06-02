import { Lock } from 'lucide-react';
import { useRevealRoot } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import Rule from '../components/Rule.jsx';
import SpongeLab from '../labs/SpongeLab.jsx';

export default function Sponge() {
  const ref = useRevealRoot();
  return (
    <section ref={ref}>
      <div className="sha-wrap">
        <SectionHead
          num="06"
          eyebrow="SHA-3 · the other machine"
          title="The"
          italic="sponge"
          lede={
            <>
              After SHA-1 fell, NIST grew uneasy that SHA-2 shared its lineage, and ran an open
              competition for a design built on entirely different bones.{' '}
              <span className="kg">Keccak</span> won, and became SHA-3. Its shape is a sponge, and
              the name is the mechanism.
            </>
          }
        />

        <p className="body">
          Imagine the internal state split into two zones. The <span className="kw">rate</span> is
          the exposed surface; the <span className="kw">capacity</span> is a hidden chamber. In the{' '}
          <em>absorb</em> phase, each chunk of input is XORed into the rate, then the whole state,
          rate and capacity together, is stirred by a permutation. In the <em>squeeze</em> phase,
          you read bits off the rate, stir, read more, until you have enough output.
        </p>

        <p className="body">
          The capacity is the crux: <strong>you never touch it directly.</strong> Input enters only
          through the rate; output leaves only through the rate. But because the stir mixes the
          entire state, the capacity shapes every output bit, while staying forever out of an
          attacker's reach. Picture a chef behind a glass divider: you pass ingredients through a
          slot and receive finished portions through the same slot, but the chef also draws from a
          private pantry you can never see or reach. That pantry is what makes the output
          unforgeable.
        </p>

        <SpongeLab />

        <div
          className="reveal"
          style={{
            border: '1px solid var(--jade)',
            borderRadius: 11,
            padding: '15px 17px',
            background: 'var(--jade-glow)',
            margin: '22px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
            <Lock size={16} style={{ color: 'var(--jade)' }} />
            <span
              style={{
                fontFamily: 'var(--slab)',
                fontWeight: 600,
                fontSize: 16.5,
                color: 'var(--jade)',
              }}
            >
              Why the scar can't form here
            </span>
          </div>
          <p className="body" style={{ margin: 0 }}>
            At the end of a squeeze, only the rate is exposed — the capacity stays hidden forever.
            To extend the message you'd need to resume the permutation from the <em>full</em> state,
            but you can never see the capacity. So length extension is structurally impossible.
            SHA-2 needs HMAC bolted on from outside; SHA-3 simply doesn't have the wound.
          </p>
        </div>
      </div>
      <Rule />
    </section>
  );
}
