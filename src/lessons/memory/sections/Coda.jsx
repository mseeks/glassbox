import Core from '../components/Core.jsx';

// Coda — the cleverness didn't vanish; it just moved up the stack.
export default function Coda() {
  return (
    <section>
      <div className="wrap">
        <div className="rev" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 8px' }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Coda
          </div>
          <h2
            className="disp"
            style={{ fontSize: 'clamp(28px,5.5vw,42px)', lineHeight: 1.12, marginBottom: 18 }}
          >
            The cleverness didn't vanish.
            <br />
            It just moved up the stack.
          </h2>
          <p style={{ color: '#cdc7ba' }}>
            When memory was scarce, genius went into fitting a whole world into a shoebox. Now that
            it is vast, genius goes into filling the ocean instead. We hold an entire artificial
            mind in memory at once. Same instinct. Four more orders of magnitude. The ring you wove
            at the top of this page is still down there under all of it, by the trillion.
          </p>
        </div>

        <div className="rev" style={{ maxWidth: 680, margin: '46px auto 0' }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Where to go next
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              [
                'The memory hierarchy',
                'Not all memory is equal. From registers down through cache, then RAM, then disk, each layer trades speed for size across six orders of magnitude. That is the reason "how much" is only half the story.',
              ],
              [
                "Moore's law and its end",
                'The doubling that drove this whole chart had a physical engine, and it is now sputtering. What replaces "just add more bits"?',
              ],
              [
                'Compression',
                'How we keep cheating the ocean: storing a photo or song in a fraction of its true size by spending computation to fold out the redundancy.',
              ],
            ].map(([t, d], i) => (
              <div
                key={i}
                style={{
                  padding: '14px 16px',
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 11,
                }}
              >
                <strong style={{ color: 'var(--amber-hi)' }}>{t}</strong>
                <p style={{ margin: '5px 0 0', fontSize: 14.5, color: 'var(--dim)' }}>{d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rev" style={{ textAlign: 'center', marginTop: 54 }}>
          <div
            style={{
              width: 1,
              height: 34,
              background: 'linear-gradient(var(--line2),transparent)',
              margin: '0 auto 14px',
            }}
          />
          <span style={{ display: 'inline-block' }}>
            <Core on size={22} />
          </span>
          <div
            className="mono"
            style={{ fontSize: 11, color: 'var(--faint)', letterSpacing: '.22em', marginTop: 12 }}
          >
            ONE RING · ONE BIT
          </div>
        </div>
      </div>
    </section>
  );
}
