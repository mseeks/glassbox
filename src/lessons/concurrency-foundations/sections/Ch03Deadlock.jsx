import { Code } from '../components/Code.jsx';
import { DiningPhilosophersDiagram } from '../components/DiningPhilosophersDiagram.jsx';

export function Ch03Deadlock() {
  return (
    <section className="section">
      <div className="section-num">03.01 — the cycle</div>
      <h2 className="section-title">
        <em>Deadlock</em>: a cycle of waiting.
      </h2>
      <p className="prose">
        Two threads. Two locks. Each thread holds one lock and is waiting on the other. Neither will
        ever proceed. This is deadlock — not a crash, not an error, just permanent silence.
      </p>

      <Code label="the simplest deadlock — two threads, two locks">
        <span className="cmt">// Thread 1 Thread 2</span>
        {'\n'}
        lockA.<span className="fn">lock</span>(); <span className="cmt">{'   //'}</span> lockB.
        <span className="fn">lock</span>();{'\n'}
        lockB.<span className="fn">lock</span>(); <span className="cmt">{'// blocks   //'}</span>{' '}
        lockA.<span className="fn">lock</span>(); <span className="cmt">{'// blocks'}</span>
        {'\n'}
        <span className="cmt">// ... // ...</span>
        {'\n'}
      </Code>

      <p className="prose">
        Edsger Dijkstra packaged this in 1965 as the <strong>dining philosophers</strong>: five
        philosophers around a circular table, one fork between each pair, each philosopher needing
        both adjacent forks to eat. If everyone simultaneously picks up their left fork and waits
        for the right, the table is silent forever.
      </p>

      <DiningPhilosophersDiagram />

      <p className="prose">
        Coffman et al. proved in 1971 that deadlock requires four conditions to hold simultaneously:{' '}
        <em>mutual exclusion</em> (a resource can't be shared), <em>hold and wait</em> (a thread
        holds one while waiting for another), <em>no preemption</em> (locks can't be forcibly
        taken), and <em>circular wait</em> (the wait graph contains a cycle). Break any one and
        deadlock becomes impossible.
      </p>
      <p className="prose">
        The standard fix is the simplest: <strong>lock ordering</strong>. Pick a total order on
        every lock in the program, and require that any thread holding lock A only acquire lock B if
        A &lt; B. The wait graph becomes a DAG, the cycle is impossible, and the philosophers all
        eat in turn. The discipline is unglamorous and surprisingly hard to maintain across a large
        codebase, which is why "use one big mutex and stop trying to be clever" is a survivable
        strategy until contention forces your hand.
      </p>
    </section>
  );
}
