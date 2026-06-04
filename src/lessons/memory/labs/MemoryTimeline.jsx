import { useEffect, useRef, useState } from 'react';
import { KB, MB, GB, TB } from '../engine/index.js';

const log10 = Math.log10;

// Tween a value 0→1 (or to a target) with rAF; used to morph the chart's
// y-axis between log and linear. Co-located here since only this lab uses it.
function useTween(target, dur = 800) {
  const [v, setV] = useState(target);
  const ref = useRef(target);
  useEffect(() => {
    let raf, start;
    const from = ref.current;
    const step = (t) => {
      if (!start) start = t;
      const k = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      const nv = from + (target - from) * e;
      ref.current = nv;
      setV(nv);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

// Real machines, plotted across time. Toggle log↔linear: on a linear axis,
// 35 years of history collapse into a flat line at zero, then a vertical
// wall. That collapse — and why we *must* use a log scale to see history at
// all — is the lesson. (Was named Explosion inline; renamed here to avoid
// shadowing the §03 section also called Explosion.)
const ERAS = [
  {
    y: 1969,
    name: 'Apollo Guidance Computer',
    b: 4 * KB,
    tag: '~4 KB RAM + ~72 KB woven ROM',
    ran: 'Flew Apollo to the Moon: real-time navigation, guidance and control.',
    eq: 'Its live memory held about two pages of text.',
  },
  {
    y: 1977,
    name: 'Apple II',
    b: 48 * KB,
    tag: '4–48 KB RAM',
    ran: 'VisiCalc, the first spreadsheet. The app that sold home computers.',
    eq: 'A couple dozen pages, held all at once.',
  },
  {
    y: 1981,
    name: 'IBM PC / DOS',
    b: 640 * KB,
    tag: '640 KB usable',
    ran: 'Lotus 1-2-3 and WordPerfect: business software for the masses.',
    eq: 'A 350-page book, entirely in memory.',
  },
  {
    y: 1982,
    name: 'Commodore 64',
    b: 64 * KB,
    tag: '64 KB RAM',
    ran: 'Games, BASIC, a demo scene. Best-selling computer model ever made.',
    eq: 'About 35 pages of text.',
  },
  {
    y: 1984,
    name: 'Macintosh 128K',
    b: 128 * KB,
    tag: '128 KB RAM',
    ran: 'The first mass GUI: windows, icons, a mouse, fonts on screen.',
    eq: '~70 pages, and now it had to draw pictures.',
  },
  {
    y: 1985,
    name: 'Nintendo (NES)',
    b: 2 * KB,
    tag: '2 KB work RAM',
    ran: 'Super Mario Bros.: a scrolling world on a 40 KB cartridge.',
    eq: 'Its scratch memory barely held a single page.',
  },
  {
    y: 1993,
    name: 'The Multimedia PC',
    b: 4 * MB,
    tag: '~4 MB RAM',
    ran: 'Windows 3.1, Encarta, CD-ROM games: sound and pictures together.',
    eq: 'About eight thick novels.',
  },
  {
    y: 1995,
    name: 'The Windows 95 PC',
    b: 16 * MB,
    tag: '~16 MB RAM',
    ran: 'A browser, email, MP3s: the Internet in the living room.',
    eq: 'A small shelf, about 30 novels.',
  },
  {
    y: 2003,
    name: 'Early-2000s PC',
    b: 512 * MB,
    tag: '~512 MB RAM',
    ran: 'Windows XP, digital photos, iTunes: life turning into files.',
    eq: 'Roughly 250 songs, or a thousand books.',
  },
  {
    y: 2008,
    name: 'The HD laptop',
    b: 4 * GB,
    tag: '~4 GB RAM',
    ran: 'HD video, social feeds, dozens of browser tabs at once.',
    eq: 'About 1,000 songs, or 30 min of HD video.',
  },
  {
    y: 2024,
    name: "Today's phone",
    b: 16 * GB,
    tag: '8–16 GB RAM',
    ran: '4K video, live maps, an AI assistant, all in your pocket.',
    eq: 'A two-million-book library, in one hand.',
  },
  {
    y: 2026,
    name: 'A single AI server',
    b: 2 * TB,
    tag: '1–2 TB RAM',
    ran: "Holds an entire language model's weights resident at once.",
    eq: 'Hundreds of thousands of hours of video.',
  },
];
const Y0 = 1969,
  Y1 = 2026,
  PHOTO = 3 * MB;
const yloL = log10(1 * KB),
  yhiL = log10(4 * TB),
  yLinMax = 2 * TB;

export default function MemoryTimeline() {
  const [mode, setMode] = useState('log');
  const [sel, setSel] = useState(0);
  const [cursor, setCursor] = useState(Y1); // reveal years up to this
  const [playing, setPlaying] = useState(false);
  const morph = useTween(mode === 'log' ? 1 : 0, 750);

  // play sweep
  useEffect(() => {
    if (!playing) return;
    let raf, start;
    const dur = 4200;
    const step = (t) => {
      if (!start) start = t;
      const k = Math.min(1, (t - start) / dur);
      const yr = Y0 + (Y1 - Y0) * k;
      setCursor(yr);
      // select the latest era revealed
      let idx = 0;
      for (let i = 0; i < ERAS.length; i++) {
        if (ERAS[i].y <= yr) idx = i;
      }
      setSel(idx);
      if (k < 1) raf = requestAnimationFrame(step);
      else setPlaying(false);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const W = 1000,
    H = 360,
    padL = 46,
    padR = 18,
    padT = 18,
    padB = 30;
  const xOf = (yr) => padL + ((yr - Y0) / (Y1 - Y0)) * (W - padL - padR);
  const yFracOf = (b) => {
    const fLog = (log10(b) - yloL) / (yhiL - yloL);
    const fLin = b / yLinMax;
    return fLin * (1 - morph) + fLog * morph;
  };
  const yOf = (b) => H - padB - yFracOf(b) * (H - padT - padB);
  const pts = ERAS.map((e) => ({ ...e, x: xOf(e.y), cy: yOf(e.b), shown: e.y <= cursor + 0.01 }));
  const shownPts = pts.filter((p) => p.shown);
  const linePath = shownPts
    .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.cy.toFixed(1)}`)
    .join(' ');
  const refY = yOf(PHOTO);
  const e = ERAS[sel];

  return (
    <div className="lab">
      <div className="lab-tag">Lab · the explosion</div>
      <p className="lab-note">
        Every dot is a real machine and the memory it shipped with. Flip the axis from{' '}
        <strong>log</strong> to
        <strong> linear</strong>. Watch thirty-five years of computing vanish into a flat line on
        the floor.
      </p>

      {/* controls */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div className="seg">
          <button className={mode === 'log' ? 'on' : ''} onClick={() => setMode('log')}>
            Log scale
          </button>
          <button className={mode === 'linear' ? 'on' : ''} onClick={() => setMode('linear')}>
            Linear scale
          </button>
        </div>
        <button
          className="btn"
          onClick={() => {
            setCursor(Y0);
            setSel(0);
            setPlaying(true);
          }}
          disabled={playing}
        >
          {playing ? '▶ playing…' : '▶ play history'}
        </button>
      </div>

      {/* chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{
          display: 'block',
          background: 'var(--mw-void-wash)',
          border: '1px solid var(--line)',
          borderRadius: 10,
        }}
      >
        {/* reference line: one phone photo */}
        <line
          x1={padL}
          y1={refY}
          x2={W - padR}
          y2={refY}
          stroke="var(--steel)"
          strokeWidth="1.3"
          strokeDasharray="5 5"
          opacity=".8"
        />
        <text
          x={W - padR}
          y={refY - 7}
          textAnchor="end"
          fill="var(--steel)"
          fontSize="13"
          fontFamily="JetBrains Mono"
        >
          one phone photo · 3 MB
        </text>
        {/* area + line */}
        {shownPts.length > 1 && (
          <path
            d={`${linePath} L${shownPts[shownPts.length - 1].x.toFixed(1)} ${H - padB} L${shownPts[0].x.toFixed(1)} ${H - padB} Z`}
            style={{ fill: 'var(--mw-amber-area)' }}
          />
        )}
        <path
          d={linePath}
          fill="none"
          stroke="var(--amber)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* points */}
        {pts.map((p, i) => (
          <g
            key={i}
            role="button"
            tabIndex={p.shown && !playing ? 0 : -1}
            aria-label={`${p.name}, ${p.y}`}
            onClick={() => {
              if (!playing) {
                setSel(i);
              }
            }}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                if (!playing) {
                  setSel(i);
                }
              }
            }}
            style={{ cursor: playing ? 'default' : 'pointer' }}
          >
            {p.shown && i === sel && (
              <circle cx={p.x} cy={p.cy} r="11" style={{ fill: 'var(--mw-amber-halo)' }} />
            )}
            <circle
              cx={p.x}
              cy={p.cy}
              r={i === sel ? 5.5 : 4}
              style={{
                fill: p.shown ? (i === sel ? 'var(--amber-hi)' : 'var(--amber)') : 'var(--mw-off)',
              }}
              stroke={p.shown ? 'var(--gallery)' : 'none'}
              strokeWidth="1.5"
            />
            {/* invisible bigger hit target */}
            <circle cx={p.x} cy={p.cy} r="16" fill="transparent" />
          </g>
        ))}
        {/* y label */}
        <text
          x={padL}
          y={padT - 4}
          fill="var(--mw-faint-fn)"
          fontSize="12"
          fontFamily="JetBrains Mono"
        >
          bytes ({mode})
        </text>
        <text
          x={padL}
          y={H - 8}
          fill="var(--mw-faint-fn)"
          fontSize="12"
          fontFamily="JetBrains Mono"
        >
          {Y0}
        </text>
        <text
          x={W - padR}
          y={H - 8}
          textAnchor="end"
          fill="var(--mw-faint-fn)"
          fontSize="12"
          fontFamily="JetBrains Mono"
        >
          {Math.round(cursor)}
        </text>
      </svg>

      {/* machine card — fixed min height to avoid reflow */}
      <div
        style={{
          marginTop: 14,
          minHeight: 118,
          padding: '13px 16px',
          background: 'var(--void)',
          border: '1px solid var(--line2)',
          borderRadius: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <span className="disp" style={{ fontSize: 26, color: 'var(--ivory)' }}>
            {e.name}
          </span>
          <span
            className="pill"
            style={{ borderColor: 'var(--amber-deep)', color: 'var(--amber-hi)' }}
          >
            {e.y} · {e.tag}
          </span>
        </div>
        <div style={{ fontSize: 14.5, color: 'var(--dim)', marginTop: 7 }}>
          <strong style={{ color: 'var(--ivory)' }}>Ran:</strong> {e.ran}
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--mw-faint-fn)', marginTop: 5 }}>{e.eq}</div>
      </div>
      <p className="footnote" style={{ marginTop: 10 }}>
        Notice where the dashed line falls: for the first ~35 years, an entire computer held less
        memory than a single photo your phone takes today.
      </p>
    </div>
  );
}
