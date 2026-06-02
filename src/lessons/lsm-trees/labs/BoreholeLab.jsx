import { useEffect, useRef, useState } from 'react';
import { Pickaxe, Plus, Trash2, RotateCcw, Search } from 'lucide-react';
import { resolveBorehole } from '../engine/index.js';
import Figure from '../components/Figure.jsx';
import Layer, { STRATA } from '../components/Layer.jsx';

const LH = 46; // layer height

// §I — the one idea, made tactile. Write to drop a new layer on top, delete
// to drop a tombstone, read to drill from the surface and take the first
// thing the bit hits.
export default function BoreholeLab() {
  const [layers, setLayers] = useState([
    { id: 3, v: '120' },
    { id: 2, v: '95' },
    { id: 1, v: '40' },
  ]);
  const [drill, setDrill] = useState(null); // null | {phase:'drilling'|'done', answer, tomb, empty}
  const [val, setVal] = useState('');
  const idc = useRef(4);
  const timers = useRef([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const write = (v) => {
    if (v === '' || v == null) return;
    clearTimers();
    setDrill(null);
    setLayers((L) => [{ id: idc.current++, v: String(v), fresh: true }, ...L]);
  };
  const del = () => {
    clearTimers();
    setDrill(null);
    setLayers((L) => [{ id: idc.current++, tomb: true, fresh: true }, ...L]);
  };

  const read = () => {
    clearTimers();
    const resolved = resolveBorehole(layers);
    setDrill({ phase: 'drilling' });
    timers.current.push(
      setTimeout(() => {
        setDrill({ phase: 'done', ...resolved });
      }, 620),
    );
  };

  const reset = () => {
    clearTimers();
    idc.current = 4;
    setDrill(null);
    setLayers([
      { id: 3, v: '120' },
      { id: 2, v: '95' },
      { id: 1, v: '40' },
    ]);
  };
  useEffect(() => () => clearTimers(), []);

  const ageLabel = (i, total) => (i === 0 ? 'newest' : i === total - 1 ? 'oldest' : `${i} down`);
  const done = drill && drill.phase === 'done';
  // drill shaft height: hovering above surface while drilling, plunged into layer 0 when done
  const shaftH = drill ? (done ? LH - 8 : 6) : 0;

  return (
    <Figure cap={`lab · the key  "balance"  through time`} style={{ padding: '24px 22px 20px' }}>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 184px', gap: 22 }}
        className="bore-grid"
      >
        <div>
          <div
            className="tiny"
            style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}
          >
            <span>the core · newest on top</span>
            <span>{layers.length} layers</span>
          </div>
          <div style={{ position: 'relative' }}>
            {/* drill shaft */}
            {drill && (
              <div
                style={{
                  position: 'absolute',
                  left: 24,
                  top: -14,
                  width: 3,
                  zIndex: 5,
                  height: 14 + shaftH,
                  background: 'linear-gradient(180deg, var(--instr-3), var(--instr))',
                  transition: 'height 0.5s cubic-bezier(0.5,0,0.2,1)',
                  boxShadow: '0 0 10px rgba(84,180,200,0.6)',
                }}
              >
                <Pickaxe
                  size={17}
                  color="var(--instr-3)"
                  style={{
                    position: 'absolute',
                    bottom: -9,
                    left: -7,
                    filter: 'drop-shadow(0 0 4px rgba(84,180,200,0.7))',
                  }}
                />
              </div>
            )}
            {layers.map((l, i) => (
              <Layer
                key={l.id}
                fill={STRATA[Math.min(i, 5)]}
                h={LH}
                idx={i}
                fresh={l.fresh}
                tomb={l.tomb}
                found={done && i === 0}
                dim={done && i > 0}
                label={l.tomb ? '∅  deleted' : `balance = ${l.v}`}
                sub={ageLabel(i, layers.length)}
              />
            ))}
            {layers.length === 0 && (
              <div
                style={{
                  padding: 20,
                  textAlign: 'center',
                  border: '1px dashed var(--rule-soft)',
                  fontStyle: 'italic',
                  color: 'var(--ink-faint)',
                }}
              >
                bedrock · no data
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div className="tiny">operations</div>
          <input
            className="inp"
            placeholder="new value"
            aria-label="New value to write"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                write(val);
                setVal('');
              }
            }}
          />
          <button
            className="btn btn-w"
            onClick={() => {
              write(val || Math.floor(Math.random() * 200));
              setVal('');
            }}
          >
            <Plus size={12} /> write
          </button>
          <button
            className="btn"
            style={{ borderColor: 'var(--rule-soft)', color: 'var(--ink-2)' }}
            onClick={del}
          >
            <Trash2 size={12} /> delete
          </button>
          <button className="btn btn-i" onClick={read}>
            <Search size={12} /> read
          </button>
          <button
            className="btn"
            style={{ borderColor: 'var(--rule)', color: 'var(--ink-3)' }}
            onClick={reset}
          >
            <RotateCcw size={12} /> reset
          </button>

          <div
            style={{
              marginTop: 4,
              padding: '12px',
              background: 'var(--paper-3)',
              border: `1.5px solid ${done ? 'var(--instr-2)' : 'var(--rule)'}`,
              minHeight: 92,
              transition: 'border-color 0.3s',
            }}
          >
            <div className="tiny" style={{ marginBottom: 6 }}>
              read returns
            </div>
            {!drill && (
              <div
                className="serif"
                style={{ fontStyle: 'italic', color: 'var(--ink-faint)', fontSize: 14 }}
              >
                press read to drill
              </div>
            )}
            {drill && !done && (
              <div className="m" style={{ color: 'var(--instr)' }}>
                drilling…
              </div>
            )}
            {done && (
              <div className="rise">
                <div
                  className="d"
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: drill.answer == null ? 'var(--ink-3)' : 'var(--writ)',
                  }}
                >
                  {drill.empty ? '–' : drill.answer == null ? 'not found' : drill.answer}
                </div>
                <div
                  className="serif"
                  style={{
                    fontStyle: 'italic',
                    fontSize: 12.5,
                    color: 'var(--ink-3)',
                    marginTop: 4,
                  }}
                >
                  {drill.empty
                    ? 'nothing here'
                    : drill.answer == null
                      ? 'top layer is a tombstone; the value below is shadowed, not gone'
                      : 'stopped at the newest layer, never looked deeper'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, paddingTop: 13, borderTop: '1px solid var(--rule)' }}>
        <span
          className="serif"
          style={{ fontStyle: 'italic', fontSize: 14.5, color: 'var(--ink-2)' }}
        >
          Write a few times and the value never moves. A new layer simply lands on top. A read
          drills from the surface and stops at the <em>first</em> layer it meets, so the newest
          write always wins. Delete, then read: the old value is still physically there, just buried
          under a layer that says <em>nothing</em>.
        </span>
      </div>
    </Figure>
  );
}
