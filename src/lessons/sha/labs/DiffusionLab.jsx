import { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { sha256RoundStates, strBytes, bitsToBoolArray } from '../engine/index.js';
import Figure from '../components/Figure.jsx';

export default function DiffusionLab() {
  const baseText = 'message';
  const a = useMemo(() => sha256RoundStates(strBytes(baseText)), []);
  const bBytes = useMemo(() => {
    const b = strBytes(baseText);
    b[0] ^= 0x01;
    return b;
  }, []); // flip 1 bit
  const b = useMemo(() => sha256RoundStates(bBytes), [bBytes]);
  const [round, setRound] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (round >= 64) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setRound((r) => Math.min(r + 1, 64)), 110);
    return () => clearTimeout(t);
  }, [playing, round]);

  const bitsA = bitsToBoolArray(a[round]);
  const bitsB = bitsToBoolArray(b[round]);
  let changed = 0;
  const cells = [];
  for (let i = 0; i < 256; i++) {
    const c = bitsA[i] !== bitsB[i];
    if (c) changed++;
    cells.push(c);
  }
  const pct = (changed / 256) * 100;

  return (
    <Figure
      label="Fig. 4 · Diffusion"
      title="One flipped input bit, spreading over 64 rounds"
      foot={
        <>
          Two inputs differing in a single bit, run through the real compression. Each square is one
          of the 256 working-state bits;{' '}
          <span style={{ color: 'var(--cerise-bright)' }}>cerise</span> marks a bit that now differs
          between the two runs. Watch a lone disturbance at round 0 saturate to ≈50% within a couple
          dozen rounds. That is rotate-and-mix doing its job; by round 64 the two states are
          uncorrelated.
        </>
      }
    >
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(16, 1fr)',
            gap: 2,
            flex: '1 1 240px',
            maxWidth: 320,
          }}
        >
          {cells.map((c, i) => (
            <div
              key={i}
              style={{
                aspectRatio: '1',
                borderRadius: 2,
                background: c ? 'var(--cerise)' : 'var(--ridge)',
                boxShadow: c ? '0 0 5px var(--cerise-glow)' : 'none',
                transition: 'background .25s, box-shadow .25s',
              }}
            />
          ))}
        </div>
        {/* readout */}
        <div style={{ flex: '1 1 160px', minWidth: 150 }}>
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 12,
              color: 'var(--bone-faint)',
              letterSpacing: '.12em',
              textTransform: 'uppercase',
            }}
          >
            round
          </div>
          <div
            style={{
              fontFamily: 'var(--slab)',
              fontSize: 40,
              fontWeight: 700,
              color: 'var(--copper)',
              lineHeight: 1,
            }}
          >
            {round}
            <span style={{ fontSize: 18, color: 'var(--bone-faint)' }}>/64</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <div className="meter">
              <span
                style={{
                  width: pct + '%',
                  background: 'linear-gradient(90deg,var(--cerise),var(--cerise-bright))',
                }}
              />
            </div>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 12.5,
                marginTop: 7,
                color: 'var(--bone-dim)',
              }}
            >
              <span style={{ color: 'var(--cerise-bright)', fontWeight: 700 }}>{changed}</span>/256
              bits differ · {pct.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
      <input
        className="rng"
        type="range"
        aria-label="Diffusion round"
        aria-valuetext={`Round ${round} of 64`}
        min={0}
        max={64}
        value={round}
        onChange={(e) => {
          setPlaying(false);
          setRound(+e.target.value);
        }}
        style={{ marginTop: 16 }}
      />
      <div className="btn-row" style={{ marginTop: 4 }}>
        <button
          className="btn primary"
          onClick={() => {
            if (round >= 64) setRound(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? <Pause size={13} /> : <Play size={13} />}
          {playing ? 'Pause' : round >= 64 ? 'Replay' : 'Run rounds'}
        </button>
        <button
          className="btn"
          onClick={() => {
            setPlaying(false);
            setRound(0);
          }}
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>
    </Figure>
  );
}
