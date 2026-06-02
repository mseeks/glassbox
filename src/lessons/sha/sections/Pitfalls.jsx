import { Flame, Key, Skull, Scale } from 'lucide-react';
import { useRevealRoot } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import Rule from '../components/Rule.jsx';

const PITFALLS = [
  {
    icon: Flame,
    tone: 'var(--cerise)',
    t: 'Never hash passwords with raw SHA',
    d: 'SHA is built to be fast. Billions of guesses per second on a GPU, and that very speed, the thing that makes SHA a fine fingerprint, becomes a gift to an attacker grinding through a stolen database offline. Reach for a slow, memory-hard function instead: Argon2id, scrypt, or bcrypt.',
  },
  {
    icon: Key,
    tone: 'var(--copper)',
    t: 'For keyed integrity, use HMAC, not H(key ‖ msg)',
    d: 'You watched the forgery happen. Authenticating a message with a secret means reaching for HMAC-SHA-256, or KMAC if you happen to be on SHA-3. Never a bare concatenation fed to the hash.',
  },
  {
    icon: Skull,
    tone: 'var(--bone-faint)',
    t: 'SHA-1 and MD5 are finished',
    d: 'Both have practical collisions. They still work fine as non-security checksums that only need to catch accidental corruption, but they fall apart the instant an adversary gets to choose the input. Never for signatures. Never for certificates.',
  },
  {
    icon: Scale,
    tone: 'var(--steel)',
    t: 'Truncation halves your collision margin',
    d: 'An n-bit hash resists collisions to about 2^(n/2) work, the birthday bound. Chop the output to t bits and that margin drops to 2^(t/2). Do the math first. Truncate deliberately, not casually.',
  },
];

export default function Pitfalls() {
  const ref = useRevealRoot();
  return (
    <section ref={ref}>
      <div className="sha-wrap">
        <SectionHead
          num="08"
          eyebrow="Footguns"
          title="Four ways to"
          italic="hold it wrong"
          lede={
            <>
              SHA functions are sharp tools. Most real-world breakage isn't the algorithm failing.
              It's the algorithm used for a job it was never meant to do.
            </>
          }
        />
        <div className="reveal" style={{ display: 'grid', gap: 11, marginTop: 22 }}>
          {PITFALLS.map(({ icon: Icon, tone, t, d }) => (
            <div
              key={t}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: 14,
                padding: '15px 16px',
                border: '1px solid var(--line)',
                borderLeft: `3px solid ${tone}`,
                borderRadius: 10,
                background: 'var(--panel)',
              }}
            >
              <Icon size={20} style={{ color: tone, marginTop: 2 }} />
              <div>
                <div
                  style={{
                    fontFamily: 'var(--slab)',
                    fontWeight: 600,
                    fontSize: 16.5,
                    color: 'var(--bone)',
                    marginBottom: 4,
                  }}
                >
                  {t}
                </div>
                <div style={{ fontSize: 14.5, color: 'var(--bone-dim)', lineHeight: 1.58 }}>
                  {d}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Rule />
    </section>
  );
}
