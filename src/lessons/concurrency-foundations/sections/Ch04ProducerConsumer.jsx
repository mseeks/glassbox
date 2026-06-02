import { Code } from '../components/Code.jsx';
import { PatternDiagram } from '../components/PatternDiagram.jsx';

export function Ch04ProducerConsumer() {
  return (
    <section className="section">
      <div className="section-num">04.01 — the bounded buffer</div>
      <h2 className="section-title">
        Producers and <em>consumers</em>.
      </h2>
      <p className="prose">
        The most fundamental shape: one or more threads produce work, one or more threads consume
        it, and a buffer between them absorbs the speed mismatch. When the buffer is full, producers
        wait. When it's empty, consumers wait. The buffer is the synchronization.
      </p>

      <PatternDiagram pattern="producer-consumer" />

      <Code label="go · producer-consumer with a channel">
        ch := <span className="fn">make</span>(<span className="kw">chan</span> Work,{' '}
        <span className="num">100</span>) <span className="cmt">// buffer of 100</span>
        {'\n\n'}
        <span className="cmt">// Producer</span>
        {'\n'}
        <span className="kw">go</span> <span className="kw">func</span>() {'{'}
        {'\n'}
        {'    '}
        <span className="kw">for</span> _, item := <span className="kw">range</span> source {'{'}
        {'\n'}
        {'        '}ch &lt;- item <span className="cmt">// blocks if buffer full</span>
        {'\n'}
        {'    '}
        {'}'}
        {'\n'}
        {'    '}
        <span className="fn">close</span>(ch) <span className="cmt">// signal "done"</span>
        {'\n'}
        {'}'}();{'\n\n'}
        <span className="cmt">// Consumer</span>
        {'\n'}
        <span className="kw">for</span> item := <span className="kw">range</span> ch {'{'}
        {'\n'}
        {'    '}
        <span className="fn">process</span>(item){' '}
        <span className="cmt">// blocks if buffer empty</span>
        {'\n'}
        {'}'}
      </Code>

      <p className="prose">
        Choosing the buffer size is a real engineering decision. Zero (synchronous handoff) gives
        lockstep coordination but no decoupling. Too small leaks producer stalls into the consumer.
        Too large lets work pile up and hides backpressure when the consumer is falling behind.
        There's no universally right answer; the question is how much decoupling you want, and how
        much memory you'll spend on it.
      </p>
    </section>
  );
}
