import { useEffect, useRef, useState } from 'react';
import { dist } from '../engine/index.js';
import { C, clientToScope } from '../components/helpers.js';

/* ── §IV · the triangle inequality — the one rule that lets us prune ── */
export default function TriangleLab() {
  const [pts, setPts] = useState({
    q: { x: 30, y: 66 },
    v: { x: 52, y: 28 },
    p: { x: 76, y: 64 },
  });
  const svgRef = useRef(null);
  const dragRef = useRef(null);

  const a = dist(pts.v, pts.p); // landmark → contact (known: stored at build)
  const b = dist(pts.q, pts.v); // query → landmark (known: measured once)
  const c = dist(pts.q, pts.p); // query → contact (UNKNOWN until measured)
  const lower = Math.abs(a - b);
  const upper = a + b;
  const scale = Math.max(upper * 1.08, 40);

  useEffect(() => {
    const move = (e) => {
      if (!dragRef.current || !svgRef.current) return;
      const c2 = clientToScope(e, svgRef.current);
      setPts((s) => ({ ...s, [dragRef.current]: c2 }));
    };
    const up = () => {
      dragRef.current = null;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  const down = (e) => {
    e.preventDefault();
    const co = clientToScope(e, svgRef.current);
    let best = 'q',
      bd = Infinity;
    for (const k of ['q', 'v', 'p']) {
      const d = Math.hypot(pts[k].x - co.x, pts[k].y - co.y);
      if (d < bd) {
        bd = d;
        best = k;
      }
    }
    dragRef.current = best;
    setPts((s) => ({ ...s, [best]: co }));
  };

  const Handle = ({ k, color, label }) => (
    <g style={{ cursor: 'grab' }}>
      <circle cx={pts[k].x} cy={pts[k].y} r="5.5" fill="transparent" />
      <circle cx={pts[k].x} cy={pts[k].y} r="2.4" fill={color} filter="url(#vpGlow)" />
      <text
        x={pts[k].x}
        y={pts[k].y - 4.2}
        fill={color}
        fontSize="4.4"
        fontFamily="var(--font-mono)"
        textAnchor="middle"
        style={{ letterSpacing: '0.04em' }}
      >
        {label}
      </text>
    </g>
  );

  return (
    <div className="vp-plate">
      <div className="vp-plabel">
        <span className="dot" /> bounding an unmeasured distance
      </div>
      <svg
        ref={svgRef}
        className="vp-scope"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={down}
        role="application"
        aria-label="Triangle of query, landmark, and contact. Drag any of the three points."
        style={{ cursor: 'grab' }}
      >
        <defs>
          <radialGradient id="triAmber" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={C.amber} stopOpacity="0.45" />
            <stop offset="100%" stopColor={C.amber} stopOpacity="0" />
          </radialGradient>
          <filter id="vpGlow2" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="0.7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* the two KNOWN sides, solid; the UNKNOWN side, dashed */}
        <line
          x1={pts.v.x}
          y1={pts.v.y}
          x2={pts.p.x}
          y2={pts.p.y}
          stroke={C.ping}
          strokeWidth="0.5"
        />
        <line
          x1={pts.q.x}
          y1={pts.q.y}
          x2={pts.v.x}
          y2={pts.v.y}
          stroke={C.amber}
          strokeWidth="0.5"
        />
        <line
          x1={pts.q.x}
          y1={pts.q.y}
          x2={pts.p.x}
          y2={pts.p.y}
          stroke={C.bone3}
          strokeWidth="0.5"
          strokeDasharray="1.5 1.5"
        />
        {/* midpoint labels for the two known sides */}
        <text
          x={(pts.v.x + pts.p.x) / 2 + 1}
          y={(pts.v.y + pts.p.y) / 2}
          fill={C.ping}
          fontSize="3.6"
          fontFamily="var(--font-mono)"
        >
          a = {a.toFixed(1)}
        </text>
        <text
          x={(pts.q.x + pts.v.x) / 2 - 13}
          y={(pts.q.y + pts.v.y) / 2}
          fill={C.amber}
          fontSize="3.6"
          fontFamily="var(--font-mono)"
        >
          b = {b.toFixed(1)}
        </text>
        <Handle k="v" color={C.ping} label="LANDMARK" />
        <Handle k="p" color={C.contact} label="CONTACT" />
        <Handle k="q" color={C.amber} label="QUERY" />
      </svg>

      {/* the bound band */}
      <div style={{ marginTop: 16 }}>
        <div className="vp-plabel" style={{ marginBottom: 9 }}>
          <span className="dot" /> what the two known sides tell us about the unknown one
        </div>
        <div
          style={{
            position: 'relative',
            height: 40,
            background: 'var(--abyss-2)',
            border: '1px solid var(--edge-soft)',
            borderRadius: 2,
          }}
        >
          {/* possible band [lower, upper] */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: (lower / scale) * 100 + '%',
              width: ((upper - lower) / scale) * 100 + '%',
              background: 'var(--ping-soft)',
              borderLeft: '1px solid var(--ping)',
              borderRight: '1px solid var(--ping)',
            }}
          />
          {/* actual c marker */}
          <div
            style={{
              position: 'absolute',
              top: -3,
              bottom: -3,
              left: (c / scale) * 100 + '%',
              width: 2,
              background: 'var(--amber)',
              boxShadow: '0 0 7px var(--amber)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: (lower / scale) * 100 + '%',
              top: -16,
              transform: 'translateX(-50%)',
              fontFamily: 'var(--mono)',
              fontSize: 9.5,
              color: 'var(--ping)',
            }}
          >
            {lower.toFixed(1)}
          </div>
          <div
            style={{
              position: 'absolute',
              left: (upper / scale) * 100 + '%',
              top: -16,
              transform: 'translateX(-50%)',
              fontFamily: 'var(--mono)',
              fontSize: 9.5,
              color: 'var(--ping)',
            }}
          >
            {upper.toFixed(1)}
          </div>
          <div
            style={{
              position: 'absolute',
              left: Math.min(96, (c / scale) * 100) + '%',
              bottom: -16,
              transform: 'translateX(-50%)',
              fontFamily: 'var(--mono)',
              fontSize: 9.5,
              color: 'var(--amber)',
            }}
          >
            {c.toFixed(1)}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 20,
            fontFamily: 'var(--mono)',
            fontSize: 10.5,
            color: 'var(--bone-3)',
            letterSpacing: '.04em',
          }}
        >
          <span>
            <span style={{ color: 'var(--ping)' }}>▮</span> the true distance must lie in this band
          </span>
          <span>
            <span style={{ color: 'var(--amber)' }}>▮</span> where it actually is
          </span>
        </div>
      </div>

      <div className="vp-stat">
        <div className="vp-statcell">
          <div className="k">Lower bound · |a − b|</div>
          <div className="v ping">{lower.toFixed(1)}</div>
        </div>
        <div className="vp-statcell">
          <div className="k">Actual · d(query,contact)</div>
          <div className="v amber">{c.toFixed(1)}</div>
        </div>
        <div className="vp-statcell">
          <div className="k">Upper bound · a + b</div>
          <div className="v">{upper.toFixed(1)}</div>
        </div>
      </div>
      <div className="vp-hint">
        <span className="pip" /> drag the query, landmark, or contact
      </div>
      <div className="vp-caption">
        Knowing only two sides of a triangle pins the third inside a band: it can&apos;t be shorter
        than
        <span style={{ color: 'var(--ping)' }}> |a − b|</span> nor longer than{' '}
        <span style={{ color: 'var(--ping)' }}> a + b</span>. Drag the query close to the landmark
        and the band collapses, so you nearly know the answer without measuring it. That{' '}
        <em>lower bound</em> is the whole game. If the closest a region could <em>possibly</em> be
        is still farther than a contact you already hold, you can throw the entire region away
        unmeasured.
      </div>
    </div>
  );
}
