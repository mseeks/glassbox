import { useState } from 'react';
import { KB, fmtBytes } from '../engine/index.js';
import Sprite from '../components/Sprite.jsx';

// Lab 2 — fit a 1980s game on a 40 KB cartridge. Toggle "reuse hero frames"
// (the real Prince of Persia trick) and watch the bar slip under or over
// the cartridge limit. The transition is the lesson: when memory is scarce,
// ingenuity becomes the only way in.
const CART = 40 * KB;
const TRACK = 48 * KB;
const FIXED = [
  { key: 'code', label: 'Game code', b: 12 * KB, col: 'var(--steel-dim)' },
  { key: 'levels', label: 'Level maps', b: 8 * KB, col: 'var(--sage)' },
  { key: 'sound', label: 'Music & SFX', b: 4 * KB, col: 'var(--rose)' },
  { key: 'hero', label: 'Hero frames', b: 9 * KB, col: 'var(--amber)' },
];
const FIXED_TOTAL = FIXED.reduce((a, s) => a + s.b, 0); // 33 KB

export default function Cartridge() {
  const [reuse, setReuse] = useState(true);
  const enemyB = reuse ? 220 : 9 * KB;
  const total = FIXED_TOTAL + enemyB;
  const fits = total <= CART;
  const pct = (b) => (b / TRACK) * 100;
  const limitPct = (CART / TRACK) * 100;

  return (
    <div className="lab">
      <div className="lab-tag">Lab · fit the game</div>
      <p className="lab-note">
        A 1980s game shipped on a cartridge holding just <strong>40 KB</strong>. Everything fit on
        that one chip: the game code, the level maps, the music, and every last frame of animation.
        Now this game needs one more thing. It needs an <em className="term">enemy</em>. Watch what
        happens when you turn off the single trick that made the whole thing fit in the first place.
      </p>

      {/* two figures */}
      <div
        style={{
          display: 'flex',
          gap: 14,
          justifyContent: 'center',
          alignItems: 'flex-end',
          marginBottom: 4,
        }}
      >
        <figure style={{ margin: 0, textAlign: 'center', width: '34%', maxWidth: 120 }}>
          <div
            style={{
              height: 128,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '72px' }}>
              <Sprite hue="amber" />
            </div>
          </div>
          <figcaption
            className="mono"
            style={{ fontSize: 10, color: 'var(--amber-hi)', marginTop: 8 }}
          >
            HERO
          </figcaption>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--mw-faint-fn)' }}>
            9 KB of frames
          </div>
        </figure>
        <div
          className="mono"
          style={{ fontSize: 20, color: 'var(--mw-faint-fn)', paddingBottom: 40 }}
        >
          {reuse ? '↔' : '+'}
        </div>
        <figure style={{ margin: 0, textAlign: 'center', width: '34%', maxWidth: 120 }}>
          <div
            style={{
              height: 128,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '72px' }}>
              <Sprite hue={reuse ? 'steel' : 'rose'} mirror={reuse} />
            </div>
          </div>
          <figcaption
            className="mono"
            style={{ fontSize: 10, color: reuse ? 'var(--steel)' : 'var(--rose)', marginTop: 8 }}
          >
            GUARD
          </figcaption>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--mw-faint-fn)' }}>
            {reuse ? '≈0 KB · reused' : '9 KB of its own'}
          </div>
        </figure>
      </div>

      {/* the toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 18px' }}>
        <div className="seg">
          <button className={reuse ? 'on' : ''} onClick={() => setReuse(true)}>
            Reuse hero frames
          </button>
          <button className={!reuse ? 'on' : ''} onClick={() => setReuse(false)}>
            Give it its own
          </button>
        </div>
      </div>

      {/* capacity bar — fixed track so toggling never reflows */}
      <div style={{ position: 'relative', paddingTop: 20 }}>
        {/* limit label sits above the line, growing leftward so it never clips */}
        <div
          className="mono"
          style={{
            position: 'absolute',
            top: 0,
            right: `${100 - limitPct}%`,
            whiteSpace: 'nowrap',
            fontSize: 10,
            color: 'var(--ivory)',
          }}
        >
          40 KB cartridge limit ↓
        </div>
        <div
          style={{
            position: 'relative',
            height: 34,
            background: 'var(--void)',
            border: '1px solid var(--line2)',
            borderRadius: 8,
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          {FIXED.map((s) => (
            <div
              key={s.key}
              style={{
                width: `${pct(s.b)}%`,
                background: s.col,
                opacity: 0.85,
                borderRight: '1px solid var(--mw-void-wash)',
                transition: 'width .45s cubic-bezier(.2,.7,.2,1)',
              }}
              title={`${s.label} · ${fmtBytes(s.b)}`}
            />
          ))}
          <div
            style={{
              width: `${pct(enemyB)}%`,
              background: reuse ? 'var(--steel)' : 'var(--danger)',
              transition: 'width .45s cubic-bezier(.2,.7,.2,1), background .3s',
              boxShadow: reuse ? 'none' : '0 0 14px var(--mw-danger-glow)',
            }}
            title={`Guard · ${fmtBytes(enemyB)}`}
          />
          {/* cartridge limit line */}
          <div
            style={{
              position: 'absolute',
              left: `${limitPct}%`,
              top: -4,
              bottom: -4,
              width: 2,
              background: 'var(--ivory)',
              boxShadow: '0 0 8px var(--mw-ink-sheen)',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--mw-faint-fn)' }}>
            0
          </span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--mw-faint-fn)' }}>
            48 KB
          </span>
        </div>
      </div>

      {/* status */}
      <div
        style={{
          marginTop: 14,
          padding: '12px 15px',
          borderRadius: 10,
          background: fits ? 'var(--mw-sage-panel)' : 'var(--mw-danger-panel)',
          border: `1px solid ${fits ? 'var(--mw-sage-edge)' : 'var(--mw-danger-edge)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span
          className="disp"
          style={{ fontSize: 30, color: fits ? 'var(--sage)' : 'var(--danger)', lineHeight: 1 }}
        >
          {fits ? '✓' : '✗'}
        </span>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div className="readout" style={{ fontSize: 15, color: 'var(--ivory)' }}>
            {fmtBytes(total)}{' '}
            {fits ? (
              'used'
            ) : (
              <span style={{ color: 'var(--danger)' }}>, over by {fmtBytes(total - CART)}</span>
            )}
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--dim)', marginTop: 2 }}>
            {reuse ? (
              <>
                The guard is just the hero's own frames,{' '}
                <strong style={{ color: 'var(--steel)' }}>read backwards</strong>. Same pixels
                reused, so it costs almost no extra memory whatsoever. The game fits.
              </>
            ) : (
              <>
                Giving the guard its own frames blows past the cartridge.{' '}
                <strong style={{ color: 'var(--danger)' }}>This game cannot ship.</strong>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
