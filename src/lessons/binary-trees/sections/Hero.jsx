import { useMemo } from 'react';
import { Ruler, Search } from 'lucide-react';
import { buildFresh, HERO_KEYS } from '../engine/index.js';
import SearchPanel from '../components/SearchPanel.jsx';

// Plate 00 — the title plate. Drop a value into the tree and watch it get
// cornered. The animated descent (SearchPanel) is the lesson's opening promise:
// any item, among a thousand, found in a handful of steps.
export default function Hero() {
  const root = useMemo(() => buildFresh(HERO_KEYS), []);
  return (
    <header id="p0" className="bst-plate" style={{ paddingTop: 'clamp(40px,7vw,78px)' }}>
      <div className="bst-wrap">
        <div className="bst-rv">
          <div className="bst-kicker">
            <Ruler size={14} aria-hidden="true" />
            <span>
              <span className="n">Plate 00</span> · a structural study
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(46px,12.5vw,108px)',
              lineHeight: 0.92,
              letterSpacing: '-.03em',
              margin: '14px 0 0',
            }}
          >
            Binary
            <br />
            Trees
          </h1>
          <p className="bst-lead">
            A way to keep a pile of data so that you can find any item — among a thousand, or a
            million — in just a <em>handful</em> of steps, while still adding and removing items
            cheaply. Drop a value into the tree below and watch it get cornered.
          </p>
        </div>
        <div className="bst-rv" style={{ marginTop: 8 }}>
          <div className="bst-lab">
            <div className="bst-lab-head">
              <span className="bst-lab-tag">
                <Search aria-hidden="true" />
                the search, step by step
              </span>
            </div>
            <div className="bst-lab-body">
              <SearchPanel
                root={root}
                presets={[37, 62, 50, 87]}
                absent={[40, 90]}
                maxHeightPx={300}
              />
            </div>
          </div>
          <p className="bst-foot" style={{ marginTop: 14, textAlign: 'center' }}>
            ↓ scroll · ten plates, zero to a working mental model
          </p>
        </div>
      </div>
    </header>
  );
}
