import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, ChevronRight, Zap } from 'lucide-react';
import { formatValue, simulateIsolation, transactionView } from '../engine/index.js';
import { LEVELS, SCENARIOS } from '../components/data.js';
import { renderProseMarkdown } from '../components/helpers.js';
import { MapMatrix } from '../components/MapMatrix.jsx';

export function IsolationLab() {
  const [scenarioId, setScenarioId] = useState('dirty_read');
  const [levelId, setLevelId] = useState('read_uncommitted');
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const scenario = useMemo(() => SCENARIOS.find((s) => s.id === scenarioId), [scenarioId]);
  const steps = useMemo(() => simulateIsolation(scenario, levelId, LEVELS), [scenario, levelId]);
  const chapterIdx = useMemo(() => SCENARIOS.findIndex((s) => s.id === scenarioId), [scenarioId]);

  const currentStep = steps[Math.min(step, steps.length - 1)];
  const prevStep = step > 0 ? steps[step - 1] : null;

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [scenarioId, levelId]);
  useEffect(() => {
    if (!playing) return;
    if (step >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 2600);
    return () => clearTimeout(id);
  }, [playing, step, steps.length]);

  const chapterRef = useRef(null);
  const scrollToChapter = useCallback(() => {
    if (chapterRef.current)
      chapterRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const onPlay = useCallback(() => {
    if (step >= steps.length - 1) setStep(0);
    setPlaying(true);
  }, [step, steps.length]);
  const onPause = useCallback(() => setPlaying(false), []);
  const onStep = useCallback(
    (d) => {
      setPlaying(false);
      setStep((s) => Math.max(0, Math.min(s + d, steps.length - 1)));
    },
    [steps.length],
  );
  const onJump = useCallback(
    (i) => {
      setPlaying(false);
      setStep(Math.max(0, Math.min(i, steps.length - 1)));
    },
    [steps.length],
  );
  const onReplay = useCallback(() => {
    setStep(0);
    setPlaying(true);
  }, []);
  const onLevelChange = useCallback((newLevelId) => {
    setLevelId(newLevelId);
  }, []);
  const onPrevChapter = useCallback(() => {
    if (chapterIdx > 0) {
      setScenarioId(SCENARIOS[chapterIdx - 1].id);
      setTimeout(scrollToChapter, 50);
    }
  }, [chapterIdx, scrollToChapter]);
  const onNextChapter = useCallback(() => {
    if (chapterIdx < SCENARIOS.length - 1) {
      setScenarioId(SCENARIOS[chapterIdx + 1].id);
      setTimeout(scrollToChapter, 50);
    }
  }, [chapterIdx, scrollToChapter]);
  const onSelectCell = useCallback(
    (sid, lid) => {
      setScenarioId(sid);
      setLevelId(lid);
      setTimeout(scrollToChapter, 50);
    },
    [scrollToChapter],
  );

  const atStart = step === 0;
  const atEnd = currentStep.idx === scenario.timeline.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
      <MapMatrix scenarioId={scenarioId} levelId={levelId} onSelectCell={onSelectCell} />

      <div
        ref={chapterRef}
        style={{ display: 'flex', flexDirection: 'column', gap: 24, scrollMarginTop: 16 }}
      >
        <ChapterTabs scenarioId={scenarioId} onChange={setScenarioId} />
        <ChapterTitle scenario={scenario} chapterIdx={chapterIdx} />
        <Stage currentStep={currentStep} prevStep={prevStep} scenario={scenario} steps={steps} />
        <StoryPanel
          step={currentStep}
          scenario={scenario}
          levelId={levelId}
          atStart={atStart}
          atEnd={atEnd}
          onLevelChange={onLevelChange}
        />
        <ControlBar
          step={step}
          totalSteps={steps.length}
          playing={playing}
          onPlay={onPlay}
          onPause={onPause}
          onStep={onStep}
          onJump={onJump}
          levelId={levelId}
          onLevelChange={onLevelChange}
          atEnd={atEnd}
          onNextChapter={onNextChapter}
          onPrevChapter={onPrevChapter}
          hasNext={chapterIdx < SCENARIOS.length - 1}
          hasPrev={chapterIdx > 0}
          onReplay={onReplay}
        />
      </div>
    </div>
  );
}

