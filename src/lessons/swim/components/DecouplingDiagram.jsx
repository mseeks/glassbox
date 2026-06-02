export function DecouplingDiagram() {
  return (
    <svg viewBox="0 0 720 380" width="100%" style={{ display: 'block' }}>
      <defs>
        <marker
          id="arr-brass"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--brass)" />
        </marker>
      </defs>

      {/* FD column */}
      <g transform="translate(40, 40)">
        <rect width="300" height="280" rx="3" fill="var(--surface)" stroke="var(--border-bright)" />
        <text
          x="20"
          y="32"
          fontFamily="JetBrains Mono, monospace"
          fontSize="10"
          letterSpacing="0.2em"
          fill="var(--brass)"
        >
          FAILURE DETECTION
        </text>
        <text
          x="20"
          y="62"
          fontFamily="Cormorant Garamond, serif"
          fontSize="22"
          fill="var(--ink-bright)"
          fontStyle="italic"
        >
          Is X alive?
        </text>
        <text
          x="20"
          y="84"
          fontFamily="Inter Tight, sans-serif"
          fontSize="12"
          fill="var(--ink-dim)"
        >
          a local question
        </text>

        <line x1="20" y1="108" x2="280" y2="108" stroke="var(--border)" />

        <g fontFamily="Inter Tight" fontSize="13" fill="var(--ink)">
          <text x="20" y="138">
            – Each node probes one peer per round
          </text>
          <text x="20" y="160">
            – Indirect probes via k helpers on failure
          </text>
          <text x="20" y="182">
            – Random target selection
          </text>
          <text x="20" y="204">
            – Bounded message load per node
          </text>
        </g>

        <g transform="translate(20, 230)">
          <text
            fontFamily="JetBrains Mono"
            fontSize="10"
            letterSpacing="0.14em"
            fill="var(--ink-faint)"
          >
            SCALES AS
          </text>
          <text
            x="0"
            y="22"
            fontFamily="Cormorant Garamond, serif"
            fontSize="28"
            fill="var(--alive)"
            fontStyle="italic"
          >
            O(1) per node
          </text>
        </g>
      </g>

      {/* Dissemination column */}
      <g transform="translate(380, 40)">
        <rect width="300" height="280" rx="3" fill="var(--surface)" stroke="var(--border-bright)" />
        <text
          x="20"
          y="32"
          fontFamily="JetBrains Mono, monospace"
          fontSize="10"
          letterSpacing="0.2em"
          fill="var(--brass)"
        >
          DISSEMINATION
        </text>
        <text
          x="20"
          y="62"
          fontFamily="Cormorant Garamond, serif"
          fontSize="22"
          fill="var(--ink-bright)"
          fontStyle="italic"
        >
          How does the answer spread?
        </text>
        <text
          x="20"
          y="84"
          fontFamily="Inter Tight, sans-serif"
          fontSize="12"
          fill="var(--ink-dim)"
        >
          a global question
        </text>

        <line x1="20" y1="108" x2="280" y2="108" stroke="var(--border)" />

        <g fontFamily="Inter Tight" fontSize="13" fill="var(--ink)">
          <text x="20" y="138">
            – Updates piggyback on probe traffic
          </text>
          <text x="20" y="160">
            – No dedicated dissemination packets
          </text>
          <text x="20" y="182">
            – Epidemic spread, like a virus
          </text>
          <text x="20" y="204">
            – Each update gossipped ~λ·log N times
          </text>
        </g>

        <g transform="translate(20, 230)">
          <text
            fontFamily="JetBrains Mono"
            fontSize="10"
            letterSpacing="0.14em"
            fill="var(--ink-faint)"
          >
            CONVERGES IN
          </text>
          <text
            x="0"
            y="22"
            fontFamily="Cormorant Garamond, serif"
            fontSize="28"
            fill="var(--gossip)"
            fontStyle="italic"
          >
            O(log N) rounds
          </text>
        </g>
      </g>

      {/* connector */}
      <g>
        <text
          x="360"
          y="350"
          textAnchor="middle"
          fontFamily="JetBrains Mono"
          fontSize="10"
          letterSpacing="0.18em"
          fill="var(--brass)"
        >
          SEPARATE, BUT THE SAME PACKETS CARRY BOTH
        </text>
      </g>
    </svg>
  );
}
