import { C } from '../components/helpers.js';

// The hero masthead: a decorative sonar-sweep scope (CSS @keyframes, neutralized
// under reduced motion via the lesson CSS) behind the title, signature eyebrow,
// and a three-cell read strip framing the task / trick / catch.
export default function Masthead() {
  return (
    <header className="vp-mast">
      <svg className="vp-scope-bg" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id="mastWedge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.ping} stopOpacity="0.0" />
            <stop offset="100%" stopColor={C.ping} stopOpacity="0.28" />
          </linearGradient>
        </defs>
        {[16, 28, 40, 48].map((r) => (
          <circle
            key={r}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="rgba(63,224,198,0.16)"
            strokeWidth="0.2"
          />
        ))}
        <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(63,224,198,0.12)" strokeWidth="0.2" />
        <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(63,224,198,0.12)" strokeWidth="0.2" />
        <g className="vp-sweep">
          <path d="M50 50 L50 4 A46 46 0 0 1 82 18 Z" fill="url(#mastWedge)" />
        </g>
        <circle
          className="vp-ping"
          cx="50"
          cy="50"
          r="2"
          fill="none"
          stroke={C.ping}
          strokeWidth="0.5"
        />
        <circle cx="50" cy="50" r="1.4" fill={C.amber} />
        {[
          [34, 30],
          [70, 40],
          [58, 72],
          [28, 64],
          [78, 66],
        ].map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="1.1" fill={C.ping} opacity="0.7" />
        ))}
      </svg>

      <div className="vp-wrap" style={{ position: 'relative', zIndex: 2 }}>
        <div className="vp-kicker">
          <span className="ln" />
          <span className="vp-eyebrow">Nearest-neighbour search · a field instrument</span>
        </div>
        <h1 className="vp-title">
          Vantage
          <br />
          Point <span className="em">Trees</span>
        </h1>
        <p className="vp-sub">
          Finding the closest thing when the only fact you can measure is distance.
        </p>

        <div className="vp-readstrip">
          <div>
            <div className="k">The task</div>
            <div className="v">
              Given one query, find its nearest neighbour among thousands, without checking them
              all.
            </div>
          </div>
          <div>
            <div className="k">The trick</div>
            <div className="v">
              File every point by its distance from a few chosen vantage points, then let the
              triangle inequality throw whole regions away. Geometry does the skipping.
            </div>
          </div>
          <div>
            <div className="k">The catch</div>
            <div className="v">
              It breaks in high dimensions. Distances bunch together, the pruning fails, and the
              search collapses back to brute force.
            </div>
          </div>
        </div>

        <p className="vp-prose" style={{ marginTop: 30, maxWidth: '60ch', color: '#cfdedb' }}>
          What follows is a working instrument, not a slideshow. Every ring, every prune, and every
          counter you&apos;ll see is produced by a real vantage-point tree running in your browser.
          Nothing is faked. Move through the seven panels in order, each one adding a single idea on
          top of the last, and by the end you&apos;ll understand how a search engine finds "the
          closest one" in a space it cannot even draw.
        </p>
      </div>
    </header>
  );
}
