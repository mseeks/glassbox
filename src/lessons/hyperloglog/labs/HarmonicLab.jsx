import { useMemo, useState } from 'react';
import Panel from '../components/Panel.jsx';
import Readout from '../components/Readout.jsx';
import Slider from '../components/Slider.jsx';
import RegisterGrid from '../components/RegisterGrid.jsx';
import { fmt } from '../components/format.js';
import { alphaM, buildReg } from '../engine/index.js';

/* LAB 5 · THE HARMONIC MEAN
   Same registers, two means. One freak run wrecks arithmetic; harmonic shrugs. */

export default function HarmonicLab() {
  const P = 8,
    M = 1 << P,
    TRUE_N = 9000;
  const base = useMemo(() => buildReg(P, TRUE_N), []);
  const [outlier, setOutlier] = useState(0); // inject a freak run into register 0
  const reg = useMemo(() => {
    const r = base.slice();
    if (outlier > 0) r[0] = Math.max(r[0], outlier);
    return r;
  }, [base, outlier]);

  const { sumInv, sumPow } = useMemo(() => {
    let si = 0,
      sp = 0;
    for (let j = 0; j < M; j++) {
      si += 2 ** -reg[j];
      sp += 2 ** reg[j];
    }
    return { sumInv: si, sumPow: sp };
  }, [reg, M]);
  const a = alphaM(M);
  const harm = (a * M * M) / sumInv; // HyperLogLog (harmonic mean of 2^R)
  const arith = a * sumPow; // same form, arithmetic mean of 2^R

  return (
    <Panel label="MEAN COMPARATOR" sub={`m = ${M} · true distinct ≈ ${fmt(TRUE_N)}`}>
      <div className="grid2" style={{ alignItems: 'start' }}>
        <div>
          <RegisterGrid reg={reg} p={P} highlight={outlier > 0 ? 0 : -1} aspect={0.62} />
          <div className="cap" style={{ textAlign: 'left' }}>
            Register <b style={{ color: 'var(--cyan)' }}>#0</b> highlighted. Inject a freakishly
            long run into it and watch each estimator react.
          </div>
        </div>
        <div>
          <Slider
            label="Freak run forced into register #0"
            display={outlier === 0 ? 'none' : 'rank ' + outlier}
            min={0}
            max={28}
            value={outlier}
            onChange={setOutlier}
          />
          <div className="readgrid" style={{ marginTop: 14 }}>
            <Readout
              label="Arithmetic mean of 2ᴿ"
              value={fmt(arith)}
              tone="mg"
              unit="explodes on one outlier"
            />
            <Readout
              label="Harmonic mean of 2ᴿ  (HyperLogLog)"
              value={fmt(harm)}
              tone="cy"
              unit="barely flinches"
            />
            <Readout label="True distinct" value={fmt(TRUE_N)} tone="iv" />
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 14,
          background: 'var(--panel2)',
          border: '1px solid var(--line)',
          borderRadius: 10,
          padding: '12px 14px',
        }}
      >
        <div className="cap" style={{ textAlign: 'left', margin: 0 }}>
          Both estimators are{' '}
          <span className="mono" style={{ fontSize: 12 }}>
            α·m·mean(2ᴿ)
          </span>{' '}
          — identical but for the mean. Arithmetic is dragged toward its largest term{' '}
          <span className="mono" style={{ fontSize: 12 }}>
            (Σ2ᴿ = {arith ? fmt(sumPow) : 0})
          </span>
          ; the harmonic mean is governed by the{' '}
          <em style={{ color: 'var(--cyan)', fontStyle: 'normal' }}>smallest</em> terms, so a lone
          monster run can’t move it. That swap is the entire “Hyper.”
        </div>
      </div>
    </Panel>
  );
}
