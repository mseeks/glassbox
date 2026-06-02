import { PARTS } from './PartsData.js';

export function Hero() {
  return (
    <section className="hero">
      <div style={{ maxWidth: '920px', margin: '0 auto', width: '100%' }}>
        <div className="hero-eyebrow">FOUNDATIONS · I–VII</div>
        <h1 className="hero-title">
          From threads
          <br />
          <span className="highlight">to memory models.</span>
        </h1>
        <p className="hero-subtitle">
          Concurrent programs are not hard because there are more lines of code. They are hard for a
          subtler reason. More than one thing can observe the same state at the same time. This
          lesson builds the mental model from the ground up: interleaving, synchronization, async
          runtimes, actors, and finally the memory-ordering rules that make "correct" mean something
          precise.
        </p>

        <div className="toc">
          {PARTS.map((ch, i) => (
            <a key={ch.num} href={`#chapter-${i + 1}`} className="toc-row">
              <div className="toc-num">{ch.num}</div>
              <div className="toc-title">{ch.title}</div>
              <div className="toc-desc">{ch.desc}</div>
            </a>
          ))}
        </div>

        <div className="hero-scroll">↓ scroll to begin</div>
      </div>
    </section>
  );
}
