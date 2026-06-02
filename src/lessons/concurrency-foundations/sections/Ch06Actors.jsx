import { ActorDiagram } from '../components/ActorDiagram.jsx';
import { Code } from '../components/Code.jsx';

export function Ch06Actors() {
  return (
    <section className="section">
      <div className="section-num">06.01 · share by communicating</div>
      <h2 className="section-title">
        A different shape <em>entirely</em>.
      </h2>
      <p className="prose">
        Everything we've covered so far assumes the same fundamental model: threads share memory,
        and synchronization controls who reads or writes when. The actor model walks away from that
        premise. Actors, independent units of execution, own private state. The only way they
        communicate is by sending each other messages.
      </p>

      <ActorDiagram />

      <p className="prose">
        Each actor has a mailbox: a queue of messages waiting to be processed. The queue may be
        bounded or unbounded depending on the runtime, and ordering rules differ at the edges, but
        the core idea is stable: an actor handles one message at a time against its own state. There
        are no locks around that state because it is not shared directly.
      </p>
      <p className="prose">
        Actor systems often compose by spawning other actors and exchanging replies. Many also
        organize those actors under supervision trees, so failure handling becomes part of the
        architecture instead of a scattered afterthought. The point is not that actors make
        concurrency easy; it is that they move the hard parts into message boundaries.
      </p>

      <Code label="elixir · actors are a built-in language feature">
        worker = <span className="fn">spawn</span>(<span className="kw">fn</span> -&gt;{'\n'}
        {'  '}
        <span className="fn">receive</span> <span className="kw">do</span>
        {'\n'}
        {'    '}
        {'{'}
        <span className="str">:work</span>, item, reply_to{'}'} -&gt;{'\n'}
        {'      '}result = <span className="fn">process</span>(item){'\n'}
        {'      '}
        <span className="fn">send</span>(reply_to, {'{'}
        <span className="str">:done</span>, result{'}'}){'\n'}
        {'  '}
        <span className="kw">end</span>
        {'\n'}
        <span className="kw">end</span>){'\n\n'}
        <span className="fn">send</span>(worker, {'{'}
        <span className="str">:work</span>, my_data, <span className="fn">self</span>(){'}'})
      </Code>

      <p className="prose">
        Erlang and its descendant Elixir build entire industries on this. Telecom switches, chat
        backends, distributed databases. Akka brings the model to the JVM. Pony enforces actor
        isolation at the type level. The pattern is unusual in mainstream languages, but in the
        right domain it removes many shared-memory locking bugs by refusing to share the memory in
        the first place.
      </p>
    </section>
  );
}
