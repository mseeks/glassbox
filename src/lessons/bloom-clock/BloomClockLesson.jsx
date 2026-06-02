import './bloom-clock.css';

import { Closing } from './components/Closing.jsx';
import { Hero } from './components/Hero.jsx';
import { Nav } from './components/Nav.jsx';

import { ChapterOne } from './sections/ChapterOne.jsx';
import { ChapterTwo } from './sections/ChapterTwo.jsx';
import { ChapterThree } from './sections/ChapterThree.jsx';
import { ChapterFour } from './sections/ChapterFour.jsx';
import { ChapterFive } from './sections/ChapterFive.jsx';
import { ChapterSix } from './sections/ChapterSix.jsx';
import { ChapterSeven } from './sections/ChapterSeven.jsx';
import { ChapterEight } from './sections/ChapterEight.jsx';
import { ChapterNine } from './sections/ChapterNine.jsx';
import { ChapterTen } from './sections/ChapterTen.jsx';
import { ChapterEleven } from './sections/ChapterEleven.jsx';

export default function BloomClockLesson() {
  return (
    <div className="bc-root">
      <Nav />
      <Hero />
      <ChapterOne />
      <ChapterTwo />
      <ChapterThree />
      <ChapterFour />
      <ChapterFive />
      <ChapterSix />
      <ChapterSeven />
      <ChapterEight />
      <ChapterNine />
      <ChapterTen />
      <ChapterEleven />
      <Closing />
    </div>
  );
}
