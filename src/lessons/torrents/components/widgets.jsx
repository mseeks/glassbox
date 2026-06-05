// Small shared atoms used across labs and sections.

// A framed lab: the mono "figlabel · sub" caption above a glass panel. Each lab
// renders its own figure caption inside. Reveals on scroll via the shared root.
export function LabFrame({ label, sub, children }) {
  return (
    <div className="tor-figure tor-rv">
      <div className="tor-figlabel">
        <b>{label}</b>
        {sub ? <span>· {sub}</span> : null}
      </div>
      <div className="tor-panel">{children}</div>
    </div>
  );
}

// A big mono readout with a small uppercase label (your speed, swarm total…).
export function Stat({ v, l, color }) {
  return (
    <div className="tor-stat">
      <div className="tor-v" style={{ color: color || 'var(--star)' }}>
        {v}
      </div>
      <div className="tor-l">{l}</div>
    </div>
  );
}

// A glowing legend dot in a swarm colour.
export function Dot({ c }) {
  return <span className="tor-dotc" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />;
}
