import './swim.css';

import { Closing } from './components/Closing.jsx';
import { Hero } from './components/Hero.jsx';
import { TOC } from './components/TOC.jsx';

import { Section01 } from './sections/Section01.jsx';
import { Section02 } from './sections/Section02.jsx';
import { Section03 } from './sections/Section03.jsx';
import { Section04 } from './sections/Section04.jsx';
import { Section05 } from './sections/Section05.jsx';
import { Section06 } from './sections/Section06.jsx';
import { Section07 } from './sections/Section07.jsx';
import { Section08 } from './sections/Section08.jsx';
import { Section09 } from './sections/Section09.jsx';
import { Section10 } from './sections/Section10.jsx';

export default function SwimLesson() {
  return (
    <div className="swim-root">
      <TOC />
      <Hero />
      <Section01 />
      <Section02 />
      <Section03 />
      <Section04 />
      <Section05 />
      <Section06 />
      <Section07 />
      <Section08 />
      <Section09 />
      <Section10 />
      <Closing />
    </div>
  );
}
