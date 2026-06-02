export function Ch02LockFree() {
  return (
    <section className="section">
      <div className="section-num">02.04 — progress guarantees</div>
      <h2 className="section-title">
        Wait-free, lock-free, and <em>blocking</em>.
      </h2>
      <p className="prose">
        These three terms describe how aggressive a concurrent algorithm's progress guarantee is.
        Stronger guarantees rule out more pathological scenarios — and are correspondingly harder to
        achieve.
      </p>

      <div className="progress-stack">
        <div className="progress-row">
          <div className="progress-name">blocking</div>
          <div className="progress-bar">
            <div style={{ width: '30%', background: 'var(--rose)' }} />
          </div>
          <div className="progress-desc">
            A thread can wait indefinitely. If the holder of a resource crashes or stalls, others
            may be stuck forever. This is the regime mutexes live in.
          </div>
        </div>
        <div className="progress-row">
          <div className="progress-name">lock-free</div>
          <div className="progress-bar">
            <div style={{ width: '65%', background: 'var(--amber)' }} />
          </div>
          <div className="progress-desc">
            At every moment, <em>at least one</em> thread is making progress. Individual threads may
            retry repeatedly (CAS losers), but the system never stalls. Worst-case latency for a
            single thread is unbounded.
          </div>
        </div>
        <div className="progress-row">
          <div className="progress-name">wait-free</div>
          <div className="progress-bar">
            <div style={{ width: '100%', background: 'var(--emerald)' }} />
          </div>
          <div className="progress-desc">
            <em>Every</em> thread completes its operation in a bounded number of steps, regardless
            of what other threads are doing. Hardest to implement, strongest guarantee. Used in
            real-time and high-frequency-trading systems where worst-case matters.
          </div>
        </div>
      </div>

      <p className="prose">
        Most production code is blocking, because mutexes are simple and the worst-case scenarios
        rarely happen. Lock-free shows up in performance-critical paths (queues, ring buffers,
        reference-counted pointers). Wait-free is rare and difficult, but the right choice when a
        hung thread becomes a missed market or a missed deadline.
      </p>

      <h3 className="subhead">
        A word on <em>futex</em>.
      </h3>
      <p className="prose">
        Mutex implementations on modern Linux are built on a primitive called <strong>futex</strong>{' '}
        — fast userspace mutex. The trick: take the fast path entirely in userspace via an atomic
        CAS, and only enter the kernel when there's actually contention (a thread needs to be parked
        or woken). The result is that an uncontended <code>lock()</code>/<code>unlock()</code> pair
        is just two atomic instructions — no system call, no context switch.
      </p>
      <p className="prose">
        Linux gained futex in 2002. Before that, every mutex acquisition was a kernel round-trip;
        modern Java, Rust, Go, and C++ runtimes all benefit from that fast-path design. It is one of
        the most consequential systems-programming inventions of the last 25 years, and almost
        nobody outside kernel hackers has heard of it.
      </p>
    </section>
  );
}
