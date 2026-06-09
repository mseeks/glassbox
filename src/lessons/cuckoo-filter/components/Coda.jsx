export function Coda() {
  return (
    <section style={{ marginTop: 160, marginBottom: 100 }}>
      <div className="cf-page">
        <div
          style={{
            maxWidth: 760,
            margin: '0 auto',
            textAlign: 'center',
            padding: '60px 0',
            borderTop: '1px solid var(--line)',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div className="cf-eyebrow cf-eyebrow-cuc" style={{ marginBottom: 28 }}>
            Coda
          </div>

          <h2
            style={{
              fontFamily: 'Fraunces',
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(26px, 4.4vw, 56px)',
              lineHeight: 1.18,
              letterSpacing: '-0.02em',
              margin: 0,
              color: 'var(--text)',
              fontVariationSettings: '"opsz" 144, "SOFT" 100',
            }}
          >
            Four moves: <span style={{ color: 'var(--cuc)' }}>hash</span>, place, evict,{' '}
            <span style={{ color: 'var(--cuc)' }}>forget</span>.
            <br />
            The rest is parameters.
          </h2>

          <div
            style={{
              marginTop: 36,
              maxWidth: 580,
              margin: '36px auto 0',
              fontFamily: 'IBM Plex Serif',
              fontSize: 16.5,
              lineHeight: 1.65,
              color: 'var(--text-2)',
              fontWeight: 300,
            }}
          >
            The cuckoo filter is no larger than its description. A short hash, an XOR, a small
            budget of kicks; eight bits per entry, three percent wrong, deletes for free. There is
            very little here. That is the point.
          </div>

          <div
            style={{
              maxWidth: 580,
              margin: '22px auto 0',
              fontFamily: 'IBM Plex Serif',
              fontSize: 16.5,
              lineHeight: 1.65,
              color: 'var(--text-2)',
              fontWeight: 300,
            }}
          >
            And one of those moves travels. The filter never records where a fingerprint’s second
            home is; it recomputes it,{' '}
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: 'var(--text)' }}>
              i₂ = i₁ ⊕ hash(fp)
            </span>
            , so either bucket reaches the other with nothing stored between them.{' '}
            <span style={{ fontStyle: 'italic', color: 'var(--text)' }}>
              Derive what you can instead of keeping it.
            </span>{' '}
            That idea is older and wider than this filter, and it is the one to carry out.
          </div>

          <div style={{ maxWidth: 620, margin: '56px auto 0', textAlign: 'left' }}>
            <div
              className="cf-eyebrow"
              style={{ marginBottom: 18, textAlign: 'center', letterSpacing: '0.28em' }}
            >
              Where to go next
            </div>
            <div className="cf-cols cf-cols-2">
              {[
                {
                  title: 'Bloom filters',
                  desc: 'The structure this one was built to beat. Pure bit arrays, smaller still, but no way to take a key back out.',
                },
                {
                  title: 'Counting Bloom filters',
                  desc: 'The other route to deletion: swap each bit for a small counter. It buys removal, but pays several times the space.',
                },
                {
                  title: 'Quotient filters',
                  desc: 'A cousin that also deletes, splitting each hash into a quotient and a remainder instead of kicking fingerprints between buckets.',
                },
                {
                  title: 'Cuckoo hashing',
                  desc: 'The table beneath the filter. Pagh and Rodler’s scheme, where the kick-and-rehome dance was born, before fingerprints ever entered.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    padding: '18px 20px',
                    border: '1px solid var(--line)',
                    background: 'var(--bg-1)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Fraunces',
                      fontSize: 19,
                      fontWeight: 400,
                      letterSpacing: '-0.012em',
                      color: 'var(--text)',
                      marginBottom: 8,
                    }}
                  >
                    {item.title}
                  </div>
                  <div className="cf-body" style={{ fontSize: 14, lineHeight: 1.55 }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
            }}
          >
            <div style={{ width: 40, height: 1, background: 'var(--line-strong)' }} />
            <div
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: 10.5,
                letterSpacing: '0.32em',
                color: 'var(--cuc)',
              }}
            >
              END
            </div>
            <div style={{ width: 40, height: 1, background: 'var(--line-strong)' }} />
          </div>

          <div
            style={{
              marginTop: 24,
              fontFamily: 'IBM Plex Serif',
              fontStyle: 'italic',
              fontSize: 13,
              color: 'var(--text-mute)',
              letterSpacing: 0,
            }}
          >
            Fan, Andersen, Kaminsky & Mitzenmacher. <br />
            <span
              className="cf-mono"
              style={{
                fontStyle: 'normal',
                fontSize: 11,
                letterSpacing: '0.06em',
                color: 'var(--cf-label-faint)',
              }}
            >
              "Cuckoo Filter: Practically Better Than Bloom" · CoNEXT 2014
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
