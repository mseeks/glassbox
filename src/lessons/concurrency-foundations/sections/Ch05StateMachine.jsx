import { Code } from '../components/Code.jsx';

export function Ch05StateMachine() {
  return (
    <section className="section">
      <div className="section-num">05.02 — what async actually compiles to</div>
      <h2 className="section-title">
        What async functions <em>compile to</em>.
      </h2>
      <p className="prose">
        An async function is not run on a special thread. It's compiled into a state machine. Each{' '}
        <code>await</code> point becomes a state transition; the function's local variables become
        fields of a struct that survives across suspensions.
      </p>

      <Code label="rust · what you write">
        <span className="kw">async fn</span> <span className="fn">fetch_user</span>(id:{' '}
        <span className="kw">u64</span>) -&gt; User {'{'}
        {'\n'}
        {'    '}
        <span className="kw">let</span> row = db.<span className="fn">query</span>(id).
        <span className="kw">await</span>;{'\n'}
        {'    '}
        <span className="kw">let</span> avatar = http.<span className="fn">get</span>(&amp;row.url).
        <span className="kw">await</span>;{'\n'}
        {'    '}User {'{'} row, avatar {'}'}
        {'\n'}
        {'}'}
      </Code>

      <Code label="rust · approximately what the compiler emits">
        <span className="kw">enum</span> FetchUser {'{'}
        {'\n'}
        {'    '}
        <span className="fn">Start</span>(<span className="kw">u64</span>),{' '}
        <span className="cmt">// haven't started yet</span>
        {'\n'}
        {'    '}
        <span className="fn">AwaitingDb</span>(DbFuture),{' '}
        <span className="cmt">// waiting on db.query</span>
        {'\n'}
        {'    '}
        <span className="fn">AwaitingHttp</span>(HttpFuture, Row),{' '}
        <span className="cmt">// waiting on http.get</span>
        {'\n'}
        {'    '}
        <span className="fn">Done</span>,{'\n'}
        {'}'}
        {'\n\n'}
        <span className="cmt">// poll() advances the state machine until it can't progress.</span>
        {'\n'}
        <span className="cmt">
          // When an await would block, poll() returns Pending and the runtime
        </span>
        {'\n'}
        <span className="cmt">
          // schedules something else. When the IO is ready, poll() is called again.
        </span>
      </Code>

      <p className="prose">
        This is a big idea hiding in plain sight. The function's <em>continuation</em> — the code
        that hasn't run yet — is captured as data in a future or task object, often heap-allocated
        by the runtime that schedules it. A single OS thread can be the executor for thousands of
        these state machines, advancing whichever one is ready, going back to sleep when none are.
      </p>
      <p className="prose">
        This was discovered, lost, and rediscovered repeatedly. Lisp had continuations in 1975.
        Python and Ruby had generators in the 2000s. C# added <code>async/await</code> in 2012.
        Today, every language with serious networking runtime has async/await, and they're all doing
        the same trick under the hood.
      </p>
    </section>
  );
}
