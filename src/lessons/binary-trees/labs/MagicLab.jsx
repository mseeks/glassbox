import { useMemo, useState } from 'react';
import { Ruler } from 'lucide-react';
import { buildPerfect, bstView, capacityOf, fmt } from '../engine/index.js';
import TreeSVG from '../components/TreeSVG.jsx';

// §03 — "n items → ~log₂ n levels". Drag the height; the readout shows how few
// levels hold an enormous number of items. The drawing caps at height 3 (any
// taller would not fit), with a note for the extra levels.
export default function MagicLab() {
  const [h, setH] = useState(3);
  const drawnH = Math.min(h, 3);
  const tree = useMemo(() => buildPerfect(drawnH), [drawnH]);
  const view = useMemo(() => bstView(tree), [tree]);
  return (
    <div className="bst-lab">
      <div className="bst-lab-head">
        <span className="bst-lab-tag">
          <Ruler aria-hidden="true" />n items → ~log₂ n levels
        </span>
      </div>
      <div className="bst-lab-body">
        <p className="bst-note">
          A perfectly balanced tree doubles its capacity with each level of height. Drag the height
          and watch how few levels it takes to hold an enormous number of items.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '52px 1fr',
            gap: '4px 12px',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <span className="bst-foot" style={{ color: 'var(--red)' }}>
            height
          </span>
          <input
            className="bst-slider"
            type="range"
            min={0}
            max={20}
            value={h}
            onChange={(e) => setH(+e.target.value)}
            aria-label="tree height"
          />
        </div>
        <div className="bst-readout" style={{ marginBottom: 12 }}>
          <span>
            height <b>{h}</b> &nbsp;=&nbsp; <b>{h + 1}</b> levels
          </span>
          <span>
            holds up to <span className="big">{fmt(capacityOf(h))}</span> items
          </span>
        </div>
        <TreeSVG
          {...view}
          showHeight
          heightLabel={`height ${drawnH}`}
          maxHeightPx={230}
          label="a perfectly balanced tree"
        />
        {h > 3 && (
          <div
            className="bst-foot"
            style={{ textAlign: 'center', marginTop: 6, color: 'var(--red)' }}
          >
            ⋮ &nbsp;+{h - 3} more level{h - 3 > 1 ? 's' : ''} than drawn
          </div>
        )}
        <div className="bst-cap">
          A million items fit in a tree just <span className="hot">20 levels</span> deep; a billion
          in <span className="hot">30</span>. Because each step down halves what&apos;s left, the
          longest search is only as long as the tree is tall — and a balanced tree of <em>n</em>{' '}
          items is about <b>log₂ n</b> tall. That relationship is the entire source of the speed.
        </div>
      </div>
    </div>
  );
}
