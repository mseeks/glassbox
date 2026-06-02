import Head from '../components/Head.jsx';
import WeaveByte from '../labs/WeaveByte.jsx';

// §01 — The bit. Memory starts with one magnetised ring.
export default function Unit() {
  return (
    <section id="unit">
      <div className="wrap">
        <Head num="01" kicker="The atom" title="It starts with one magnet." />
        <div className="rev">
          <p className="lead" style={{ marginBottom: 16 }}>
            All memory is built from one humble thing: a switch that is either <strong>on</strong>{' '}
            or <strong>off</strong>. Every photo you have ever owned, every song, every program, all
            of it comes down to that. We call the switch a <em className="term">bit</em>. Eight of
            them together make a <em className="term">byte</em>, and one byte is just enough to hold
            a single letter. That is the whole foundation.
          </p>
          <p style={{ marginBottom: 24 }}>
            For the first thirty years of computing, that switch was a tiny ring of iron called a{' '}
            <em className="term">magnetic core</em>. Thread a wire through it one way and it stored
            a 1; the other way, a 0. The memory that guided Apollo to the Moon was thousands of
            these rings, threaded <strong>by hand</strong> by women working at looms, one single bit
            at a time. You could hold it. You could weave it.
          </p>
        </div>
        <div className="rev">
          <WeaveByte />
        </div>
      </div>
    </section>
  );
}
