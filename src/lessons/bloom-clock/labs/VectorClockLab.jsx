import { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { vMerge, vRecord } from '../engine/index.js';
import { Callout } from '../components/atoms.jsx';

export const VectorClockLab = () => {
  const [nodes, setNodes] = useState(['A', 'B', 'C']);
  const [vectors, setVectors] = useState(() => ({
    A: [0, 0, 0],
    B: [0, 0, 0],
    C: [0, 0, 0],
  }));

  const tick = (nodeId) => {
    const idx = nodes.indexOf(nodeId);
    setVectors((prev) => ({ ...prev, [nodeId]: vRecord(prev[nodeId], idx) }));
  };

  const message = (from, to) => {
    const fromIdx = nodes.indexOf(from);
    const toIdx = nodes.indexOf(to);
    setVectors((prev) => {
      // sender increments first
      const senderClock = vRecord(prev[from], fromIdx);
      // receiver merges then increments
      const merged = vMerge(prev[to], senderClock);
      const receiverClock = vRecord(merged, toIdx);
      return { ...prev, [from]: senderClock, [to]: receiverClock };
    });
  };

  const addNode = () => {
    if (nodes.length >= 8) return;
    const newId = String.fromCharCode(65 + nodes.length);
    const newNodes = [...nodes, newId];
    setNodes(newNodes);
    setVectors((prev) => {
      const out = {};
      newNodes.forEach((id) => {
        const existing = prev[id] || new Array(newNodes.length).fill(0);
        // extend old vectors with a new 0 slot
        out[id] = id === newId ? new Array(newNodes.length).fill(0) : [...existing, 0];
      });
      return out;
    });
  };

  const reset = () => {
    setNodes(['A', 'B', 'C']);
    setVectors({ A: [0, 0, 0], B: [0, 0, 0], C: [0, 0, 0] });
  };

  const nodeColors = [
    'var(--bc-gold)',
    'var(--bc-violet)',
    'var(--bc-emerald)',
    'var(--bc-rose)',
    'var(--bc-teal)',
    'var(--bc-node-6)',
    'var(--bc-node-7)',
    'var(--bc-node-8)',
  ];

  return (
    <div className="bc-panel-elevated" style={{ padding: 32, marginTop: 40 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div className="bc-eyebrow" style={{ color: 'var(--bc-emerald)' }}>
            LAB · VECTOR CLOCK
          </div>
          <div className="bc-italic" style={{ fontSize: 26, color: 'var(--bc-ink)', marginTop: 4 }}>
            Watch the size grow with N
          </div>
        </div>
        <div className="bc-mono" style={{ fontSize: 12, color: 'var(--bc-ink-muted)' }}>
          per-event size: <span style={{ color: 'var(--bc-rose)' }}>{nodes.length} integers</span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 14 }}>
        {nodes.map((id, i) => (
          <div key={id} className="bc-vc-row">
            <div
              className="bc-italic bc-vc-label"
              style={{
                fontSize: 32,
                color: nodeColors[i % nodeColors.length],
                textAlign: 'center',
              }}
            >
              {id}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {vectors[id].map((v, j) => (
                <div
                  key={j}
                  className="bc-mono"
                  style={{
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      v > 0
                        ? `color-mix(in srgb, ${nodeColors[j % nodeColors.length]} 14%, transparent)`
                        : 'var(--bc-sheen)',
                    border: `1px solid ${v > 0 ? `color-mix(in srgb, ${nodeColors[j % nodeColors.length]} 42%, transparent)` : 'var(--bc-sheen-border-2)'}`,
                    borderRadius: 3,
                    fontSize: 14,
                    color: v > 0 ? nodeColors[j % nodeColors.length] : 'var(--bc-ink-faint)',
                    transition: 'all 200ms',
                    flexShrink: 0,
                  }}
                >
                  {v}
                </div>
              ))}
            </div>
            <div className="bc-vc-controls" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button className="bc-btn" onClick={() => tick(id)}>
                tick
              </button>
              {nodes.length > 1 && (
                <select
                  className="bc-mono"
                  aria-label={`Send a message from node ${id} to another node`}
                  onChange={(e) => {
                    if (e.target.value) {
                      message(id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  style={{
                    background: 'var(--bc-control-bg)',
                    border: '1px solid var(--bc-control-border)',
                    color: 'var(--bc-ink)',
                    padding: '8px 12px',
                    borderRadius: 3,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                  defaultValue=""
                >
                  <option value="">send →</option>
                  {nodes
                    .filter((n) => n !== id)
                    .map((n) => (
                      <option key={n} value={n}>
                        send to {n}
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
        <button className="bc-btn bc-btn-violet" onClick={addNode} disabled={nodes.length >= 8}>
          <Plus size={13} /> add a node
        </button>
        <button className="bc-btn" onClick={reset}>
          <RotateCcw size={13} /> reset
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="bc-mono" style={{ fontSize: 11, color: 'var(--bc-ink-faint)' }}>
            total bytes carried per event: {nodes.length * 4}
          </div>
        </div>
      </div>

      <Callout title="What to notice" color="var(--bc-emerald)" tone="note">
        Each row is one node's <em>view of the world</em>. Slot j in node i's vector answers a
        single question: how many events from node j have I, transitively, heard about? Now add a
        node. Every existing vector grows, and the bytes carried on every future event grow right
        along with it. This is the exactness bill.
      </Callout>
    </div>
  );
};
