import { useRevealRoot } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import Rule from '../components/Rule.jsx';
import FamilyTimeline from '../labs/FamilyTimeline.jsx';

export default function Family() {
  const ref = useRevealRoot();
  return (
    <section ref={ref}>
      <div className="sha-wrap">
        <SectionHead
          num="02"
          eyebrow="The family"
          title="Two machines wearing"
          italic="one name"
          lede={
            <>
              "SHA" is not a single algorithm. It is a lineage spanning thirty years and two
              completely unrelated internal designs that happen to share a name, and you cannot
              really understand SHA without meeting both of them.
            </>
          }
        />
        <FamilyTimeline />
        <p className="body">
          Everything from here splits along that seam. <span className="kw">SHA-2</span> is an
          assembly line. <span className="kg">SHA-3</span> is a sponge. We will build each one from
          the ground up, look closely at the exact spot where SHA-2 still carries an old scar, then
          watch SHA-3 sidestep that same wound entirely by construction.
        </p>
      </div>
      <Rule />
    </section>
  );
}
