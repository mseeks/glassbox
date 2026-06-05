import { useEffect, useState } from 'react';
import { Hash, Filter, Anchor, Boxes, ArrowRight, Pencil } from 'lucide-react';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { BUILD_SST, BUILD_DATA, getBlockedTrace } from '../engine/index.js';
import Section from '../components/Section.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import Plate from '../components/Plate.jsx';
import Seg from '../components/Seg.jsx';
import PlayBar from '../components/PlayBar.jsx';
import { usePlayer } from '../components/usePlayer.js';

const BUILD_BLOCKS = BUILD_SST.blocks;
const BUILD_SEGS = [
  ...BUILD_BLOCKS.map((b, i) => ({ kind: 'block', i })),
  { kind: 'index' },
  { kind: 'bloom' },
  { kind: 'footer' },
];
const READ_TARGET = 'loch';
const READ_BLOCK = getBlockedTrace(BUILD_SST, READ_TARGET).blockIndex;
const READ_SEQ = ['footer', 'index', 'block', 'scan'];

function segMeta(kind) {
  switch (kind) {
    case 'index':
      return { label: 'INDEX', ic: Hash, tone: 'steel' };
    case 'bloom':
      return { label: 'BLOOM', ic: Filter, tone: 'sage' };
    case 'footer':
      return { label: 'FOOTER', ic: Anchor, tone: 'ink' };
    default:
      return { label: '', ic: Boxes, tone: 'steel' };
  }
}
function segTone(tone, active) {
  const base =
    tone === 'steel'
      ? { borderColor: 'var(--steel)', background: 'var(--steel-wash)' }
      : tone === 'sage'
        ? { borderColor: 'var(--sage)', background: 'var(--sage-wash)' }
        : { borderColor: 'var(--ink-2)', background: 'var(--recess-2)' };
  if (active) return { ...base, boxShadow: '0 0 0 2px var(--blood)', borderColor: 'var(--blood)' };
  return base;
}

