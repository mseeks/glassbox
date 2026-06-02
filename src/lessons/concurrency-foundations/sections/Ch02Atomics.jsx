import { Code } from '../components/Code.jsx';

export function Ch02Atomics() {
  return (
    <section className="section">
      <div className="section-num">02.03 — atomicity</div>
      <h2 className="section-title">
        Below the lock, the <em>indivisible</em>.
      </h2>
      <p className="prose">
        An atomic operation is one the hardware cannot tear in half. A normal write to a 64-bit
        integer on a 32-bit machine isn't atomic — another thread can read after the first 32 bits
        update but before the second. An atomic store guarantees the read sees either the old value
        or the new value, never a Frankenstein.
      </p>
      <p className="prose">Atomicity comes in three flavors:</p>

      <div className="atomic-flavors">
        <div className="atomic-flavor">
          <div className="atomic-flavor-name">load</div>
          <div className="atomic-flavor-desc">Read a value indivisibly.</div>
        </div>
        <div className="atomic-flavor">
          <div className="atomic-flavor-name">store</div>
          <div className="atomic-flavor-desc">Write a value indivisibly.</div>
        </div>
        <div className="atomic-flavor">
          <div className="atomic-flavor-name">read-modify-write</div>
          <div className="atomic-flavor-desc">
            Read, transform, write — all without another thread sneaking in. <code>fetch_add</code>,{' '}
            <code>compare_exchange</code>, <code>swap</code>.
          </div>
        </div>
      </div>

      <p className="prose">
        The most important RMW is <strong>compare-and-swap</strong> (CAS): "if this location
        currently holds X, replace it with Y, atomically; otherwise tell me what it actually holds,
        and I'll try again."
      </p>

      <Code label="rust · a lock-free counter built from CAS">
        <span className="kw">loop</span> {'{'}
        {'\n'}
        {'    '}
        <span className="kw">let</span> current = counter.<span className="fn">load</span>(Relaxed);
        {'\n'}
        {'    '}
        <span className="kw">let</span> next = current + <span className="num">1</span>;{'\n'}
        {'    '}
        <span className="kw">match</span> counter.<span className="fn">compare_exchange</span>
        (current, next, Relaxed, Relaxed) {'{'}
        {'\n'}
        {'        '}
        <span className="fn">Ok</span>(_) =&gt; <span className="kw">break</span>,{' '}
        <span className="cmt">// we won the race</span>
        {'\n'}
        {'        '}
        <span className="fn">Err</span>(_) =&gt; <span className="kw">continue</span>,{' '}
        <span className="cmt">// someone beat us; retry</span>
        {'\n'}
        {'    '}
        {'}'}
        {'\n'}
        {'}'}
      </Code>

      <p className="prose">
        This loop is the basic shape behind many lock-free data structures. CAS is the universal RMW
        primitive: any concurrent algorithm that can be written with locks can, in principle, be
        rewritten in terms of CAS. For this pure counter, <code>Relaxed</code> is enough because the
        counter is not publishing any other data. Queues, pointers, and handoff protocols usually
        need stronger ordering.
      </p>
      <p className="prose">
        The price is complexity: handling the retry case correctly is famously difficult. The payoff
        is contention behavior that a mutex may not be able to match, when you truly need it.
      </p>
    </section>
  );
}
