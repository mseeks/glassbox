import { useEffect, useMemo, useState } from 'react';
import { Check, X as XIcon, Search } from 'lucide-react';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { skipTrace, SKIP_RUNS, SKIP_M, SKIP_K, SKIP_TARGETS, BLOOMS } from '../engine/index.js';
import Section from '../components/Section.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import Plate from '../components/Plate.jsx';
import Stat from '../components/Stat.jsx';
import PlayBar from '../components/PlayBar.jsx';
import { usePlayer } from '../components/usePlayer.js';

// §VI — a bloom filter on every table is a doorman: before any seek, ask "could
// this key possibly be here?" A "no" skips for free; a "maybe" costs one seek,
// and a maybe can be wrong — an honest false positive, one wasted read.
export default function SkipLab() {
  const reduced = usePrefersReducedMotion();
  const [key, setKey] = useState('ginger');
  const { seq } = useMemo(() => skipTrace(key), [key]);
  const total = seq.length;
  const player = usePlayer(total, { speed: 740, reduced });
  const { i, reset } = player;
  useEffect(() => {
    reset();
  }, [key, reset]);
  const done = i >= total;

  const revealed = seq.slice(0, i); // verdicts shown so far
  const curStep = i > 0 && !done ? seq[i - 1] : done ? seq[seq.length - 1] : null;
  const curTag = i > 0 ? seq[Math.min(i, total) - 1].tag : null;
  const seeksSoFar = revealed.reduce((a, s) => a + s.seeks, 0);
  const verdictByTag = Object.fromEntries(revealed.map((s) => [s.tag, s]));
  const hitTag = seq.find((s) => s.verdict === 'hit')?.tag;

  let status = 'ready — query the stack top to bottom';
  if (curStep && i > 0) {
    if (curStep.verdict === 'skip') status = `${curStep.tag}: filter says no → skip · 0 seeks`;
    else if (curStep.verdict === 'hit') status = `${curStep.tag}: maybe → read → found “${key}”`;
    else status = `${curStep.tag}: maybe → read → MISS · false positive · 1 seek wasted`;
  }
  const isFP = done && seq.some((s) => s.verdict === 'falsepos') && !hitTag;
  const isClean = done && seeksSoFar === 0;

  return (
    <Section id="bloom">
      <SectionHeading
        roman="VI"
        kicker="the bloom filter"
        title="A doorman for every table"
        dek="A read may have to consult several tables. Each carries a small in-memory bloom filter, so before any seek you ask: could this key possibly be here?"
      />

      <div className="sst-prose" style={{ marginBottom: 20 }}>
        <p>
          A bloom filter answers <em>definitely not</em> or <em>maybe</em>, never a false negative.
          So a <span className="sage-t">no</span> lets you skip the whole table with zero disk work,
          and only a <span className="ox">maybe</span> costs a seek. It turns “probe every table”
          into “probe only the ones that might actually have it.” The price is honest: a maybe can
          be wrong, and that costs one wasted read.
        </p>
      </div>

      <Plate cap="skip lab · 4 runs · newest on top" capRight={`m=${SKIP_M} bits · k=${SKIP_K}`}>
        <div className="sst-lab-controls">
          <div className="sst-chiprow" style={{ flex: 1 }}>
            {SKIP_TARGETS.map((t) => (
              <button
                key={t}
                className={`sst-keychip${key === t ? ' on' : ''}`}
                onClick={() => setKey(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="sst-lab-controls" style={{ marginTop: 12 }}>
          <PlayBar player={player} reduced={reduced} done={done} />
          <div className="sst-readout" style={{ marginLeft: 'auto' }}>
            <Stat value={seeksSoFar} label="seeks · with filter" tone="blood" />
            <Stat value={SKIP_RUNS.length} label="seeks · without it (worst case)" />
          </div>
        </div>

        <div className="sst-status">{status}</div>

        <div className="sst-skipstack">
          {SKIP_RUNS.map((run) => {
            const v = verdictByTag[run.tag];
            const isCur = curTag === run.tag && i > 0 && !done;
            const bf = BLOOMS[run.tag];
            const probedIdx = isCur
              ? seq.find((s) => s.tag === run.tag)?.idx || []
              : v
                ? v.idx
                : [];
            let rowState = 'idle';
            if (v?.verdict === 'skip') rowState = 'skip';
            else if (v?.verdict === 'hit') rowState = 'hit';
            else if (v?.verdict === 'falsepos') rowState = 'fp';
            const rowStyle =
              rowState === 'skip'
                ? { borderColor: 'var(--sage)', background: 'var(--sage-wash)' }
                : rowState === 'hit'
                  ? { borderColor: 'var(--blood)', background: 'var(--blood-wash)' }
                  : rowState === 'fp'
                    ? { borderColor: 'var(--blood)', borderStyle: 'dashed' }
                    : isCur
                      ? { borderColor: 'var(--blood)', boxShadow: '0 0 0 2px var(--blood-wash)' }
                      : {};

            return (
              <div key={run.tag} className="sst-skiprow" style={rowStyle}>
                <div className="sst-skip-id">
                  <span className="sst-mono" style={{ fontWeight: 700 }}>
                    {run.tag}
                  </span>
                  {run.age && <span className="sst-tiny">{run.age}</span>}
                  {v && (
                    <span className={`sst-skip-badge ${rowState}`}>
                      {rowState === 'skip' ? (
                        <>
                          <XIcon size={11} aria-hidden="true" /> skip
                        </>
                      ) : rowState === 'hit' ? (
                        <>
                          <Check size={11} aria-hidden="true" /> read · hit
                        </>
                      ) : (
                        <>
                          <Search size={11} aria-hidden="true" /> read · miss
                        </>
                      )}
                    </span>
                  )}
                </div>
                <div className="sst-skip-keys">
                  {run.keys.map((k) => (
                    <span
                      key={k}
                      className="sst-seg-rec"
                      style={
                        done && k === key && rowState === 'hit'
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
                <div className="sst-skip-bits" title="bloom bit-array">
                  {Array.from({ length: SKIP_M }).map((_, b) => {
                    const set = bf.bits[b] === 1;
                    const probed = (isCur || v) && probedIdx.includes(b);
                    const cls = probed
                      ? set
                        ? 'set probe'
                        : 'empty probe'
                      : set
                        ? 'set'
                        : 'empty';
                    return <span key={b} className={`sst-bit ${cls}`} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Plate>

      <div className="sst-note" style={{ marginTop: 18 }}>
        <span className="sst-note-lab">
          {isFP ? 'the honest case' : isClean ? 'the clean case' : 'read it'}
        </span>
        {isFP ? (
          <>
            “{key}” is in <b>none</b> of the runs, yet one filter said <i>maybe</i> and charged you
            a seek to find nothing. That is a <b>false positive</b> — the price of a probabilistic
            filter. It never lies the other way: a <i>no</i> is always true.
          </>
        ) : isClean ? (
          <>
            Every filter said <b>no</b>, so the disk was never touched — <b>0 seeks</b> to prove “
            {key}” is absent, versus reading all {SKIP_RUNS.length} runs without filters.
          </>
        ) : (
          <>
            A <b>no</b> skips a table for free; only a <b>maybe</b> spends a seek. Across a tall
            stack of runs, that is the difference between one read and many.
          </>
        )}
      </div>
    </Section>
  );
}
