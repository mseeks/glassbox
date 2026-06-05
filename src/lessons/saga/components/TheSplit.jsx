import { SPLIT_MONOLITH, SPLIT_SERVICES } from '../engine/index.js';

// §I figure — one monolith (a single write-ahead log) becoming four
// independently-logged services, the moment atomicity loses its single owner.
export default function TheSplit() {
  return (
    <div className="sg-sx-split">
      <div className="sg-sx-half">
        <h4>before · one monolith</h4>
        <div className="sg-sx-mono-box">
          <div style={{ fontFamily: "'Marcellus',serif", fontSize: '17px' }}>
            {SPLIT_MONOLITH.name}
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--gold)',
              letterSpacing: '.04em',
            }}
          >
            {SPLIT_MONOLITH.log}
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: '13.5px',
              color: 'var(--ink-2)',
              fontStyle: 'italic',
              lineHeight: 1.45,
            }}
          >
            {SPLIT_MONOLITH.desc}
          </div>
        </div>
      </div>
      <div className="sg-sx-arrow" aria-hidden="true">
        <span>→</span>
      </div>
      <div className="sg-sx-half">
        <h4>after · four services</h4>
        {SPLIT_SERVICES.map(([n, l]) => (
          <div className="sg-sx-svc" key={n}>
            <div className="nm">{n}</div>
            <div className="lg">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
