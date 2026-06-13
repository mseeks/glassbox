import { SectionHeader } from '../components/Section.jsx';
import { LabFrame } from '../components/widgets.jsx';
import NatLab from '../labs/NatLab.jsx';
import LessonLink from '../../../shared/LessonLink.jsx';

// §06 — reaching through the wall: NAT traversal by hole-punching.
export default function Nat() {
  return (
    <section id="nat" className="tor-section">
      <div className="tor-wrap">
        <SectionHeader
          n="06"
          kicker="Getting connected"
          title="Reaching through the {}"
          em="wall"
        />
        <div className="tor-prose tor-rv">
          <p>
            You now hold a list of peer addresses — but most peers sit behind a home router doing{' '}
            <strong>network address translation</strong>, which forwards replies to connections you
            started and quietly drops the ones that arrive unannounced. So a direct dial fails in
            both directions at once.
          </p>
          <p>
            The escape is to have both peers punch <em>outward</em> to a shared rendezvous, so each
            router opens a mapping; then packets flow straight between them. Torrents increasingly
            carry this over <LessonLink to="udp">UDP</LessonLink> with a transport that also notices
            when it's congesting your line and backs off — so a download doesn't strangle a video
            call sharing the same connection. Try the dial both ways:
          </p>
        </div>
      </div>
      <div className="tor-wrap-wide">
        <LabFrame label="Two peers behind routers" sub="NAT traversal">
          <NatLab />
        </LabFrame>
      </div>
    </section>
  );
}
