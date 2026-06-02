import { useMemo, useRef, useState } from 'react';
import Panel from '../components/Panel.jsx';
import Readout from '../components/Readout.jsx';
import Slider from '../components/Slider.jsx';
import RegisterGrid from '../components/RegisterGrid.jsx';
import SplitBits from '../components/SplitBits.jsx';
import { fmt } from '../components/format.js';
import { bucketAndRank, hllEstimate, murmur3_32 } from '../engine/index.js';

/* LAB 4 · STOCHASTIC AVERAGING
   Split the hash: index bits pick a register; the rest gives the run. */

export default function StochasticLab() {
  const [p, setP] = useState(6);
  const [reg, setReg] = useState(() => new Uint8Array(1 << 6));
  const [count, setCount] = useState(0);
  const [last, setLast] = useState(null); // {h, idx, rank}
  const [hl, setHl] = useState(-1);
  const idRef = useRef(0);

  const resetTo = (np) => {
    setReg(new Uint8Array(1 << np));
    setCount(0);
    setLast(null);
    setHl(-1);
    idRef.current = 0;
  };
  const onP = (np) => {
    setP(np);
    resetTo(np);
  };

  const step1 = () => {
    const key = 's' + idRef.current;
    idRef.current++;
    const h = murmur3_32(key);
    const [idx, rank] = bucketAndRank(h, p);
    setReg((prev) => {
      const n = prev.slice();
      if (rank > n[idx]) n[idx] = rank;
      return n;
    });
    setLast({ h, idx, rank });
    setHl(idx);
    setCount((c) => c + 1);
  };
  const stream = (K) => {
    setReg((prev) => {
      const n = prev.slice();
      for (let i = 0; i < K; i++) {
        const h = murmur3_32('s' + idRef.current);
        idRef.current++;
        const idx = h >>> (32 - p);
        const w = (h << p) >>> 0;
        const rank = w === 0 ? 32 - p + 1 : Math.clz32(w) + 1;
        if (rank > n[idx]) n[idx] = rank;
      }
      return n;
    });
    setCount((c) => c + K);
    setHl(-1);
    setLast(null);
  };

  const { E } = useMemo(() => hllEstimate(reg, p), [reg, p]);
  const err = count > 0 ? ((E - count) / count) * 100 : 0;
  const m = 1 << p;

  return (
    <Panel label="REGISTER BANK" sub={`m = 2^${p} = ${m} registers`}>
      <div className="ctrls" style={{ marginBottom: 14 }}>
        <button className="btn cyan" onClick={step1}>
          + Step one item
        </button>
        <button className="btn" onClick={() => stream(2000)}>
          Stream +2,000
        </button>
        <button className="btn" onClick={() => stream(20000)}>
          Stream +20,000
        </button>
        <button
          className="btn"
          onClick={() => resetTo(p)}
          style={{ color: 'var(--magenta)', borderColor: 'var(--magenta-dim)' }}
        >
          Reset
        </button>
      </div>
      <Slider
        label="Precision  p  (registers = 2ᵖ)"
        display={`p=${p} · m=${m}`}
        min={4}
        max={10}
        value={p}
        onChange={onP}
      />

      <div style={{ marginTop: 16 }}>
        <RegisterGrid reg={reg} p={p} highlight={hl} />
      </div>

      {last && (
        <div
          style={{
            marginTop: 14,
            background: 'var(--panel2)',
            border: '1px solid var(--line)',
            borderRadius: 10,
            padding: '12px 14px',
          }}
        >
          <div className="cap" style={{ textAlign: 'left', margin: '0 0 8px' }}>
            <span className="idxb" style={{ padding: '1px 5px', borderRadius: 3 }}>
              first {p} bits
            </span>{' '}
            choose register <b style={{ color: 'var(--cyan)' }}>#{last.idx}</b> · the rest gives
            rank <b style={{ color: 'var(--brass-hi)' }}>{last.rank}</b>
          </div>
          <SplitBits h={last.h} p={p} />
        </div>
      )}

      <div className="readgrid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: 16 }}>
        <Readout label="Distinct added" value={fmt(count)} tone="iv" />
        <Readout label="HLL estimate" value={count ? fmt(E) : '–'} tone="cy" />
        <Readout
          label="Error"
          value={count ? (err >= 0 ? '+' : '') + err.toFixed(1) + '%' : '–'}
          tone={Math.abs(err) > 8 ? 'mg' : 'br'}
        />
      </div>
      <div className="cap">
        Each register runs its own coin-oracle on its own slice of the stream. Slide{' '}
        <b style={{ color: 'var(--cyan)' }}>p</b> up and you get more registers: more independent
        estimates averaged together, a tighter answer. The cost? Linear memory, nothing more.
      </div>
    </Panel>
  );
}
