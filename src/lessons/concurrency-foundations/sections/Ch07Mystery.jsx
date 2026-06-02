import { useState } from 'react';
import { Code } from '../components/Code.jsx';

export function Ch07Mystery() {
  const [pick, setPick] = useState(null);

  const options = [
    { key: 'no', label: 'No, impossible', tagline: 'at least one must see the other' },
    { key: 'yes', label: 'Yes, possible', tagline: 'both can return false' },
  ];

  return (
    <section className="section">
      <div className="section-num">07.01 · the mystery</div>
      <h2 className="section-title">
        A puzzle, before <em>theory</em>.
      </h2>
      <p className="prose">
        Two threads start at the same instant, each running two lines. Both globals begin{' '}
        <code>false</code>. There are no locks, no synchronization, no clever tricks. Just plain
        atomic stores and loads.
      </p>

      <Code label="rust · racing two atomics">
        <span className="cmt">// Both X and Y start as false.</span>
        {'\n'}
        <span className="kw">static</span> <span className="var">X</span>:{' '}
        <span className="fn">AtomicBool</span> = <span className="fn">AtomicBool</span>::
        <span className="fn">new</span>(<span className="kw">false</span>);{'\n'}
        <span className="kw">static</span> <span className="var">Y</span>:{' '}
        <span className="fn">AtomicBool</span> = <span className="fn">AtomicBool</span>::
        <span className="fn">new</span>(<span className="kw">false</span>);{'\n\n'}
        <span className="cmt">// Thread 1 Thread 2</span>
        {'\n'}
        <span className="var">X</span>.<span className="fn">store</span>(
        <span className="kw">true</span>, Relaxed); <span className="cmt">{'   //'}</span>{' '}
        <span className="var">Y</span>.<span className="fn">store</span>(
        <span className="kw">true</span>, Relaxed);{'\n'}
        <span className="kw">let</span> <span className="var">r1</span> ={' '}
        <span className="var">Y</span>.<span className="fn">load</span>(Relaxed);{' '}
        <span className="cmt">{'  //'}</span> <span className="kw">let</span>{' '}
        <span className="var">r2</span> = <span className="var">X</span>.
        <span className="fn">load</span>(Relaxed);
      </Code>

      <p className="prose">
        Both threads <strong>write first, then read</strong>. So at least one thread's write must
        happen before the other's read, and whichever thread goes first ought to have its write
        sitting there in memory for the other thread to see. Right?
      </p>

      <div className="quiz">
        <div className="quiz-q">
          After both threads finish, can <code>r1</code> and <code>r2</code> <em>both</em> be{' '}
          <code>false</code>?
        </div>
        <div className="quiz-options">
          {options.map((opt) => {
            let cls = 'quiz-btn';
            if (pick === opt.key) cls += opt.key === 'yes' ? ' correct' : ' wrong';
            return (
              <button
                key={opt.key}
                className={cls}
                onClick={() => setPick(opt.key)}
                aria-pressed={pick === opt.key}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{opt.label}</div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    opacity: 0.7,
                    marginTop: '3px',
                    fontFamily: 'Manrope, sans-serif',
                  }}
                >
                  {opt.tagline}
                </div>
              </button>
            );
          })}
        </div>
        {pick && (
          <div className="quiz-reveal">
            {pick === 'yes' ? (
              <span>
                <strong>Correct, and unsettling.</strong> Both reads can return <code>false</code>,
                even though both threads wrote <code>true</code> first. Most engineers correctly
                protest that this should be impossible; the next sections show you the machinery
                that makes it routine.
              </span>
            ) : (
              <span>
                <strong>The intuition is reasonable, but wrong.</strong> Both reads <em>can</em>{' '}
                return <code>false</code>. Even though both threads wrote <code>true</code> before
                reading, neither thread is guaranteed to see the other's write. The next sections
                show you exactly why.
              </span>
            )}
          </div>
        )}
      </div>

      <p className="prose">
        Try predicting before you scroll. The lesson is more vivid when the mystery is sharpened
        first.
      </p>
    </section>
  );
}
