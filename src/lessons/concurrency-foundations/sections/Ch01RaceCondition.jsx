import { Code } from '../components/Code.jsx';

export function Ch01RaceCondition() {
  return (
    <section className="section">
      <div className="section-num">01.02 — the bug taxonomy</div>
      <h2 className="section-title">
        Race conditions vs <em>data races</em>.
      </h2>
      <p className="prose">
        Both involve timing. Both produce wrong answers. Both have "race" in the name. They are not
        the same thing, and writers who use them interchangeably are losing precision that the rest
        of this lesson depends on.
      </p>

      <div className="compare-grid">
        <div className="defn-card">
          <div className="defn-card-tag">data race</div>
          <div className="defn-card-title">A memory-level fault.</div>
          <p>
            Two threads access the same memory location, at least one access is a write, and no
            synchronization edge orders them.
          </p>
          <p>
            <strong>Status:</strong> undefined behavior in C and C++; prevented by Rust's safe type
            system unless you opt into unsafe code. Other languages define their own rules, but
            tools like ThreadSanitizer can still catch many cases.
          </p>
        </div>
        <div className="defn-card cyan-tag">
          <div className="defn-card-tag">race condition</div>
          <div className="defn-card-title">A logic-level fault.</div>
          <p>
            The program's behavior depends on the timing or interleaving of operations, in a way
            that wasn't intended.
          </p>
          <p>
            <strong>Status:</strong> a correctness bug. The program is well-defined under the
            language standard; it just doesn't do what you want. No tool can find these for you; you
            have to reason about them.
          </p>
        </div>
      </div>

      <p className="prose">
        Every data race is a race condition. Not every race condition is a data race. The classic
        illustration:
      </p>

      <Code label="rust · race condition without a data race">
        <span className="cmt">// counter is an AtomicI32. Atomic ops are NOT data races.</span>
        {'\n'}
        <span className="cmt">// But this is still racy:</span>
        {'\n'}
        <span className="kw">if</span> counter.<span className="fn">load</span>(SeqCst) =={' '}
        <span className="num">0</span> {'{'}
        {'\n'}
        {'    '}counter.<span className="fn">store</span>(initial_value, SeqCst);{'\n'}
        {'}'}
      </Code>

      <p className="prose">
        Two threads can both load <code>0</code>, both pass the <code>if</code>, and both store
        their initial values — overwriting each other. Atomic operations prevent the data race; they
        don't prevent the <em>race condition</em>, because the synchronization didn't span the right
        boundary. The check and the store needed to be one atomic operation (a compare-and-swap),
        not two.
      </p>

      <p className="prose">
        Most of this lesson is about giving you the vocabulary and the primitives to make those
        boundary decisions correctly. The rest of it is about why the boundaries exist in the first
        place — which is what the memory-ordering section gets to.
      </p>
    </section>
  );
}
