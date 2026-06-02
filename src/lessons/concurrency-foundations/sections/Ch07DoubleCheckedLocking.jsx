import { useState } from 'react';
import { Code } from '../components/Code.jsx';

export function Ch07DoubleCheckedLocking() {
  const [fixed, setFixed] = useState(false);

  return (
    <section className="section">
      <div className="section-num">07.05 — in the wild</div>
      <h2 className="section-title">
        Double-checked locking, and why it <em>broke</em>.
      </h2>
      <p className="prose">
        For two decades, this Java idiom was the textbook pattern for thread-safe lazy
        initialization. It was also subtly wrong: a thread could observe a non-null reference before
        the object's constructor writes were safely visible.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'flex-end',
          margin: '1.5rem 0 0.75rem',
        }}
      >
        <div
          className="mode-toggle"
          style={{ padding: '4px' }}
          role="group"
          aria-label="Double-checked locking variant"
        >
          <button
            className={`mode-btn ${!fixed ? 'active' : ''}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.78rem' }}
            aria-pressed={!fixed}
            onClick={() => setFixed(false)}
          >
            Broken
          </button>
          <button
            className={`mode-btn ${fixed ? 'active' : ''}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.78rem' }}
            aria-pressed={fixed}
            onClick={() => setFixed(true)}
          >
            Fixed
          </button>
        </div>
      </div>

      <Code label={fixed ? 'java · with volatile' : 'java · the classic bug'}>
        <span className="kw">class</span> <span className="fn">Singleton</span> {'{'}
        {'\n'}
        {'    '}
        <span className="kw">private static</span>{' '}
        {fixed ? (
          <span
            className="kw"
            style={{
              background: 'rgba(110,231,183,0.15)',
              padding: '1px 5px',
              borderRadius: '3px',
            }}
          >
            volatile
          </span>
        ) : (
          <span
            style={{
              textDecoration: 'line-through',
              textDecorationColor: 'var(--rose)',
              color: 'var(--ink-faint)',
            }}
          >
            volatile
          </span>
        )}{' '}
        <span className="fn">Singleton</span> instance;{'\n\n'}
        {'    '}
        <span className="kw">static</span> <span className="fn">Singleton</span>{' '}
        <span className="fn">getInstance</span>() {'{'}
        {'\n'}
        {'        '}
        <span className="kw">if</span> (instance == <span className="kw">null</span>) {'{'}{' '}
        <span className="cmt">{'// (1) fast path, no lock'}</span>
        {'\n'}
        {'            '}
        <span className="kw">synchronized</span> (<span className="fn">Singleton</span>.
        <span className="kw">class</span>) {'{'}
        {'\n'}
        {'                '}
        <span className="kw">if</span> (instance == <span className="kw">null</span>) {'{'}
        {'\n'}
        {'                    '}instance = <span className="kw">new</span>{' '}
        <span className="fn">Singleton</span>();{' '}
        <span className="cmt">{fixed ? '// (2) the publication' : '// (2) the bug'}</span>
        {'\n'}
        {'                '}
        {'}'}
        {'\n'}
        {'            '}
        {'}'}
        {'\n'}
        {'        '}
        {'}'}
        {'\n'}
        {'        '}
        <span className="kw">return</span> instance;{'\n'}
        {'    '}
        {'}'}
        {'\n'}
        {'}'}
      </Code>

      <p className="prose">
        The bug hides in line (2). <code>new Singleton()</code> looks atomic, but the JVM and CPU
        are free to break it into three steps and reorder them:
      </p>

      <div className="dcl-steps">
        <div className="dcl-step">
          <span className="dcl-step-letter">a</span>
          <span className="dcl-step-text">Allocate storage for the object</span>
        </div>
        <div className="dcl-step">
          <span className="dcl-step-letter">b</span>
          <span className="dcl-step-text">Run the constructor (initialize fields)</span>
        </div>
        <div className="dcl-step">
          <span className="dcl-step-letter">c</span>
          <span className="dcl-step-text">
            Store the address into <code>instance</code>
          </span>
        </div>
      </div>

      <p className="prose">
        In source order this is <strong>a → b → c</strong>. The compiler is allowed to reorder to{' '}
        <strong>a → c → b</strong> because, in the writing thread, the result is the same: by the
        time the publishing thread uses <code>instance</code>, the object exists.
      </p>
      <p className="prose">
        But thread 2, hitting the fast path on line (1), reads <code>instance</code>{' '}
        <em>between</em> c and b. It sees a non-null pointer to an object whose constructor has not
        safely published its fields. The next method call may see default values, broken invariants,
        or a surprising <code>NullPointerException</code>. The failure is not mystical; the
        reference became visible before the state it was supposed to protect.
      </p>

      <div className="pull-quote">
        The store of the pointer was reordered before the writes that should have preceded it. This
        is the simulator's bug, in production code.
      </div>

      <p className="prose">
        The fix is one keyword: <code>volatile</code>. Click <strong>Fixed</strong> above to see it.
        In Java, <code>volatile</code> makes the store a <strong>release</strong> and the load an{' '}
        <strong>acquire</strong> — the same arrow you watched form in the timeline. The
        constructor's writes are now guaranteed visible before any thread observes a non-null
        pointer. The bug closes.
      </p>
      <p className="prose">
        The same mechanism wears different names in different languages: <code>volatile</code> in
        Java, <code>std::atomic</code> with <code>memory_order_release/acquire</code> in C++,{' '}
        <code>AtomicReference.setRelease/getAcquire</code> in modern Java APIs, ordered atomic
        operations on <code>Arc&lt;T&gt;</code> in Rust. Different syntax, identical happens-before
        edges.
      </p>
    </section>
  );
}
