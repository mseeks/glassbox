import React, { useEffect, useMemo, useState } from 'react';
import { Play, RotateCcw, ChevronRight, Layers } from 'lucide-react';
import { findFrames, insertPlan, SORTED12, UNSORTED12, FIND_T, INS_V } from '../engine/index.js';
import { useStepper } from '../components/useStepper.js';
import Legend from '../components/Legend.jsx';

// One row of cells; `list` interleaves arrows to draw a linked list.
function Cells({ cells, states, list }) {
  return (
    <div className="bst-cmp-cells">
      {cells.map((v, i) => (
        <React.Fragment key={i}>
          <div className={`bst-bcell ${states[i] || ''}`}>{v}</div>
          {list && i < cells.length - 1 && <span className="bst-sep">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

// §01 — the same twelve numbers stored three ways. Run find or insert and watch
// what each structure costs. All frames come from the engine's findFrames /
// insertPlan; the stepper only walks the recorded find animation.
export default function CompareLab() {
  const [op, setOp] = useState('find');
  const rows = useMemo(
    () => [
      {
        name: 'Unsorted array',
        find: findFrames('seq', UNSORTED12, FIND_T),
        ins: insertPlan('append', UNSORTED12, INS_V),
        base: UNSORTED12,
        list: false,
      },
      {
        name: 'Sorted array',
        find: findFrames('binary', SORTED12, FIND_T),
        ins: insertPlan('shiftSorted', SORTED12, INS_V),
        base: SORTED12,
        list: false,
      },
      {
        name: 'Sorted linked list',
        find: findFrames('seq', SORTED12, FIND_T),
        ins: insertPlan('spliceList', SORTED12, INS_V),
        base: SORTED12,
        list: true,
      },
    ],
    [],
  );
  const maxLen = Math.max(...rows.map((r) => r.find.frames.length));
  const { i, playing, play, step, reset, atEnd } = useStepper(maxLen, 520);
  useEffect(() => {
    reset();
  }, [op, reset]);
  return (
    <div className="bst-lab">
      <div className="bst-lab-head">
        <span className="bst-lab-tag">
          <Layers aria-hidden="true" />
          two operations · three structures
        </span>
      </div>
      <div className="bst-lab-body">
        <p className="bst-note">
          The same twelve numbers, stored three ways. Run each operation and watch what it costs.
        </p>
        <div className="bst-controls" style={{ marginBottom: 12 }}>
          <div className="bst-seg">
            <button className={op === 'find' ? 'on' : ''} onClick={() => setOp('find')}>
              Find {FIND_T}
            </button>
            <button className={op === 'insert' ? 'on' : ''} onClick={() => setOp('insert')}>
              Insert {INS_V}
            </button>
          </div>
          {op === 'find' && (
            <>
              <button className="bst-btn red" onClick={play} disabled={playing}>
                <Play aria-hidden="true" />
                {atEnd ? 'replay' : 'run'}
              </button>
              <button className="bst-btn ghost" onClick={step} disabled={atEnd}>
                <ChevronRight aria-hidden="true" />
                step
              </button>
              <button className="bst-btn ghost" onClick={reset}>
                <RotateCcw aria-hidden="true" />
                reset
              </button>
            </>
          )}
        </div>
        <div className="bst-cmp">
          {rows.map((r, ri) => {
            const isFind = op === 'find';
            const frame = isFind ? r.find.frames[Math.min(i, r.find.frames.length - 1)] : null;
            const cells = isFind ? r.base : r.ins.cells;
            const states = isFind ? frame : r.ins.states;
            const cost = isFind
              ? `${r.find.comparisons} compare${r.find.comparisons > 1 ? 's' : ''}`
              : r.ins.cost;
            return (
              <div className="bst-cmp-row" key={ri}>
                <div className="bst-cmp-name">
                  <span>{r.name}</span>
                  <span className="bst-cmp-cost">{cost}</span>
                </div>
                <Cells cells={cells} states={states} list={r.list} />
              </div>
            );
          })}
        </div>
        <Legend
          items={[
            { c: 'var(--red)', t: 'examining' },
            { c: 'var(--dim)', t: 'discarded / skipped' },
            { c: 'var(--blue)', t: 'match' },
            { c: 'var(--gold)', t: 'written / shifted' },
          ]}
        />
        <div className="bst-cap">
          {op === 'find' ? (
            <>
              Only the sorted <b>array</b> can leap to the middle and halve what&apos;s left, so it
              finds {FIND_T} in a couple of steps. The sorted <em>list</em> holds the same order but
              can&apos;t jump — it must walk node by node.{' '}
              <span className="hot">Order needs random access to pay off.</span>
            </>
          ) : (
            <>
              Appending to the unsorted array or splicing the list is nearly free. But keeping the{' '}
              <b>array</b> sorted means shoving every later element over to open a gap —{' '}
              <span className="hot">expensive, and it gets worse the bigger the array.</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
