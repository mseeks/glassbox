import './concurrency-foundations.css';

import { ChapterHeader } from './components/ChapterHeader.jsx';
import { Coda } from './components/Coda.jsx';
import { Hero } from './components/Hero.jsx';
import { PartRail } from './components/PartRail.jsx';

import { Ch01ConcurrencyVsParallelism } from './sections/Ch01ConcurrencyVsParallelism.jsx';
import { Ch01RaceCondition } from './sections/Ch01RaceCondition.jsx';
import { Ch02Mutex } from './sections/Ch02Mutex.jsx';
import { Ch02Semaphore } from './sections/Ch02Semaphore.jsx';
import { Ch02Atomics } from './sections/Ch02Atomics.jsx';
import { Ch02LockFree } from './sections/Ch02LockFree.jsx';
import { Ch03Deadlock } from './sections/Ch03Deadlock.jsx';
import { Ch03Livelock } from './sections/Ch03Livelock.jsx';
import { Ch03Starvation } from './sections/Ch03Starvation.jsx';
import { Ch04ProducerConsumer } from './sections/Ch04ProducerConsumer.jsx';
import { Ch04FanOutIn } from './sections/Ch04FanOutIn.jsx';
import { Ch04Pipeline } from './sections/Ch04Pipeline.jsx';
import { Ch04PubSub } from './sections/Ch04PubSub.jsx';
import { Ch04Select } from './sections/Ch04Select.jsx';
import { Ch05WhyAsync } from './sections/Ch05WhyAsync.jsx';
import { Ch05StateMachine } from './sections/Ch05StateMachine.jsx';
import { Ch05MNScheduling } from './sections/Ch05MNScheduling.jsx';
import { Ch06Actors } from './sections/Ch06Actors.jsx';
import { Ch06Supervision } from './sections/Ch06Supervision.jsx';
import { Ch07Mystery } from './sections/Ch07Mystery.jsx';
import { Ch07Simulator } from './sections/Ch07Simulator.jsx';
import { Ch07Reordering } from './sections/Ch07Reordering.jsx';
import { Ch07HappensBefore } from './sections/Ch07HappensBefore.jsx';
import { Ch07DoubleCheckedLocking } from './sections/Ch07DoubleCheckedLocking.jsx';
import { Ch07Reference } from './sections/Ch07Reference.jsx';

export default function ConcurrencyFoundationsLesson() {
  return (
    <div className="lesson-root">
      <div className="lesson-content">
        <Hero />
        <PartRail />

        <ChapterHeader
          num="one"
          anchor="chapter-1"
          blurb="Where the trouble starts. More than one thread of execution, sharing state. Before we can reason about correctness, we need to be precise about what 'concurrent' even means."
        >
          Concurrency starts with <em>interleaving</em>.
        </ChapterHeader>
        <Ch01ConcurrencyVsParallelism />
        <Ch01RaceCondition />

        <ChapterHeader
          num="two"
          anchor="chapter-2"
          blurb="The vocabulary of synchronization. Mutexes, semaphores, atomics, and the line that runs from blocking through lock-free to wait-free."
        >
          The <em>tools</em>.
        </ChapterHeader>
        <Ch02Mutex />
        <Ch02Semaphore />
        <Ch02Atomics />
        <Ch02LockFree />

        <ChapterHeader
          num="three"
          anchor="chapter-3"
          blurb="Three ways a program can remain alive while failing to make useful progress. No compiler can save you from them."
        >
          Liveness <em>failures</em>.
        </ChapterHeader>
        <Ch03Deadlock />
        <Ch03Livelock />
        <Ch03Starvation />

        <ChapterHeader
          num="four"
          anchor="chapter-4"
          blurb="The shapes that work. Patterns of conversation between threads that have proven themselves over decades of practice."
        >
          Patterns of <em>conversation</em>.
        </ChapterHeader>
        <Ch04ProducerConsumer />
        <Ch04FanOutIn />
        <Ch04Pipeline />
        <Ch04PubSub />
        <Ch04Select />

        <ChapterHeader
          num="five"
          anchor="chapter-5"
          blurb="How runtimes keep many waiting tasks moving on a small number of OS threads, using syntax that still reads top-to-bottom."
        >
          Async / <em>await</em>.
        </ChapterHeader>
        <Ch05WhyAsync />
        <Ch05StateMachine />
        <Ch05MNScheduling />

        <ChapterHeader
          num="six"
          anchor="chapter-6"
          blurb="A different shape: keep state private, send messages across boundaries, and make supervision part of the design."
        >
          Share by <em>communicating</em>.
        </ChapterHeader>
        <Ch06Actors />
        <Ch06Supervision />

        <ChapterHeader
          num="seven"
          anchor="chapter-7"
          blurb="Reordering and visibility, governed by happens-before: the rules of cause and effect that synchronization imposes on real hardware."
        >
          Memory ordering and <em>happens-before</em>.
        </ChapterHeader>
        <Ch07Mystery />
        <Ch07Simulator />
        <Ch07Reordering />
        <Ch07HappensBefore />
        <Ch07DoubleCheckedLocking />
        <Ch07Reference />

        <Coda />

        <div className="footer">
          <div className="footer-line" />
          <div className="footer-text">
            <span className="footer-mark">⌑</span> end of lesson
          </div>
        </div>
      </div>
    </div>
  );
}
