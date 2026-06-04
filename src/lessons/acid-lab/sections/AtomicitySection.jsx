import { forwardRef } from 'react';
import { SectionDivider } from '../components/SectionDivider.jsx';
import { AtomicityLab } from '../labs/AtomicityLab.jsx';

export const AtomicitySection = forwardRef(function AtomicitySection(_props, ref) {
  return (
    <>
      <div ref={ref} style={{ scrollMarginTop: 16, marginTop: 32 }}>
        <SectionDivider
          letter="A"
          kicker="The failure axis"
          name="Atomicity"
          accent="var(--iso-violet)"
          intro="What happens when a transaction is interrupted mid-flight? Atomicity says: it must either fully happen or not happen at all. Nothing in between. The mechanism that makes this possible is the **write-ahead log**, a small, fsync'd journal that becomes the source of truth at the moment of commit. Three scenarios show how it works."
        />
      </div>
      <AtomicityLab />
    </>
  );
});
