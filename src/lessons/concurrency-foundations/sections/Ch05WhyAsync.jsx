export function Ch05WhyAsync() {
  return (
    <section className="section">
      <div className="section-num">05.01 — the C10K problem</div>
      <h2 className="section-title">
        A thread for every <em>request</em>?
      </h2>
      <p className="prose">
        Through the 1990s, the standard server architecture was thread-per-connection: each incoming
        request got its own OS thread, which handled it from accept to close. Simple, synchronous,
        easy to reason about. It also fell over at around ten thousand concurrent connections — the
        C10K problem — because OS threads have stack overhead (megabytes each) and context-switching
        cost that scales poorly.
      </p>
      <p className="prose">
        The diagnosis: most of those threads weren't <em>computing</em> anything. They were blocked
        on IO — waiting for a database query, a file read, a network response — holding a thread of
        resources to do nothing.
      </p>
      <p className="prose">
        Async is the architectural answer. The same code that <em>looks</em> synchronous — await
        this, then do that — doesn't actually pin a thread while waiting. A small pool of threads
        handles thousands of in-flight tasks, switching between them at every IO boundary. The
        threads are precious; the tasks are cheap.
      </p>

      <div className="pull-quote">
        Threads are an OS abstraction. Tasks are a runtime abstraction. Async is what you get when
        the runtime is doing the scheduling instead.
      </div>
    </section>
  );
}
