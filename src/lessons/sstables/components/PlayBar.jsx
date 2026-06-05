import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';

// The Play / Step / Reset control group every lab shares. Each button carries
// visible text, so it needs no extra aria. The icons are decorative.
//
// Play is autoplay only after the user presses it, but to honour reduced motion
// the trigger is hidden when `reduced` is set — the reader drives with Step
// instead (which renders each frame statically, no animation).
export default function PlayBar({ player, reduced, done, label = '', btnStyle }) {
  const { play, pause, step, reset, playing } = player;
  const verb = done ? 'Replay' : 'Play';
  const suffix = label ? ` ${label}` : '';
  return (
    <>
      {!reduced && (
        <button
          className="sst-btn primary"
          onClick={playing ? pause : play}
          style={btnStyle}
          aria-label={playing ? 'Pause' : `${verb}${suffix}`}
        >
          {playing ? (
            <>
              <Pause size={14} aria-hidden="true" /> Pause
            </>
          ) : (
            <>
              <Play size={14} aria-hidden="true" /> {verb}
              {suffix}
            </>
          )}
        </button>
      )}
      <button className="sst-btn" onClick={step} disabled={done} style={btnStyle}>
        <StepForward size={14} aria-hidden="true" /> Step
      </button>
      <button className="sst-btn" onClick={reset} style={btnStyle}>
        <RotateCcw size={14} aria-hidden="true" /> Reset
      </button>
    </>
  );
}
