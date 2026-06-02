import Head from '../components/Head.jsx';
import MemoryTimeline from '../labs/MemoryTimeline.jsx';

// §03 — The explosion. Hand-weaving became printing, then a doubling that
// folded the floor away under thirty-five years of history.
export default function Explosion() {
  return (
    <section id="explosion">
      <div className="wrap">
        <Head num="03" kicker="When bits got cheap" title="Then the floor fell away." />
        <div className="rev">
          <p className="lead" style={{ marginBottom: 24 }}>
            Hand-weaving became printing. Once memory was etched onto silicon, the number of bits
            you could fit on one chip roughly <strong>doubled every couple of years</strong> for
            half a century. Each rung of the ladder below is about a thousandfold leap. The growth
            is so violent that a normal ruler can't show it. That is the first thing this chart will
            teach you.
          </p>
        </div>
        <div className="rev">
          <MemoryTimeline />
        </div>
      </div>
    </section>
  );
}
