import { Lock, Shield, Zap } from 'lucide-react';

function GuidanceLine({ icon, title, body }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '1rem 1.25rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ color: 'var(--amber)', marginTop: '3px', flexShrink: 0 }}>{icon}</div>
      <div>
        <div
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '1.05rem',
            color: 'var(--ink)',
            marginBottom: '0.25rem',
            fontWeight: 500,
          }}
        >
          {title}
        </div>
        <div style={{ color: 'var(--ink-dim)', fontSize: '0.92rem', lineHeight: 1.6 }}>{body}</div>
      </div>
    </div>
  );
}

export function Ch07Reference() {
  return (
    <section className="section">
      <div className="section-num">07.06 · the orderings</div>
      <h2 className="section-title">
        Three flavors of <em>guarantee</em>.
      </h2>
      <p className="prose">
        Languages with explicit atomics let you choose how strong an ordering each operation emits.
        Stronger orderings are slower (more synchronization between cores) but easier to reason
        about. Weaker orderings are faster but require carefully designed protocols.
      </p>

      <div className="ref-grid">
        <div className="ref-card relaxed">
          <div className="ref-card-tag">weakest · fastest</div>
          <div className="ref-card-name">Relaxed</div>
          <div className="ref-card-desc">
            Atomicity only. The operation itself is indivisible, but the compiler and CPU may
            reorder anything around it. No happens-before edges created.
          </div>
          <div className="ref-card-when">
            <strong>Use when:</strong> a pure counter where you only care about the final count, not
            when others observe it relative to other writes.
          </div>
        </div>

        <div className="ref-card acqrel">
          <div className="ref-card-tag">workhorse pair</div>
          <div className="ref-card-name">Acquire / Release</div>
          <div className="ref-card-desc">
            Release on a store publishes everything that came before it in the same thread. Acquire
            on a load that sees the released value receives those writes. Forms a cross-thread arrow
            only between matched pairs.
          </div>
          <div className="ref-card-when">
            <strong>Use when:</strong> implementing a lock, queue, or any "publish data, then signal
            ready" pattern in performance-sensitive code.
          </div>
        </div>

        <div className="ref-card seqcst">
          <div className="ref-card-tag">strongest default</div>
          <div className="ref-card-name">SeqCst</div>
          <div className="ref-card-desc">
            All SeqCst operations across all threads agree on a single global order. Matches the
            naive "interleaved instructions" mental model more closely than weaker orderings. It can
            require stronger fences, especially on weakly ordered hardware.
          </div>
          <div className="ref-card-when">
            <strong>Use when:</strong> in doubt. It costs more than weaker orderings in some hot
            paths, but it buys a simpler correctness story.
          </div>
        </div>
      </div>

      <div className="divider" />

      <h3
        style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 400,
          fontSize: '1.5rem',
          color: 'var(--ink)',
          margin: '1rem 0 0.5rem',
          letterSpacing: '-0.005em',
        }}
      >
        Sources of happens-before
      </h3>
      <p className="prose" style={{ marginBottom: '1.25rem' }}>
        Within one thread, source order gives you happens-before for free. Across threads, every
        cross-thread guarantee comes from one of these primitives. Anything else is a hopeful guess.
      </p>

      <div className="hb-grid">
        <div className="hb-row">
          <span className="hb-from">mutex unlock</span>
          <span className="hb-arrow">⟶</span>
          <span className="hb-to">next lock</span>
          <span className="hb-note">same mutex</span>
        </div>
        <div className="hb-row">
          <span className="hb-from">atomic release-store</span>
          <span className="hb-arrow">⟶</span>
          <span className="hb-to">acquire-load</span>
          <span className="hb-note">that observes the released value</span>
        </div>
        <div className="hb-row">
          <span className="hb-from">channel send</span>
          <span className="hb-arrow">⟶</span>
          <span className="hb-to">matching receive</span>
          <span className="hb-note">Go, Rust mpsc, etc.</span>
        </div>
        <div className="hb-row">
          <span className="hb-from">volatile write</span>
          <span className="hb-arrow">⟶</span>
          <span className="hb-to">subsequent volatile read</span>
          <span className="hb-note">
            Java <code>volatile</code>; C/C++ atomics need explicit orderings
          </span>
        </div>
        <div className="hb-row">
          <span className="hb-from">Thread.start()</span>
          <span className="hb-arrow">⟶</span>
          <span className="hb-to">first instruction</span>
          <span className="hb-note">in the spawned thread</span>
        </div>
        <div className="hb-row">
          <span className="hb-from">last instruction</span>
          <span className="hb-arrow">⟶</span>
          <span className="hb-to">Thread.join()</span>
          <span className="hb-note">whoever waits sees everything that finished</span>
        </div>
      </div>

      <p className="prose">
        These compose: an arrow from A to B and from B to C gives you A to C. A whole program is a
        graph of these edges, and "thread-safe" really means "every fact that needs to be observed
        across threads is reachable through these arrows."
      </p>

      <div className="divider" />

      <h3
        style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 400,
          fontSize: '1.5rem',
          color: 'var(--ink)',
          margin: '1rem 0 1rem',
          letterSpacing: '-0.005em',
        }}
      >
        Practical guidance
      </h3>

      <div style={{ display: 'grid', gap: '0.75rem', margin: '1.25rem 0 2rem' }}>
        <GuidanceLine
          icon={<Lock size={14} />}
          title="Use a mutex."
          body="Lock = acquire, unlock = release. Done. This handles 95% of real-world synchronization correctly without a single line of memory-ordering code."
        />
        <GuidanceLine
          icon={<Zap size={14} />}
          title="If atomics, default to SeqCst."
          body="It's slower, but it matches your intuition. Switch to Acquire/Release only when profiling proves SeqCst is the bottleneck."
        />
        <GuidanceLine
          icon={<Shield size={14} />}
          title="Use Relaxed only when ordering truly does not matter."
          body="Statistics and metrics counters are good examples. Reference-counting and destruction paths often need acquire/release edges, so do not treat Relaxed as a blanket performance upgrade."
        />
      </div>

      <p className="prose">
        Memory models are a rabbit hole that production code rarely needs to descend into. The
        framework here (store buffers, reordering, happens-before) is enough to recognize when
        you've wandered into the territory and to know what tools exist when you do.
      </p>
    </section>
  );
}
