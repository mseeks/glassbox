import { ACID_PROPERTIES } from './data.js';
import { hexToRgb } from './helpers.js';

export function AcidGlanceCards({ activeSection, onJumpSection }) {
  return (
    <section
      className="iso-fade-in"
      style={{
        maxWidth: 1040,
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div
          className="iso-ui"
          style={{
            fontSize: 10,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(232, 222, 200, 0.55)',
            marginBottom: 8,
          }}
        >
          The four pillars
        </div>
        <h2
          className="iso-display"
          style={{
            fontSize: 'clamp(24px, 2.6vw, 30px)',
            fontWeight: 500,
            margin: 0,
            color: '#e8dec8',
            fontStyle: 'italic',
          }}
        >
          What ACID actually promises
        </h2>
        <p
          className="iso-body"
          style={{
            fontSize: 14,
            color: 'rgba(232, 222, 200, 0.6)',
            margin: '8px auto 0',
            maxWidth: 540,
            lineHeight: 1.55,
          }}
        >
          Each letter is a different question, asked along a different axis. Tap any card to jump to
          its section.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
        }}
        className="iso-acid-grid"
      >
        {ACID_PROPERTIES.map((p) => (
          <AcidCard
            key={p.letter}
            prop={p}
            active={activeSection === p.section}
            onClick={() => onJumpSection(p.section)}
          />
        ))}
      </div>
    </section>
  );
}

function AcidCard({ prop, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="iso-card"
      style={{
        padding: '20px 18px',
        borderRadius: 10,
        position: 'relative',
        textAlign: 'left',
        cursor: 'pointer',
        border: '1px solid ' + (active ? prop.accent : 'rgba(232, 222, 200, 0.08)'),
        background: active
          ? `linear-gradient(180deg, rgba(${hexToRgb(prop.accent)}, 0.04) 0%, #14141c 60%)`
          : '#14141c',
        transition: 'all 220ms ease',
        boxShadow: active
          ? `0 0 0 1px ${prop.accent}33, 0 12px 40px -16px ${prop.accent}55`
          : '0 8px 24px -12px rgba(0,0,0,0.6)',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = `${prop.accent}55`;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = 'rgba(232, 222, 200, 0.08)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
        <div
          className="iso-display"
          style={{
            fontSize: 56,
            fontWeight: 400,
            lineHeight: 0.85,
            color: prop.accent,
            fontStyle: 'italic',
            fontVariationSettings: "'opsz' 144",
          }}
        >
          {prop.letter}
        </div>
        <div>
          <div
            className="iso-display"
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: '#e8dec8',
              lineHeight: 1.1,
            }}
          >
            {prop.name}
          </div>
          <div
            className="iso-ui"
            style={{
              fontSize: 9,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(232, 222, 200, 0.55)',
              marginTop: 2,
            }}
          >
            {prop.domain} axis
          </div>
        </div>
      </div>

      <div className="iso-rule-short" style={{ margin: '14px 0 12px', width: 30 }} />

      <div
        className="iso-body"
        style={{
          fontSize: 13,
          color: 'rgba(232, 222, 200, 0.7)',
          lineHeight: 1.5,
          fontStyle: 'italic',
          marginBottom: 10,
          minHeight: 38,
        }}
      >
        {prop.question}
      </div>

      <div
        className="iso-body"
        style={{
          fontSize: 13,
          color: '#e8dec8',
          lineHeight: 1.5,
          marginBottom: 12,
          minHeight: 38,
        }}
      >
        {prop.promise}
      </div>

      <div
        className="iso-mono"
        style={{
          fontSize: 11,
          color: prop.accent,
          fontWeight: 500,
          opacity: 0.85,
        }}
      >
        {prop.mechanism}
      </div>

      {prop.centerpiece && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            fontSize: 10,
            color: prop.accent,
            letterSpacing: '0.1em',
          }}
        >
          ★
        </div>
      )}
    </button>
  );
}
