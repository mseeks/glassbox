export function Ch02Semaphore() {
  return (
    <section className="section">
      <div className="section-num">02.02 · counting and signaling</div>
      <h2 className="section-title">
        The semaphore is not a <em>fancier</em> mutex.
      </h2>
      <p className="prose">
        A semaphore is a counter. It has two operations: <code>acquire</code> (subtract one, wait if
        the counter would go negative) and <code>release</code> (add one, possibly wake a waiter).
        When the count is initialized to N, exactly N threads can hold the semaphore at once.
      </p>

      <div className="compare-grid">
        <div className="defn-card">
          <div className="defn-card-tag">mutex</div>
          <div className="defn-card-title">Ownership.</div>
          <p>
            Acquired and released by the <em>same</em> thread. Models exclusive access to a
            resource: one writer at a time.
          </p>
          <p>"I am about to touch this thing. Wait your turn."</p>
        </div>
        <div className="defn-card cyan-tag">
          <div className="defn-card-tag">semaphore</div>
          <div className="defn-card-title">Permits.</div>
          <p>
            Any thread can release. The thread that decrements doesn't have to be the thread that
            increments. Models a pool of resources or a signal between threads.
          </p>
          <p>"There are three of these things; one of you can have one."</p>
        </div>
      </div>

      <p className="prose">
        Real uses for semaphores: a connection pool with a fixed maximum, rate limiting (one permit
        per request, replenished on a timer), or a counting signal where producer threads increment
        and consumer threads decrement. A binary semaphore (count starts at 0 or 1) looks like a
        mutex but isn't. The release-without-ownership rule means it can be used for cross-thread
        signaling that mutexes can't express.
      </p>
      <p className="prose">
        The name is older than the abstraction. Edsger Dijkstra introduced it in 1965 with
        operations <code>P()</code> and <code>V()</code>, the first letters of two long Dutch words.
        Most languages now spell them <code>acquire</code> and <code>release</code>, or{' '}
        <code>wait</code> and <code>signal</code>, but the underlying primitive is the same.
      </p>
    </section>
  );
}
