import { SectionLabel } from '../components/SectionLabel.jsx';
import { FailureRoll } from '../components/FailureRoll.jsx';

export function SectionFour() {
  return (
    <section className="section" id="s4">
      <SectionLabel num="4" label="Why P Is Not Optional" />
      <h2 className="h-section">
        &ldquo;Pick two&rdquo; is the <em>wrong</em> frame.
      </h2>

      <p className="lede">
        The popular slogan suggests a triangle where you can stand at any corner. You cannot. The
        corner labeled <em>CA</em> — a system with consistency and availability but no partition
        tolerance — describes only one kind of thing: a single-machine system, where partitions are
        impossible because there is no <em>between</em> to break.
      </p>

      <p>
        The instant your system spans two machines, the network exists, and the network sometimes
        loses messages. Not as a rare bug, but as a feature of how networks are built. Switches
        reboot. Cables fray. A process pauses for garbage collection (a routine memory-cleanup
        operation in languages like Java or Go that briefly freezes the program) and looks identical
        to a partition from every other process trying to reach it. From the system&rsquo;s point of
        view, &ldquo;partition&rdquo; and &ldquo;the peer is being slow in a way I can&rsquo;t
        distinguish from being dead&rdquo; are the same event.
      </p>

      <FailureRoll />
      <div className="figure-caption" style={{ marginBottom: 32 }}>
        <strong>Fig. 4</strong> &nbsp; A sample of partition-class events. Some are visible; many
        are silent.
      </div>

      <p>
        So the right reading is: <strong>P is a fact, not a feature.</strong>
        Networks fail. The only question your system gets to answer is what it does <em>
          during
        </em>{' '}
        the failure. And on that question, the theorem leaves you exactly two answers: keep serving
        and accept staleness (sacrifice C), or refuse to serve until certainty returns (sacrifice
        A). The triangle metaphor was always a lie. The real picture is a fork:{' '}
        <strong>CP or AP</strong>, chosen at the moment of partition.
      </p>

      <div className="pull">
        You don&rsquo;t pick P. P picks you. What you pick is what to do when P arrives.
      </div>
    </section>
  );
}
