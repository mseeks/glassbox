import { SectionHeader } from '../components/Section.jsx';
import { LabFrame } from '../components/widgets.jsx';
import SwarmLab from '../labs/SwarmLab.jsx';

// §03 — anatomy of a swarm: a living constellation of seeders and leechers.
export default function Swarm() {
  return (
    <section id="swarm" className="tor-section">
      <div className="tor-wrap">
        <SectionHeader n="03" kicker="The swarm" title="A living {}" em="constellation" />
        <div className="tor-prose tor-rv">
          <p>
            Everyone trading a given file forms a <strong>swarm</strong>, with two roles by degree.{' '}
            <span style={{ color: 'var(--gold-2)' }}>Seeders</span> hold the complete file and only
            upload. <span style={{ color: 'var(--signal-2)' }}>Leechers</span> are still
            downloading, sharing the verified pieces they already have while they gather the rest.
          </p>
          <p>
            A swarm's health is roughly its ratio of seeders to leechers. When the last seeder
            leaves and the leechers between them don't hold every piece, the file becomes
            unfinishable — which is exactly what one of the cleverest parts of the design exists to
            prevent. Press play and watch pieces flow:
          </p>
        </div>
      </div>
      <div className="tor-wrap-wide">
        <LabFrame label="A swarm exchanging pieces" sub="seeders & leechers">
          <SwarmLab />
        </LabFrame>
      </div>
    </section>
  );
}
