export function ActorDiagram() {
  return (
    <div className="actor-card">
      <svg
        viewBox="0 0 540 200"
        className="actor-svg"
        role="img"
        aria-label="Actor model message passing diagram"
      >
        {/* Actor A */}
        <g>
          <rect
            x={40}
            y={50}
            width={120}
            height={100}
            rx={10}
            fill="var(--surface)"
            stroke="var(--amber)"
            strokeWidth="1.5"
          />
          <text
            x={100}
            y={36}
            fontFamily="JetBrains Mono"
            fontSize="9"
            fill="var(--amber)"
            textAnchor="middle"
            letterSpacing="2"
          >
            ACTOR A
          </text>
          <text
            x={100}
            y={88}
            fontFamily="Fraunces"
            fontStyle="italic"
            fontSize="13"
            fill="var(--ink)"
            textAnchor="middle"
          >
            private state
          </text>
          <line x1={60} y1={100} x2={140} y2={100} stroke="var(--border)" />
          <text
            x={100}
            y={118}
            fontFamily="JetBrains Mono"
            fontSize="9"
            fill="var(--ink-faint)"
            textAnchor="middle"
            letterSpacing="2"
          >
            MAILBOX
          </text>
          {/* Mailbox queue */}
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={70 + i * 18}
              y={128}
              width={14}
              height={14}
              rx={2}
              fill={i === 0 ? 'rgba(94,234,212,0.25)' : 'rgba(94,234,212,0.1)'}
              stroke="var(--cyan)"
              strokeWidth="0.8"
            />
          ))}
        </g>
        {/* Actor B */}
        <g>
          <rect
            x={380}
            y={50}
            width={120}
            height={100}
            rx={10}
            fill="var(--surface)"
            stroke="var(--cyan)"
            strokeWidth="1.5"
          />
          <text
            x={440}
            y={36}
            fontFamily="JetBrains Mono"
            fontSize="9"
            fill="var(--cyan)"
            textAnchor="middle"
            letterSpacing="2"
          >
            ACTOR B
          </text>
          <text
            x={440}
            y={88}
            fontFamily="Fraunces"
            fontStyle="italic"
            fontSize="13"
            fill="var(--ink)"
            textAnchor="middle"
          >
            private state
          </text>
          <line x1={400} y1={100} x2={480} y2={100} stroke="var(--border)" />
          <text
            x={440}
            y={118}
            fontFamily="JetBrains Mono"
            fontSize="9"
            fill="var(--ink-faint)"
            textAnchor="middle"
            letterSpacing="2"
          >
            MAILBOX
          </text>
          {[0, 1].map((i) => (
            <rect
              key={i}
              x={410 + i * 18}
              y={128}
              width={14}
              height={14}
              rx={2}
              fill={i === 0 ? 'rgba(251,191,36,0.25)' : 'rgba(251,191,36,0.1)'}
              stroke="var(--amber)"
              strokeWidth="0.8"
            />
          ))}
        </g>
        {/* Message envelopes traveling */}
        <g>
          <line
            x1={160}
            y1={90}
            x2={380}
            y2={90}
            stroke="var(--cyan)"
            strokeWidth="1.4"
            strokeOpacity="0.6"
          />
          <polygon points="380,90 372,87 372,93" fill="var(--cyan)" />
          <rect
            x={250}
            y={82}
            width={36}
            height={16}
            rx={3}
            fill="var(--bg-deep)"
            stroke="var(--cyan)"
            strokeWidth="1"
          />
          <text
            x={268}
            y={94}
            fontFamily="JetBrains Mono"
            fontSize="9"
            fill="var(--cyan)"
            textAnchor="middle"
          >
            msg
          </text>
        </g>
        <g>
          <line
            x1={380}
            y1={120}
            x2={160}
            y2={120}
            stroke="var(--amber)"
            strokeWidth="1.4"
            strokeOpacity="0.6"
          />
          <polygon points="160,120 168,117 168,123" fill="var(--amber)" />
          <rect
            x={254}
            y={112}
            width={36}
            height={16}
            rx={3}
            fill="var(--bg-deep)"
            stroke="var(--amber)"
            strokeWidth="1"
          />
          <text
            x={272}
            y={124}
            fontFamily="JetBrains Mono"
            fontSize="9"
            fill="var(--amber)"
            textAnchor="middle"
          >
            reply
          </text>
        </g>
      </svg>
      <div className="actor-caption">No shared memory. No locks. Only messages.</div>
    </div>
  );
}
