import { useCallback, useState } from 'react';
import { useRevealRoot } from '../../shared/reveal.jsx';
import { useScrollSpy, scrollToId } from '../../shared/useScrollSpy.js';
import Nav, { NAV } from './components/Nav.jsx';
import Hero from './sections/Hero.jsx';
import Wire from './sections/Wire.jsx';
import Secret from './sections/Secret.jsx';
import Dh from './sections/Dh.jsx';
import Mitm from './sections/Mitm.jsx';
import Sign from './sections/Sign.jsx';
import Chain from './sections/Chain.jsx';
import Handshake from './sections/Handshake.jsx';
import Coda from './sections/Coda.jsx';
import './tls.css';

/* ════════════════════════════════════════════════════════════════════════
   TLS — THE SEALED CHANNEL
   How two strangers build a private, verified room across a hostile public wire.
   World: a cipher channel on a dark switchboard. Petrol-teal ground, warm bone
   ink, AQUA for the live/secured channel, BRASS for trust & seals, VERMILION for
   the attacker and broken verification.
   Type: Spectral (display) · Schibsted Grotesk (body) · JetBrains Mono (keys/hex).

   Composition root. The real (toy-sized) crypto — modpow / discreteLog / fnv1a /
   RSA / keystreamXor / the colour helpers / threatState — lives in ./engine;
   reusable atoms (SectionHeader, LockBadge, Channel, Verdict, Row, Swatch,
   Section, P, Nav) in ./components; the seven labs in ./labs; Hero, the seven
   prose chapters, and the Coda in ./sections. This shell wires them, attaching
   the shared reveal-on-scroll observer to the root and the shared scroll-spy to
   the section nav.
   ════════════════════════════════════════════════════════════════════════ */
const NAV_IDS = NAV.map((s) => s.id);

export default function TlsLesson() {
  const rootRef = useRevealRoot({ selector: '.tls-rv', inClass: 'tls-in' });
  const active = useScrollSpy(NAV_IDS, { rootMargin: '-45% 0px -50% 0px' });
  const [sheetOpen, setSheetOpen] = useState(false);

  const jump = useCallback((id) => {
    setSheetOpen(false);
    scrollToId(id);
  }, []);

  return (
    <div className="tls-root" ref={rootRef}>
      <Nav active={active} onJump={jump} sheetOpen={sheetOpen} setSheetOpen={setSheetOpen} />
      <div className="tls-stage">
        <Hero />
        <Wire />
        <Secret />
        <Dh />
        <Mitm />
        <Sign />
        <Chain />
        <Handshake />
        <Coda />
      </div>
    </div>
  );
}
