import { Code } from '../components/Code.jsx';

export function Ch03Livelock() {
  return (
    <section className="section">
      <div className="section-num">03.02 — politeness deadlock</div>
      <h2 className="section-title">
        <em>Livelock</em>: motion without progress.
      </h2>
      <p className="prose">
        Two people in a narrow hallway, walking toward each other. You step left to let them pass;
        they step right to let you pass. You both step back. You both step the other way. Repeat
        forever. No one is stuck — everyone is moving — but no one is getting anywhere.
      </p>
      <p className="prose">
        Livelock in code looks the same. Two threads, both detecting potential conflict, both
        backing off "politely." Both retrying. Both backing off again. The system burns CPU making
        perfectly correct local decisions and accomplishing nothing globally.
      </p>

      <Code label="naive optimistic locking — vulnerable to livelock">
        <span className="kw">loop</span> {'{'}
        {'\n'}
        {'    '}
        <span className="kw">if</span> conflict_detected() {'{'}
        {'\n'}
        {'        '}release_my_resources(); <span className="cmt">// "you go first"</span>
        {'\n'}
        {'        '}reacquire_resources();{' '}
        <span className="cmt">// the other thread does the same</span>
        {'\n'}
        {'        '}
        <span className="kw">continue</span>;{'\n'}
        {'    '}
        {'}'}
        {'\n'}
        {'    '}do_work();{'\n'}
        {'    '}
        <span className="kw">break</span>;{'\n'}
        {'}'}
      </Code>

      <p className="prose">
        The fix breaks the symmetry. Instead of always backing off, threads back off for a{' '}
        <em>random</em> amount of time before retrying. Two threads picking different random delays
        will desynchronize within a few rounds, and one will get through. This is exactly why
        ethernet uses randomized exponential backoff for collision resolution — same problem,
        different layer.
      </p>
    </section>
  );
}
