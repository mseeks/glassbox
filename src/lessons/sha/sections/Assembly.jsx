import { useRevealRoot } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import AssemblyLineLab from '../labs/AssemblyLineLab.jsx';

export default function Assembly() {
  const ref = useRevealRoot();
  return (
    <section ref={ref}>
      <div className="sha-wrap">
        <SectionHead
          num="03"
          eyebrow="SHA-2 · the engine"
          title="The"
          italic="assembly line"
          lede={
            <>
              The SHA-2 family is built on a shape called <span className="kw">Merkle–Damgård</span>
              . Picture a factory line. Down it travels a single 256-bit workpiece, and each station
              along the way grabs one block of your message, stamps it hard into that workpiece, and
              passes it on to the next. The last station hands you the finished piece: your hash.
            </>
          }
        />

        <p className="body">
          Before anything enters the line, the message is <em>padded</em> to a clean multiple of 512
          bits: append a <code className="ic">1</code> bit, then zeros, then a 64-bit count of the
          original length. That trailing length is not decoration. It is load-bearing. It guarantees
          that two messages of different sizes can never produce the same padded stream, which is
          something collision resistance structurally requires.
        </p>

        <AssemblyLineLab />

        <p className="body">
          The "stamp" is the <span className="kw">compression function</span>: it takes the current
          state plus one block and produces the next state. Its output is folded <em>back into</em>{' '}
          the running state, because without that feedback the whole thing would be reversible and
          useless. Then the next block comes through. Inside each stamp, sixty-four rounds of mixing
          run one after another, and that mixing is where the avalanche is born.
        </p>
      </div>
    </section>
  );
}
