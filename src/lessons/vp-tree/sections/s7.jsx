import { Reveal } from '../../../shared/reveal.jsx';
import SecHead from '../components/SecHead.jsx';

// §VII · Onward — the wider family of proximity structures, and the footer.
export default function S7() {
  return (
    <section id="s7" className="vp-section">
      <Reveal base="rv">
        <SecHead
          rn="VII · Onward"
          title="The wider family"
          lede="The vantage-point tree is one answer to one question: proximity. Here is the neighbourhood it lives in."
        />
      </Reveal>
      <Reveal base="rv">
        <div className="vp-cards">
          <div className="vp-card">
            <h4>k-d trees</h4>
            <p>
              The coordinate cousin: split space with axis-aligned cuts instead of distance shells.
              Excellent in low dimensions when you do have coordinates.
            </p>
            <span className="tag">spatial · coordinates</span>
          </div>
          <div className="vp-card">
            <h4>Ball trees</h4>
            <p>
              Group points into nested bounding spheres rather than median shells around a single
              landmark. Often sturdier on clustered data.
            </p>
            <span className="tag">metric · bounding</span>
          </div>
          <div className="vp-card">
            <h4>MVP trees</h4>
            <p>
              Use several vantage points per node at once, making each split sharper and the tree
              shallower. Fewer levels to descend.
            </p>
            <span className="tag">metric · multi-vantage</span>
          </div>
          <div className="vp-card">
            <h4>BK-trees</h4>
            <p>
              Built for discrete metrics like edit distance. The structure behind fast "did you
              mean?" spelling correction.
            </p>
            <span className="tag">metric · discrete</span>
          </div>
          <div className="vp-card">
            <h4>M-trees</h4>
            <p>
              A disk-friendly metric index you can update on the fly, closer to how a database would
              actually store and grow one over time. Built to live on disk.
            </p>
            <span className="tag">metric · on-disk</span>
          </div>
          <div className="vp-card">
            <h4>LSH &amp; HNSW</h4>
            <p>
              The approximate world for high dimensions. Hashing and navigable graphs that power
              modern vector search. Where the curse sends everyone, eventually.
            </p>
            <span className="tag">approximate · high-dim</span>
          </div>
        </div>
      </Reveal>
      <Reveal base="rv" className="vp-prose">
        <p style={{ marginTop: 26 }}>
          One question runs under all of them: <em>what is closest?</em> Each structure strikes its
          own bargain. Some trade exactness for speed, some chase higher dimensions, some pay more
          at build time so that every later query runs faster. The trade-offs differ. The shape does
          not. Knowing how the spheres and the triangle inequality work here is the lens that makes
          the rest of the family legible.
        </p>
      </Reveal>

      <footer className="vp-foot">
        <div className="sig">
          Vantage Point Trees · an interactive field instrument · built on a live engine
        </div>
      </footer>
    </section>
  );
}
