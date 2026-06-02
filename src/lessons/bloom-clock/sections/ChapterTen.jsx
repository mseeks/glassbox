import { ChapterTitle, Prose, Section } from '../components/atoms.jsx';
import { FamilyTable } from '../labs/FamilyTable.jsx';

export const ChapterTen = () => (
  <Section id="ch10">
    <ChapterTitle
      number="X"
      eyebrow="THE FAMILY"
      title="Where the Bloom clock sits"
      sub="A Pareto frontier: space versus exactness versus dynamism."
    />
    <div style={{ maxWidth: 760 }}>
      <Prose dropcap>
        <p>
          The Bloom clock is one of several logical clocks. Each one occupies a different point on a
          multi-axis frontier. The axes: space per event. Exactness of comparison. Whether it can
          even detect concurrency at all, and how much pain dynamic membership causes. None of these
          is strictly better than the rest. They are different answers to different deployment
          realities.
        </p>
        <p>
          Below, the six members of the family that matter most, laid out so you can see exactly
          what each one trades away to earn its spot. Read it as a menu, not a ranking.
        </p>
      </Prose>
    </div>

    <div style={{ marginTop: 48 }}>
      <FamilyTable />
    </div>

    <div style={{ maxWidth: 760, marginTop: 48 }}>
      <Prose>
        <p>
          Reading the table, a few patterns surface. The exact clocks (Lamport, vector, version
          vector, interval tree, HLC) all guarantee that "before" really means before and
          "concurrent" really means concurrent. But exactness is never free. Each one pays for it
          somewhere: maybe in raw space, maybe in coordination cost. Maybe in the grind of
          membership bookkeeping, or in a hard dependency on the physical clock that the others
          never take on.
        </p>
        <p>
          The Bloom clock takes the unique trade of giving up exactness in <em>one direction</em>.
          Its "concurrent" verdict is exact, the same guarantee a vector clock makes. Its "before"
          verdict can be wrong with bounded probability. What it buys with that one concession is
          considerable: the space stays constant no matter how large the cluster grows, while the
          membership bookkeeping drops to nothing and no physical clock ever enters the picture. For
          the right workload, that's a beautiful position to occupy.
        </p>
      </Prose>
    </div>
  </Section>
);
