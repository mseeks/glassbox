import { SectionHeader } from '../components/Section.jsx';
import { LabFrame } from '../components/widgets.jsx';
import TrackerLab from '../labs/TrackerLab.jsx';

// §04 — the tracker: a matchmaker with one weakness (a single point of failure).
export default function Tracker() {
  return (
    <section id="tracker" className="tor-section">
      <div className="tor-wrap">
        <SectionHeader n="04" kicker="The tracker" title="A matchmaker with one {}" em="weakness" />
        <div className="tor-prose tor-rv">
          <p>
            So how do you find others who hold the same file? The first answer is a{' '}
            <strong>tracker</strong> — a lightweight server that stores none of the file itself.
            It's pure matchmaking: you announce an infohash and your address, and it hands back a
            list of peers.
          </p>
          <p>
            It's cheap, because it only brokers introductions. But it's a single point of failure.
            Shut the tracker down and discovery stops — even though every byte still lives out in
            the swarm. The introductions became the bottleneck. Kill it, and notice what survives:
          </p>
        </div>
      </div>
      <div className="tor-wrap-wide">
        <LabFrame label="The tracker as broker" sub="single point of failure">
          <TrackerLab />
        </LabFrame>
      </div>
    </section>
  );
}
