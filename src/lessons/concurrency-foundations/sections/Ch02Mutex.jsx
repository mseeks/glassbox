import { Code } from '../components/Code.jsx';

export function Ch02Mutex() {
  return (
    <section className="section">
      <div className="section-num">02.01 · mutual exclusion</div>
      <h2 className="section-title">
        The mutex, plain and <em>literal</em>.
      </h2>
      <p className="prose">
        A mutex is a permission slip. At any moment, exactly one thread holds it; everyone else
        waits. The thread that holds the mutex executes its critical section in peace, then returns
        the slip and lets someone else have a turn.
      </p>

      <Code label="rust · the canonical critical section">
        <span className="kw">let</span> guard = mutex.<span className="fn">lock</span>().
        <span className="fn">unwrap</span>();{' '}
        <span className="cmt">// acquire — waits if held</span>
        {'\n'}
        <span className="cmt">// inside this block, guard owns the data exclusively</span>
        {'\n'}
        guard.balance += amount;{'\n'}
        <span className="cmt">// guard goes out of scope here → unlock</span>
        {'\n'}
      </Code>

      <p className="prose">
        Two operations matter: <strong>acquire</strong> (a thread asks for the lock and waits if
        needed) and <strong>release</strong> (the holder hands it back, possibly waking a waiter).
        Everything between is the <em>critical section</em>. That is the code guaranteed to execute
        without interference.
      </p>
      <p className="prose">
        This guarantee comes at a cost. Real mutexes usually try a fast path first, maybe even
        spinning briefly in userspace, but under contention the kernel may park the waiter and run
        another thread. When the mutex is released, a parked waiter has to be woken. That round-trip
        is fast on modern systems but not free. And contention, many threads queueing on one mutex,
        is one of the most common performance problems in concurrent code.
      </p>
      <p className="prose">
        The deepest property of a mutex is what we'll meet again in the memory-ordering section:
        lock-and-unlock on the same mutex creates a <em>happens-before</em> edge between the
        previous holder and the next. Anything written before <code>unlock()</code> is guaranteed
        visible to the thread that next runs <code>lock()</code>. This is why "use a mutex" is the
        standard advice. It solves both atomicity and visibility in one move.
      </p>
    </section>
  );
}
