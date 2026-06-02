export function Welcome() {
  return (
    <section
      className="iso-fade-in"
      style={{
        textAlign: 'center',
        maxWidth: 720,
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div
        className="iso-ui"
        style={{
          fontSize: 11,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: 'rgba(232, 222, 200, 0.45)',
          marginBottom: 18,
        }}
      >
        A · C · I · D
      </div>
      <h1
        className="iso-display"
        style={{
          fontSize: 'clamp(44px, 6.5vw, 76px)',
          fontWeight: 400,
          lineHeight: 1.0,
          margin: 0,
          color: '#e8dec8',
          letterSpacing: '-0.025em',
        }}
      >
        The{' '}
        <em
          style={{
            fontStyle: 'italic',
            fontWeight: 300,
            background: 'linear-gradient(180deg, #5eead4 0%, #34d399 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          ACID
        </em>{' '}
        Lab
      </h1>
      <div className="iso-rule-short" style={{ margin: '24px auto 28px' }} />
      <p
        className="iso-body"
        style={{
          fontSize: 'clamp(17px, 1.8vw, 20px)',
          lineHeight: 1.6,
          color: 'rgba(232, 222, 200, 0.82)',
          margin: 0,
          maxWidth: 600,
          marginInline: 'auto',
        }}
      >
        Four letters, four guarantees — the contract every database makes with the applications that
        trust it. <em style={{ color: '#e8dec8', fontStyle: 'italic' }}>Atomicity</em>,{' '}
        <em style={{ color: '#e8dec8', fontStyle: 'italic' }}>Consistency</em>,{' '}
        <em style={{ color: '#e8dec8', fontStyle: 'italic' }}>Isolation</em>,{' '}
        <em style={{ color: '#e8dec8', fontStyle: 'italic' }}>Durability</em>: each addresses a
        different kind of failure, with different machinery.
      </p>
      <p
        className="iso-body"
        style={{
          fontSize: 'clamp(15px, 1.6vw, 17px)',
          lineHeight: 1.6,
          color: 'rgba(232, 222, 200, 0.6)',
          margin: '16px auto 0',
          maxWidth: 600,
        }}
      >
        Isolation and Atomicity get the long treatment; Consistency and Durability the short one.
        The deepest machinery is in the first two — but each of the four rewards an honest look. By
        the end, ACID should feel less like a memorized acronym and more like a coordinate system
        you can think inside of.
      </p>
    </section>
  );
}
