import { useRevealRoot } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import Rule from '../components/Rule.jsx';
import Figure from '../components/Figure.jsx';

const COMPARE = [
  ['Construction', 'Merkle–Damgård (assembly line)', 'Sponge (absorb / squeeze)'],
  ['Core operations', 'Add · Rotate · XOR', 'Bitwise permutation over a big state'],
  ['Length extension', 'Vulnerable (use HMAC)', 'Immune by design'],
  ['Software speed', 'Faster; hardware-accelerated on most CPUs', 'Slower in software'],
  ['Hardware speed', 'Good', 'Excellent; simpler, side-channel friendly'],
  ['Variable output', 'No', 'Yes: SHAKE (XOF)'],
];

const VARIANTS = [
  [
    'SHA-256',
    'SHA-2',
    '32-bit words, 64 rounds. The universal default for fingerprints, Merkle trees, git, certificates.',
  ],
  [
    'SHA-512',
    'SHA-2',
    '64-bit words, 80 rounds. Faster than SHA-256 on 64-bit hardware; larger security margin.',
  ],
  [
    'SHA-512/256',
    'SHA-2',
    'SHA-512 truncated to 256 bits. Same output size as SHA-256, faster on modern CPUs, and length-extension-safe (truncation hides the state).',
  ],
  [
    'SHA3-256 / 512',
    'SHA-3',
    'Fixed-output drop-in replacements for the SHA-2 sizes, on sponge bones.',
  ],
  [
    'SHAKE128 / 256',
    'SHA-3',
    'Extendable-output functions: squeeze as many bits as you want. No SHA-2 equivalent, ideal for key derivation and mask generation.',
  ],
];

export default function Variants() {
  const ref = useRevealRoot();
  return (
    <section ref={ref}>
      <div className="sha-wrap">
        <SectionHead
          num="07"
          eyebrow="The toolbox"
          title="Variants, and"
          italic="when to reach for each"
          lede={
            <>
              Within each family sit several sizes, plus one genuinely new capability in SHA-3. Here
              is the practical map.
            </>
          }
        />

        {/* head-to-head */}
        <Figure
          label="Fig. 7 · Head to head"
          title="SHA-2 vs SHA-3"
          foot={
            <>
              Neither is "better." SHA-3 is the more conservative, hardware-friendly design with the
              length-extension wound healed and variable output as a bonus. SHA-2 is faster in
              software and woven into nearly everything already. New protocol with no legacy? SHA-3
              (or SHA-512/256). Slotting into an existing world? SHA-256.
            </>
          }
        >
          <div style={{ display: 'grid', gap: 0 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.05fr 1fr 1fr',
                gap: 8,
                paddingBottom: 8,
                borderBottom: '1px solid var(--line-bright)',
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ color: 'var(--bone-faint)' }} />
              <span style={{ color: 'var(--copper)' }}>SHA-2</span>
              <span style={{ color: 'var(--jade)' }}>SHA-3</span>
            </div>
            {COMPARE.map(([k, a, b], i) => (
              <div
                key={k}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.05fr 1fr 1fr',
                  gap: 8,
                  padding: '11px 0',
                  borderBottom: i < COMPARE.length - 1 ? '1px solid var(--line)' : 'none',
                  alignItems: 'start',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--bone-dim)', fontWeight: 500 }}>{k}</span>
                <span style={{ fontSize: 13, color: 'var(--sha-body)' }}>{a}</span>
                <span style={{ fontSize: 13, color: 'var(--sha-body)' }}>{b}</span>
              </div>
            ))}
          </div>
        </Figure>

        {/* variant list */}
        <div className="reveal" style={{ display: 'grid', gap: 9, margin: '8px 0 4px' }}>
          {VARIANTS.map(([name, fam, desc]) => (
            <div
              key={name}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: 13,
                alignItems: 'start',
                padding: '13px 15px',
                border: '1px solid var(--line)',
                borderRadius: 10,
                background: 'var(--panel)',
              }}
            >
              <div style={{ minWidth: 96 }}>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: 'var(--bone)',
                  }}
                >
                  {name}
                </div>
                <span
                  className="chip"
                  style={{
                    marginTop: 5,
                    fontSize: 10,
                    color: fam === 'SHA-2' ? 'var(--copper)' : 'var(--jade)',
                    borderColor: (fam === 'SHA-2' ? 'var(--copper)' : 'var(--jade)') + '55',
                  }}
                >
                  {fam}
                </span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--bone-dim)', lineHeight: 1.55 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
      <Rule />
    </section>
  );
}
