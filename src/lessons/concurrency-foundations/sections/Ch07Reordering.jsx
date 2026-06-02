import { useState } from 'react';

export function Ch07Reordering() {
  const [reordered, setReordered] = useState(false);

  return (
    <section className="section">
      <div className="section-num">07.03 · reordering</div>
      <h2 className="section-title">
        Two layers of <em>rewriting</em>, both invisible.
      </h2>
      <p className="prose">
        Store buffers are only half the story. Even before your code reaches the CPU, the{' '}
        <strong>compiler</strong> may have already rewritten it, moving instructions around for
        better register allocation, cache behavior, or pipeline efficiency. Both compiler and CPU
        follow the same rule: preserve the program's behavior{' '}
        <em>as observed by a single thread</em>. Cross-thread observations are not protected.
      </p>

      <div className="reorder">
        <div className="reorder-card">
          <div className="reorder-card-label">source code · what you wrote</div>
          <div className="reorder-line">
            <span className="lnum">1</span>
            {'data = compute_result()'}
          </div>
          <div className="reorder-line">
            <span className="lnum">2</span>
            {'flag = true'}
          </div>
        </div>
        <div className="reorder-arrow">
          <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
            <path
              d="M2 12 H32 M28 6 L34 12 L28 18"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          compiler
        </div>
        <div className="reorder-card">
          <div className="reorder-card-label">emitted assembly · maybe</div>
          <div className={`reorder-line ${reordered ? 'swapped' : ''}`}>
            <span className="lnum">{reordered ? '2' : '1'}</span>
            {reordered ? 'flag = true' : 'data = compute_result()'}
          </div>
          <div className={`reorder-line ${reordered ? 'swapped' : ''}`}>
            <span className="lnum">{reordered ? '1' : '2'}</span>
            {reordered ? 'data = compute_result()' : 'flag = true'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0 2rem' }}>
        <button
          className="btn primary"
          onClick={() => setReordered(!reordered)}
          aria-pressed={reordered}
        >
          {reordered ? 'Restore source order' : 'Let compiler reorder'}
        </button>
      </div>

      <p className="prose">
        From your single thread's perspective, both versions are identical. By the end,{' '}
        <code>data</code> holds the result and <code>flag</code> is true. The compiler is free to
        choose. But another thread spinning on <code>flag</code> and then reading <code>data</code>{' '}
        sees the difference: in the reordered version, it can see <code>flag == true</code> while{' '}
        <code>data</code> is still empty.
      </p>

      <div className="pull-quote">
        Optimizers preserve what one thread sees. Memory models govern what other threads see.
      </div>
    </section>
  );
}
