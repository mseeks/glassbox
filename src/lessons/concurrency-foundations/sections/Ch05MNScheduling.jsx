export function Ch05MNScheduling() {
  return (
    <section className="section">
      <div className="section-num">05.03 — many tasks, few threads</div>
      <h2 className="section-title">
        Many tasks, <em>few threads</em>.
      </h2>
      <p className="prose">
        Once functions are state machines, the runtime is free to multiplex M tasks onto N OS
        threads (where M is far larger than N). A goroutine in Go costs about 2KB; a Tokio task in
        Rust is also lightweight; a JS Promise is lightweight too. You can have very large numbers
        of in-flight tasks on a handful of threads, and the runtime juggles them.
      </p>
      <p className="prose">
        The runtime's scheduler is the soul of the design. Different runtimes pick different
        strategies:
      </p>

      <div className="runtime-grid">
        <div className="runtime-card">
          <div className="runtime-card-name">Go (goroutines)</div>
          <p>
            M:N work-stealing scheduler. Each OS thread has a local queue; idle threads steal from
            busy ones. Preemption is <em>cooperative</em> (at function calls and IO) but also{' '}
            <em>preemptive</em> via signal-driven interrupts since Go 1.14, so a tight CPU loop
            can't starve other goroutines.
          </p>
        </div>
        <div className="runtime-card">
          <div className="runtime-card-name">Rust (Tokio)</div>
          <p>
            Cooperative-only. Tasks must reach an <code>.await</code> point for the runtime to
            switch. CPU-bound work in an async function is a footgun — it blocks the whole executor
            thread until the next await. <code>spawn_blocking</code> exists to dodge it.
          </p>
        </div>
        <div className="runtime-card">
          <div className="runtime-card-name">JavaScript (event loop)</div>
          <p>
            M:1 — a single thread runs everything. Tasks queue as microtasks (promises) or
            macrotasks (timers, IO callbacks). Web Workers exist for parallelism, but the main
            thread is alone.
          </p>
        </div>
        <div className="runtime-card">
          <div className="runtime-card-name">Erlang/Elixir (BEAM)</div>
          <p>
            M:N preemptive. The VM tracks <em>reductions</em> (work units) per process and forcibly
            switches at fixed budgets, so ordinary CPU-bound processes cannot monopolize a scheduler
            thread forever. Built for telecoms; the design is forty years old and still ahead.
          </p>
        </div>
      </div>

      <p className="prose">
        Notice what's missing from this list: locks. Most async runtimes are built on the assumption
        that tasks are mostly waiting on IO and rarely contending for shared memory. When they do,
        you reach back for the primitives in chapter two — but the majority of well-architected
        async code never needs to.
      </p>
    </section>
  );
}
