export function Ch01ConcurrencyVsParallelism() {
  // Two visualizations of the same 4-task workload
  // CONCURRENT: interleaved on one core (single track, segments)
  // PARALLEL: distributed on two cores (two tracks, simultaneous)
  const palette = {
    A: 'var(--amber)',
    B: 'var(--cyan)',
    C: 'var(--emerald)',
    D: 'var(--rose)',
  };

  // Concurrent: 12 time slices, interleaved
  const conc = ['A', 'B', 'A', 'C', 'B', 'D', 'A', 'C', 'B', 'D', 'C', 'D'];
  // Parallel: two cores, 6 slices each, all 4 tasks complete at the same wall-clock time
  const par1 = ['A', 'A', 'A', 'C', 'C', 'C'];
  const par2 = ['B', 'B', 'B', 'D', 'D', 'D'];

  return (
    <section className="section">
      <div className="section-num">01.01 · terms of art</div>
      <h2 className="section-title">
        Concurrency is not <em>parallelism</em>.
      </h2>
      <p className="prose">
        Casual conversation treats these two words as synonyms. They are not. They refer to
        genuinely different things, and the distinction matters every time you reason about
        correctness and every time you reason about performance.
      </p>
      <p className="prose">
        <strong>Concurrency</strong> is a property of <em>structure</em>. A program is concurrent if
        it's organized as multiple independent computations that <em>could</em> interleave in any
        order. Core count is beside the point.
      </p>
      <p className="prose">
        <strong>Parallelism</strong> is a property of <em>execution</em>. Two computations are
        parallel if they're happening at the same instant, on different hardware. How the program
        was organized is a separate question entirely.
      </p>

      <div className="cvp-card">
        <div className="cvp-row">
          <div className="cvp-label">
            <div className="cvp-label-tag">concurrent</div>
            <div className="cvp-label-desc">one core, four tasks, interleaved</div>
          </div>
          <div className="cvp-track">
            {conc.map((t, i) => (
              <div
                key={i}
                className="cvp-slice"
                style={{
                  background: palette[t],
                  animationDelay: i * 0.06 + 's',
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
        <div className="cvp-row">
          <div className="cvp-label">
            <div className="cvp-label-tag">parallel</div>
            <div className="cvp-label-desc">two cores, four tasks, simultaneous</div>
          </div>
          <div className="cvp-tracks-stacked">
            <div className="cvp-track cvp-track-thin">
              {par1.map((t, i) => (
                <div
                  key={i}
                  className="cvp-slice"
                  style={{
                    background: palette[t],
                    animationDelay: i * 0.08 + 's',
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
            <div className="cvp-track cvp-track-thin">
              {par2.map((t, i) => (
                <div
                  key={i}
                  className="cvp-slice"
                  style={{
                    background: palette[t],
                    animationDelay: i * 0.08 + 0.04 + 's',
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="cvp-axis">
          <span>time</span>
          <svg width="60" height="8" viewBox="0 0 60 8">
            <path
              d="M0 4 H50 M44 1 L50 4 L44 7"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="pull-quote">
        Concurrency is about dealing with lots of things at once. Parallelism is about doing lots of
        things at once.
        <div className="pull-quote-attr">Rob Pike</div>
      </div>

      <p className="prose">
        Concrete examples: a single-threaded JavaScript runtime juggling promises is concurrent but
        not parallel. A SIMD instruction operating on eight floats at once is parallel but not
        concurrent. A multi-threaded Go web server handling thousands of connections is both.
      </p>
      <p className="prose">
        Many concurrency bugs are really gaps between the interleavings you imagined and the
        interleavings the runtime, scheduler, compiler, or hardware can actually produce. Some show
        up on one thread; parallel hardware just makes the gap easier to hit. The rest of this
        lesson is about learning to see that gap before production does.
      </p>
    </section>
  );
}
