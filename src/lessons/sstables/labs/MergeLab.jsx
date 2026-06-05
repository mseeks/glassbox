import { useEffect, useMemo, useState } from 'react';
import { GitMerge, ArrowDown, BookMarked } from 'lucide-react';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { kwayMerge, MERGE_RUNS } from '../engine/index.js';
import Section from '../components/Section.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import Plate from '../components/Plate.jsx';
import Seg from '../components/Seg.jsx';
import Stat from '../components/Stat.jsx';
import Rec from '../components/Rec.jsx';
import PlayBar from '../components/PlayBar.jsx';
import { usePlayer } from '../components/usePlayer.js';

// §VII — the k-way merge. A cursor rides each sorted run; the smallest key is
// emitted and shared cursors advance. Newest wins on ties; a tombstone is
// carried forward, and buried only when the merge reaches the bottom level.
export default function MergeLab() {
  const reduced = usePrefersReducedMotion();
  const [bottom, setBottom] = useState(false);
  const tables = useMemo(() => MERGE_RUNS.map((r) => r.data), []);
  const { out, trace } = useMemo(
    () => kwayMerge(tables, { bottomLevel: bottom }),
    [tables, bottom],
  );
  const total = trace.length;
  const player = usePlayer(total, { speed: 900, reduced });
  const { i, reset } = player;
  useEffect(() => {
    reset();
  }, [bottom, reset]);
  const done = i >= total;

  const cur = i < total ? trace[i] : null;
  const doneSteps = trace.slice(0, i);
  const emitted = doneSteps.filter((s) => s.emitted);
  const shadowed = doneSteps.reduce((a, s) => a + s.discarded.length, 0);
  const buried = doneSteps.filter((s) => s.dropped).length;

  let status = 'ready — merge three runs into one';
  if (cur) {
    const inN = 1 + cur.discarded.length;
    const base =
      inN > 1
        ? `“${cur.key}” is in ${inN} runs → newest (T${cur.winner}) wins`
        : `“${cur.key}” → only in T${cur.winner}`;
    status = cur.tomb
      ? `${base} · tombstone ${bottom ? '→ buried (bottom level)' : '→ kept (older copies may survive below)'}`
      : base;
  } else if (done) {
    status = `merged ${out.length} keys into one fresh run · ${shadowed} shadowed · ${buried} buried`;
  }

  return (
    <Section id="merge">
      <SectionHeading
        roman="VII"
        kicker="compaction"
        title="Pour many runs into one"
        dek="Open a cursor on each sorted run, repeatedly emit the smallest key, advance that cursor. Every input is read once, streaming; the output is written once. That is why compaction is kind to the disk."
      />

      <div className="sst-prose" style={{ marginBottom: 20 }}>
        <p>
          Two rules ride along on the merge — and both are echoes of how the layered store behaves.
          When a key appears in several runs, the <span className="ox">newest</span> copy wins and
          the rest are dropped: recency is resolved once, here, instead of on every read. And a{' '}
          <span className="dead-t">tombstone</span> — a delete marker — is carried forward through
          merges, then finally <strong>buried</strong> only when the merge includes the very bottom
          level, where no older copy can hide beneath it. A merge of these files is itself a file,
          which is what lets compaction run forever.
        </p>
      </div>

      <Plate
        cap="merge lab · 3 runs in · 1 run out"
        capRight={bottom ? 'bottom level' : 'intermediate level'}
      >
        <div className="sst-lab-controls">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="sst-tiny">bottom level?</span>
            <Seg
              ariaLabel="level"
              value={bottom ? 'yes' : 'no'}
              onChange={(v) => setBottom(v === 'yes')}
              options={[
                { value: 'no', label: 'Intermediate' },
                { value: 'yes', label: 'Bottom' },
              ]}
            />
          </div>
          <PlayBar
            player={player}
            reduced={reduced}
            done={done}
            label="merge"
            btnStyle={{ alignSelf: 'flex-end' }}
          />
          <div className="sst-readout" style={{ marginLeft: 'auto' }}>
            <Stat value={emitted.length} label="emitted" tone="sage" />
            <Stat value={shadowed} label="shadowed" />
            <Stat value={buried} label="buried" tone="blood" />
          </div>
        </div>

        <div className="sst-status">{status}</div>

        {/* input runs */}
        <div className="sst-merge-ins">
          {MERGE_RUNS.map((run, t) => {
            const runLen = run.data.length;
            const consumed = i < total ? cur.positions[t] : runLen;
            return (
              <div key={run.tag} className="sst-merge-col">
                <div className="sst-merge-head">
                  <span className="sst-mono" style={{ fontWeight: 700 }}>
                    {run.tag}
                  </span>
                  <span
                    className="sst-tiny"
                    style={{
                      color:
                        t === 0
                          ? 'var(--blood)'
                          : t === MERGE_RUNS.length - 1
                            ? 'var(--steel)'
                            : 'var(--ink-3)',
                    }}
                  >
                    {run.age}
                  </span>
                </div>
                <div className="sst-merge-recs">
                  {run.data.map(([k, v], r) => {
                    const isConsumed = r < consumed;
                    const isHead = i < total && r === consumed && consumed < runLen;
                    let st = 'idle';
                    if (isConsumed) st = 'shadow';
                    else if (isHead) {
                      if (t === cur.winner) st = cur.tomb ? 'dead' : 'hit';
                      else if (cur.discarded.includes(t)) st = 'shadow';
                      else st = 'block';
                    }
                    return <Rec key={k} k={k} v={v} state={st} />;
                  })}
                  {run.data.length === 0 && <span className="sst-tiny">empty</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* arrow */}
        <div className="sst-merge-arrow" aria-hidden="true">
          <GitMerge size={16} /> <span className="sst-tiny">k-way merge → new run</span>{' '}
          <ArrowDown size={15} />
        </div>

        {/* output run */}
        <div className="sst-merge-out">
          <div className="sst-merge-head">
            <span className="sst-mono" style={{ fontWeight: 700, color: 'var(--sage)' }}>
              <BookMarked size={13} aria-hidden="true" /> merged run
            </span>
            <span className="sst-tiny">{done ? 'sealed' : 'writing…'}</span>
          </div>
          <div className="sst-merge-orecs">
            {emitted.length === 0 ? (
              <span className="sst-tiny" style={{ color: 'var(--ink-3)' }}>
                —
              </span>
            ) : (
              emitted.map((s) => (
                <Rec
                  key={s.key}
                  k={s.key}
                  v={s.value}
                  state={s.tomb ? 'dead' : 'kept'}
                  title={s.tomb ? 'tombstone, carried onward' : undefined}
                />
              ))
            )}
          </div>
        </div>
      </Plate>

      <div className="sst-note" style={{ marginTop: 18 }}>
        <span className="sst-note-lab">flip the level</span>
        Set the merge to <b>bottom</b> and run it: the <code>cedar</code> tombstone is <b>buried</b>{' '}
        — it vanishes from the output, because nothing older can survive beneath the bottom. At an{' '}
        <b>intermediate</b> level the same tombstone is <b>kept</b> and travels onward, in case an
        older <code>cedar</code> still lurks in a lower run. That single condition is the whole
        tombstone-storm subtlety, made into one decision.
      </div>
    </Section>
  );
}
