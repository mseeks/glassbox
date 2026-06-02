import { renderProseMarkdown } from './helpers.js';

export function SectionDivider({ letter, name, kicker, accent, intro }) {
  return (
    <div
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
        className="iso-display"
        style={{
          fontSize: 'clamp(120px, 16vw, 180px)',
          fontWeight: 300,
          lineHeight: 0.85,
          color: accent,
          opacity: 0.18,
          fontStyle: 'italic',
          letterSpacing: '-0.04em',
          marginBottom: -20,
        }}
      >
        {letter}
      </div>
      <div
        className="iso-ui"
        style={{
          fontSize: 10,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: accent,
          marginBottom: 6,
          opacity: 0.8,
        }}
      >
        {kicker}
      </div>
      <h2
        className="iso-display"
        style={{
          fontSize: 'clamp(34px, 4.5vw, 48px)',
          fontWeight: 500,
          margin: 0,
          color: '#e8dec8',
          lineHeight: 1.05,
        }}
      >
        {name}
      </h2>
      {intro && (
        <p
          className="iso-body"
          style={{
            fontSize: 'clamp(16px, 1.7vw, 18px)',
            lineHeight: 1.6,
            color: 'rgba(232, 222, 200, 0.78)',
            margin: '20px auto 0',
            maxWidth: 580,
          }}
          dangerouslySetInnerHTML={{ __html: renderProseMarkdown(intro) }}
        />
      )}
    </div>
  );
}
