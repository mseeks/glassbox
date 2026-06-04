import { useEffect, useMemo, useRef, useState } from 'react';
import { nnSearch, collectPoints, subtreeNodeIds } from '../engine/index.js';
import Scope from '../components/Scope.jsx';
import Crosshair from '../components/Crosshair.jsx';
import TreeDiagram from '../components/TreeDiagram.jsx';
import { C } from '../components/helpers.js';
import { FIELD, TREE } from './shared-field.js';

/* ── §V · the search — branch-and-bound with a guarantee (the payoff) ── */
export default function SearchLab() {
  const [q, setQ] = useState({ x: 58, y: 43 });
  const search = useMemo(() => nnSearch(TREE, q), [q]);
  const steps = search.steps;
  const [step, setStep] = useState(-1);
  const play = useRef(null);

  const stop = () => {
    clearInterval(play.current);
    play.current = null;
  };
  useEffect(() => () => stop(), []);
  const reset = (qq) => {
    stop();
    if (qq) setQ(qq);
    setStep(-1);
  };
  const onPick = (pt) => {
    reset(pt);
  };
  const startPlay = () => {
    stop();
    setStep((s) => (s >= steps.length - 1 ? -1 : s));
    play.current = setInterval(() => {
      setStep((s) => {
        if (s >= steps.length - 1) {
          stop();
          return s;
        }
        return s + 1;
      });
    }, 620);
  };

  const F = useMemo(() => {
    const measuredIds = new Set(),
      prunedPointIds = new Set(),
      prunedNodeIds = new Set(),
      pathIds = new Set();
    let tau = Infinity,
      best = null,
      comps = 0;
    for (let i = 0; i <= step && i < steps.length; i++) {
      const s = steps[i];
      if (s.kind === 'measure') {
        measuredIds.add(s.point.id);
        pathIds.add(s.node.id);
        tau = s.tau;
        best = s.best;
        comps = s.dcount;
      } else if (s.kind === 'prune') {
        const child = s.side === 'inside' ? s.node.inside : s.node.outside;
        if (child) {
          subtreeNodeIds(child, prunedNodeIds);
          collectPoints(child).forEach((p) => prunedPointIds.add(p.id));
        }
        tau = s.tau;
      } else if (s.kind === 'descend') {
        tau = s.tau;
      }
    }
    let currentNode = null,
      currentPoint = null,
      shell = null,
      pruneShell = null;
    let status = {
      text: 'Place a query, then walk the search. We always descend toward the side the query is on first, holding on to the closest contact found so far.',
      tone: '',
    };
    if (step >= 0 && step < steps.length) {
      const s = steps[step];
      if (s.kind === 'measure') {
        currentNode = s.node;
        currentPoint = s.point;
        if (!s.leaf && s.mu != null) shell = { x: s.node.vp.x, y: s.node.vp.y, r: s.mu };
        status = {
          text: s.improved
            ? `Measured a vantage at range ${s.d.toFixed(1)}: our new closest contact.`
            : `Measured a vantage at range ${s.d.toFixed(1)}, farther than our best (${tau.toFixed(
                1,
              )}), so we keep what we hold.`,
          tone: '',
        };
      } else if (s.kind === 'prune') {
        currentNode = s.node;
        pruneShell = { x: s.node.vp.x, y: s.node.vp.y, r: s.mu };
        status = {
          text: `Pruned the ${s.side} region: even its nearest possible contact is ${s.bound.toFixed(
            1,
          )} away, beyond our best (${s.tau.toFixed(1)}). ${s.skipped} contact${
            s.skipped === 1 ? '' : 's'
          } skipped, never measured.`,
          tone: 'prune',
        };
      } else if (s.kind === 'descend') {
        currentNode = s.node;
        status = {
          text: `The ${s.side} region might still hide something closer than ${s.tau.toFixed(
            1,
          )}, so we go in and look.`,
          tone: '',
        };
      }
    }
    const done = steps.length > 0 && step >= steps.length - 1;
    if (done) {
      tau = search.tau;
      best = search.best;
      comps = search.dcount;
      shell = null;
      pruneShell = null;
      status = {
        text: `Nearest contact found at range ${search.tau.toFixed(1)}, using ${
          search.dcount
        } distance measurements, not ${FIELD.length}.`,
        tone: 'found',
      };
    }
    return {
      measuredIds,
      prunedPointIds,
      prunedNodeIds,
      pathIds,
      tau,
      best,
      comps,
      currentNode,
      currentPoint,
      shell,
      pruneShell,
      status,
      done,
    };
  }, [search, step, steps]);

  const N = FIELD.length;
  const pct = Math.max(4, (F.comps / N) * 100);

  return (
    <div className="vp-plate">
      <div className="vp-plabel">
        <span className="dot" /> scope · guided hunt with pruning
      </div>
      <Scope pickable onPick={onPick}>
        {/* tau search disk */}
        {isFinite(F.tau) && F.tau > 0 && (
          <circle
            cx={q.x}
            cy={q.y}
            r={F.tau}
            fill="rgba(255,180,84,0.06)"
            stroke={C.amber}
            strokeWidth="0.35"
            strokeDasharray="1.5 1.5"
            opacity="0.8"
          />
        )}
        {/* current shell / pruned shell */}
        {F.shell && (
          <circle
            cx={F.shell.x}
            cy={F.shell.y}
            r={F.shell.r}
            fill="none"
            stroke={C.ping}
            strokeWidth="0.45"
          />
        )}
        {F.pruneShell && (
          <circle
            cx={F.pruneShell.x}
            cy={F.pruneShell.y}
            r={F.pruneShell.r}
            fill="none"
            stroke={C.coral}
            strokeWidth="0.45"
            strokeDasharray="1.5 1.5"
          />
        )}
        {/* connector when done */}
        {F.done && F.best && (
          <line x1={q.x} y1={q.y} x2={F.best.x} y2={F.best.y} stroke={C.amber} strokeWidth="0.5" />
        )}
        {/* contacts */}
        {FIELD.map((p, i) => {
          const pruned = F.prunedPointIds.has(p.id);
          const measured = F.measuredIds.has(p.id);
          const isBest = F.best && p.id === F.best.id;
          const isCurrent = F.currentPoint && p.id === F.currentPoint.id;
          let fill = C.contact,
            op = 0.5,
            r = 1.4;
          if (pruned) {
            fill = C.coral;
            op = 0.7;
          }
          if (measured) {
            fill = C.ping;
            op = 1;
          }
          if (isBest) {
            fill = C.amber;
            op = 1;
            r = 2.3;
          }
          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={fill}
                opacity={op}
                filter={isBest || isCurrent ? 'url(#vpGlow)' : undefined}
              />
              {isCurrent && (
                <circle cx={p.x} cy={p.y} r="3" fill="none" stroke={C.ping} strokeWidth="0.4" />
              )}
              {isBest && (
                <circle cx={p.x} cy={p.y} r="3.4" fill="none" stroke={C.amber} strokeWidth="0.4" />
              )}
            </g>
          );
        })}
        <Crosshair x={q.x} y={q.y} />
      </Scope>

      <div className="vp-stat">
        <div className="vp-statcell">
          <div className="k">Measurements used</div>
          <div className="v ping">
            {F.comps}
            <span className="u">/ {N}</span>
          </div>
        </div>
        <div className="vp-statcell">
          <div className="k">Closest range</div>
          <div className="v amber">{isFinite(F.tau) ? F.tau.toFixed(1) : '–'}</div>
        </div>
      </div>

      <div className="vp-cmp">
        <div className="vp-cmprow">
          <span className="lbl">VP tree</span>
          <div className="track">
            <div className="fill" style={{ width: pct + '%', background: 'var(--ping)' }} />
          </div>
          <span className="num">{F.comps}</span>
        </div>
        <div className="vp-cmprow">
          <span className="lbl">Brute force</span>
          <div className="track">
            <div className="fill" style={{ width: '100%', background: 'var(--coral-fill)' }} />
          </div>
          <span className="num">{N}</span>
        </div>
      </div>

      <div className="vp-ctrls">
        <button
          className="vp-btn solid"
          onClick={() => {
            stop();
            setStep((s) => Math.min(steps.length - 1, s + 1));
          }}
          disabled={F.done}
        >
          ▸ Step
        </button>
        <button className="vp-btn" onClick={startPlay} disabled={F.done}>
          ▸▸ Play
        </button>
        <button className="vp-btn" onClick={() => reset()}>
          Reset
        </button>
      </div>

      <div className={'vp-status ' + F.status.tone}>{F.status.text}</div>

      <div className="vp-treewrap">
        <div className="vp-plabel" style={{ marginBottom: 8 }}>
          <span className="dot" /> the descent ·{' '}
          <span style={{ color: 'var(--ping)' }}>visited</span> ·{' '}
          <span style={{ color: 'var(--coral)' }}>pruned</span>
        </div>
        <TreeDiagram
          root={TREE}
          pathSet={F.pathIds}
          prunedSet={F.prunedNodeIds}
          currentId={F.currentNode ? F.currentNode.id : null}
          height={172}
        />
      </div>

      <div className="vp-hint">
        <span className="pip" /> tap the scope to drop the query anywhere
      </div>
      <div className="vp-caption">
        The dashed <span style={{ color: 'var(--amber)' }}>amber circle</span> is our current best
        range. It shrinks as we find closer contacts. At each vantage point we descend toward the
        query first, then ask of the other side: could anything in there beat what we already hold?
        If the triangle inequality says no, the whole
        <span style={{ color: 'var(--coral)' }}> region is pruned</span>, skipped without a single
        measurement. The pruning is provably safe. It only ever discards contacts that cannot win.
      </div>
    </div>
  );
}
