import { FLAT_SEEKS_BIG, FLAT_SEEKS_SMALL } from '../engine/index.js';
import Section from '../components/Section.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import Plate from '../components/Plate.jsx';
import Stat from '../components/Stat.jsx';
import LessonLink from '../../../shared/LessonLink.jsx';

// §II — the naive sorted slab and its seek tax. The ticks are a pure CSS
// entrance animation, neutralized by the shell under reduced motion.
export default function Slab() {
  const ticks = FLAT_SEEKS_BIG; // 30
  return (
    <Section id="slab">
      <SectionHeading
        roman="II"
        kicker="the false start"
        title="The almost-right answer"
        dek="Write the pairs to a file, sorted. Job one is done. Job two looks done too — until you watch a lookup actually run."
      />
      <div className="sst-g2">
        <div className="sst-prose">
          <p>
            Sorted data gives you <strong>binary search</strong>, so finding a key should cost about
            the logarithm of the count — fast, in principle. But this is the binary-tree disease in
            disguise. Two things go wrong on real hardware.
          </p>
          <p>
            First, you cannot jump to the middle <em>record</em>. Keys and values have different
            lengths, so the middle <em>byte</em> lands in the guts of some arbitrary pair, and you
            cannot compute where the five-hundred-millionth record begins. Second, even if you
            could, every jump is a separate <span className="ox">disk seek</span> — a physical trip
            of a few milliseconds. The logarithm of a billion to base two is about thirty.
          </p>
          <p>
            Thirty trips for one key, roughly a tenth of a second. We convicted that number once
            already. The flat slab fights the disk in exactly the way a naive{' '}
            <LessonLink to="binary-trees">binary tree</LessonLink> does. It needs the same medicine
            — but a version built for a file that will never change.
          </p>
        </div>
        <div className="sst-reveal">
          <Plate cap="naive slab · one lookup at a billion keys" capRight="≈ 0.10 s">
            <div className="sst-seektax">
              {Array.from({ length: ticks }).map((_, i) => (
                <span key={i} className="sst-tick" style={{ animationDelay: `${i * 26}ms` }} />
              ))}
            </div>
            <div className="sst-readout" style={{ marginTop: 16 }}>
              <Stat value={ticks} label="disk seeks" tone="blood" />
              <Stat value="1" label="key found" />
            </div>
            <div className="sst-note" style={{ marginTop: 16 }}>
              <span className="sst-note-lab">honest footnote</span>
              Over the tiny 31-key file in the next lab, binary search is only{' '}
              <b>{FLAT_SEEKS_SMALL} seeks</b>. The tax is invisible at toy sizes and ruinous at real
              ones — which is the whole reason the fix exists.
            </div>
          </Plate>
        </div>
      </div>
    </Section>
  );
}
