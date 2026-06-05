import './bloom-filters.css';

import { Footer } from './components/Footer.jsx';
import { Hero } from './components/Hero.jsx';
import { TableOfContents } from './components/TableOfContents.jsx';

import { BlockedBFVisual } from './labs/BlockedBFVisual.jsx';
import { CountingBFDemo } from './labs/CountingBFDemo.jsx';
import { MathLab } from './labs/MathLab.jsx';
import { Sandbox } from './labs/Sandbox.jsx';
import { SaturationDemo } from './labs/SaturationDemo.jsx';
import { ScalableVisual } from './labs/ScalableVisual.jsx';

import { Ch01TheQuestion } from './sections/Ch01TheQuestion.jsx';
import { Ch02TheConstruction } from './sections/Ch02TheConstruction.jsx';
import { Ch03TheAsymmetry } from './sections/Ch03TheAsymmetry.jsx';
import { Ch04TheMath } from './sections/Ch04TheMath.jsx';
import { Ch04bImplementationNote } from './sections/Ch04bImplementationNote.jsx';
import { Ch05Saturation } from './sections/Ch05Saturation.jsx';
import { Ch06TheLimits } from './sections/Ch06TheLimits.jsx';
import { Ch07TheVariants } from './sections/Ch07TheVariants.jsx';
import { Ch07bBlocked } from './sections/Ch07bBlocked.jsx';
import { Ch07cScalable } from './sections/Ch07cScalable.jsx';
import { Ch07dRestOfFamily } from './sections/Ch07dRestOfFamily.jsx';
import { Ch08TheCousins } from './sections/Ch08TheCousins.jsx';
import { Ch09InProduction } from './sections/Ch09InProduction.jsx';
import { Ch10WhenNotTo } from './sections/Ch10WhenNotTo.jsx';
import { Coda } from './sections/Coda.jsx';

function LabFrame({ children }) {
  return (
    <div
      className="max-w-4xl mx-auto px-6 md:px-12"
      style={{ marginTop: '-2rem', marginBottom: '4rem' }}
    >
      {children}
    </div>
  );
}

export default function BloomFiltersLesson() {
  return (
    <div className="bf-root">
      <TableOfContents />
      <Hero />

      <Ch01TheQuestion />
      <Ch02TheConstruction />
      <LabFrame>
        <Sandbox />
      </LabFrame>

      <Ch03TheAsymmetry />
      <Ch04TheMath />
      <LabFrame>
        <MathLab />
      </LabFrame>

      <Ch04bImplementationNote />
      <Ch05Saturation />
      <LabFrame>
        <SaturationDemo />
      </LabFrame>

      <Ch06TheLimits />
      <Ch07TheVariants />
      <LabFrame>
        <CountingBFDemo />
      </LabFrame>

      <Ch07bBlocked />
      <LabFrame>
        <BlockedBFVisual />
      </LabFrame>

      <Ch07cScalable />
      <LabFrame>
        <ScalableVisual />
      </LabFrame>

      <Ch07dRestOfFamily />
      <Ch08TheCousins />
      <Ch09InProduction />
      <Ch10WhenNotTo />
      <Coda />

      <Footer />
    </div>
  );
}
