import { SectionHeader } from '../components/Section.jsx';
import { LabFrame } from '../components/widgets.jsx';
import ServerSwarmLab from '../labs/ServerSwarmLab.jsx';

// §01 — the inversion: demand becomes supply. The founding move of BitTorrent,
// where every downloader is also an uploader, so the crowd grows the reservoir.
export default function Inversion() {
  return (
    <section id="inversion" className="tor-section">
      <div className="tor-wrap">
        <SectionHeader n="01" kicker="The inversion" title="Demand becomes {}" em="supply" />
        <div className="tor-prose tor-rv">
          <p>
            Picture the ordinary way to download a file: one server, many downloaders, and a fixed
            amount of upload bandwidth to share between them. Every newcomer gets a thinner slice.
            The launch day for something popular is the server's <em>worst</em> day, not its best —
            ten thousand arrivals at once, and the whole thing buckles. In that world, demand is a
            cost.
          </p>
          <p>
            BitTorrent's founding move is to flip that one sentence. What if every downloader were
            also an uploader? The instant you hold a piece, you can hand it to the next person. Now
            the crowd isn't draining a fixed reservoir — the crowd <strong>is</strong> the
            reservoir, and it grows with its own size.
          </p>
        </div>
        <div className="tor-pull tor-rv">
          Popularity stops <span className="tor-g">consuming</span> capacity and starts{' '}
          <span className="tor-t">creating</span> it.
        </div>
        <div className="tor-prose tor-rv">
          <p>
            It's a library where borrowing a book turns you into a lending branch. Drag the crowd
            larger and watch the two worlds split apart:
          </p>
        </div>
      </div>
      <div className="tor-wrap-wide">
        <LabFrame label="Per-peer throughput" sub="single server vs swarm">
          <ServerSwarmLab />
        </LabFrame>
      </div>
    </section>
  );
}