function ChapterTabs({ scenarioId, onChange }) {
  return (
    <nav
      className="iso-fade-in"
      style={{
        maxWidth: 880,
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${SCENARIOS.length}, minmax(0, 1fr))`,
          gap: 4,
          background: 'rgba(20, 20, 28, 0.5)',
          border: '1px solid rgba(232, 222, 200, 0.06)',
          borderRadius: 10,
          padding: 4,
        }}
        className="iso-tabstrip"
      >
        {SCENARIOS.map((s, i) => {
          const active = s.id === scenarioId;
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              className="iso-ui iso-chapter-tab"
              style={{
                padding: '12px 10px',
                background: active ? '#1a1a24' : 'transparent',
                color: active ? '#e8dec8' : 'rgba(232, 222, 200, 0.5)',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 200ms ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = '#e8dec8';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = 'rgba(232, 222, 200, 0.5)';
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: active ? '#5eead4' : 'rgba(232, 222, 200, 0.35)',
                  marginBottom: 2,
                  fontWeight: 600,
                }}
              >
                Ch. {i + 1}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  lineHeight: 1.2,
                }}
              >
                {s.title.replace(/^The /, '')}
              </div>
              {active && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: 'linear-gradient(90deg, #5eead4 0%, #34d399 100%)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function ChapterTitle({ scenario, chapterIdx }) {
  return (
    <div className="iso-fade-in" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
      <div
        className="iso-ui"
        style={{
          fontSize: 10,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(232, 222, 200, 0.55)',
          marginBottom: 8,
        }}
      >
        Chapter {chapterIdx + 1} · {scenario.subtitle}
      </div>
      <h2
        className="iso-display"
        style={{
          fontSize: 'clamp(34px, 4.5vw, 48px)',
          fontWeight: 500,
          margin: 0,
          color: '#e8dec8',
          lineHeight: 1.05,
          letterSpacing: '-0.015em',
        }}
      >
        {scenario.title}
      </h2>
      <div
        className="iso-card"
        style={{
          marginTop: 18,
          padding: '10px 16px',
          borderRadius: 6,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: 999, background: '#5eead4' }} />
        <span
          className="iso-ui"
          style={{
            fontSize: 9,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(232, 222, 200, 0.45)',
          }}
        >
          Invariant
        </span>
        <span className="iso-body" style={{ fontSize: 14, color: '#e8dec8' }}>
          {scenario.invariant}
        </span>
      </div>
    </div>
  );
}

/* ── STAGE: the visualization, height-stable within a scenario ───── */

function Stage({ currentStep, prevStep, scenario, steps }) {
  return (
    <div
      className="iso-card"
      style={{ padding: '22px 24px', borderRadius: 12, position: 'relative', zIndex: 2 }}
    >
      <DatabaseRow
        committed={currentStep.committed}
        prevCommitted={prevStep ? prevStep.committed : null}
      />
      <div style={{ height: 22 }} />
      <TimelineView scenario={scenario} steps={steps} currentStepIdx={currentStep.idx} />
      <div style={{ height: 18 }} />
      <ViewBubbles
        t1={currentStep.txns.T1}
        t2={currentStep.txns.T2}
        committed={currentStep.committed}
        scenario={scenario}
      />
    </div>
  );
}

function DatabaseRow({ committed, prevCommitted }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '8px 0',
        flexWrap: 'wrap',
      }}
    >
      <div
        className="iso-ui"
        style={{
          fontSize: 9,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(232, 222, 200, 0.55)',
          flexShrink: 0,
        }}
      >
        Committed database
      </div>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        {Object.entries(committed).map(([k, v]) => {
          const changed = prevCommitted && prevCommitted[k] !== v;
          return (
            <div
              key={k}
              className={changed ? 'iso-tick-in' : ''}
              style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}
            >
              <span
                className="iso-mono"
                style={{ fontSize: 11, color: 'rgba(232, 222, 200, 0.45)' }}
              >
                {k}
              </span>
              <span style={{ color: 'rgba(232, 222, 200, 0.3)', fontSize: 12 }}>=</span>
              <span
                className="iso-display"
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  color: changed ? '#5eead4' : '#e8dec8',
                  transition: 'color 600ms ease',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatValue(v)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineView({ scenario, steps, currentStepIdx }) {
  return (
    <div>
      {/* lane headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '36px 1fr 1fr',
          gap: 14,
          padding: '0 8px 10px',
        }}
      >
        <div />
        <div
          className="iso-display"
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: '#5eead4',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          T₁
        </div>
        <div
          className="iso-display"
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: '#fbbf24',
            paddingLeft: 14,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          T₂
        </div>
      </div>
      <div className="iso-rule" style={{ marginBottom: 4 }} />
      <div role="list">
        {scenario.timeline.map((op, i) => {
          const stepIdx = i + 1;
          const stepData = steps[stepIdx]; // step result, has readValue/writeValue/flag
          return (
            <ScoreLine
              key={i}
              op={op}
              stepIdx={stepIdx}
              currentStepIdx={currentStepIdx}
              readValue={stepData?.readValue}
              writeValue={stepData?.writeValue}
              flag={stepData?.flag}
            />
          );
        })}
      </div>
    </div>
  );
}

function ScoreLine({ op, stepIdx, currentStepIdx, readValue, writeValue, flag }) {
  const isT1 = op.txn === 'T1';
  const past = stepIdx < currentStepIdx;
  const present = stepIdx === currentStepIdx;
  const future = stepIdx > currentStepIdx;
  const accent = isT1 ? '#5eead4' : '#fbbf24';
  const accentSoft = isT1 ? 'rgba(94, 234, 212, 0.06)' : 'rgba(251, 191, 36, 0.06)';

  // Show inline result for past/current operations
  const showResult = !future;
  const isAnomalyHere = present && flag === 'anomaly';
  const isAbortHere = present && flag === 'abort';

  let content;
  if (op.type === 'read' && showResult) {
    content = (
      <span>
        <span style={{ opacity: 0.85 }}>read {op.key}</span>
        <span style={{ color: 'rgba(232, 222, 200, 0.55)', margin: '0 6px' }}>→</span>
        <span style={{ fontWeight: 600 }}>{formatValue(readValue)}</span>
      </span>
    );
  } else if (op.type === 'write' && showResult) {
    content = (
      <span>
        <span style={{ opacity: 0.85 }}>{op.key} ←</span>
        <span style={{ marginLeft: 6, fontWeight: 600 }}>{formatValue(writeValue)}</span>
      </span>
    );
  } else if (op.type === 'commit') {
    content = (
      <span style={{ letterSpacing: '0.06em' }}>
        {flag === 'abort' && !future ? 'COMMIT → aborted' : 'COMMIT'}
      </span>
    );
  } else if (op.type === 'abort') {
    content = <span style={{ letterSpacing: '0.06em' }}>ABORT</span>;
  } else if (op.type === 'begin') {
    content = <span style={{ letterSpacing: '0.06em' }}>BEGIN</span>;
  } else {
    content = opLabel(op);
  }

  return (
    <div
      role="listitem"
      style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr 1fr',
        alignItems: 'center',
        gap: 14,
        padding: '7px 8px',
        borderRadius: 6,
        background: present ? accentSoft : 'transparent',
        borderLeft: '2px solid ' + (present ? accent : 'transparent'),
        transition: 'all 240ms ease',
        opacity: future ? 0.3 : past ? 0.62 : 1,
      }}
    >
      <div
        className="iso-mono"
        style={{
          fontSize: 10,
          color: 'rgba(232, 222, 200, 0.32)',
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        §{String(stepIdx).padStart(2, '0')}
      </div>
      {/* T1 column */}
      <div style={{ paddingRight: 6 }}>
        {isT1 && (
          <span
            className="iso-mono"
            style={{
              fontSize: 13,
              fontWeight: present ? 600 : 500,
              color: isAnomalyHere
                ? '#fb7185'
                : isAbortHere
                  ? '#fbbf24'
                  : present
                    ? accent
                    : 'rgba(94, 234, 212, 0.78)',
            }}
          >
            {content}
          </span>
        )}
      </div>
      {/* T2 column */}
      <div style={{ paddingLeft: 14, borderLeft: '1px dashed rgba(232, 222, 200, 0.07)' }}>
        {!isT1 && (
          <span
            className="iso-mono"
            style={{
              fontSize: 13,
              fontWeight: present ? 600 : 500,
              color: isAnomalyHere
                ? '#fb7185'
                : isAbortHere
                  ? '#fbbf24'
                  : present
                    ? accent
                    : 'rgba(251, 191, 36, 0.78)',
            }}
          >
            {content}
          </span>
        )}
      </div>
    </div>
  );
}

function opLabel(op) {
  switch (op.type) {
    case 'begin':
      return 'BEGIN';
    case 'commit':
      return 'COMMIT';
    case 'abort':
      return 'ABORT';
    case 'read':
      return `read ${op.key}`;
    case 'write':
      return `${op.key} ← ${op.expr}`;
    default:
      return op.type;
  }
}

function ViewBubbles({ t1, t2, committed, scenario }) {
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
      className="iso-views-grid"
    >
      <ViewBubble txnId="T1" txn={t1} committed={committed} scenario={scenario} />
      <ViewBubble txnId="T2" txn={t2} committed={committed} scenario={scenario} />
    </div>
  );
}

function ViewBubble({ txnId, txn, committed, scenario }) {
  const accent = txnId === 'T1' ? '#5eead4' : '#fbbf24';
  const symbol = txnId === 'T1' ? 'T₁' : 'T₂';
  const isIdle = !txn || txn.status === 'idle';
  const view = isIdle ? null : transactionView(txn);

  const status = isIdle
    ? 'queued'
    : txn.status === 'aborted'
      ? txn.systemAborted
        ? 'aborted by db'
        : 'aborted'
      : txn.status === 'committed'
        ? 'committed'
        : 'in flight';
  const statusColor = isIdle
    ? 'rgba(232, 222, 200, 0.55)'
    : txn.status === 'aborted'
      ? '#fb7185'
      : txn.status === 'committed'
        ? '#34d399'
        : accent;

  // Always show all keys for a stable layout
  const allKeys = scenario.keys;

  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 8,
        background: txnId === 'T1' ? 'rgba(94, 234, 212, 0.04)' : 'rgba(251, 191, 36, 0.04)',
        border:
          '1px dashed ' +
          (txnId === 'T1' ? 'rgba(94, 234, 212, 0.22)' : 'rgba(251, 191, 36, 0.22)'),
        opacity: isIdle ? 0.5 : 1,
        transition: 'opacity 300ms ease',
        minHeight: 78,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 8,
          gap: 8,
        }}
      >
        <div
          className="iso-ui"
          style={{
            fontSize: 9,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: accent,
            fontWeight: 600,
          }}
        >
          {symbol} believes
        </div>
        <span
          className="iso-ui"
          style={{
            fontSize: 9,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: statusColor,
            fontWeight: 500,
          }}
        >
          {status}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', alignItems: 'baseline' }}>
        {allKeys.map((k) => {
          const observed = view && k in view;
          const v = observed ? view[k] : null;
          const realV = committed[k];
          const divergent = observed && realV !== v;
          return (
            <span
              key={k}
              className="iso-mono"
              style={{
                fontSize: 13,
                color: !observed ? 'rgba(232,222,200,0.3)' : divergent ? '#fb7185' : '#e8dec8',
                fontWeight: divergent ? 600 : 500,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <span style={{ opacity: 0.65 }}>{k} =</span> {observed ? formatValue(v) : '–'}
              {divergent && (
                <span
                  style={{
                    fontSize: 10,
                    marginLeft: 5,
                    color: 'rgba(251, 113, 133, 0.85)',
                    fontFamily: 'Newsreader, serif',
                    fontStyle: 'italic',
                    fontWeight: 400,
                  }}
                >
                  (truly {formatValue(realV)})
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ── STORY PANEL: holds the chapter intro, per-step prose, OR chapter close
   ── min-height ensures stable geometry across steps ──────────────── */

function StoryPanel({ step, scenario, levelId, atStart, atEnd, onLevelChange }) {
  // Pick which content to show
  if (atStart) return <StoryIntro scenario={scenario} />;
  if (atEnd)
    return (
      <StoryClose
        scenario={scenario}
        finalStep={step}
        levelId={levelId}
        onLevelChange={onLevelChange}
      />
    );
  return <StepProse step={step} scenario={scenario} levelId={levelId} />;
}

function StoryIntro({ scenario }) {
  return (
    <div
      className="iso-fade-in"
      style={{
        maxWidth: 720,
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
        minHeight: 140,
      }}
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div
          className="iso-mono"
          style={{
            fontSize: 11,
            color: 'rgba(232, 222, 200, 0.3)',
            flexShrink: 0,
            paddingTop: 6,
            minWidth: 32,
          }}
        >
          §00
        </div>
        <div style={{ flex: 1 }}>
          <div
            className="iso-ui"
            style={{
              fontSize: 9,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(232, 222, 200, 0.55)',
              marginBottom: 8,
            }}
          >
            Setting the scene
          </div>
          <p
            className="iso-body"
            style={{
              fontSize: 'clamp(16px, 1.7vw, 19px)',
              lineHeight: 1.65,
              color: 'rgba(232, 222, 200, 0.92)',
              margin: 0,
            }}
            dangerouslySetInnerHTML={{ __html: renderProseMarkdown(scenario.intro) }}
          />
        </div>
      </div>
    </div>
  );
}

function StepProse({ step, scenario, levelId }) {
  const op = step.op;
  const opIdx = op ? scenario.timeline.indexOf(op) : -1;
  const timelineEntry = opIdx >= 0 ? scenario.timeline[opIdx] : null;

  let prose = null;
  if (timelineEntry) {
    if (timelineEntry.proseByLevel && timelineEntry.proseByLevel[levelId]) {
      prose = timelineEntry.proseByLevel[levelId];
    } else {
      prose = timelineEntry.prose;
    }
  }
  if (!prose) prose = step.message;

  const isAnomaly = step.flag === 'anomaly';
  const isAbort = step.flag === 'abort';

  return (
    <div
      key={step.idx}
      className="iso-fade-in"
      style={{
        maxWidth: 720,
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
        minHeight: 140,
      }}
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div
          className="iso-mono"
          style={{
            fontSize: 11,
            color: 'rgba(232, 222, 200, 0.3)',
            flexShrink: 0,
            paddingTop: 6,
            minWidth: 32,
          }}
        >
          §{String(step.idx).padStart(2, '0')}
        </div>
        <div style={{ flex: 1 }}>
          <p
            className="iso-body"
            style={{
              fontSize: 'clamp(16px, 1.7vw, 19px)',
              lineHeight: 1.65,
              color: 'rgba(232, 222, 200, 0.92)',
              margin: 0,
            }}
            dangerouslySetInnerHTML={{ __html: renderProseMarkdown(prose) }}
          />

          {step.annotation && (
            <div
              className={isAnomaly ? 'iso-anomaly-pulse' : ''}
              style={{
                marginTop: 12,
                padding: '10px 14px',
                borderRadius: 6,
                background: isAnomaly
                  ? 'rgba(251, 113, 133, 0.08)'
                  : isAbort
                    ? 'rgba(251, 191, 36, 0.08)'
                    : 'rgba(232, 222, 200, 0.04)',
                border:
                  '1px solid ' +
                  (isAnomaly
                    ? 'rgba(251, 113, 133, 0.25)'
                    : isAbort
                      ? 'rgba(251, 191, 36, 0.25)'
                      : 'rgba(232, 222, 200, 0.1)'),
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              {isAnomaly ? (
                <AlertTriangle
                  size={14}
                  style={{ color: '#fb7185', flexShrink: 0, marginTop: 3 }}
                />
              ) : isAbort ? (
                <Zap size={14} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 3 }} />
              ) : (
                <ChevronRight
                  size={14}
                  style={{ color: 'rgba(232,222,200,0.5)', flexShrink: 0, marginTop: 3 }}
                />
              )}
              <div
                className="iso-body"
                style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  fontStyle: 'italic',
                  color: isAnomaly ? '#fb7185' : isAbort ? '#fbbf24' : 'rgba(232, 222, 200, 0.7)',
                }}
              >
                {step.annotation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StoryClose({ scenario, finalStep, levelId, onLevelChange }) {
  const isAnomaly = finalStep.hadAnomaly;
  const anySystemAborted = finalStep.anySystemAborted;
  const closing = isAnomaly ? scenario.closing.bad : scenario.closing.good;
  const accent = isAnomaly ? '#fb7185' : anySystemAborted ? '#fbbf24' : '#34d399';
  const verdict = isAnomaly
    ? 'The anomaly was permitted'
    : anySystemAborted
      ? 'The anomaly was prevented (one transaction aborted)'
      : 'The anomaly was prevented';

  const idx = LEVELS.findIndex((l) => l.id === levelId);
  const nextLevel = LEVELS[idx + 1] || null;
  const prevLevel = LEVELS[idx - 1] || null;

  return (
    <div
      className="iso-fade-in"
      style={{
        maxWidth: 720,
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div
          className="iso-mono"
          style={{
            fontSize: 11,
            color: 'rgba(232, 222, 200, 0.3)',
            flexShrink: 0,
            paddingTop: 6,
            minWidth: 32,
          }}
        >
          fin.
        </div>
        <div style={{ flex: 1 }}>
          <div
            className="iso-ui"
            style={{
              fontSize: 9,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: accent,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            {verdict}
          </div>
          <p
            className="iso-body"
            style={{
              fontSize: 'clamp(16px, 1.7vw, 19px)',
              lineHeight: 1.65,
              color: 'rgba(232, 222, 200, 0.92)',
              margin: 0,
            }}
            dangerouslySetInnerHTML={{ __html: renderProseMarkdown(closing) }}
          />

          {/* level transitions, inline */}
          {(prevLevel || nextLevel) && (
            <div
              style={{
                marginTop: 18,
                padding: '14px 16px',
                borderRadius: 8,
                background: 'rgba(20, 20, 28, 0.6)',
                border: '1px solid rgba(232, 222, 200, 0.06)',
              }}
            >
              <div
                className="iso-ui"
                style={{
                  fontSize: 9,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(232, 222, 200, 0.42)',
                  marginBottom: 10,
                }}
              >
                Replay this scenario at a different level
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {prevLevel && (
                  <button
                    onClick={() => onLevelChange(prevLevel.id)}
                    className="iso-ui"
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      background: 'rgba(232, 222, 200, 0.04)',
                      border: '1px solid rgba(232, 222, 200, 0.12)',
                      color: 'rgba(232, 222, 200, 0.85)',
                      fontSize: 12,
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    ← One weaker: {prevLevel.name}
                  </button>
                )}
                {nextLevel && (
                  <button onClick={() => onLevelChange(nextLevel.id)} className="iso-cta">
                    One stronger: {nextLevel.name} →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── CONTROL BAR: stepping + level switcher; transforms at chapter end ── */

function ControlBar({
  step,
  totalSteps,
  onStep,
  onJump,
  playing,
  onPlay,
  onPause,
  levelId,
  onLevelChange,
  atEnd,
  onNextChapter,
  onPrevChapter,
  hasNext,
  hasPrev,
  onReplay,
}) {
  if (atEnd) {
    return (
      <div
        className="iso-card"
        style={{
          padding: '14px 18px',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <button
          onClick={onPrevChapter}
          disabled={!hasPrev}
          className="iso-ui"
          style={{
            background: 'none',
            border: 'none',
            cursor: hasPrev ? 'pointer' : 'not-allowed',
            color: hasPrev ? 'rgba(232,222,200,0.7)' : 'rgba(232,222,200,0.25)',
            fontSize: 13,
            padding: '8px 4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← Previous chapter
        </button>

        <button
          onClick={onReplay}
          className="iso-ui"
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            cursor: 'pointer',
            background: 'rgba(232, 222, 200, 0.04)',
            border: '1px solid rgba(232, 222, 200, 0.12)',
            color: 'rgba(232, 222, 200, 0.85)',
            fontSize: 12,
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <RotateCcw size={12} /> Replay this chapter
        </button>

        <button
          onClick={onNextChapter}
          disabled={!hasNext}
          className="iso-cta"
          style={{
            opacity: hasNext ? 1 : 0.3,
            cursor: hasNext ? 'pointer' : 'not-allowed',
          }}
        >
          Next chapter →
        </button>
      </div>
    );
  }

  return (
    <div
      className="iso-card iso-stepbar"
      style={{
        padding: '12px 16px',
        borderRadius: 10,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: 16,
        position: 'relative',
        zIndex: 2,
      }}
    >
      {/* left: step controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => onStep(-1)}
          disabled={step <= 0}
          className="iso-step-arrow"
          aria-label="Previous"
        >
          <ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <button
          onClick={playing ? onPause : onPlay}
          className="iso-ui"
          style={{
            padding: '7px 14px',
            borderRadius: 999,
            background: playing ? 'rgba(232, 222, 200, 0.14)' : 'rgba(94, 234, 212, 0.14)',
            color: playing ? '#e8dec8' : '#5eead4',
            border:
              '1px solid ' + (playing ? 'rgba(232, 222, 200, 0.2)' : 'rgba(94, 234, 212, 0.3)'),
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {playing ? <Pause size={12} /> : <Play size={12} />}
          {playing ? 'Pause' : 'Auto'}
        </button>
        <button
          onClick={() => onStep(+1)}
          disabled={step >= totalSteps - 1}
          className="iso-step-arrow"
          aria-label="Next"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* center: progress dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <button
            key={i}
            onClick={() => onJump(i)}
            aria-label={`Step ${i}`}
            style={{
              width: i === step ? 22 : 6,
              height: 6,
              borderRadius: 999,
              background: i <= step ? '#e8dec8' : 'rgba(232, 222, 200, 0.16)',
              border: 'none',
              transition: 'all 280ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* right: level switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          className="iso-ui"
          style={{
            fontSize: 9,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(232, 222, 200, 0.55)',
            whiteSpace: 'nowrap',
          }}
        >
          Level
        </span>
        <select
          value={levelId}
          onChange={(e) => onLevelChange(e.target.value)}
          className="iso-ui"
          aria-label="Isolation level"
          style={{
            padding: '7px 28px 7px 12px',
            borderRadius: 6,
            background:
              "rgba(232, 222, 200, 0.04) url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%23e8dec8' opacity='0.5' d='M0 0l5 6 5-6z'/></svg>\") no-repeat right 10px center",
            border: '1px solid rgba(232, 222, 200, 0.12)',
            color: '#e8dec8',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
        >
          {LEVELS.map((l) => (
            <option key={l.id} value={l.id} style={{ background: '#14141c' }}>
              {l.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
