import { useEffect, useRef, useState } from 'react';
import { ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { bloomPositions, falsePositiveRate, optimalK } from '../engine/index.js';

const SAT_WORDS = [
  'alpha',
  'bravo',
  'charlie',
  'delta',
  'echo',
  'foxtrot',
  'golf',
  'hotel',
  'india',
  'juliet',
  'kilo',
  'lima',
  'mike',
  'november',
  'oscar',
  'papa',
  'quebec',
  'romeo',
  'sierra',
  'tango',
  'uniform',
  'victor',
  'whiskey',
  'xray',
  'yankee',
  'zulu',
  'apple',
  'banana',
  'cherry',
  'date',
  'elder',
  'fig',
  'grape',
  'honey',
  'ivory',
  'jade',
  'kiwi',
  'lemon',
  'mango',
  'nectar',
  'orange',
  'peach',
  'quince',
  'raisin',
  'sage',
  'thyme',
  'umber',
  'vanilla',
  'walnut',
  'yarrow',
  'amber',
  'blue',
  'copper',
  'denim',
  'ebony',
  'fuchsia',
  'gold',
  'hazel',
  'indigo',
  'jet',
  'khaki',
  'lilac',
  'mauve',
  'navy',
  'olive',
  'pearl',
  'quartz',
  'rose',
  'silver',
  'teal',
  'umber',
  'violet',
  'wheat',
  'xanthic',
  'yellow',
  'zinc',
  'arc',
  'bend',
  'curve',
  'dot',
  'edge',
  'face',
  'grid',
  'hex',
  'iris',
  'joint',
  'knot',
  'line',
  'mesh',
  'node',
  'oval',
  'peak',
  'quirk',
  'ray',
  'shape',
  'tip',
  'union',
  'vein',
  'wave',
  'xenon',
];

export function SaturationDemo() {
  const M = 64;
  const K = 3;
  const COLS = 16;
  const [bits, setBits] = useState(() => new Array(M).fill(false));
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState([{ n: 0, setRatio: 0, fpr: 0 }]);
  const runRef = useRef(false);

  useEffect(() => {
    runRef.current = running;
  }, [running]);

  function tickOnce(curBits, curStep, curHistory) {
    if (curStep >= SAT_WORDS.length)
      return { bits: curBits, step: curStep, history: curHistory, done: true };
    const word = SAT_WORDS[curStep];
    const positions = bloomPositions(word, K, M);
    const newBits = [...curBits];
    for (const p of positions) newBits[p] = true;
    const setCount = newBits.filter((b) => b).length;
    const setRatio = setCount / M;
    const newN = curStep + 1;
    const fpr = Math.pow(setRatio, K);
    return {
      bits: newBits,
      step: newN,
      history: [...curHistory, { n: newN, setRatio, fpr }],
      done: false,
    };
  }

  async function run() {
    if (running) {
      setRunning(false);
      return;
    }
    setRunning(true);
    runRef.current = true;
    let curBits = bits,
      curStep = step,
      curHistory = history;
    while (runRef.current && curStep < SAT_WORDS.length) {
      const result = tickOnce(curBits, curStep, curHistory);
      curBits = result.bits;
      curStep = result.step;
      curHistory = result.history;
      setBits(curBits);
      setStep(curStep);
      setHistory(curHistory);
      if (result.done) break;
      await new Promise((r) => setTimeout(r, 180));
    }
    setRunning(false);
    runRef.current = false;
  }

  function stepOnce() {
    if (running || step >= SAT_WORDS.length) return;
    const result = tickOnce(bits, step, history);
    setBits(result.bits);
    setStep(result.step);
    setHistory(result.history);
  }

  function reset() {
    setRunning(false);
    runRef.current = false;
    setBits(new Array(M).fill(false));
    setStep(0);
    setHistory([{ n: 0, setRatio: 0, fpr: 0 }]);
  }

  const setCount = bits.filter((b) => b).length;
  const setRatio = setCount / M;
  const fpr = step === 0 ? 0 : Math.pow(setRatio, K);
  const theoreticalFPR = falsePositiveRate(M, step, K);

  // FPR curve SVG
  const W = 460,
    H = 140,
    PAD_L = 38,
    PAD_R = 12,
    PAD_T = 10,
    PAD_B = 22;
  const PW = W - PAD_L - PAD_R,
    PH = H - PAD_T - PAD_B;
  const maxN = SAT_WORDS.length;
  const xS = (n) => PAD_L + (n / maxN) * PW;
  const yS = (f) => PAD_T + (1 - f) * PH;
  const histPath = history
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xS(p.n).toFixed(2)} ${yS(p.fpr).toFixed(2)}`)
    .join(' ');

  return (
    <div className="bf-panel" style={{ padding: '2rem 1.75rem' }}>
      <div className="flex items-baseline justify-between mb-1 flex-wrap gap-2">
        <div>
          <div
            className="bf-ui"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.25em',
              color: 'rgba(196, 181, 253, 0.7)',
              textTransform: 'uppercase',
            }}
          >
            Lab 03
          </div>
          <div
            className="bf-display"
            style={{ fontSize: '1.85rem', color: '#f5e9d3', marginTop: '0.3rem' }}
          >
            Saturation
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="bf-spec-pill">m = {M}</span>
          <span className="bf-spec-pill">k = {K}</span>
          <span className="bf-spec-pill">n = {step}</span>
          <span
            className="bf-spec-pill"
            style={{ color: '#ddd6fe', borderColor: 'rgba(196, 181, 253, 0.3)' }}
          >
            FPR ≈ {step === 0 ? '0' : (theoreticalFPR * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="bf-body-italic bf-mark-muted mt-2 mb-5" style={{ fontSize: '0.92rem' }}>
        A tiny filter sized for about a dozen elements. Press play and watch what happens when you
        keep inserting past its capacity.
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: '4px',
          padding: '0.9rem 0.85rem',
          background: 'rgba(10, 10, 15, 0.45)',
          borderRadius: '3px',
          marginBottom: '1rem',
        }}
      >
        {bits.map((b, i) => (
          <div key={i} className={`bf-bit${b ? ' set' : ''}`} />
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div
          className="bf-panel"
          style={{ padding: '0.85rem 1rem', background: 'rgba(10, 10, 15, 0.4)' }}
        >
          <div
            className="bf-ui bf-mark-muted"
            style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            bits set
          </div>
          <div className="bf-display mt-1" style={{ fontSize: '1.4rem', color: '#ddd6fe' }}>
            {setCount} / {M}
          </div>
          <div className="bf-mono bf-mark-muted mt-1" style={{ fontSize: '0.7rem' }}>
            {(setRatio * 100).toFixed(1)}% load
          </div>
        </div>
        <div
          className="bf-panel"
          style={{ padding: '0.85rem 1rem', background: 'rgba(10, 10, 15, 0.4)' }}
        >
          <div
            className="bf-ui bf-mark-muted"
            style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            theoretical FPR
          </div>
          <div
            className="bf-display mt-1"
            style={{
              fontSize: '1.4rem',
              color:
                theoreticalFPR > 0.5 ? '#fda4af' : theoreticalFPR > 0.1 ? '#c4b5fd' : '#5eead4',
            }}
          >
            {(theoreticalFPR * 100).toFixed(theoreticalFPR < 0.001 ? 4 : 1)}%
          </div>
          <div className="bf-mono bf-mark-muted mt-1" style={{ fontSize: '0.7rem' }}>
            (1−e<sup>−kn/m</sup>)<sup>k</sup>
          </div>
        </div>
        <div
          className="bf-panel"
          style={{ padding: '0.85rem 1rem', background: 'rgba(10, 10, 15, 0.4)' }}
        >
          <div
            className="bf-ui bf-mark-muted"
            style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            empirical FPR
          </div>
          <div
            className="bf-display mt-1"
            style={{
              fontSize: '1.4rem',
              color: fpr > 0.5 ? '#fda4af' : fpr > 0.1 ? '#c4b5fd' : '#5eead4',
            }}
          >
            {(fpr * 100).toFixed(fpr < 0.001 ? 4 : 1)}%
          </div>
          <div className="bf-mono bf-mark-muted mt-1" style={{ fontSize: '0.7rem' }}>
            (set/m)<sup>k</sup>
          </div>
        </div>
      </div>

      {/* History curve */}
      <div className="mb-4">
        <div
          className="bf-ui bf-mark-muted mb-1"
          style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          fpr over insertions
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{
            width: '100%',
            height: 'auto',
            background: 'rgba(10, 10, 15, 0.5)',
            borderRadius: '3px',
            border: '1px solid rgba(232, 222, 200, 0.06)',
          }}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <g key={p}>
              <line
                x1={PAD_L}
                y1={yS(p)}
                x2={W - PAD_R}
                y2={yS(p)}
                stroke="rgba(232, 222, 200, 0.06)"
                strokeWidth="0.5"
              />
              <text
                x={PAD_L - 4}
                y={yS(p) + 3}
                fontSize="9"
                fill="#a89e8a"
                textAnchor="end"
                fontFamily="JetBrains Mono"
              >
                {(p * 100).toFixed(0)}%
              </text>
            </g>
          ))}
          {[0, 20, 40, 60, 80, 100].map((nn) => (
            <g key={nn}>
              <line
                x1={xS(nn)}
                y1={PAD_T}
                x2={xS(nn)}
                y2={H - PAD_B}
                stroke="rgba(232, 222, 200, 0.06)"
                strokeWidth="0.5"
              />
              <text
                x={xS(nn)}
                y={H - PAD_B + 12}
                fontSize="9"
                fill="#a89e8a"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
              >
                {nn}
              </text>
            </g>
          ))}
          {/* Optimal capacity marker */}
          <line
            x1={xS(optimalK(M, (M / Math.LN2) * 0.693) === K ? Math.round((M * Math.LN2) / K) : 15)}
            y1={PAD_T}
            x2={xS(15)}
            y2={H - PAD_B}
            stroke="#5eead4"
            strokeWidth="1"
            strokeDasharray="2 4"
            opacity="0.5"
          />
          <text
            x={xS(15) + 4}
            y={PAD_T + 10}
            fontSize="8"
            fill="#5eead4"
            fontFamily="Inter Tight"
            fontWeight="600"
          >
            designed n ≈ 15
          </text>
          {/* Curve */}
          <path
            d={histPath}
            stroke="#c4b5fd"
            strokeWidth="1.75"
            fill="none"
            strokeLinejoin="round"
          />
          {history.length > 0 && (
            <circle
              cx={xS(history[history.length - 1].n)}
              cy={yS(history[history.length - 1].fpr)}
              r="3.5"
              fill="#c4b5fd"
              stroke="#0a0a0f"
              strokeWidth="1.5"
            />
          )}
        </svg>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <button className="bf-btn primary" onClick={run}>
          {running ? (
            <>
              <Pause style={{ width: 13, height: 13 }} /> Pause
            </>
          ) : (
            <>
              <Play style={{ width: 13, height: 13 }} /> {step === 0 ? 'Play' : 'Resume'}
            </>
          )}
        </button>
        <button
          className="bf-btn"
          onClick={stepOnce}
          disabled={running || step >= SAT_WORDS.length}
        >
          <ChevronRight style={{ width: 13, height: 13 }} /> Step
        </button>
        <button className="bf-btn ghost" onClick={reset}>
          <RotateCcw style={{ width: 13, height: 13 }} /> Reset
        </button>
        <div className="ml-auto bf-mono bf-mark-muted" style={{ fontSize: '0.74rem' }}>
          {step < SAT_WORDS.length ? (
            <>
              next: <span className="bf-mark-amber">"{SAT_WORDS[step]}"</span>
            </>
          ) : (
            <span style={{ color: '#fda4af' }}>list exhausted</span>
          )}
        </div>
      </div>
    </div>
  );
}
