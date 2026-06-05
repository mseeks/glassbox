import { useCallback } from 'react';
import { useRevealRoot } from '../../shared/reveal.jsx';
import { useScrollSpy, scrollToId } from '../../shared/useScrollSpy.js';
import { useScrollProgress } from '../../shared/useScrollProgress.js';
import Nav, { NAV } from './components/Nav.jsx';
import Starfield from './components/Starfield.jsx';
import Hero from './sections/Hero.jsx';
import Inversion from './sections/Inversion.jsx';
import Naming from './sections/Naming.jsx';
import Swarm from './sections/Swarm.jsx';
import Tracker from './sections/Tracker.jsx';
import Dht from './sections/Dht.jsx';
import Nat from './sections/Nat.jsx';
import Choke from './sections/Choke.jsx';
import Rarest from './sections/Rarest.jsx';
import V2 from './sections/V2.jsx';
import Coda from './sections/Coda.jsx';
import './torrents.css';

/* ════════════════════════════════════════════════════════════════════════
   THE SWARM — an interactive lesson on how torrents work.
   World: a night-sky observatory. Peers are points of light; transfers are
   luminous threads; an infohash is a catalog designation; a DHT lookup is
   celestial navigation toward a target by getting warmer. Signal teal for the
   engine, gold for what's held, coral for failure, violet for the address space.
   Type: Yeseva One (titling) · Sora (reading) · JetBrains Mono (the readout).

   Composition root. The real BitTorrent mechanics (SHA-256, the Kademlia DHT,
   the bandwidth model, choking, rarest-first, the v2 Merkle tree) live in
   ./engine; the reusable atoms (Nav, SectionHeader, Starfield, the hero glyph,
   the figure widgets) in ./components; the nine interactive labs in ./labs; the
   hero, nine chapters, and coda in ./sections. This shell wires them, attaching
   the shared reveal-on-scroll observer to the root and the shared scroll-spy +
   reading-progress to the contents rail.
   ════════════════════════════════════════════════════════════════════════ */
const NAV_IDS = NAV.map((s) => s.id);

export default function TorrentsLesson() {
  const rootRef = useRevealRoot({ selector: '.tor-rv', inClass: 'tor-in' });
  const active = useScrollSpy(NAV_IDS, { rootMargin: '-45% 0px -50% 0px' });
  const progress = useScrollProgress();

  const jump = useCallback((id) => scrollToId(id), []);

  return (
    <div className="tor-root" ref={rootRef}>
      <Starfield />
      <div className="tor-bg-grain" aria-hidden="true" />
      <div className="tor-rail" style={{ width: `${progress}%` }} aria-hidden="true" />
      <Nav active={active} onJump={jump} />

      <div className="tor-content">
        <Hero onJump={jump} />
        <div className="tor-rule" />
        <Inversion />
        <div className="tor-rule" />
        <Naming />
        <div className="tor-rule" />
        <Swarm />
        <div className="tor-rule" />
        <Tracker />
        <div className="tor-rule" />
        <Dht />
        <div className="tor-rule" />
        <Nat />
        <div className="tor-rule" />
        <Choke />
        <div className="tor-rule" />
        <Rarest />
        <div className="tor-rule" />
        <V2 />
        <div className="tor-rule" />
        <Coda />
      </div>
    </div>
  );
}
