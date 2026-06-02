import { ChevronRight, Fingerprint } from 'lucide-react';
import { useRevealRoot } from '../../../shared/reveal.jsx';

export default function Coda() {
  const ref = useRevealRoot();
  return (
    <section ref={ref} style={{ paddingBottom: 100 }}>
      <div className="sha-wrap">
        <div className="eyebrow reveal">
          <span className="dash" /> Coda
        </div>
        <h2 className="h-sec reveal" style={{ marginTop: 14, fontSize: 'clamp(24px,4.6vw,34px)' }}>
          One name, two machines, one lesson about{' '}
          <em style={{ color: 'var(--copper)' }}>boundaries</em>.
        </h2>
        <p className="body reveal" style={{ marginTop: 18 }}>
          <span className="kw">SHA-2</span> is an assembly line with an exposed final workpiece. It
          is fast. It is conservative. It is everywhere, yet it stays vulnerable to "keep building
          from where they stopped" unless you wrap it in HMAC.
          <span className="kg"> SHA-3</span> is a sponge with a permanently hidden interior. It runs
          a touch slower in software. In exchange it is immune to that whole class of attack, and it
          can pour out as many output bits as you ask it for.
        </p>
        <p className="body reveal">
          Both rest on the same quiet miracle you met at the start. Stir bits hard enough, blending
          the carries from addition with the wandering of rotation and the folding of XOR, and a
          one-way street appears where there was none. Trivial to walk forward. Hopeless to walk
          back. That asymmetry is what lets a thirty-two byte fingerprint stand in for a document, a
          download, a block of a chain, or a leaf of a tree, and still be trusted.
        </p>

        <div
          className="reveal"
          style={{
            marginTop: 30,
            padding: '20px 22px',
            border: '1px solid var(--line-bright)',
            borderRadius: 13,
            background: 'linear-gradient(135deg, var(--copper-glow), transparent 70%)',
          }}
        >
          <div className="eyebrow" style={{ color: 'var(--bone-faint)' }}>
            Where to go next
          </div>
          <div style={{ marginTop: 12, display: 'grid', gap: 9 }}>
            {[
              [
                'The Keccak round, in full',
                'θ ρ π χ ι: five micro-operations that make the real permutation.',
              ],
              [
                'HMAC & HKDF',
                'How keyed hashing becomes message authentication and key derivation.',
              ],
              [
                'The birthday bound',
                'Why an n-bit hash only buys n/2 bits of collision resistance.',
              ],
              [
                'BLAKE3 & Merkle hashing',
                'A modern hash that is a tree at its core: parallel, and very fast.',
              ],
            ].map(([t, d]) => (
              <div key={t} style={{ display: 'flex', gap: 11, alignItems: 'baseline' }}>
                <ChevronRight
                  size={14}
                  style={{ color: 'var(--copper)', flexShrink: 0, transform: 'translateY(2px)' }}
                />
                <span style={{ fontSize: 14.5 }}>
                  <span
                    style={{ color: 'var(--bone)', fontWeight: 600, fontFamily: 'var(--slab)' }}
                  >
                    {t}
                  </span>
                  <span style={{ color: 'var(--bone-faint)' }}>: {d}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="reveal"
          style={{
            marginTop: 40,
            textAlign: 'center',
            fontFamily: 'var(--mono)',
            fontSize: 12,
            color: 'var(--bone-faint)',
            letterSpacing: '.1em',
          }}
        >
          <Fingerprint size={15} style={{ color: 'var(--copper)', marginBottom: 6 }} />
          <br />
          every digest in this lesson was computed live · sha-256 verified against NIST vectors
        </div>
      </div>
    </section>
  );
}
