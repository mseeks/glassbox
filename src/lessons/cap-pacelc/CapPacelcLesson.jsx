import './cap-pacelc.css';

import { TopNav } from './components/TopNav.jsx';
import { Hero } from './components/Hero.jsx';
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

export default function CapPacelcLesson() {
  return (
    <div className="cap-root">
      <TopNav />
      <div className="cap-content">
        <Hero />
        <SectionOne />
        <SectionTwo />
        <SectionThree />
        <SectionFour />
        <SectionFive />
        <SectionSix />
        <SectionSeven />
        <SectionEight />
        <SectionNine />
        <SectionTen />
        <SectionEleven />
        <Coda />
      </div>
    </div>
  );
}
