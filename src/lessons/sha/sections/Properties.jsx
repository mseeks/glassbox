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
              only need to spread values evenly, fast and uniform, and that single property is the
              whole of their job. A<span className="kw"> cryptographic</span> hash asks for more: it
              has to hold up against an adversary who is actively, cleverly trying to break it.
            </>
          }
        />

        <p className="body">
          Three guarantees pin that hardness down. They stack in order, each one harder to provide
          than the one before it and each one more damaging to lose when it finally gives way.
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
                You cannot find <em>any</em> two distinct inputs that collide. Not even ones you get
                to choose freely. This is the strongest demand, and the first to fall when a hash
                dies.
              </>
            }
          />
        </div>

        <p className="body">
          The third implies the second, but not the reverse. Collision resistance is the heavy one.
          It is exactly what <span className="kd">SHA-1</span> lost in 2017. Nobody can reverse a
          SHA-1 hash even today, yet the moment two chosen inputs sharing one digest were
          demonstrated, that single fact broke every system that had quietly assumed distinct inputs
          would always yield distinct fingerprints: signatures, certificates, version control.
        </p>

        <p className="body">
          Underneath all three sits a property nobody lists as an axiom but everyone leans on: the
          <em> avalanche effect</em>. Flip one input bit. Roughly half the output bits should flip,
          unpredictably, so that the digest you get back looks statistically indistinguishable from
          random noise no matter how small the change you made. Avalanche is what <em>feels</em>{' '}
          like strength. The three guarantees above are what you actually rely on. Try it. Make the
          meter stray far from 50%:
        </p>

        <AvalancheLab />
      </div>
    </section>
  );
}
