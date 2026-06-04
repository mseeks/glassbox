import { forwardRef } from 'react';
import { SectionDivider } from '../components/SectionDivider.jsx';
import { IsolationLab } from '../labs/IsolationLab.jsx';

export const IsolationSection = forwardRef(function IsolationSection(_props, ref) {
  return (
    <>
      <div ref={ref} style={{ scrollMarginTop: 16 }}>
        <SectionDivider
          letter="I"
          kicker="The concurrency axis"
          name="Isolation"
          accent="var(--iso-teal)"
          intro="Run transactions side by side and they can interfere in surprising ways. The isolation level is the database's promise about which kinds of interference it will permit, and which it will catch. Five chapters. Five levels. Twenty-five micro-stories."
        />
      </div>
      <IsolationLab />
    </>
  );
});
