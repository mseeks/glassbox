import { useMemo } from 'react';

// HeroField — the woven-rings → ocean haze background. Only the Hero uses
// it, so it stays inline here. Mutable rendering data (random seeds) is
// memoised once on mount.
function HeroField() {
  const rings = useMemo(() => {
    const out = [];
    // left: a few large, sparse, hand-made rings
    const big = [
      [60, 120],
      [150, 200],
      [120, 300],
      [230, 140],
      [210, 300],
    ];
    big.forEach(([x, y], i) => out.push({ x, y, r: 15, on: i % 2 === 0, big: true, idx: i }));
    // right: densifying haze → the ocean
    let seed = 7;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < 520; i++) {
      const t = rnd(); // 0..1 across
      const x = 300 + t * 640;
      const y = 40 + rnd() * 380;
      const dens = t; // denser to the right
      if (rnd() < 0.25 + dens * 0.7) {
        out.push({ x, y, r: 2.2 + (1 - t) * 4.5, on: rnd() < 0.45, big: false, idx: i });
      }
    }
    return out;
  }, []);
  return (
    <svg
      viewBox="0 0 960 440"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: 0.85,
      }}
    >
      <defs>
        <radialGradient id="hglow" cx="22%" cy="42%" r="70%">
          <stop offset="0%" stopColor="rgba(246,181,69,.16)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="hfade" x1="0" x2="1">
          <stop offset="55%" stopColor="transparent" />
          <stop offset="100%" stopColor="var(--gallery)" />
        </linearGradient>
      </defs>
      <rect width="960" height="440" fill="url(#hglow)" />
      {rings.map((r, i) => (
        <g key={i}>
          {r.big && (
            <>
              <line
                x1={r.x - r.r - 6}
                y1={r.y}
                x2={r.x + r.r + 6}
                y2={r.y}
                stroke="var(--steel-dim)"
                strokeWidth="1"
                opacity=".5"
              />
              <line
                x1={r.x}
                y1={r.y - r.r - 6}
                x2={r.x}
                y2={r.y + r.r + 6}
                stroke="var(--steel-dim)"
                strokeWidth="1"
                opacity=".5"
              />
            </>
          )}
          <circle
            cx={r.x}
            cy={r.y}
            r={r.r}
            fill="none"
            stroke={r.on ? 'var(--amber)' : '#2a3756'}
            strokeWidth={r.big ? 2.2 : 1.1}
            opacity={r.big ? 0.95 : 0.3 + 0.5 * (r.x / 960)}
            style={r.on ? { filter: 'drop-shadow(0 0 4px rgba(246,181,69,.7))' } : {}}
          />
        </g>
      ))}
      <rect width="960" height="440" fill="url(#hfade)" />
    </svg>
  );
}

// The whole story in one image: a handful of large rings woven by hand on
// the left, dissolving rightward into an uncountable ocean of tiny ones.
export default function Hero() {
  return (
    <header
      style={{
        position: 'relative',
        minHeight: 'clamp(560px,92vh,820px)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <HeroField />
      <div className="wrap" style={{ position: 'relative', zIndex: 2 }}>
        <div className="rev in" style={{ maxWidth: 660 }}>
          <div className="eyebrow" style={{ marginBottom: 20 }}>
            A history of almost nothing
          </div>
          <h1
            className="disp"
            style={{ fontSize: 'clamp(46px,11vw,104px)', margin: '0 0 8px', color: 'var(--ivory)' }}
          >
            The Weight
            <br />
            of Memory
          </h1>
          <p
            className="lead"
            style={{
              maxWidth: 540,
              marginTop: 22,
              fontSize: 'clamp(17px,2.6vw,21px)',
              color: '#d8d1c2',
            }}
          >
            It began as something you could hold: a wire threaded by hand through a ring of iron,
            one bit at a time. In a single lifetime it became an ocean nobody can picture. This is
            the story of how. And of what each drop of it once let a machine do.
          </p>
          <div
            style={{
              marginTop: 30,
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <span
              className="pill"
              style={{ borderColor: 'var(--amber-deep)', color: 'var(--amber-hi)' }}
            >
              one bit, by hand
            </span>
            <span style={{ color: 'var(--faint)' }}>→</span>
            <span
              className="pill"
              style={{ borderColor: 'var(--steel-dim)', color: 'var(--steel)' }}
            >
              an ocean, today
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 22,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 2,
        }}
      >
        <span
          className="mono"
          style={{ fontSize: 11, color: 'var(--faint)', letterSpacing: '.2em' }}
        >
          SCROLL ↓
        </span>
      </div>
    </header>
  );
}
