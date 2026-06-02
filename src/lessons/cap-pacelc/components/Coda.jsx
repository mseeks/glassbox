/* ════════════════════════════════════════════════════════════════════════
   CODA — the synthesis.

   Typography-led. No heavy visual. The lesson lands.
   ════════════════════════════════════════════════════════════════════════ */
export function Coda() {
  return (
    <section style={{ padding: '120px 0 140px', textAlign: 'center' }}>
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          letterSpacing: '0.3em',
          color: 'var(--coral)',
          marginBottom: 28,
        }}
      >
        ⟢ &nbsp; CODA &nbsp; ⟣
      </div>

      <h2
        className="display"
        style={{
          fontSize: 'clamp(32px, 5.5vw, 56px)',
          fontWeight: 300,
          letterSpacing: '-0.025em',
          lineHeight: 1.1,
          margin: 0,
          maxWidth: 720,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        CAP is a coordinate system, <br />
        <span className="display-italic" style={{ color: 'var(--coral)' }}>
          not a checklist.
        </span>
      </h2>

      <div
        style={{
          marginTop: 52,
          maxWidth: 560,
          marginLeft: 'auto',
          marginRight: 'auto',
          fontFamily: 'Spectral, serif',
          fontWeight: 300,
          fontSize: 18,
          lineHeight: 1.75,
          color: 'var(--ink-2)',
          fontStyle: 'italic',
        }}
      >
        <p style={{ margin: '0 0 14px' }}>It does not tell you which system to build.</p>
        <p style={{ margin: 0 }}>
          It tells you what the universe will charge you for the system you have in mind.
        </p>
      </div>

      {/* Visual breath between font registers */}
      <div
        style={{
          margin: '64px auto 0',
          width: 40,
          height: 1,
          background: 'var(--coral)',
          opacity: 0.4,
        }}
      />

      <div
        style={{
          marginTop: 36,
          maxWidth: 620,
          marginLeft: 'auto',
          marginRight: 'auto',
          fontFamily: 'Lora, serif',
          fontSize: 15,
          lineHeight: 1.75,
          color: 'var(--ink-dim)',
          textAlign: 'left',
        }}
      >
        <p style={{ margin: '0 0 18px' }}>
          The theorem is short. The misunderstanding of it is long, and the design space it leaves
          you is wider than the slogan suggests. Linearizable or causal. Available or refusing.
          Local or quorum. Strong by default or strong on demand. The map has more rooms than two.
        </p>
        <p style={{ margin: '0 0 18px' }}>
          What CAP and PACELC together give you is a question to ask of every distributed-data
          design:{' '}
          <em>
            what will this system do when the network fails, and what will it do when the network
            works?
          </em>{' '}
          Once those two answers are precise, the rest of the architecture follows.
        </p>
        <p
          style={{
            margin: 0,
            textAlign: 'center',
            fontStyle: 'italic',
            color: 'var(--ink-2)',
            fontSize: 16,
          }}
        >
          The rest is engineering.
        </p>
      </div>

      <div
        style={{
          marginTop: 80,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          letterSpacing: '0.3em',
          color: 'var(--ink-faint)',
        }}
      >
        ╱ &nbsp; END &nbsp; ╱
      </div>
    </section>
  );
}
