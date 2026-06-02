import React from 'react';

export function Coda() {
  const insights = [
    {
      key: 'shared',
      title: 'Most hard bugs live at sharing boundaries',
      body: (
        <React.Fragment>
          Race conditions, deadlocks, livelocks, lost updates, torn reads — they all get easier to
          create when more than one thread of execution touches the same state without a clear
          discipline for who touches when. Actors reduce that surface area; they do not remove the
          need for design.
        </React.Fragment>
      ),
    },
    {
      key: 'tools',
      title: 'There is a hierarchy of tools',
      body: (
        <React.Fragment>
          Mutexes, semaphores, atomics, channels, async tasks, actors. Each lives at a different
          point on the tradeoff curve between simplicity, performance, and isolation. The skill
          isn't memorizing them; it's recognizing which tool the problem is already asking for.
        </React.Fragment>
      ),
    },
    {
      key: 'edges',
      title: 'happens-before is the foundation',
      body: (
        <React.Fragment>
          The guarantees you rely on — that the mutex actually protects what it protects, that the
          channel actually delivers what it sent, that the actor actually sees the message — bottom
          out at <em>happens-before</em> edges in the memory model. Those arrows are where
          visibility becomes something you can reason about instead of something you hope for.
        </React.Fragment>
      ),
    },
  ];

  return (
    <section className="section section-coda">
      <div className="section-num">coda</div>
      <h2 className="section-title">
        What you can now <em>see</em>.
      </h2>
      <p className="prose">
        Concurrency is hard because programs that share state can be observed in inconsistent ways.
        Every primitive in this lesson — mutexes, atomics, channels, async tasks, actors, and memory
        orderings — is a way of saying which observations are allowed, which are forbidden, and who
        gets to decide.
      </p>

      <div className="closing-grid">
        {insights.map((it, i) => (
          <div className="closing-card" key={it.key}>
            <div className="closing-num">{['I', 'II', 'III'][i]}</div>
            <div className="closing-card-title">{it.title}</div>
            <div className="closing-card-body">{it.body}</div>
          </div>
        ))}
      </div>

      <p className="prose">
        Concurrency is not a sub-discipline of programming so much as a precise vocabulary for
        talking about what programs <em>actually do</em>, as opposed to what they look like they're
        doing. Most production code mercifully never needs to descend into the depths you've now
        visited. But when an "impossible" bug surfaces, you'll recognize the terrain immediately,
        and you'll know which floor of the building it lives on.
      </p>

      <div className="pull-quote" style={{ borderLeftColor: 'var(--cyan)', maxWidth: '38rem' }}>
        Modern hardware is fast because it doesn't synchronize. Modern software is correct because
        it knows where, exactly, to ask it to.
      </div>
    </section>
  );
}
