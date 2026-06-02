import { PatternDiagram } from '../components/PatternDiagram.jsx';

export function Ch04PubSub() {
  return (
    <section className="section">
      <div className="section-num">04.04 · broadcast</div>
      <h2 className="section-title">
        Pub-sub: one to <em>many</em>.
      </h2>
      <p className="prose">
        Sometimes a piece of work has no specific consumer. Every interested subscriber should see
        it. Pub-sub is the pattern for that case: publishers post to a topic, the system fans the
        message out to every current subscriber, and subscribers come and go without the publisher
        ever knowing they exist.
      </p>

      <PatternDiagram pattern="pub-sub" />

      <p className="prose">
        The hard problems are all on the subscriber side. What happens to a slow subscriber? You can
        buffer for them, drop messages, or disconnect them. What happens when a subscriber dies? You
        can replay missed messages, or just resume from now. Different systems answer differently:
        Kafka durably logs and lets subscribers seek; ZeroMQ drops; Redis Pub/Sub is
        fire-and-forget. The pattern never changes. The policy is the entire engineering problem.
      </p>
    </section>
  );
}
