import { useState } from 'react';
import { Node } from '../components/Node.jsx';

export function ProofLab() {
  const [step, setStep] = useState(0); // 0..3 sequence, 4..6 = chose a branch
  // 0 = initial, 1 = write started, 2 = write committed on G1, 3 = partition, 4 = client B asks G2
  // 5a/5b/5c = G2 chose option a/b/c

  const reset = () => setStep(0);
  const next = () => setStep((s) => Math.min(4, s + 1));
  const choose = (which) => setStep({ a: 5, b: 6, c: 7 }[which]);

  // states for visualization
  const g1Value = step >= 2 ? 1 : 0;
  const g2Value = 0; // G2 never learns of the write — that's the whole point
  const partitioned = step >= 3;
  const clientA = step >= 1;
  const clientB = step >= 4;

  const stepText = [
    'Two replicas, G1 and G2, each holding x = 0. Both healthy. A short conversation between them keeps them in sync. We begin.',
    'A client (call her Alice) sends a write to G1: x = 1. G1 accepts it. To preserve availability (A), G1 must respond with success. It cannot wait.',
    'G1 has committed x = 1 locally and acknowledged Alice. It will replicate to G2 when it can, but the world has other plans.',
    'A partition forms. G1 cannot reach G2. The replication message that should propagate x = 1 is silently lost.',
    'A different client, Bob, asks G2 to read x. What can G2 do?',
  ];

  const branchText = {
    5: {
      // chose a: return 0
      color: 'var(--coral)',
      title: 'G2 returns 0 — the value it has.',
      body: "G2 answers honestly with what it knows: x = 0. The system stays available (A), but Bob has now observed an older value after Alice's newer write completed. Linearizability is violated. Consistency (C) is sacrificed.",
      lost: 'C',
    },
    6: {
      // chose b: return 1
      color: 'var(--ink-faint)',
      title: 'G2 returns 1 — the new value.',
      body: 'G2 has no way to know x = 1. The partition prevented the replication message from arriving; G2 has not received any update. To return 1 would be to invent information, to fabricate a value the node cannot have learned. This is not a real option. The model does not permit nodes to know what they have not been told.',
      lost: '—',
    },
    7: {
      // chose c: refuse or hang
      color: 'var(--coral)',
      title: 'G2 refuses or blocks.',
      body: 'G2 says "I cannot answer right now." Perhaps it returns an error, perhaps it waits forever for the partition to heal. Either way, Bob does not get a non-error response in bounded time. Availability (A) is sacrificed. The system stays consistent (C), but at the cost of an unanswered request.',
      lost: 'A',
    },
  }[step];

  return (
    <div className="panel" style={{ background: 'var(--bg-deep)', padding: 0, overflow: 'hidden' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <pattern id="proof-grid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <path
              d="M 30 0 L 0 0 0 30"
              fill="none"
              stroke="var(--border)"
              strokeOpacity="0.2"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="600" height="340" fill="url(#proof-grid)" />

        {/* Client A (Alice) — top left */}
        {clientA && (
          <g opacity={step >= 4 ? 0.4 : 1}>
            <circle
              cx="100"
              cy="60"
              r="16"
              fill="var(--cyan-soft)"
              stroke="var(--cyan)"
              strokeWidth="1.2"
            />
            <text
              x="100"
              y="64"
              textAnchor="middle"
              fontFamily="Spectral, serif"
              fontStyle="italic"
              fontSize="12"
              fill="var(--cyan)"
            >
              A
            </text>
            <text
              x="100"
              y="90"
              textAnchor="middle"
              fontFamily="Spectral, serif"
              fontStyle="italic"
              fontSize="11"
              fill="var(--ink-dim)"
            >
              Alice
            </text>
          </g>
        )}

        {/* Client B (Bob) — top right */}
        {clientB && (
          <g>
            <circle
              cx="500"
              cy="60"
              r="16"
              fill="var(--cyan-soft)"
              stroke="var(--cyan)"
              strokeWidth="1.2"
            />
            <text
              x="500"
              y="64"
              textAnchor="middle"
              fontFamily="Spectral, serif"
              fontStyle="italic"
              fontSize="12"
              fill="var(--cyan)"
            >
              B
            </text>
            <text
              x="500"
              y="90"
              textAnchor="middle"
              fontFamily="Spectral, serif"
              fontStyle="italic"
              fontSize="11"
              fill="var(--ink-dim)"
            >
              Bob
            </text>
          </g>
        )}

        {/* Alice's write arrow to G1 */}
        {clientA && step >= 1 && (
          <g>
            <line
              x1="116"
              y1="68"
              x2="186"
              y2="146"
              stroke="var(--cyan)"
              strokeOpacity={step === 1 ? 1 : 0.3}
              strokeWidth="1"
              markerEnd="url(#arrow-cyan-2)"
            />
            {step === 1 && (
              <text
                x="120"
                y="120"
                fontFamily="JetBrains Mono, monospace"
                fontSize="10"
                fill="var(--cyan)"
              >
                write x=1
              </text>
            )}
          </g>
        )}

        {/* G1 — bottom left */}
        <Node
          x={200}
          y={180}
          r={36}
          label="G1"
          state={partitioned ? 'consistent' : 'alive'}
          value={`x = ${g1Value}`}
        />

        {/* G2 — bottom right */}
        <Node
          x={400}
          y={180}
          r={36}
          label="G2"
          state={partitioned && step >= 5 ? (step === 7 ? 'unavail' : 'available') : 'alive'}
          value={`x = ${step === 6 ? '?' : g2Value}`}
        />

        {/* Replication wire between G1 and G2 */}
        {!partitioned && (
          <>
            <line
              x1="236"
              y1="180"
              x2="364"
              y2="180"
              stroke="var(--emerald)"
              strokeOpacity="0.4"
              strokeWidth="0.8"
            />
            <text
              x="300"
              y="170"
              textAnchor="middle"
              fontFamily="Spectral, serif"
              fontStyle="italic"
              fontSize="11"
              fill="var(--emerald)"
            >
              replication
            </text>
          </>
        )}

        {/* Failed replication when partitioned */}
        {partitioned && (
          <>
            <line
              x1="236"
              y1="180"
              x2="290"
              y2="180"
              stroke="var(--coral)"
              strokeOpacity="0.4"
              strokeWidth="0.8"
              strokeDasharray="3,4"
            />
            <line
              x1="310"
              y1="180"
              x2="364"
              y2="180"
              stroke="var(--coral)"
              strokeOpacity="0.4"
              strokeWidth="0.8"
              strokeDasharray="3,4"
            />
            <g transform="translate(300, 180)">
              <line x1="-10" y1="-12" x2="10" y2="12" stroke="var(--coral)" strokeWidth="1.5" />
              <line x1="10" y1="-12" x2="-10" y2="12" stroke="var(--coral)" strokeWidth="1.5" />
            </g>
            <text
              x="300"
              y="155"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="10"
              fill="var(--coral)"
              letterSpacing="0.1em"
            >
              PARTITION
            </text>
          </>
        )}

        {/* Bob's read arrow to G2 */}
        {clientB && (
          <line
            x1="484"
            y1="68"
            x2="414"
            y2="146"
            stroke="var(--cyan)"
            strokeWidth="1"
            strokeOpacity="0.8"
            markerEnd="url(#arrow-cyan-2)"
          />
        )}

        {/* G2's response when a branch is chosen */}
        {step === 5 && (
          <g>
            <line
              x1="414"
              y1="214"
              x2="484"
              y2="92"
              stroke="var(--coral)"
              strokeWidth="1.2"
              markerEnd="url(#arrow-coral)"
            />
            <rect
              x="430"
              y="230"
              width="60"
              height="32"
              rx="3"
              fill="var(--coral-soft)"
              stroke="var(--coral)"
              strokeWidth="1"
            />
            <text
              x="460"
              y="251"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="14"
              fontWeight="600"
              fill="var(--coral)"
            >
              x = 0
            </text>
            <text
              x="460"
              y="278"
              textAnchor="middle"
              fontFamily="Spectral, serif"
              fontStyle="italic"
              fontSize="11"
              fill="var(--coral)"
            >
              (stale)
            </text>
          </g>
        )}
        {step === 6 && (
          <g>
            <rect
              x="425"
              y="230"
              width="70"
              height="32"
              rx="3"
              fill="var(--surface)"
              stroke="var(--ink-faint)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <text
              x="460"
              y="251"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="14"
              fill="var(--ink-faint)"
            >
              x = ?
            </text>
            <text
              x="460"
              y="280"
              textAnchor="middle"
              fontFamily="Spectral, serif"
              fontStyle="italic"
              fontSize="11"
              fill="var(--ink-faint)"
            >
              (unknowable)
            </text>
          </g>
        )}
        {step === 7 && (
          <g>
            <rect
              x="425"
              y="230"
              width="70"
              height="32"
              rx="3"
              fill="var(--coral-soft)"
              stroke="var(--coral)"
              strokeWidth="1"
            />
            <text
              x="460"
              y="251"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="13"
              fill="var(--coral)"
            >
              — silence —
            </text>
            <text
              x="460"
              y="280"
              textAnchor="middle"
              fontFamily="Spectral, serif"
              fontStyle="italic"
              fontSize="11"
              fill="var(--coral)"
            >
              (refused)
            </text>
          </g>
        )}

        <defs>
          <marker
            id="arrow-cyan-2"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L5,3 L0,6" fill="none" stroke="var(--cyan)" strokeWidth="1.2" />
          </marker>
          <marker id="arrow-coral" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L5,3 L0,6" fill="none" stroke="var(--coral)" strokeWidth="1.2" />
          </marker>
        </defs>
      </svg>

      <div
        style={{
          padding: '24px 28px 28px',
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
        }}
      >
        {step <= 4 ? (
          <>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.2em',
                color: 'var(--coral)',
                marginBottom: 10,
              }}
            >
              STEP {step + 1} OF 5
            </div>
            <p
              style={{
                fontFamily: 'Spectral, serif',
                fontSize: 17,
                lineHeight: 1.55,
                color: 'var(--ink)',
                fontStyle: 'italic',
                fontWeight: 300,
                margin: '0 0 22px',
              }}
            >
              {stepText[step]}
            </p>

            {step < 4 ? (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn primary" onClick={next}>
                  Continue →
                </button>
                {step > 0 && (
                  <button className="btn" onClick={reset}>
                    Reset
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    color: 'var(--ink-faint)',
                    marginBottom: 12,
                    textTransform: 'uppercase',
                  }}
                >
                  G2's possible responses
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <button
                    className="btn"
                    style={{ textAlign: 'left', padding: '14px 18px' }}
                    onClick={() => choose('a')}
                  >
                    <strong style={{ color: 'var(--coral)' }}>a.</strong>
                    &nbsp; Return what G2 has: x = 0
                  </button>
                  <button
                    className="btn"
                    style={{ textAlign: 'left', padding: '14px 18px' }}
                    onClick={() => choose('b')}
                  >
                    <strong style={{ color: 'var(--ink-faint)' }}>b.</strong>
                    &nbsp; Return x = 1 (the value G2 doesn&rsquo;t know)
                  </button>
                  <button
                    className="btn"
                    style={{ textAlign: 'left', padding: '14px 18px' }}
                    onClick={() => choose('c')}
                  >
                    <strong style={{ color: 'var(--coral)' }}>c.</strong>
                    &nbsp; Refuse to answer, or hang waiting
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 16,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  color: branchText.color,
                }}
              >
                OUTCOME
              </div>
              {branchText.lost !== '—' && (
                <div
                  style={{
                    fontFamily: 'Spectral, serif',
                    fontSize: 12,
                    fontStyle: 'italic',
                    color: 'var(--ink-faint)',
                  }}
                >
                  {branchText.lost} is sacrificed
                </div>
              )}
            </div>
            <p
              style={{
                fontFamily: 'Spectral, serif',
                fontSize: 19,
                fontWeight: 400,
                lineHeight: 1.4,
                color: branchText.color,
                margin: '0 0 14px',
                fontStyle: 'italic',
              }}
            >
              {branchText.title}
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              {branchText.body}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
              <button className="btn primary" onClick={() => setStep(4)}>
                ← Try another branch
              </button>
              <button className="btn" onClick={reset}>
                Reset proof
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
