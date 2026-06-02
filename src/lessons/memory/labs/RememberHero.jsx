import { useMemo, useState } from 'react';
import { GB, MB, fmtBytes } from '../engine/index.js';
import Sprite, { SW, SH } from '../components/Sprite.jsx';

// The same hero from the cartridge, remembered five richer ways. Each step
// costs orders of magnitude more than the last — the §05 thesis made concrete.
const HERO_PX = SW * SH; // 192 dots
const MEDIA = [
  {
    key: 'name',
    label: 'Name',
    title: 'His name',
    kind: 'text',
    b: 4,
    blurb: 'Four letters of text. Words weigh almost nothing. About a byte each.',
  },
  {
    key: 'pic',
    label: 'Picture',
    title: 'A picture',
    kind: 'sprite',
    b: HERO_PX,
    blurb:
      'A small bitmap, holding one byte for every single coloured dot on screen. One picture dwarfs a word.',
  },
  {
    key: 'anim',
    label: 'Animated',
    title: 'Animated',
    kind: 'frames',
    b: 20 * HERO_PX,
    blurb:
      'About twenty frames of him moving. Animation is nothing more than many separate pictures, played one after another in a row.',
  },
  {
    key: 'video',
    label: 'Video',
    title: 'A video clip',
    kind: 'film',
    b: 30 * MB,
    blurb: 'A few seconds of real video. That is thirty full pictures, every single second.',
  },
  {
    key: 'ai',
    label: 'AI',
    title: 'An AI of him',
    kind: 'cloud',
    b: 4 * GB,
    blurb:
      'A model that can dream up brand-new pictures of him out of nothing, and it takes billions of numbers all held in memory at once.',
  },
];
const WHI = Math.log10(8 * GB);

// A swarm of small rings used to represent the "cloud of weights" of the AI
// option. Only used inside this lab, so co-located.
function RingCloud() {
  const dots = useMemo(() => {
    let s = 9;
    const r = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: 96 }, () => ({ x: r() * 100, y: r() * 56, on: r() < 0.5 }));
  }, []);
  return (
    <svg viewBox="0 0 100 56" width="100%" style={{ maxWidth: 240 }}>
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r="1.25"
          fill="none"
          stroke={d.on ? 'var(--amber)' : '#2c364f'}
          strokeWidth="0.4"
        />
      ))}
    </svg>
  );
}

function MediaStage({ m }) {
  if (m.kind === 'text')
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        {['h', 'e', 'r', 'o'].map((c, i) => (
          <div
            key={i}
            className="mono"
            style={{
              width: 38,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--amber-deep)',
              borderRadius: 8,
              color: 'var(--amber-hi)',
              fontSize: 22,
              background: 'rgba(246,181,69,.06)',
            }}
          >
            {c}
          </div>
        ))}
      </div>
    );
  if (m.kind === 'sprite')
    return (
      <div style={{ width: 78, animation: 'bob 2.6s ease-in-out infinite' }}>
        <Sprite hue="amber" />
      </div>
    );
  if (m.kind === 'frames')
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        {[0, 1, 2, 3].map((k) => (
          <div key={k} style={{ width: 40, opacity: 0.45 + 0.18 * k }}>
            <Sprite hue="amber" mirror={k % 2 === 1} />
          </div>
        ))}
        <span
          className="mono"
          style={{ fontSize: 10, color: 'var(--faint)', marginLeft: 2, paddingBottom: 6 }}
        >
          × ~20
        </span>
      </div>
    );
  if (m.kind === 'film')
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8,1fr)',
          gap: 4,
          width: '100%',
          maxWidth: 280,
        }}
      >
        {Array.from({ length: 24 }).map((_, k) => (
          <div key={k}>
            <Sprite hue="amber" mirror={k % 2 === 1} />
          </div>
        ))}
      </div>
    );
  return <RingCloud />;
}

export default function RememberHero() {
  const [i, setI] = useState(0);
  const m = MEDIA[i];
  const pos = Math.max(2, (Math.log10(m.b) / WHI) * 100);
  const v = m.b / 4;
  const times =
    v < 1000
      ? `${Math.round(v)}×`
      : v < 1e6
        ? `${(v / 1000).toFixed(0)}k×`
        : v < 1e9
          ? `${(v / 1e6).toFixed(0)}M×`
          : `${(v / 1e9).toFixed(1)} billion×`;
  return (
    <div className="lab">
      <div className="lab-tag">Lab · the cost of memory</div>
      <p className="lab-note">
        Here is the same hero from the cartridge, <em className="term">remembered</em> five
        different ways. Step through them. Watch what each richer version costs to keep in memory.
      </p>
      <div
        style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 14,
        }}
      >
        {MEDIA.map((x, k) => (
          <button
            key={x.key}
            className={`btn ${k === i ? 'on' : ''}`}
            style={{ padding: '7px 12px', fontSize: 11 }}
            onClick={() => setI(k)}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div
        style={{
          height: 168,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--void)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          overflow: 'hidden',
          padding: 12,
        }}
      >
        <MediaStage m={m} />
      </div>
      <div style={{ marginTop: 14 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <span className="disp" style={{ fontSize: 24, color: 'var(--ivory)' }}>
            {m.title}
          </span>
          <span className="readout" style={{ fontSize: 20, color: 'var(--amber-hi)' }}>
            {fmtBytes(m.b)}
          </span>
        </div>
        <div
          style={{
            height: 10,
            background: 'var(--void)',
            border: '1px solid var(--line2)',
            borderRadius: 6,
            overflow: 'hidden',
            marginTop: 8,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pos}%`,
              background: 'linear-gradient(90deg,var(--amber-deep),var(--amber-hi))',
              transition: 'width .5s cubic-bezier(.2,.7,.2,1)',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--faint)' }}>
            1 B
          </span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--faint)' }}>
            8 GB · log scale
          </span>
        </div>
        <p style={{ fontSize: 14.5, color: 'var(--dim)', marginTop: 12, minHeight: 44 }}>
          {m.blurb}
        </p>
        {i > 0 && (
          <div className="callout steel" style={{ margin: '4px 0 0', padding: '10px 14px' }}>
            <span style={{ fontSize: 14.5 }}>
              Remembering him this way costs about{' '}
              <strong style={{ color: 'var(--steel)' }}>{times}</strong> what his name does.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
