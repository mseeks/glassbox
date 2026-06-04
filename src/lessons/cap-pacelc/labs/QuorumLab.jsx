import { useState } from 'react';
import { analyzeQuorum } from '../engine/index.js';

export function QuorumLab() {
  const [N, setN] = useState(5);
  const [W, setW] = useState(3);
  const [R, setR] = useState(3);

  const { safeW, safeR, strong, profile, profileDesc, writeFailTol, readFailTol } = analyzeQuorum({
    n: N,
    w: W,
    r: R,
  });

  // Render N replicas in a ring
  const radius = 90;
  const cx = 175,
    cy = 135;

  return (
    <div className="panel" style={{ padding: 0, background: 'var(--bg-deep)' }}>
      <div
        className="stack-on-mobile"
        style={{
          gridTemplateColumns: 'minmax(280px, 1fr) minmax(260px, 320px)',
        }}
      >
        {/* Ring visualization */}
        <div style={{ background: 'var(--surface)', padding: '24px 18px', minWidth: 0 }}>
          <svg viewBox="0 0 350 270" style={{ width: '100%', height: 'auto', display: 'block' }}>
            {/* Reference circle */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="var(--border)"
              strokeOpacity="0.4"
              strokeWidth="0.5"
              strokeDasharray="2,4"
            />

            {/* Title */}
            <text
              x={cx}
              y={20}
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="10"
              fill="var(--ink-faint)"
              letterSpacing="0.2em"
            >
              N = {N} REPLICAS
            </text>

            {/* Replicas */}
            {Array.from({ length: N }, (_, i) => {
              const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
              const x = cx + Math.cos(angle) * radius;
              const y = cy + Math.sin(angle) * radius;
              const inWrite = i < safeW;
              const inRead = i < safeR;
              const inBoth = inWrite && inRead;
              return (
                <g key={i}>
                  {/* Read ring */}
                  {inRead && (
                    <circle
                      cx={x}
                      cy={y}
                      r="22"
                      fill="none"
                      stroke="var(--cyan)"
                      strokeWidth="1.5"
                      strokeOpacity="0.7"
                    />
                  )}
                  {/* Write ring */}
                  {inWrite && (
                    <circle
                      cx={x}
                      cy={y}
                      r="17"
                      fill="none"
                      stroke="var(--emerald)"
                      strokeWidth="1.5"
                      strokeOpacity="0.7"
                    />
                  )}
                  {/* Node */}
                  <circle
                    cx={x}
                    cy={y}
                    r="11"
                    fill={
                      inBoth
                        ? 'var(--cap-node-quorum)'
                        : inWrite || inRead
                          ? 'var(--cap-node-sheen)'
                          : 'var(--surface)'
                    }
                    stroke={inBoth ? 'var(--violet)' : 'var(--border-bright)'}
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    fontFamily="JetBrains Mono, monospace"
                    fontSize="9"
                    fill={inBoth ? 'var(--violet)' : 'var(--ink-dim)'}
                    fontWeight={inBoth ? 600 : 400}
                  >
                    n{i + 1}
                  </text>
                </g>
              );
            })}

            {/* Legend */}
            <g transform="translate(20, 245)">
              <circle cx={6} cy={0} r="6" fill="none" stroke="var(--emerald)" strokeWidth="1.5" />
              <text
                x={18}
                y={4}
                fontFamily="JetBrains Mono, monospace"
                fontSize="10"
                fill="var(--ink-dim)"
              >
                W = {safeW} write quorum
              </text>
            </g>
            <g transform="translate(180, 245)">
              <circle cx={6} cy={0} r="6" fill="none" stroke="var(--cyan)" strokeWidth="1.5" />
              <text
                x={18}
                y={4}
                fontFamily="JetBrains Mono, monospace"
                fontSize="10"
                fill="var(--ink-dim)"
              >
                R = {safeR} read quorum
              </text>
            </g>
          </svg>
        </div>

        {/* Controls + verdict */}
        <div style={{ background: 'var(--surface)', padding: '22px' }}>
          <div style={{ marginBottom: 18 }}>
            <SliderRow
              label="Replicas (N)"
              min={3}
              max={9}
              value={N}
              onChange={(v) => {
                setN(v);
                if (W > v) setW(v);
                if (R > v) setR(v);
              }}
              color="var(--ink-2)"
            />
            <SliderRow
              label="Write quorum (W)"
              min={1}
              max={N}
              value={safeW}
              onChange={(v) => setW(v)}
              color="var(--emerald)"
            />
            <SliderRow
              label="Read quorum (R)"
              min={1}
              max={N}
              value={safeR}
              onChange={(v) => setR(v)}
              color="var(--cyan)"
            />
          </div>

          {/* Verdict */}
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--bg-deep)',
              border: `1px solid ${strong ? 'var(--emerald)' : 'var(--amber)'}`,
              borderLeftWidth: 2,
            }}
          >
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 16,
                color: strong ? 'var(--emerald)' : 'var(--amber)',
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              R + W = {safeR + safeW} {strong ? '>' : '≤'} N = {N}
            </div>
            <div
              style={{
                fontFamily: 'Spectral, serif',
                fontStyle: 'italic',
                fontSize: 14,
                color: strong ? 'var(--emerald)' : 'var(--amber)',
                marginBottom: 10,
              }}
            >
              {profile}
            </div>
            <div
              style={{
                fontSize: 12.5,
                lineHeight: 1.55,
                color: 'var(--ink-2)',
              }}
            >
              {profileDesc}
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              fontSize: 10.5,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            <div style={{ color: 'var(--ink-faint)' }}>
              writes survive:{' '}
              <span style={{ color: 'var(--ink)' }}>
                {writeFailTol} node failure{writeFailTol === 1 ? '' : 's'}
              </span>
            </div>
            <div style={{ color: 'var(--ink-faint)' }}>
              reads survive:{' '}
              <span style={{ color: 'var(--ink)' }}>
                {readFailTol} node failure{readFailTol === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* Presets */}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9,
                letterSpacing: '0.18em',
                color: 'var(--ink-faint)',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              presets
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <button
                className="btn"
                style={{ fontSize: 9, padding: '5px 8px' }}
                onClick={() => {
                  setN(5);
                  setW(1);
                  setR(1);
                }}
              >
                R=1, W=1
              </button>
              <button
                className="btn"
                style={{ fontSize: 9, padding: '5px 8px' }}
                onClick={() => {
                  setN(5);
                  setW(3);
                  setR(3);
                }}
              >
                quorum
              </button>
              <button
                className="btn"
                style={{ fontSize: 9, padding: '5px 8px' }}
                onClick={() => {
                  setN(5);
                  setW(5);
                  setR(1);
                }}
              >
                W=N, R=1
              </button>
              <button
                className="btn"
                style={{ fontSize: 9, padding: '5px 8px' }}
                onClick={() => {
                  setN(5);
                  setW(1);
                  setR(5);
                }}
              >
                R=N, W=1
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderRow({ label, min, max, value, onChange, color }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: 'var(--ink-dim)',
          marginBottom: 5,
        }}
      >
        <span>{label}</span>
        <span style={{ color, fontWeight: 600 }}>{value}</span>
      </div>
      <input
        type="range"
        aria-label={label}
        aria-valuetext={`${value} (${label})`}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          width: '100%',
          height: 4,
          accentColor: color,
          background: 'var(--bg-deep)',
        }}
      />
    </div>
  );
}
