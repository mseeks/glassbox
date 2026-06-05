import { useCallback, useRef, useState } from 'react';
import './acid-lab.css';

import { Welcome } from './components/Welcome.jsx';
import { AcidGlanceCards } from './components/AcidGlanceCards.jsx';

import { AtomicitySection } from './sections/AtomicitySection.jsx';
import { ConsistencySection } from './sections/ConsistencySection.jsx';
import { IsolationSection } from './sections/IsolationSection.jsx';
import { DurabilitySection } from './sections/DurabilitySection.jsx';
import { SynthesisSection } from './sections/SynthesisSection.jsx';

/* ════════════════════════════════════════════════════════════════════
   ACID Lab — composition root.

   The four pillars get their own section files; Isolation and Atomicity
   delegate their interactive machinery to ./labs. Shared visual primitives
   (Welcome, AcidGlanceCards, MapMatrix, SectionDivider) live in ./components,
   alongside the const data tables (LEVELS / SCENARIOS / MATRIX /
   ACID_PROPERTIES / ATOMICITY_SCENARIOS / SYNTHESIS_PHASES) and small
   helpers (renderProseMarkdown, hexToRgb).

   This shell owns just the cross-section navigation state — the
   activeSection highlight on the ACID glance cards and the refs the
   "tap a card to jump" handler scrolls into view.
   ════════════════════════════════════════════════════════════════════ */
export default function AcidLabLesson() {
  const isolationRef = useRef(null);
  const atomicityRef = useRef(null);
  const durabilityRef = useRef(null);
  const consistencyRef = useRef(null);

  const [activeSection, setActiveSection] = useState('atomicity');

  const onJumpSection = useCallback((section) => {
    setActiveSection(section);
    const sectionRefs = {
      isolation: isolationRef,
      atomicity: atomicityRef,
      durability: durabilityRef,
      consistency: consistencyRef,
    };
    const ref = sectionRefs[section];
    setTimeout(() => {
      if (ref?.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  return (
    <div className="iso-root" style={{ padding: '40px 24px 80px', position: 'relative' }}>
      <div
        style={{
          maxWidth: 920,
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 56,
        }}
      >
        <Welcome />

        <AcidGlanceCards activeSection={activeSection} onJumpSection={onJumpSection} />

        <AtomicitySection ref={atomicityRef} />

        <ConsistencySection ref={consistencyRef} />

        <IsolationSection ref={isolationRef} />

        <DurabilitySection ref={durabilityRef} />

        {/* Colophon — "Four letters, four guarantees, one database that keeps
            its promises." The lesson now closes in SynthesisSection (the ∴
            Synthesis movement: takeaway + where-to-go-next), so this couplet no
            longer renders as a second, competing closure. */}
        <SynthesisSection />
      </div>
    </div>
  );
}
