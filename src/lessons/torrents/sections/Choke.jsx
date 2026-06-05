import { SectionHeader } from '../components/Section.jsx';
import { LabFrame } from '../components/widgets.jsx';
import ChokeLab from '../labs/ChokeLab.jsx';

// §07 — an economy of strangers: tit-for-tat choking and optimistic unchoking.
export default function Choke() {
  return (
    <section id="choke" className="tor-section">
      <div className="tor-wrap">
        <SectionHeader n="07" kicker="Tit-for-tat" title="An economy of {}" em="strangers" />
        <div className="tor-prose tor-rv">
          <p>
            In a crowd of self-interested strangers, what stops everyone from taking and never
            giving? A pure freeloader ought to win. BitTorrent's answer is a small local rule that —
            run by everyone independently — produces good behavior across the whole swarm.
          </p>
          <p>
            It's called <strong>choking</strong>. Each peer continuously uploads only to the few
            peers feeding it fastest right now and chokes the rest, re-judging every few seconds.
            The one deliberate exception is <strong>optimistic unchoking</strong>: a single slot
            handed to a random choked peer, rotating over time.
          </p>
        </div>
        <div className="tor-pull tor-rv">
          It's a <span className="tor-g">potluck</span> — keep refilling the plates that feed you,
          and toss one taste to a stranger.
        </div>
        <div className="tor-prose tor-rv">
          <p>
            That random slot does two jobs: it surfaces partners faster than your current set, and
            it gives a newcomer with nothing yet its first piece. Tap each neighbor's generosity and
            watch who you keep feeding:
          </p>
        </div>
      </div>
      <div className="tor-wrap-wide">
        <LabFrame label="Your four upload slots" sub="choking & optimism">
          <ChokeLab />
        </LabFrame>
      </div>
    </section>
  );
}
