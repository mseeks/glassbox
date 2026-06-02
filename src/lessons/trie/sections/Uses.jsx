import { Reveal } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';

// §VIII — In the wild: where tries earn their keep.
export default function Uses() {
  return (
    <section className="section">
      <Reveal>
        <SectionHead n="VIII" kicker="In the wild" title="Where tries earn their keep" />
      </Reveal>
      <Reveal>
        <div className="uses">
          <div className="use">
            <span className="ix">1</span>
            <div>
              <div className="ut">Autocomplete & search suggestions</div>
              <p>
                The prefix-region walk is the entire feature. Type three letters, walk to the node
                they spell, and read off the subtree sitting below where you landed, and every
                suggestion you could want is already there in alphabetical order. No search.
              </p>
            </div>
          </div>
          <div className="use">
            <span className="ix">2</span>
            <div>
              <div className="ut">Spell-checkers & dictionaries</div>
              <p>
                Membership in length proportional to the word. And "did you mean" comes cheap, found
                by nudging a single letter and following the near-by paths the map has already drawn
                for you. Spelling is a walk.
              </p>
            </div>
          </div>
          <div className="use">
            <span className="ix">3</span>
            <div>
              <div className="ut">IP routing tables</div>
              <p>
                Longest-prefix match over address bits decides the next hop. Tries and radix tries
                are the classic engine behind that choice, made millions of times a second on real
                routers. Address in, next hop out.
              </p>
            </div>
          </div>
          <div className="use">
            <span className="ix">4</span>
            <div>
              <div className="ut">Predictive text & T9</div>
              <p>
                Old number-pad phones and modern phone keyboards both walk a trie of likely
                continuations. Same trick, decades apart.
              </p>
            </div>
          </div>
          <div className="use">
            <span className="ix">5</span>
            <div>
              <div className="ut">In-memory database indexes</div>
              <p>
                Ordered keys, range scans, and prefix lookups all live in one structure. Just one.
                That is why ART-style tries keep showing up at the heart of modern in-memory
                engines.
              </p>
            </div>
          </div>
          <div className="use">
            <span className="ix">6</span>
            <div>
              <div className="ut">Word games & solvers</div>
              <p>
                Boggle and Scrabble solvers prune dead branches instantly. If a prefix has no track
                on the map, there is nothing valid down that way, so the solver stops exploring it
                at once.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
