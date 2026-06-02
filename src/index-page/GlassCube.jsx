// The landing hero: a slowly rotating clear glass cube with a small nebula
// glowing inside — the brand made literal (the black box, made of glass).
//
// Pure CSS 3D (transform-style: preserve-3d). No JS, no rAF: the motion is a
// CSS @keyframes spin, so the global `prefers-reduced-motion` block in
// shared/utilities.css freezes it for free — it settles on the resting 3/4
// frame (the spin sweeps a full 360°, so its first and last frame coincide).
// The nebula is two parallax layers (a dim cloud behind, a bright core in
// front) plus a scatter of stars, so the rotation reveals real depth inside
// the glass. Decorative only: the whole stage is aria-hidden; the hero copy
// beside it carries the meaning.
function GlassCube() {
  return (
    <div className="gb-stage" aria-hidden="true">
      <div className="gb-glow" />
      <div className="gb-scene">
        <div className="gb-cube">
          <span className="gb-face gb-front" />
          <span className="gb-face gb-back" />
          <span className="gb-face gb-right" />
          <span className="gb-face gb-left" />
          <span className="gb-face gb-top" />
          <span className="gb-face gb-bottom" />
          <span className="gb-nebula gb-nebula-back" />
          <span className="gb-stars" />
          <span className="gb-nebula gb-nebula-front" />
        </div>
      </div>
    </div>
  );
}

export default GlassCube;
