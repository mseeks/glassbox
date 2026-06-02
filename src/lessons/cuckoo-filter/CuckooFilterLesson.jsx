import './cuckoo-filter.css';

import { Coda } from './components/Coda.jsx';
import { Hero } from './components/Hero.jsx';

import { SectionOne } from './sections/SectionOne.jsx';
import { SectionTwo } from './sections/SectionTwo.jsx';
import { SectionThree } from './sections/SectionThree.jsx';
import { SectionFour } from './sections/SectionFour.jsx';
import { SectionFive } from './sections/SectionFive.jsx';
import { SectionSix } from './sections/SectionSix.jsx';
import { SectionSeven } from './sections/SectionSeven.jsx';
import { SectionEight } from './sections/SectionEight.jsx';
import { SectionNine } from './sections/SectionNine.jsx';

export default function CuckooFilterLesson() {
  return (
    <div className="cf-root">
      <div className="cf-content">
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
        <Coda />
      </div>
    </div>
  );
}
