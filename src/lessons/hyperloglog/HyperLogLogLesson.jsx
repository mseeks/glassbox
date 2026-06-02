import { useScrollProgress } from '../../shared/useScrollProgress.js';
import Masthead from './sections/Masthead.jsx';
import Chapter01 from './sections/Chapter01.jsx';
import Chapter02 from './sections/Chapter02.jsx';
import Chapter03 from './sections/Chapter03.jsx';
import Chapter04 from './sections/Chapter04.jsx';
import Chapter05 from './sections/Chapter05.jsx';
import Chapter06 from './sections/Chapter06.jsx';
import Chapter07 from './sections/Chapter07.jsx';
import Closing from './sections/Closing.jsx';
import './hyperloglog.css';

/* ════════════════════════════════════════════════════════════════════════
   HYPERLOGLOG — "The Estimation Engine"
   An analog instrument that infers a multitude from the rarest flicker it sees.

   Aesthetic: dark control-room panel · sodium-brass machine · phosphor-cyan
   readout · hot-magenta variance · ivory ground-truth.
   Type: Big Shoulders Display (numerals/titles) · Literata (prose) ·
         JetBrains Mono (telemetry).

   Composition root. The real, numerically-verified MurmurHash3 + HyperLogLog
   math lives in ./engine; reusable visuals/atoms (Chapter / Panel / Readout /
   Slider / RegisterGrid / SplitBits) + presentational helpers (colors / format
   / useCanvas) live in ./components; the seven labs live in ./labs; the
   masthead, the seven chapters, and the closing live in ./sections. This shell
   just wires the scroll-progress rail and the prose flow.
   ════════════════════════════════════════════════════════════════════════ */
export default function HyperLogLogLesson() {
  const progress = useScrollProgress();

  return (
    <div className="hll">
      <div className="rail">
        <i style={{ width: `${progress}%` }} />
      </div>

      <div className="wrap">
        <Masthead />
        <Chapter01 />
        <Chapter02 />
        <Chapter03 />
        <Chapter04 />
        <Chapter05 />
        <Chapter06 />
        <Chapter07 />
        <Closing />
      </div>
    </div>
  );
}
