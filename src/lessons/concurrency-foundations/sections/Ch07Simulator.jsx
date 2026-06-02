import { Simulator } from '../labs/Simulator.jsx';

export function Ch07Simulator() {
  return (
    <section className="section">
      <div className="section-num">07.02 · under the hood</div>
      <h2 className="section-title">
        Why both reads can be <em>false</em>.
      </h2>

      <div className="mental-model">
        <div className="mental-model-label">Mental model</div>
        <p className="mental-model-body">
          Picture each CPU core as a contractor with a private clipboard. The shared bulletin board
          across the room is main memory. A write gets scribbled on the local clipboard first, fast
          and private, and only walked across the room to the shared bulletin board some time later,
          which is why two contractors can each scribble <span className="ink">"done"</span> on
          their own clipboards, glance at the bulletin board while it is still empty, and conclude
          that nothing is finished. That is the entire bug. The rest of this lesson is just
          precision around it.
        </p>
      </div>

      <p className="prose">
        In CPU terms, the clipboard is called a <strong>store buffer</strong>: a small queue per
        core where writes sit before reaching main memory. Other cores can't see writes still in the
        buffer. The hardware does this on purpose. Writing to memory is slow, so the core moves on
        while the write drains in the background.
      </p>
      <p className="prose">
        Step through the simulator below. Try the manual sequence:{' '}
        <strong>T1 stores → T2 stores → T1 loads → T2 loads → flush both</strong>. You'll discover
        that both threads can read <code>false</code> from a world where both already wrote{' '}
        <code>true</code>. Now flip the toggle to <strong>SeqCst</strong>. Run the very same
        sequence again and watch the both-false outcome become impossible.
      </p>

      <Simulator />

      <p className="prose">
        The bug isn't a hardware defect. It's exactly what relaxed memory models promise:{' '}
        <strong>writes can be reordered with later reads to different addresses</strong>. The store
        buffer is the mechanism. The as-if-serial rule for a single thread is preserved, since each
        thread observes its own writes in order, so the impossibility only ever existed inside your
        mental model. Never inside the machine.
      </p>
    </section>
  );
}
