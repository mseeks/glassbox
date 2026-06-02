export function Ch03Starvation() {
  return (
    <section className="section">
      <div className="section-num">03.03 — the forgotten thread</div>
      <h2 className="section-title">
        <em>Starvation</em>: never your turn.
      </h2>
      <p className="prose">
        Starvation is the third member of the liveness family, and the subtlest. A thread is
        starving if it's eligible to run but the scheduler keeps choosing other threads. Nothing is
        broken — the program is making progress — but a particular thread is making none.
      </p>
      <p className="prose">
        Two common causes: <strong>unfair locks</strong> (a lock that always wakes the
        most-recently-blocked waiter, leaving long-waiting threads to wait forever) and{' '}
        <strong>priority inversion</strong> (a high-priority thread blocked behind a low-priority
        thread that was holding its lock when a medium-priority thread preempted it).
      </p>

      <div className="pull-quote">
        Mars Pathfinder, 1997: priority inversion caused the rover to repeatedly reset on the
        Martian surface. The fix, uploaded from Earth, was to enable priority inheritance on the
        offending mutex.
      </div>

      <p className="prose">
        Defenses are at the system level: fair scheduling, FIFO mutex queues, priority inheritance
        (when a high-priority thread blocks on a lock, the holder temporarily inherits the high
        priority), or work-stealing schedulers that proactively rebalance load. None of these come
        for free; like everything in concurrency, you choose what to give up.
      </p>
    </section>
  );
}
