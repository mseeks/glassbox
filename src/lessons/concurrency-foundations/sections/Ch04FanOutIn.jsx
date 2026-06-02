import { PatternDiagram } from '../components/PatternDiagram.jsx';

export function Ch04FanOutIn() {
  return (
    <section className="section">
      <div className="section-num">04.02 — distribute, then gather</div>
      <h2 className="section-title">
        Fan-out, <em>fan-in</em>.
      </h2>
      <p className="prose">
        When the work is parallelizable but the result needs to be reassembled, the shape is fan-out
        / fan-in: one source splits work across N workers, and the workers' outputs merge back into
        a single stream. Map-reduce in miniature.
      </p>

      <PatternDiagram pattern="fan-out-in" />

      <p className="prose">
        The number of workers is the dial: too few leaves cores idle, too many adds scheduling
        overhead and cache thrash. A reasonable default is the number of physical cores for
        CPU-bound work, or much higher for IO-bound work where most of the time is spent waiting.
        The <em>only</em> way to know is to measure.
      </p>
      <p className="prose">
        The merge stage is where backpressure matters: if one worker is slow, the merge can either
        wait (preserves order, slows down) or interleave (faster, loses order). Both are valid; you
        choose based on whether downstream consumers care.
      </p>
    </section>
  );
}
