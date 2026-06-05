import { useMemo } from 'react';
import { mulberry32 } from '../engine/index.js';

// The fixed night-sky backdrop: 64 seeded stars. Each star twinkles via the
// CSS @keyframes tor-tw, which the shell's global reduced-motion rule already
// neutralizes — so there is no JS loop to gate here; under reduced motion the
// stars simply hold their base opacity. Decorative, so aria-hidden.
export default function Starfield() {
  const stars = useMemo(() => {
    const r = mulberry32(7);
    return Array.from({ length: 64 }, () => ({
      l: r() * 100,
      t: r() * 100,
      s: r() * 1.7 + 0.6,
      o: r() * 0.5 + 0.18,
      d: r() * 5,
    }));
  }, []);
  return (
    <div className="tor-bg-layer" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className="tor-star"
          style={{
            left: s.l + '%',
            top: s.t + '%',
            width: s.s + 'px',
            height: s.s + 'px',
            '--o': s.o,
            animationDelay: s.d + 's',
          }}
        />
      ))}
    </div>
  );
}
