import { useEffect, useMemo, useState } from 'react';
import { Hash, AlignLeft } from 'lucide-react';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import {
  getBlockedTrace,
  getFlatTrace,
  LOOKUP_SST,
  LOOKUP_N,
  LOOKUP_TARGETS,
  LOOKUP_ABSENT,
  FLAT_SEEKS_SMALL,
  FLAT_SEEKS_BIG,
} from '../engine/index.js';
import Section from '../components/Section.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import Plate from '../components/Plate.jsx';
import Seg from '../components/Seg.jsx';
import Stat from '../components/Stat.jsx';
import PlayBar from '../components/PlayBar.jsx';
import { usePlayer } from '../components/usePlayer.js';

function lkStyle(state) {
  switch (state) {
    case 'dim':
      return { opacity: 0.32 };
    case 'probe':
      return { borderColor: 'var(--blood)', background: 'var(--blood-wash)', color: 'var(--ink)' };
    case 'seen':
      return { borderColor: 'var(--blood-2)', color: 'var(--ink-2)' };
    case 'hit':
      return { borderColor: 'var(--blood)', background: 'var(--blood)', color: 'var(--paper)' };
    case 'block':
      return { borderColor: 'var(--steel)', background: 'var(--steel-wash)' };
    case 'chosen':
      return { borderColor: 'var(--steel)', background: 'var(--steel)', color: 'var(--paper)' };
    default:
      return {};
  }
}
function LkCell({ label, state }) {
  return (
    <div className="sst-lkcell" style={lkStyle(state)}>
      {label}
    </div>
  );
}

