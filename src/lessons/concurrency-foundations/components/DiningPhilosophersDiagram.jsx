export function DiningPhilosophersDiagram() {
  // Five philosophers around a circular table; forks between each pair.
  // We render an SVG with chair positions and fork positions on a circle.
  const cx = 180;
  const cy = 180;
  const philR = 110; // distance from center to philosopher
  const forkR = 75; // distance from center to fork
  const N = 5;

  const phils = Array.from({ length: N }).map((_, i) => {
    const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + philR * Math.cos(angle), y: cy + philR * Math.sin(angle), idx: i };
  });
  const forks = Array.from({ length: N }).map((_, i) => {
    const angle = ((i + 0.5) / N) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + forkR * Math.cos(angle), y: cy + forkR * Math.sin(angle), idx: i };
  });

  return (
    <div className="dp-card">
      <div className="dp-tag">five philosophers · five forks · zero meals</div>
      <svg
        viewBox="0 0 360 360"
        className="dp-svg"
        role="img"
        aria-label="Dining philosophers wait cycle diagram"
      >
        {/* Table */}
        <circle
          cx={cx}
          cy={cy}
          r="50"
          style={{ fill: 'var(--cf-wash-table)' }}
          stroke="var(--border)"
          strokeDasharray="3 4"
        />
        <text
          x={cx}
          y={cy + 4}
          fontFamily="JetBrains Mono"
          fontSize="9"
          fill="var(--ink-faint)"
          textAnchor="middle"
          letterSpacing="2"
        >
          TABLE
        </text>
        {/* Wait arrows — each philosopher holds left fork, waits for right */}
        {phils.map((p, i) => {
          const heldFork = forks[(i + N - 1) % N]; // left fork (held)
          const wantedFork = forks[i]; // right fork (wanted)
          return (
            <g key={'arrows-' + i}>
              {/* Holds left */}
              <line
                x1={p.x}
                y1={p.y}
                x2={heldFork.x}
                y2={heldFork.y}
                stroke="var(--emerald)"
                strokeWidth="1.5"
                strokeOpacity="0.55"
              />
              {/* Waits for right */}
              <line
                x1={p.x}
                y1={p.y}
                x2={wantedFork.x}
                y2={wantedFork.y}
                stroke="var(--rose)"
                strokeWidth="1.5"
                strokeOpacity="0.7"
                strokeDasharray="3 3"
              />
            </g>
          );
        })}
        {/* Forks */}
        {forks.map((f, i) => (
          <g key={'fork-' + i}>
            <circle
              cx={f.x}
              cy={f.y}
              r="9"
              fill="var(--bg-deep)"
              stroke="var(--amber)"
              strokeWidth="1.5"
            />
            <text
              x={f.x}
              y={f.y + 3}
              fontFamily="JetBrains Mono"
              fontSize="8"
              fill="var(--amber)"
              textAnchor="middle"
            >
              ⌑
            </text>
          </g>
        ))}
        {/* Philosophers */}
        {phils.map((p, i) => (
          <g key={'phil-' + i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="22"
              fill="var(--surface)"
              stroke="var(--cyan)"
              strokeWidth="1.5"
            />
            <text
              x={p.x}
              y={p.y + 5}
              fontFamily="Fraunces"
              fontStyle="italic"
              fontSize="14"
              fill="var(--cyan)"
              textAnchor="middle"
              fontWeight="500"
            >
              P{i + 1}
            </text>
          </g>
        ))}
      </svg>
      <div className="dp-legend">
        <span className="dp-legend-item">
          <span className="dp-swatch" style={{ background: 'var(--emerald)' }} /> holds (left fork)
        </span>
        <span className="dp-legend-item">
          <span className="dp-swatch dashed" style={{ background: 'var(--rose)' }} /> waits for
          (right fork)
        </span>
      </div>
    </div>
  );
}
