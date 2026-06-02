import { Lock, Fingerprint, ShieldAlert } from 'lucide-react';
import { useRevealRoot } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import AvalancheLab from '../labs/AvalancheLab.jsx';

function PropertyCard({ icon: Icon, name, defn, tone }) {
  return (
    <div
      style={{
        border: '1px solid var(--line)',
        borderRadius: 11,
        padding: '15px 16px',
        background: 'linear-gradient(180deg,var(--panel),transparent)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
        <Icon size={17} style={{ color: tone }} />
        <span
          style={{
            fontFamily: 'var(--slab)',
            fontWeight: 600,
            fontSize: 16.5,
            color: 'var(--bone)',
          }}
        >
          {name}
        </span>
      </div>
      <div style={{ fontSize: 14.5, color: 'var(--bone-dim)', lineHeight: 1.6 }}>{defn}</div>
    </div>
  );
}

export default function Properties() {
  const ref = useRevealRoot();
  return (
    <section ref={ref}>
      <div className="sha-wrap">
        <SectionHead
          num="01"
          eyebrow="Foundations"
          title="What makes a hash"
          italic="cryptographic"
          lede={
            <>
              Any hash crushes arbitrary input down to a fixed size. The ones inside hash tables
              only need to spread values evenly. They are fast and uniform, and that is the whole
              job. A<span className="kw"> cryptographic</span> hash adds something harder: it must
              hold up against an adversary who is actively trying to break it.
            </>
          }
        />

        <p className="body">
          That hardness is pinned down by three guarantees, stacked in increasing difficulty to
          provide, and increasing damage if broken.
        </p>

        <div
          className="reveal"
          style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr', margin: '22px 0' }}
        >
          <PropertyCard
            icon={Lock}
            tone="var(--copper)"
            name="Preimage resistance"
            defn={
              <>
                Given a fingerprint <code className="ic">H(x)</code>, you cannot work backward to
                any input that produces it. The function is <span className="kw">one-way</span>:
                trivial to walk forward, hopeless to walk back.
              </>
            }
          />
          <PropertyCard
            icon={Fingerprint}
            tone="var(--steel)"
            name="Second-preimage resistance"
            defn={
              <>
                Given a specific input <code className="ic">x</code>, you cannot find a{' '}
                <em>different</em> input that hashes to the same value. Nobody can swap your
                document for a forgery that shares its fingerprint.
              </>
            }
          />
          <PropertyCard
            icon={ShieldAlert}
            tone="var(--cerise)"
            name="Collision resistance"
            defn={
              <>
                You cannot find <em>any</em> two distinct inputs that collide — even ones you get to
                choose freely. This is the strongest demand, and the first to fall when a hash dies.
              </>
            }
          />
        </div>

        <p className="body">
          The third implies the second, but not the reverse. Collision resistance is the heavy one.
          It is exactly what <span className="kd">SHA-1</span> lost in 2017: nobody can reverse a
          SHA-1 hash even today, but two chosen inputs sharing one were demonstrated, and that alone
          broke every system relying on distinct inputs giving distinct fingerprints: signatures,
          certificates, version control.
        </p>

        <p className="body">
          Underneath all three sits a property nobody lists as an axiom but everyone leans on: the
          <em> avalanche effect</em>. Flip one input bit and roughly half the output bits should
          flip, unpredictably. The output should be statistically indistinguishable from random
          noise. Avalanche is what <em>feels</em> like strength; the three guarantees are what you
          actually rely on. Try to make the meter stray far from 50%:
        </p>

        <AvalancheLab />
      </div>
    </section>
  );
}
