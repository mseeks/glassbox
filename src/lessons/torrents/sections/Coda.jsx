import HeroConstellation from '../components/HeroConstellation.jsx';
import LessonLink from '../../../shared/LessonLink.jsx';

// Coda — the three through-lines, and threads to keep pulling. Closes on the
// same constellation glyph the hero opened with.
export default function Coda() {
  return (
    <>
      <section id="coda" className="tor-section">
        <div className="tor-wrap">
          <div className="tor-rv">
            <div className="tor-kicker">Coda · the through-lines</div>
            <h2 className="tor-sec">
              There is no center — only a <span className="tor-em">name</span>.
            </h2>
          </div>
          <div className="tor-prose tor-rv" style={{ marginTop: 22 }}>
            <p>Three ideas carried the whole way down.</p>
            <p>
              <strong>Content addressing</strong> is the spine. A name derived from the bytes can't
              misrepresent them — so the same trick that identifies the file also proves each piece,
              the metadata, and, through the <LessonLink to="merkle-trees">Merkle root</LessonLink>,
              the file as a whole. You trust the math, never the stranger.
            </p>
            <p>
              <strong>Demand became supply.</strong> The single sentence BitTorrent flipped at the
              very start echoes through every later choice — rarest-first keeping scarce pieces
              alive, tit-for-tat turning self-interest into circulation, a swarm that gets stronger
              the more it is wanted.
            </p>
            <p>
              <strong>Local rules made global behavior</strong>, with no authority anywhere. No
              server splitting a fixed pipe, no tracker that has to stay up, no one blessing the
              data. Just peers each following a small rule, and a coherent system settling out of
              it.
            </p>
          </div>
          <div className="tor-pull tor-rv">
            A crowd that agrees on a <span className="tor-t">name</span> needs no one to{' '}
            <span className="tor-g">bless</span> the bytes.
          </div>
          <div className="tor-prose tor-rv">
            <p className="tor-dim">
              Where to go next, if you want to keep pulling threads: the{' '}
              <strong>Sybil and eclipse attacks</strong> that flood a hash table with fake IDs to
              surround a key; the congestion control inside <strong>µTP</strong> that decides how
              politely a download yields to other traffic; <strong>peer exchange</strong>, where
              peers gossip their peer lists directly; and the economics read as a{' '}
              <strong>repeated game</strong> — why tit-for-tat is robust, where it can be gamed, and
              how private trackers bolt reputation on top.
            </p>
          </div>
        </div>
      </section>

      <footer style={{ padding: '10px 0 70px', textAlign: 'center' }}>
        <div className="tor-rule" style={{ marginBottom: 26 }} />
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <HeroConstellation />
        </div>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '.22em',
            textTransform: 'uppercase',
            color: 'var(--faint)',
          }}
        >
          The Swarm · BitTorrent · a crowd that became a server
        </p>
      </footer>
    </>
  );
}
