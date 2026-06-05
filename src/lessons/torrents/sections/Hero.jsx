import { ArrowRight } from 'lucide-react';
import HeroConstellation from '../components/HeroConstellation.jsx';

// Hero — the title plate over the night sky. The constellation glyph gates its
// own SMIL motion; the scroll cue floats via CSS (globally neutralized). `onJump`
// is the shared reduced-motion-aware scroller from the composition root.
export default function Hero({ onJump }) {
  return (
    <header className="tor-hero">
      <div className="tor-wrap" style={{ textAlign: 'center' }}>
        <div
          className="tor-rv"
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 26 }}
        >
          <HeroConstellation />
        </div>
        <div className="tor-rv">
          <div className="tor-kicker" style={{ justifyContent: 'center' }}>
            BRAM COHEN · 2001 · a file held by strangers
          </div>
          <h1 className="tor-disp">The Swarm</h1>
          <p className="tor-hero-sub">How a torrent turns a crowd into a server</p>
        </div>
        <p className="tor-lead tor-rv" style={{ maxWidth: 624, margin: '26px auto 0' }}>
          Download from one server and every newcomer makes it slower. BitTorrent flips that single
          sentence — and almost its whole design falls out of the flip, ending in a self-verifying
          name for a file held entirely by strangers.
        </p>
        <div
          className="tor-rv"
          style={{
            display: 'flex',
            gap: 9,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 24,
          }}
        >
          {['the inversion', 'content addressing', 'the hash table', 'magnets'].map((w) => (
            <span key={w} className="tor-wp">
              {w}
            </span>
          ))}
        </div>
        <button className="tor-rv tor-cue" onClick={() => onJump('inversion')}>
          begin
          <ArrowRight size={15} style={{ transform: 'rotate(90deg)' }} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
