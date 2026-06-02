function PatNode({ x, y, label, color, small }) {
  const w = small ? 56 : 64;
  const h = small ? 24 : 30;
  const stroke = `var(--${color})`;
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={6}
        fill="var(--bg-deep)"
        stroke={stroke}
        strokeWidth="1.2"
      />
      <text
        x={x}
        y={y + (small ? 3 : 4)}
        fontFamily="JetBrains Mono"
        fontSize={small ? 9 : 10}
        fill={stroke}
        textAnchor="middle"
        letterSpacing="1.5"
      >
        {label}
      </text>
    </g>
  );
}

function PatBuffer({ x, y }) {
  const cells = 5;
  const cw = 16;
  const totalW = cells * cw;
  return (
    <g>
      {Array.from({ length: cells }).map((_, i) => (
        <rect
          key={i}
          x={x - totalW / 2 + i * cw}
          y={y - 10}
          width={cw - 2}
          height={20}
          fill={i < 3 ? 'rgba(251,191,36,0.18)' : 'transparent'}
          stroke="var(--border-bright)"
          strokeWidth="1"
        />
      ))}
      <text
        x={x}
        y={y - 18}
        fontFamily="JetBrains Mono"
        fontSize="8"
        fill="var(--ink-faint)"
        textAnchor="middle"
        letterSpacing="2"
      >
        BUFFER
      </text>
    </g>
  );
}

function PatArrow({ x1, y1, x2, y2, fade }) {
  const opacity = fade ? 0.4 : 0.85;
  return (
    <g opacity={opacity}>
      <line
        x1={x1}
        y1={y1}
        x2={x2 - 4}
        y2={y2}
        stroke="var(--emerald)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <polygon
        points={`${x2},${y2} ${x2 - 6},${y2 - 3} ${x2 - 6},${y2 + 3}`}
        fill="var(--emerald)"
      />
    </g>
  );
}

// Pattern diagram — small SVG that draws producer, consumer, fan, etc.
export function PatternDiagram({ pattern }) {
  const W = 540;
  const H = 160;
  const center = H / 2;

  if (pattern === 'producer-consumer') {
    return (
      <div className="pat-diagram">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="pat-svg"
          role="img"
          aria-label="Producer-consumer pattern diagram"
        >
          <PatNode x={70} y={center} label="producer" color="amber" />
          <PatBuffer x={W / 2} y={center} />
          <PatNode x={W - 70} y={center} label="consumer" color="cyan" />
          <PatArrow x1={102} y1={center} x2={W / 2 - 60} y2={center} />
          <PatArrow x1={W / 2 + 60} y1={center} x2={W - 102} y2={center} />
        </svg>
      </div>
    );
  }
  if (pattern === 'fan-out-in') {
    const ny = [center - 40, center, center + 40];
    return (
      <div className="pat-diagram">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="pat-svg"
          role="img"
          aria-label="Fan-out fan-in pattern diagram"
        >
          <PatNode x={60} y={center} label="source" color="amber" />
          {ny.map((y, i) => (
            <g key={i}>
              <PatNode x={W / 2} y={y} label={`w${i + 1}`} color="cyan" small />
              <PatArrow x1={92} y1={center} x2={W / 2 - 22} y2={y} />
              <PatArrow x1={W / 2 + 22} y1={y} x2={W - 92} y2={center} />
            </g>
          ))}
          <PatNode x={W - 60} y={center} label="sink" color="emerald" />
        </svg>
      </div>
    );
  }
  if (pattern === 'pipeline') {
    const stages = [
      { x: 70, label: 'parse', color: 'amber' },
      { x: 200, label: 'transform', color: 'cyan' },
      { x: 340, label: 'enrich', color: 'emerald' },
      { x: 470, label: 'sink', color: 'rose' },
    ];
    return (
      <div className="pat-diagram">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="pat-svg"
          role="img"
          aria-label="Pipeline pattern diagram"
        >
          {stages.map((s, i) => (
            <g key={i}>
              <PatNode x={s.x} y={center} label={s.label} color={s.color} />
              {i < stages.length - 1 && (
                <PatArrow x1={s.x + 32} y1={center} x2={stages[i + 1].x - 32} y2={center} />
              )}
            </g>
          ))}
        </svg>
      </div>
    );
  }
  if (pattern === 'pub-sub') {
    const subs = [center - 50, center - 16, center + 18, center + 52];
    return (
      <div className="pat-diagram">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="pat-svg"
          role="img"
          aria-label="Publish-subscribe pattern diagram"
        >
          <PatNode x={60} y={center} label="pub" color="amber" />
          <g>
            <rect
              x={W / 2 - 50}
              y={center - 14}
              width={100}
              height={28}
              rx={6}
              fill="var(--surface)"
              stroke="var(--cyan)"
              strokeWidth="1"
            />
            <text
              x={W / 2}
              y={center + 4}
              fontFamily="JetBrains Mono"
              fontSize="10"
              fill="var(--cyan)"
              textAnchor="middle"
              letterSpacing="2"
            >
              topic
            </text>
          </g>
          <PatArrow x1={92} y1={center} x2={W / 2 - 52} y2={center} />
          {subs.map((y, i) => (
            <g key={i}>
              <PatNode x={W - 60} y={y} label={`sub${i + 1}`} color="emerald" small />
              <PatArrow x1={W / 2 + 52} y1={center} x2={W - 92} y2={y} fade />
            </g>
          ))}
        </svg>
      </div>
    );
  }
  return null;
}
