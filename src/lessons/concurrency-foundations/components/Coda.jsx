import React from 'react';

import LessonLink from '../../../shared/LessonLink.jsx';

const NEXT = [
  {
    key: 'memory-models',
    num: 'I',
    title: 'Hardware memory models',
    body: (
      <React.Fragment>
        Drop below <em>happens-before</em> to where it is enforced: x86&apos;s strong TSO, ARM and
        RISC-V&apos;s weak ordering, and the fences a compiler emits to bridge them. Same source,
        very different arrows.
      </React.Fragment>
    ),
  },
  {
    key: 'lock-free',
    num: 'II',
    title: 'Lock-free data structures',
    body: (
      <React.Fragment>
        Treiber stacks, Michael&ndash;Scott queues, and the ABA problem. What it costs to let many
        threads observe and mutate a structure with no lock holding the line.
      </React.Fragment>
    ),
  },
  {
    key: 'consensus',
    num: 'III',
    title: 'Distributed consensus',
    body: (
      <React.Fragment>
        The same question across machines instead of threads: which observations of a shared value
        are allowed when the wire can drop, delay, and reorder.{' '}
        <LessonLink to="paxos">Paxos</LessonLink> and Raft are the canonical answers.
      </React.Fragment>
    ),
  },
  {
    key: 'formal',
    num: 'IV',
    title: 'Formal verification',
    body: (
      <React.Fragment>
        TLA+ and model checking let you state &ldquo;which interleavings are allowed&rdquo; as an
        invariant and have a machine search for the one that breaks it &mdash; the bug you would
        otherwise meet in production.
      </React.Fragment>
    ),
  },
];

export function Coda() {
  return (
    <section className="section section-coda">
      <div className="section-num">coda</div>
      <h2 className="section-title">
        What you can now <em>see</em>.
      </h2>
      <p className="prose">
        Concurrency is hard for one reason. Programs that share state can be observed in
        inconsistent ways. Every primitive in this lesson is a way of saying which observations are
        allowed, which are forbidden, and who gets to decide. Mutexes, atomics, channels, async
        tasks, actors, memory orderings: each one draws that line somewhere.
      </p>

      <div className="cc-one-idea">
        <div className="cc-one-idea-label">The one idea</div>
        <p className="cc-one-idea-body">
          Every synchronization primitive &mdash; mutex, atomic, channel, actor &mdash; is one
          answer to a single question:{' '}
          <em>
            which observations across threads are allowed, which are forbidden, and who decides.
          </em>{' '}
          Underneath them all sit <em>happens-before</em> edges; the arrows are where visibility
          stops being something you hope for and becomes something you can reason about. The shape
          of those answers <em>is</em> whether your program is correct.
        </p>
      </div>

      <p className="prose">
        Most production code mercifully never descends into the depths you&apos;ve now visited. But
        the depths are real. When an &ldquo;impossible&rdquo; bug surfaces, you&apos;ll recognize
        the terrain immediately, and you&apos;ll know which floor of the building it lives on.
      </p>

      <p className="section-num" style={{ marginTop: '2.5rem' }}>
        where to go next
      </p>
      <div className="closing-grid">
        {NEXT.map((it) => (
          <div className="closing-card" key={it.key}>
            <div className="closing-num">{it.num}</div>
            <div className="closing-card-title">{it.title}</div>
            <div className="closing-card-body">{it.body}</div>
          </div>
        ))}
      </div>

      <div className="pull-quote" style={{ borderLeftColor: 'var(--cyan)', maxWidth: '38rem' }}>
        Modern hardware is fast because it doesn&apos;t synchronize. Modern software is correct
        because it knows where, exactly, to ask it to.
      </div>
    </section>
  );
}
