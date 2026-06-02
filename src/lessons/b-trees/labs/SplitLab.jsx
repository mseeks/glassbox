import { useEffect, useRef, useState } from 'react';
import {
  Plus,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Building2,
} from 'lucide-react';
import { BTree, resetNodeIds, heightOf, countOf } from '../engine/index.js';
import TreeSVG from '../components/TreeSVG.jsx';

// §V — the split, the centerpiece. File keys into a tree whose drawers hold at
// most four keys; a fifth card triggers a split and, at the full root, grows a
// level. The frame player is driven by buttons the user pressed, so it keeps
// animating; the timer cleans up.
const SPLIT_PALETTE = [5, 15, 25, 35, 45, 50, 55, 60, 65, 70, 75, 80, 85, 95];

export default function SplitLab() {
  const build = () => {
    resetNodeIds(9000);
    const t = new BTree(5);
    [10, 20, 30, 40].forEach((k) => t.insert(k));
    return t;
  };
  const treeRef = useRef(null);
  if (!treeRef.current) treeRef.current = build();
  const [present, setPresent] = useState(() => new Set([10, 20, 30, 40]));
  const [frames, setFrames] = useState([]);
  const [fi, setFi] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [, force] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    if (fi >= frames.length - 1) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => setFi((i) => i + 1), 1250);
    return () => clearTimeout(timer.current);
  }, [playing, fi, frames]);

  const doInsert = (k) => {
    clearTimeout(timer.current);
    const f = treeRef.current.insert(k);
    setPresent((p) => new Set(p).add(k));
    if (f.length) {
      setFrames(f);
      setFi(0);
      setPlaying(true);
    } else {
      setFrames([]);
      setPlaying(false);
    }
    force((x) => x + 1);
  };
  const random = () => {
    const avail = SPLIT_PALETTE.filter((k) => !present.has(k));
    if (avail.length) doInsert(avail[Math.floor(Math.random() * avail.length)]);
  };
  const reset = () => {
    clearTimeout(timer.current);
    treeRef.current = build();
    setPresent(new Set([10, 20, 30, 40]));
    setFrames([]);
    setFi(0);
    setPlaying(false);
    force((x) => x + 1);
  };

  const active = frames.length > 0;
  const frame = active ? frames[fi] : null;
  const displayRoot = active ? frame.snap : treeRef.current.root;
  const focusIds = new Set(frame ? frame.focus : []);
  const h = heightOf(displayRoot),
    c = countOf(displayRoot);

  return (
    <div className="bt-lab">
      <span className="bt-lab-tab">
        <Plus />
        Lab · insert &amp; split
      </span>
      <div className="bt-lab-body">
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 9 }}>
          A drawer holds at most <strong>4 keys</strong>, and this catalog starts with a single
          drawer already full to the brim. File <span className="bt-stampc">50</span> first and
          watch what a full root does. Go on.
        </div>
        <div className="bt-controls" style={{ marginBottom: 10 }}>
          {SPLIT_PALETTE.map((k) => (
            <button
              key={k}
              className="bt-keypill"
              disabled={present.has(k) || playing}
              onClick={() => doInsert(k)}
              style={
                k === 50 && !present.has(50)
                  ? { borderColor: 'var(--stamp)', color: 'var(--stamp)', fontWeight: 700 }
                  : undefined
              }
            >
              {k}
            </button>
          ))}
          <button className="bt-btn bt-btn-ghost" disabled={playing} onClick={random}>
            <Sparkles />
            Random
          </button>
          <button className="bt-btn bt-btn-ghost" onClick={reset}>
            <RotateCcw />
            Reset
          </button>
        </div>

        {/* player + grew badge — sits directly above the tree so both stay in view */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 34, marginBottom: 2 }}
        >
          <button
            className="bt-btn"
            disabled={!active || fi === 0}
            aria-label="Previous step"
            onClick={() => {
              setPlaying(false);
              setFi((i) => Math.max(0, i - 1));
            }}
          >
            <ChevronLeft />
          </button>
          {playing ? (
            <button className="bt-btn" onClick={() => setPlaying(false)}>
              <Pause />
              Pause
            </button>
          ) : (
            <button
              className="bt-btn"
              disabled={!active || fi >= frames.length - 1}
              onClick={() => {
                if (fi >= frames.length - 1) {
                  setFi(0);
                }
                setPlaying(true);
              }}
            >
              <Play />
              {active && fi >= frames.length - 1 ? 'Replay' : 'Play'}
            </button>
          )}
          <button
            className="bt-btn"
            disabled={!active || fi >= frames.length - 1}
            aria-label="Next step"
            onClick={() => {
              setPlaying(false);
              setFi((i) => Math.min(frames.length - 1, i + 1));
            }}
          >
            <ChevronRight />
          </button>
          <div style={{ flex: 1 }} />
          {frame && frame.grew && (
            <span
              className="bt-chip bt-chip-stamp"
              style={{ animation: 'btpulse 1s ease infinite' }}
            >
              <Building2 size={12} />
              grew a level
            </span>
          )}
        </div>

        <div style={{ minHeight: 196 }}>
          <TreeSVG
            root={displayRoot}
            maxHeight={210}
            state={{
              focusIds,
              medianKey: frame ? frame.median : null,
              dim: !!(frame && frame.kind !== 'settled'),
            }}
          />
        </div>

        <div className="bt-lab-cap" style={{ minHeight: '3em' }}>
          {frame
            ? frame.caption
            : 'Drawer ready, four cards inside. File any key. A split happens the moment a fifth card lands in a full drawer.'}
        </div>

        <div className="bt-readgrid" style={{ marginTop: 4 }}>
          <div className="bt-read">
            <div
              className="bt-read-n"
              style={{
                color: frame && frame.grew ? 'var(--stamp)' : 'var(--ink)',
                transition: 'color .3s',
              }}
            >
              {h}
            </div>
            <div className="bt-read-l">height (levels)</div>
          </div>
          <div className="bt-read">
            <div className="bt-read-n">{c}</div>
            <div className="bt-read-l">keys filed</div>
          </div>
          <div className="bt-read">
            <div
              className="bt-read-n"
              style={{ fontSize: 15, fontFamily: 'var(--font-mono)', paddingTop: 6 }}
            >
              {frame ? frame.kind : 'idle'}
            </div>
            <div className="bt-read-l">last event</div>
          </div>
        </div>
      </div>
    </div>
  );
}