// §III — drive the real engine traces. Flat slab vs blocked + sparse index:
// watch the seeks. One seek lands you in the right block; the index search and
// the in-block scan are free in memory.
export default function LookupLab() {
  const reduced = usePrefersReducedMotion();
  const [mode, setMode] = useState('blocked');
  const [key, setKey] = useState('kyoto');
  const trace = useMemo(
    () => (mode === 'blocked' ? getBlockedTrace(LOOKUP_SST, key) : getFlatTrace(LOOKUP_SST, key)),
    [mode, key],
  );
  const steps = trace.steps;
  const total = steps.length;
  const player = usePlayer(total, { speed: 600, reduced });
  const { i, reset } = player;
  // restart on new key/mode
  useEffect(() => {
    reset();
  }, [key, mode, reset]);

  const done = i >= total;
  const seen = steps.slice(0, Math.max(i, 0));
  const cur = i > 0 ? steps[i - 1] : null;

  // ---- blocked-mode derivations ----
  const lastIdx = [...seen].reverse().find((s) => s.phase === 'index');
  const fetched = seen.some((s) => s.phase === 'fetch');
  const chosenBlock = trace.blockIndex;
  const scannedAt = seen.filter((s) => s.phase === 'scan').map((s) => s.at);
  const curScan = cur && cur.phase === 'scan' ? cur.at : -1;

  const seeksSoFar = mode === 'flat' ? Math.min(i, total) : fetched ? 1 : 0;
  const projection = mode === 'flat' ? FLAT_SEEKS_BIG : 1;

  // narration of the current step
  let status = 'ready — press play';
  if (cur && i > 0) {
    if (mode === 'flat') {
      status = done
        ? trace.found
          ? `found “${key}” — but it cost ${total} seeks here, ≈${FLAT_SEEKS_BIG} at scale`
          : `“${key}” absent — ${total} seeks wasted`
        : `binary-search probe ${Math.min(i, total)} of ${total} · each probe is a disk seek`;
    } else {
      if (cur.phase === 'index')
        status = `index probe ${seen.filter((s) => s.phase === 'index').length} · still in memory · 0 seeks`;
      else if (cur.phase === 'fetch') status = `one seek → fetch block b${chosenBlock}`;
      else if (cur.phase === 'scan')
        status = done
          ? trace.found
            ? `found “${key}” by scanning in memory · 1 seek total`
            : `“${key}” absent · still only 1 seek`
          : `scanning block b${chosenBlock} in memory · free`;
    }
  }

  return (
    <Section id="lookup">
      <SectionHeading
        roman="III"
        kicker="the fix"
        title="Index the pallet, not the box"
        dek="Chop the file into blocks of a few kilobytes. Index only the first key of each block. One seek lands you in the right block; the rest is a free in-memory scan."
      />

      <div className="sst-prose" style={{ marginBottom: 22 }}>
        <p>
          The forklift takes the same trip whether it grabs one box or a whole pallet, so the trip
          is what costs. Make each block pallet-sized and the operating system hands you the entire
          block per seek. Then a <span className="st">sparse index</span> — one entry per block — is
          enough: pay one seek to land inside a block, and scanning it is nearly free. That sparse
          index is a <strong>one-level, write-once B-tree</strong>.
        </p>
      </div>

      {/* ── lab ── */}
      <Plate
        cap={`lookup lab · ${LOOKUP_N} sorted keys · 7 blocks`}
        capRight={mode === 'blocked' ? 'blocked + sparse index' : 'flat slab'}
      >
        <div className="sst-lab-controls">
          <Seg
            ariaLabel="storage mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'blocked', label: 'Blocked + index' },
              { value: 'flat', label: 'Flat slab' },
            ]}
          />
          <div className="sst-chiprow" style={{ flex: 1 }}>
            {LOOKUP_TARGETS.map((t) => (
              <button
                key={t}
                className={`sst-keychip${key === t ? (LOOKUP_ABSENT.has(t) ? ' miss on' : ' on') : ''}`}
                onClick={() => setKey(t)}
              >
                {t}
                {LOOKUP_ABSENT.has(t) ? ' ·absent' : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="sst-lab-controls" style={{ marginTop: 12 }}>
          <PlayBar player={player} reduced={reduced} done={done} label="search" />
          <div className="sst-readout" style={{ marginLeft: 'auto' }}>
            <Stat value={seeksSoFar} label="seeks · this file" tone="blood" />
            <Stat
              value={projection}
              label="seeks · at 10⁹ keys"
              tone={mode === 'flat' ? 'blood' : 'sage'}
            />
          </div>
        </div>

        <div className="sst-status">{status}</div>

        {/* ── visual ── */}
        {mode === 'blocked' ? (
          <div className="sst-lk-blocked">
            <div className="sst-lk-idxlabel">
              <Hash size={13} aria-hidden="true" /> sparse index · held in memory
            </div>
            <div className="sst-scrollx">
              <div className="sst-lk-idxrow">
                {LOOKUP_SST.index.map((e) => {
                  const j = e.blockIndex;
                  let st = 'idle';
                  if (cur && cur.phase === 'index' && cur.at === j && !done) st = 'probe';
                  else if (!fetched && lastIdx && (j < lastIdx.lo || j > lastIdx.hi)) st = 'dim';
                  else if (fetched && j === chosenBlock) st = 'chosen';
                  return <LkCell key={j} state={st} label={`${e.firstKey}`} />;
                })}
              </div>
            </div>

            <div className="sst-lk-blocks">
              {LOOKUP_SST.blocks.map((b, j) => {
                const active = fetched && j === chosenBlock;
                return (
                  <div key={j} className={`sst-lk-block${active ? ' on' : ''}`}>
                    <span className="sst-lk-btag">b{j}</span>
                    <div className="sst-lk-brecs">
                      {b.records.map(([k], r) => {
                        const isCur = active && curScan === r && !done;
                        const wasScan = active && scannedAt.includes(r);
                        const isMatch = trace.found && k === key;
                        let st = 'idle';
                        if (active) {
                          if (done && isMatch) st = 'hit';
                          else if (isCur) st = 'probe';
                          else if (isMatch && wasScan) st = 'hit';
                          else if (wasScan) st = 'block';
                        }
                        return <LkCell key={k} state={st} label={k} />;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="sst-lk-flat">
            <div className="sst-lk-idxlabel">
              <AlignLeft size={13} aria-hidden="true" /> one flat run · no index · every probe seeks
              the disk
            </div>
            <div className="sst-lk-flatgrid">
              {LOOKUP_SST.records.map(([k], r) => {
                const probes = seen.filter((s) => s.phase === 'probe').map((s) => s.at);
                const isCur = cur && cur.phase === 'probe' && cur.at === r && !done;
                const wasProbe = probes.includes(r);
                const isMatch = trace.found && k === key;
                let st = 'idle';
                if (done && isMatch) st = 'hit';
                else if (isCur) st = 'probe';
                else if (isMatch && wasProbe) st = 'hit';
                else if (wasProbe) st = 'seen';
                return <LkCell key={k} state={st} label={k} />;
              })}
            </div>
          </div>
        )}
      </Plate>

      <div className="sst-note" style={{ marginTop: 18 }}>
        <span className="sst-note-lab">read it</span>
        In <b>blocked</b> mode the index search happens in memory (zero seeks); the single seek is
        the block fetch. In <b>flat</b> mode every probe is a seek — <b>{FLAT_SEEKS_SMALL}</b> here,
        and because seeks grow with the logarithm, about <b>{FLAT_SEEKS_BIG}</b> at a billion keys.
        The blocked file stays at <b>one</b>. Even the absent key costs a seek in blocked mode — the
        bloom filter in section VI is how we dodge that.
      </div>
    </Section>
  );
}
