import { Code } from '../components/Code.jsx';

export function Ch04Select() {
  return (
    <section className="section">
      <div className="section-num">04.05 · the unifying primitive</div>
      <h2 className="section-title">
        Go's <em>select</em>: composing channels.
      </h2>
      <p className="prose">
        All of the above patterns are special cases of "wait on multiple things, do whichever is
        ready first." Go elevates that into a first-class language construct:
      </p>

      <Code label="go · select waits on whichever channel is ready">
        <span className="kw">select</span> {'{'}
        {'\n'}
        <span className="kw">case</span> work := &lt;-jobs:{'\n'}
        {'    '}
        <span className="fn">process</span>(work){'\n'}
        <span className="kw">case</span> result := &lt;-feedback:{'\n'}
        {'    '}
        <span className="fn">handle</span>(result){'\n'}
        <span className="kw">case</span> &lt;-time.<span className="fn">After</span>(
        <span className="num">5</span> * time.Second):{'\n'}
        {'    '}
        <span className="fn">timeout</span>(){'\n'}
        <span className="kw">case</span> &lt;-ctx.<span className="fn">Done</span>():{'\n'}
        {'    '}
        <span className="kw">return</span> ctx.<span className="fn">Err</span>(){'\n'}
        {'}'}
      </Code>

      <p className="prose">
        With <code>select</code>, timeouts and cancellation become the same shape as message
        receiving. No separate timer thread. A pipeline stage selects between its input channel, a
        context done channel, and a timer channel, and the cases compete: whichever fires first
        wins, and the others stay armed for next time around.
      </p>
      <p className="prose">
        Other languages have analogues. Erlang has <code>receive</code>, Rust has{' '}
        <code>tokio::select!</code>, and JavaScript leans on <code>Promise.race</code> for
        promise-level coordination. Go's version is unusual for being equally idiomatic at the
        language level. The pattern of "many sources, one synchronizer" is concurrency's most
        reusable shape, and <code>select</code> is its most direct expression.
      </p>
    </section>
  );
}
