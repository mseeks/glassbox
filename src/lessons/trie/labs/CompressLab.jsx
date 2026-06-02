import { useMemo, useState } from 'react';
import { buildRadix, buildTrie, layoutRadix, layoutTrie } from '../engine/index.js';
import TrieMap from '../components/TrieMap.jsx';
import Callout from '../components/Callout.jsx';
import { WORDS } from '../components/helpers.js';

// Toggle between the standard trie and the path-compressed radix trie. The
// pure single-child corridors collapse into multi-letter segments — same
// words, same paths, fewer nodes to allocate.
export default function CompressLab() {
  const stdRoot = useMemo(() => buildTrie(WORDS), []);
  const radRoot = useMemo(() => buildRadix(WORDS), []);
  const stdData = useMemo(() => layoutTrie(stdRoot), [stdRoot]);
  const radData = useMemo(() => layoutRadix(radRoot, { colW: 74 }), [radRoot]);
  const [mode, setMode] = useState('std');
  const data = mode === 'std' ? stdData : radData;
  const stdCount = stdData.nodes.length,
    radCount = radData.nodes.length;
  return (
    <div className="card">
      <div className="lab-head">
        <span className="lab-tag">lab 04 · path compression</span>
        <span className="lab-title">The radix trie</span>
      </div>
      <div className="lab-sub">
        A long run of single-child junctions carries no information. There are no decisions to make.
        Collapse each such run into one labelled segment and the map shrinks without losing a thing.
      </div>
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <div className="seg">
          <button className={mode === 'std' ? 'on' : ''} onClick={() => setMode('std')}>
            Standard
          </button>
          <button className={mode === 'rad' ? 'on' : ''} onClick={() => setMode('rad')}>
            Compressed
          </button>
        </div>
        <span style={{ fontSize: 13.5, color: 'var(--ink-dim)' }}>
          same {WORDS.length} words, same paths
        </span>
      </div>
      <TrieMap data={data} showWords="all" />
      <div className="statrow">
        <div className="stat">
          <div className="v">{stdCount}</div>
          <div className="l">nodes · standard trie</div>
        </div>
        <div className="stat">
          <div className="v" style={{ color: 'var(--pine)' }}>
            {radCount}
          </div>
          <div className="l">nodes · compressed</div>
        </div>
        <div className="stat">
          <div className="v">
            {Math.round((1 - radCount / stdCount) * 100)}
            <small>%</small>
          </div>
          <div className="l">fewer hops to chase</div>
        </div>
      </div>
      <Callout title="read the segment labels">
        In compressed mode an edge can carry several letters at once. The run{' '}
        <span className="tcode">d·g·e</span> after "do" becomes a single segment, because nothing
        branches along the way. Lookup still walks letter by letter; it just stores the boring
        stretches as one piece.
      </Callout>
    </div>
  );
}
