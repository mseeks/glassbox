import { useMemo, useState } from 'react';
import Panel from '../components/Panel.jsx';
import Readout from '../components/Readout.jsx';
import Slider from '../components/Slider.jsx';
import RegisterGrid from '../components/RegisterGrid.jsx';
import { fmt } from '../components/format.js';
import { hllEstimate, murmur3_32 } from '../engine/index.js';

/* LAB 7 · MERGE (MAX) */

export default function MergeLab() {
  const P = 10,
    M = 1 << P,
    NA = 60000,
    NB = 60000;
  const regA = useMemo(() => {
    const r = new Uint8Array(M);
    for (let i = 0; i < NA; i++) {
      const h = murmur3_32('u' + i);
      const idx = h >>> (32 - P);
      const w = (h << P) >>> 0;
      const rank = w === 0 ? 32 - P + 1 : Math.clz32(w) + 1;
      if (rank > r[idx]) r[idx] = rank;
    }
    return r;
  }, [M]);
  const [overlap, setOverlap] = useState(0); // 0..60000
  const regB = useMemo(() => {
    const start = NA - overlap; // B = [start, start+NB)
    const r = new Uint8Array(M);
    for (let i = 0; i < NB; i++) {
      const id = start + i;
      const h = murmur3_32('u' + id);
      const idx = h >>> (32 - P);
      const w = (h << P) >>> 0;
      const rank = w === 0 ? 32 - P + 1 : Math.clz32(w) + 1;
      if (rank > r[idx]) r[idx] = rank;
    }
    return r;
  }, [M, overlap]);
  const merged = useMemo(() => {
    const r = new Uint8Array(M);
    for (let j = 0; j < M; j++) r[j] = Math.max(regA[j], regB[j]);
    return r;
  }, [M, regA, regB]);

  const eA = hllEstimate(regA, P).E,
    eB = hllEstimate(regB, P).E,
    eM = hllEstimate(merged, P).E;
  const trueUnion = NA + NB - overlap;

  return (
    <Panel label="SHARD MERGER" sub="two machines · element-wise max">
      <Slider
        label="Overlap between shard A and shard B"
        display={fmt(overlap) + ' shared'}
        min={0}
        max={60000}
        step={2000}
        value={overlap}
        onChange={setOverlap}
      />
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16 }}
        className="mergegrids"
      >
        <div>
          <div className="cap" style={{ margin: '0 0 6px', color: 'var(--brass)' }}>
            SHARD A · {fmt(NA)}
          </div>
          <RegisterGrid reg={regA} p={P} aspect={0.7} />
        </div>
        <div>
          <div className="cap" style={{ margin: '0 0 6px', color: 'var(--brass)' }}>
            SHARD B · {fmt(NB)}
          </div>
          <RegisterGrid reg={regB} p={P} aspect={0.7} />
        </div>
        <div>
          <div className="cap" style={{ margin: '0 0 6px', color: 'var(--cyan)' }}>
            MAX-MERGED
          </div>
          <RegisterGrid reg={merged} p={P} aspect={0.7} />
        </div>
      </div>
      <div className="readgrid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: 16 }}>
        <Readout
          label="Naive sum |A|+|B|"
          value={fmt(eA + eB)}
          tone="mg"
          unit="double-counts the overlap"
        />
        <Readout label="Max-merge estimate" value={fmt(eM)} tone="cy" unit="the actual union" />
        <Readout label="True union" value={fmt(trueUnion)} tone="iv" />
      </div>
      <div className="cap">
        Taking the larger value in each cell is all a merge requires — it is associative,
        commutative, and immune to double-counting. A visitor who hit both shards still raises the
        same registers, so they are counted{' '}
        <em style={{ color: 'var(--cyan)', fontStyle: 'normal' }}>once</em>. Count anywhere, merge
        everywhere.
      </div>
    </Panel>
  );
}
