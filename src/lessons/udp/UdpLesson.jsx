import './udp.css';

import { Hero } from './components/Hero.jsx';
import { Navigation } from './components/Navigation.jsx';
import { Coda } from './components/Coda.jsx';

import { SectionOne } from './sections/SectionOne.jsx';
import { SectionTwo } from './sections/SectionTwo.jsx';
import { SectionThree } from './sections/SectionThree.jsx';
import { SectionFour } from './sections/SectionFour.jsx';
import { SectionFive } from './sections/SectionFive.jsx';
import { SectionSix } from './sections/SectionSix.jsx';
import { SectionSeven } from './sections/SectionSeven.jsx';
import { SectionEight } from './sections/SectionEight.jsx';
import { SectionNine } from './sections/SectionNine.jsx';
import { SectionTen } from './sections/SectionTen.jsx';
import { SectionEleven } from './sections/SectionEleven.jsx';

/* ════════════════════════════════════════════════════════════════════════
   UDP — A MASTERCLASS
   The protocol that tells the truth about the network.
   ════════════════════════════════════════════════════════════════════════ */

export default function UdpLesson() {
  return (
    <div className="udp-root">
      <Navigation />
      <div id="hero" data-nav="hero">
        <Hero />
      </div>
      <div id="s1" data-nav="s1">
        <SectionOne />
      </div>
      <div id="s2" data-nav="s2">
        <SectionTwo />
      </div>
      <div id="s3" data-nav="s3">
        <SectionThree />
      </div>
      <div id="s4" data-nav="s4">
        <SectionFour />
      </div>
      <div id="s5" data-nav="s5">
        <SectionFive />
      </div>
      <div id="s6" data-nav="s6">
        <SectionSix />
      </div>
      <div id="s7" data-nav="s7">
        <SectionSeven />
      </div>
      <div id="s8" data-nav="s8">
        <SectionEight />
      </div>
      <div id="s9" data-nav="s9">
        <SectionNine />
      </div>
      <div id="s10" data-nav="s10">
        <SectionTen />
      </div>
      <div id="s11" data-nav="s11">
        <SectionEleven />
      </div>
      <div id="coda" data-nav="coda">
        <Coda />
      </div>
    </div>
  );
}