// §IV — compose the file front to back: data blocks, then the index, the bloom
// filter, and a footer written LAST (only then are the block offsets known).
// Flip to READ to run the film backward from the footer.
export default function BuildLab() {
  const reduced = usePrefersReducedMotion();
  const [mode, setMode] = useState('write');
  const totalWrite = BUILD_SEGS.length; // blocks + 3
  const totalRead = READ_SEQ.length; // 4
  const total = mode === 'write' ? totalWrite : totalRead;
  const player = usePlayer(total, { speed: 760, reduced });
  const { i, reset } = player;
  useEffect(() => {
    reset();
  }, [mode, reset]);
  const done = i >= total;

  // write: how many segments committed; how many index entries are known in memory
  const written = Math.min(i, totalWrite); // segments placed = i
  const blocksDone = Math.min(written, BUILD_BLOCKS.length);
  const activeWriteIdx = mode === 'write' && i > 0 ? i - 1 : -1; // index of the seg just placed

  // read: which stage is current
  const readStage = mode === 'read' && i > 0 ? READ_SEQ[Math.min(i - 1, totalRead - 1)] : null;
  const readActiveKind = readStage ? (readStage === 'scan' ? 'block' : readStage) : null;

  // status text
  let status =
    mode === 'write'
      ? 'ready — build the file front to back'
      : 'ready — read it backward from the footer';
  if (i > 0) {
    if (mode === 'write') {
      const seg = BUILD_SEGS[Math.min(i - 1, totalWrite - 1)];
      if (done) status = 'done — footer written last, pointing back at the index';
      else if (seg.kind === 'block')
        status = `composing block b${seg.i} · its first key joins the in-memory index`;
      else if (seg.kind === 'index')
        status = 'data finished → now block offsets are known → write the index block';
      else if (seg.kind === 'bloom') status = 'write the bloom filter';
      else if (seg.kind === 'footer')
        status = 'write the fixed-size footer — last, so it can record where the index begins';
    } else {
      if (readStage === 'footer') status = 'seek to end − footer size → read the fixed footer';
      else if (readStage === 'index')
        status = 'footer says where the index lives → binary-search it (in memory)';
      else if (readStage === 'block') status = `one seek → fetch block b${READ_BLOCK}`;
      else if (readStage === 'scan') status = `scan in memory → found “${READ_TARGET}”`;
    }
  }

  const knownIdx = BUILD_BLOCKS.slice(0, mode === 'write' ? blocksDone : BUILD_BLOCKS.length);

  return (
    <Section id="anatomy">
      <SectionHeading
        roman="IV"
        kicker="the layout"
        title="The colophon at the end"
        dek="Data blocks first, then the index, then the bloom filter, then a small footer at the very end. The order is not a quirk — it is the signature of something written once."
      />

      <div className="sst-prose" style={{ marginBottom: 20 }}>
        <p>
          You cannot write the index until the data is done, because only then do you know each
          block’s location. So you stream the data, then write the index, then a{' '}
          <span className="st">footer</span> that records where the index begins. Reading runs the
          film backward: seek to the end, read the fixed footer, and now you know where everything
          lives — like an index printed on a book’s last page, because the page numbers only exist
          once the book is set.
        </p>
      </div>

      <Plate
        cap={`build lab · ${BUILD_DATA.length} keys`}
        capRight={mode === 'write' ? 'writing · front → back' : 'reading · back → front'}
      >
        <div className="sst-lab-controls">
          <Seg
            ariaLabel="direction"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'write', label: 'Write' },
              { value: 'read', label: 'Read' },
            ]}
          />
          <PlayBar player={player} reduced={reduced} done={done} />
        </div>

        <div className="sst-status">{status}</div>

        {/* in-memory index accumulator (write mode) */}
        {mode === 'write' && (
          <div className="sst-buildmem">
            <span className="sst-tiny" style={{ color: 'var(--steel)' }}>
              <Pencil size={12} aria-hidden="true" /> index · in memory
              {written > BUILD_BLOCKS.length ? ' → flushed to file' : ''}
            </span>
            <div className="sst-chiprow" style={{ marginTop: 6 }}>
              {knownIdx.length === 0 ? (
                <span className="sst-mono" style={{ color: 'var(--ink-3)', fontSize: 12 }}>
                  —
                </span>
              ) : (
                knownIdx.map((b, j) => (
                  <span
                    key={j}
                    className="sst-lkcell"
                    style={{ borderColor: 'var(--steel)', background: 'var(--steel-wash)' }}
                  >
                    {b.firstKey} → b{j}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {/* the file, laid out left to right */}
        <div className="sst-scrollx" style={{ marginTop: 14 }}>
          <div className="sst-filerow">
            {BUILD_SEGS.map((seg, idx) => {
              const committed = mode === 'write' ? idx < written : true;
              const isLanding = mode === 'write' && idx === activeWriteIdx;
              const meta = segMeta(seg.kind);
              const isReadActive =
                mode === 'read' &&
                i > 0 &&
                ((readActiveKind === 'block' && seg.kind === 'block' && seg.i === READ_BLOCK) ||
                  (readActiveKind === seg.kind && seg.kind !== 'block'));
              const active = isLanding || isReadActive;

              if (!committed) {
                return (
                  <div key={idx} className="sst-seg-ghost">
                    {seg.kind === 'block' ? `b${seg.i}` : meta.label}
                  </div>
                );
              }
              if (seg.kind === 'block') {
                const b = BUILD_BLOCKS[seg.i];
                return (
                  <div
                    key={idx}
                    className={`sst-fileseg${active ? ' active' : ''}`}
                    style={segTone('steel', active)}
                  >
                    <span className="sst-seg-tag">
                      <Boxes size={11} aria-hidden="true" /> b{seg.i}
                    </span>
                    <div className="sst-seg-recs">
                      {b.records.map(([k]) => (
                        <span
                          key={k}
                          className="sst-seg-rec"
                          style={
                            mode === 'read' && active && k === READ_TARGET
                              ? {
                                  background: 'var(--blood)',
                                  color: 'var(--paper)',
                                  borderColor: 'var(--blood)',
                                }
                              : {}
                          }
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }
              const Ic = meta.ic;
              return (
                <div
                  key={idx}
                  className={`sst-fileseg meta${active ? ' active' : ''}`}
                  style={segTone(meta.tone, active)}
                >
                  <span className="sst-seg-tag">
                    <Ic size={11} aria-hidden="true" /> {meta.label}
                  </span>
                  {seg.kind === 'index' && (
                    <div className="sst-seg-recs">
                      {BUILD_BLOCKS.map((b, j) => (
                        <span key={j} className="sst-seg-rec">
                          {b.firstKey}→b{j}
                        </span>
                      ))}
                    </div>
                  )}
                  {seg.kind === 'bloom' && (
                    <div className="sst-bloombits">
                      {Array.from({ length: 18 }).map((_, b) => (
                        <span key={b} className={`sst-bbit${(b * 7) % 3 === 0 ? ' on' : ''}`} />
                      ))}
                    </div>
                  )}
                  {seg.kind === 'footer' && (
                    <div className="sst-seg-foot">→ index @ {BUILD_SST.footer.indexOffset}B</div>
                  )}
                </div>
              );
            })}
            {mode === 'read' && i > 0 && (
              <div className="sst-readhead" aria-hidden="true">
                <ArrowRight size={13} style={{ transform: 'scaleX(-1)' }} /> read direction
              </div>
            )}
          </div>
        </div>
      </Plate>

      <div className="sst-note" style={{ marginTop: 18 }}>
        <span className="sst-note-lab">why last</span>
        The footer is fixed-size and final so a reader can find it instantly — seek to{' '}
        <code>end − footer</code>, and it hands over the location of everything else. The index
        couldn’t come first: until the data is written, its block offsets simply don’t exist yet.
      </div>
    </Section>
  );
}
