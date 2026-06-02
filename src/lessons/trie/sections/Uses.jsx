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
                The prefix-region walk is the entire feature. Type three letters, read off the
                subtree.
              </p>
            </div>
          </div>
          <div className="use">
            <span className="ix">2</span>
            <div>
              <div className="ut">Spell-checkers & dictionaries</div>
              <p>
                Membership in length proportional to the word, plus cheap "did you mean" via near-by
                paths.
              </p>
            </div>
          </div>
          <div className="use">
            <span className="ix">3</span>
            <div>
              <div className="ut">IP routing tables</div>
              <p>
                Longest-prefix match over address bits decides the next hop. Tries (and radix tries)
                are the classic engine.
              </p>
            </div>
          </div>
          <div className="use">
            <span className="ix">4</span>
            <div>
              <div className="ut">Predictive text & T9</div>
              <p>
                Old number-pad and modern phone keyboards both walk a trie of likely continuations.
              </p>
            </div>
          </div>
          <div className="use">
            <span className="ix">5</span>
            <div>
              <div className="ut">In-memory database indexes</div>
              <p>
                Ordered keys, range scans, and prefix lookups live in one structure. That is why
                ART-style tries show up in modern engines.
              </p>
            </div>
          </div>
          <div className="use">
            <span className="ix">6</span>
            <div>
              <div className="ut">Word games & solvers</div>
              <p>
                Boggle and Scrabble solvers prune dead branches instantly: if a prefix has no track,
                stop exploring.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
