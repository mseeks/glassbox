import { ChapterTitle, Prose, Section } from '../components/atoms.jsx';
import { FamilyTable } from '../labs/FamilyTable.jsx';

export const ChapterTen = () => (
  <Section id="ch10">
    <ChapterTitle
      number="X"
      eyebrow="THE FAMILY"
      title="Where the Bloom clock sits"
      sub="A Pareto frontier of space, exactness, and dynamism."
    />
    <div style={{ maxWidth: 760 }}>
      <Prose dropcap>
        <p>
          The Bloom clock is one of several logical clocks. Each one occupies a different point on a
          multi-axis frontier: space per event, exactness of comparison, ability to detect
          concurrency, ease of handling dynamic membership. None of these are strictly better than
          the others — they're different answers to different deployment realities.
        </p>
        <p>
          Below, the six members of the family that matter most. Read it as a menu, not a ranking.
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
          "concurrent" really means concurrent — but each pays for that exactness somewhere: in
          space, in coordination cost, in membership management, in physical-clock dependency.
        </p>
        <p>
          The Bloom clock takes the unique trade of giving up exactness in <em>one direction</em>.
          Its "concurrent" verdict is exact — same guarantee a vector clock makes. Its "before"
          verdict can be wrong with bounded probability. In exchange, the space is constant, the
          membership management is trivial, and there's no physical clock dependency. For the right
          workload, that's a beautiful position to occupy.
        </p>
      </Prose>
    </div>
  </Section>
);
