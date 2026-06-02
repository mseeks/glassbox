import { Figure } from '../components/Figure.jsx';
import { P } from '../components/P.jsx';
import { PageBlock } from '../components/PageBlock.jsx';
import { Rule } from '../components/Rule.jsx';
import { SectionHead } from '../components/SectionHead.jsx';
import { CuckooHashingLab } from '../labs/CuckooHashingLab.jsx';

export function SectionTwo() {
  return (
    <section className="cf-section">
      <SectionHead num="02" eyebrow="The substrate" title="Cuckoo" italic="hashing" />

      <PageBlock>
        <P size="lead">
          Cuckoo hashing is a hash table with one unusual rule of residence: every key has not one
          home, but <em>two</em>. The two candidates are chosen by independent hash functions; on
          arrival, the key may occupy either.
        </P>
        <P>
          When a new key arrives and finds both homes taken, it does not give up. It moves into one
          of the two anyway and <em>displaces</em>
          the resident. The evicted key then walks to <em>its</em> other home. If that one is
          occupied too, the displacement continues: a chain of kicks, each victim shuttled to its
          alternate, until at last someone finds an empty seat. The procedure terminates when a
          vacancy is found. It also terminates when the chain loops, the kick budget runs out, and
          the insertion is refused.
        </P>
        <P>
          For all this commotion, the structure earns the property that makes it interesting: any
          lookup examines <strong>exactly two slots</strong> and no more. There is no chain to
          follow, no list to traverse. The address of the second slot is known from the key alone.
        </P>
      </PageBlock>

      <Figure
        label="Fig. 1"
        title="Eleven slots, ten keys"
        foot={<>Insert the keys one by one. Watch the chains form once the table fills.</>}
      >
        <CuckooHashingLab />
      </Figure>

      <PageBlock>
        <P>
          One detail will prove essential. To displace a resident, the algorithm must know that
          resident's <em>other</em> home. To know that, it must hash the key. This works perfectly
          when the table stores keys. It will appear, briefly, to break when we throw the keys away.
        </P>
      </PageBlock>

      <Rule />
    </section>
  );
}
