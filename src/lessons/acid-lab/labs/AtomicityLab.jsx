import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react';
import { formatValue, simulateAtomicity } from '../engine/index.js';
import { ATOMICITY_SCENARIOS } from '../components/data.js';
import { renderProseMarkdown } from '../components/helpers.js';

export function AtomicityLab() {
  const [scenarioId, setScenarioId] = useState('clean_commit');
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const scenario = useMemo(
    () => ATOMICITY_SCENARIOS.find((s) => s.id === scenarioId),
    [scenarioId],
  );
  const steps = useMemo(() => simulateAtomicity(scenario), [scenario]);
  const scenarioIdx = useMemo(
    () => ATOMICITY_SCENARIOS.findIndex((s) => s.id === scenarioId),
    [scenarioId],
  );
  const currentStep = steps[Math.min(step, steps.length - 1)];

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [scenarioId]);
  useEffect(() => {
    if (!playing) return;
    if (step >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 2800);
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
  const onPrevScenario = useCallback(() => {
    if (scenarioIdx > 0) {
      setScenarioId(ATOMICITY_SCENARIOS[scenarioIdx - 1].id);
      setTimeout(scrollToChapter, 50);
    }
  }, [scenarioIdx, scrollToChapter]);
  const onNextScenario = useCallback(() => {
    if (scenarioIdx < ATOMICITY_SCENARIOS.length - 1) {
      setScenarioId(ATOMICITY_SCENARIOS[scenarioIdx + 1].id);
      setTimeout(scrollToChapter, 50);
    }
  }, [scenarioIdx, scrollToChapter]);

  const atStart = step === 0;
  const atEnd = currentStep.idx === scenario.timeline.length;

  return (
    <div
      ref={chapterRef}
      style={{ display: 'flex', flexDirection: 'column', gap: 24, scrollMarginTop: 16 }}
    >
      <ScenarioTabs scenarioId={scenarioId} onChange={setScenarioId} />
      <ChapterTitle scenario={scenario} scenarioIdx={scenarioIdx} />
      <Stage step={currentStep} />
      <StoryPanel step={currentStep} scenario={scenario} atStart={atStart} atEnd={atEnd} />
      <ControlBar
        step={step}
        totalSteps={steps.length}
        playing={playing}
        onPlay={onPlay}
        onPause={onPause}
        onStep={onStep}
        onJump={onJump}
        atEnd={atEnd}
        onPrevScenario={onPrevScenario}
        onNextScenario={onNextScenario}
        hasNext={scenarioIdx < ATOMICITY_SCENARIOS.length - 1}
        hasPrev={scenarioIdx > 0}
        onReplay={onReplay}
      />
    </div>
  );
}

function ScenarioTabs({ scenarioId, onChange }) {
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
          gridTemplateColumns: `repeat(${ATOMICITY_SCENARIOS.length}, minmax(0, 1fr))`,
          gap: 4,
          background: 'rgba(20, 20, 28, 0.5)',
          border: '1px solid rgba(232, 222, 200, 0.06)',
          borderRadius: 10,
          padding: 4,
        }}
      >
        {ATOMICITY_SCENARIOS.map((s, i) => {
          const active = s.id === scenarioId;
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              className="iso-ui"
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
                  color: active ? '#a78bfa' : 'rgba(232, 222, 200, 0.35)',
                  marginBottom: 2,
                  fontWeight: 600,
                }}
              >
                §{i + 1}
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
                    background: 'linear-gradient(90deg, #a78bfa 0%, #f0abfc 100%)',
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

function ChapterTitle({ scenario, scenarioIdx }) {
  return (
    <div
      className="iso-fade-in"
      style={{
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
      }}
    >
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
        Scenario {scenarioIdx + 1} · {scenario.subtitle}
      </div>
      <h3
        className="iso-display"
        style={{
          fontSize: 'clamp(28px, 3.6vw, 40px)',
          fontWeight: 500,
          margin: 0,
          color: '#e8dec8',
          lineHeight: 1.05,
          letterSpacing: '-0.015em',
        }}
      >
        {scenario.title}
      </h3>
    </div>
  );
}

function Stage({ step }) {
  return (
    <div
      className="iso-card"
      style={{
        padding: '20px 22px',
        borderRadius: 12,
        position: 'relative',
        zIndex: 2,
      }}
    >
      <MemoryView step={step} />
      <div style={{ height: 14 }} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: 14,
        }}
        className="iso-atomic-grid"
      >
        <DiskDbView step={step} />
        <WalView step={step} />
      </div>
    </div>
  );
}

function MemoryView({ step }) {
  const { active, crashed, recovered } = step;

  let label, content, accent, accentSoft;
  if (crashed) {
    label = 'in-flight (volatile)';
    accent = '#fb7185';
    accentSoft = 'rgba(251, 113, 133, 0.08)';
    content = (
      <span className="iso-mono" style={{ fontSize: 14, color: '#fb7185', fontWeight: 500 }}>
        💥 volatile state lost
      </span>
    );
  } else if (recovered) {
    label = 'in-flight (volatile)';
    accent = '#34d399';
    accentSoft = 'rgba(52, 211, 153, 0.08)';
    content = (
      <span className="iso-mono" style={{ fontSize: 13, color: '#34d399', fontWeight: 500 }}>
        ✓ system restarted, recovery complete
      </span>
    );
  } else if (!active) {
    label = 'in-flight (volatile)';
    accent = 'rgba(232, 222, 200, 0.3)';
    accentSoft = 'rgba(232, 222, 200, 0.02)';
    content = (
      <span
        className="iso-body"
        style={{ fontSize: 13, color: 'rgba(232, 222, 200, 0.55)', fontStyle: 'italic' }}
      >
        no transaction in flight
      </span>
    );
  } else {
    label = 'T₁ (volatile, in memory)';
    accent = '#fbbf24';
    accentSoft = 'rgba(251, 191, 36, 0.06)';
    const writes = Object.entries(active.writes);
    const writesStr =
      writes.length > 0 ? writes.map(([k, v]) => `${k}=${v}`).join(', ') : '(no writes yet)';
    const statusLabels = {
      active: 'active',
      committed_in_log: 'committed (logged, not yet applied)',
      fully_committed: 'fully committed',
    };
    content = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span className="iso-mono" style={{ fontSize: 13, color: '#e8dec8' }}>
          <span style={{ color: 'rgba(232, 222, 200, 0.5)' }}>writes pending:</span>{' '}
          <span style={{ color: '#fbbf24', fontWeight: 600 }}>{writesStr}</span>
        </span>
        <span className="iso-ui" style={{ fontSize: 11, color: 'rgba(232, 222, 200, 0.55)' }}>
          status:{' '}
          <span style={{ color: '#fbbf24', fontWeight: 500 }}>
            {statusLabels[active.status] || active.status}
          </span>
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: 8,
        background: accentSoft,
        border:
          '1px dashed ' +
          (accent === 'rgba(232, 222, 200, 0.3)' ? 'rgba(232, 222, 200, 0.12)' : `${accent}55`),
        transition: 'all 300ms ease',
        minHeight: 72,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div
        className="iso-ui"
        style={{
          fontSize: 9,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: accent,
          marginBottom: 6,
          fontWeight: 600,
          opacity: accent === 'rgba(232, 222, 200, 0.3)' ? 0.6 : 1,
        }}
      >
        {label}
      </div>
      {content}
    </div>
  );
}

function DiskDbView({ step }) {
  const db = step.db;
  // We'd like to mark which DB keys just changed, by comparing to previous step.
  // For now, simple presentation.
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 8,
        background: 'rgba(232, 222, 200, 0.03)',
        border: '1px solid rgba(232, 222, 200, 0.12)',
        minHeight: 130,
      }}
    >
      <div
        className="iso-ui"
        style={{
          fontSize: 9,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'rgba(232, 222, 200, 0.5)',
          marginBottom: 4,
          fontWeight: 600,
        }}
      >
        Database
      </div>
      <div
        className="iso-ui"
        style={{
          fontSize: 10,
          color: 'rgba(232, 222, 200, 0.55)',
          marginBottom: 14,
          fontStyle: 'italic',
        }}
      >
        on disk · durable
      </div>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        {Object.entries(db).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span className="iso-mono" style={{ fontSize: 10, color: 'rgba(232, 222, 200, 0.45)' }}>
              {k}
            </span>
            <span
              className="iso-display"
              style={{
                fontSize: 26,
                fontWeight: 500,
                color: '#e8dec8',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatValue(v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WalView({ step }) {
  const wal = step.wal;
  const isLatestEntry = (i) => i === wal.length - 1;

  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 8,
        background: 'rgba(167, 139, 250, 0.04)',
        border: '1px solid rgba(167, 139, 250, 0.2)',
        minHeight: 130,
      }}
    >
      <div
        className="iso-ui"
        style={{
          fontSize: 9,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#a78bfa',
          marginBottom: 4,
          fontWeight: 600,
        }}
      >
        Write-ahead log
      </div>
      <div
        className="iso-ui"
        style={{
          fontSize: 10,
          color: 'rgba(167, 139, 250, 0.6)',
          marginBottom: 12,
          fontStyle: 'italic',
        }}
      >
        on disk · append-only · fsync'd
      </div>
      {wal.length === 0 ? (
        <div
          className="iso-body"
          style={{ fontSize: 13, color: 'rgba(232, 222, 200, 0.35)', fontStyle: 'italic' }}
        >
          (empty)
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {wal.map((e, i) => (
            <WalEntry key={e.id} entry={e} isLatest={isLatestEntry(i)} />
          ))}
        </div>
      )}
    </div>
  );
}

function WalEntry({ entry, isLatest }) {
  const isCommit = entry.type === 'COMMIT';
  const isAbort = entry.type === 'ABORT';
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '32px 1fr auto',
        gap: 10,
        padding: '4px 8px',
        borderRadius: 4,
        background: isLatest ? 'rgba(167, 139, 250, 0.1)' : 'transparent',
        borderLeft: '2px solid ' + (isLatest ? '#a78bfa' : 'transparent'),
        transition: 'all 240ms ease',
      }}
      className={isLatest ? 'iso-tick-in' : ''}
    >
      <span
        className="iso-mono"
        style={{
          fontSize: 10,
          color: 'rgba(232, 222, 200, 0.35)',
          fontVariantNumeric: 'tabular-nums',
          textAlign: 'right',
        }}
      >
        §{String(entry.id).padStart(2, '0')}
      </span>
      <span
        className="iso-mono"
        style={{
          fontSize: 13,
          color: isCommit ? '#34d399' : isAbort ? '#fb7185' : '#e8dec8',
          fontWeight: isCommit ? 600 : 500,
        }}
      >
        {entry.type === 'WRITE' ? (
          <>
            <span style={{ opacity: 0.7 }}>WRITE</span> {entry.key} = {formatValue(entry.value)}
          </>
        ) : (
          <span style={{ letterSpacing: '0.04em' }}>{entry.type}</span>
        )}
        <span style={{ color: 'rgba(232, 222, 200, 0.55)', marginLeft: 6, fontSize: 11 }}>
          {entry.txn}
        </span>
      </span>
      {isCommit && (
        <span
          className="iso-ui"
          style={{
            fontSize: 9,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#34d399',
            fontWeight: 600,
          }}
        >
          fsync ✓
        </span>
      )}
    </div>
  );
}

function StoryPanel({ step, scenario, atStart, atEnd }) {
  if (atStart) return <StoryIntro scenario={scenario} />;
  if (atEnd) return <StoryClose scenario={scenario} />;
  return <StepProse step={step} scenario={scenario} />;
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

function StepProse({ step, scenario }) {
  const op = step.op;
  const opIdx = op ? scenario.timeline.indexOf(op) : -1;
  const timelineEntry = opIdx >= 0 ? scenario.timeline[opIdx] : null;
  const prose = timelineEntry?.prose || step.message;

  const isCrash = op?.type === 'crash';
  const isRecover = op?.type === 'recover';

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
          {(isCrash || isRecover) && (
            <div
              className="iso-ui"
              style={{
                fontSize: 9,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: isCrash ? '#fb7185' : '#34d399',
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              {isCrash ? '💥 system failure' : '✓ recovery'}
            </div>
          )}
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
        </div>
      </div>
    </div>
  );
}

function StoryClose({ scenario }) {
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
              color: '#a78bfa',
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            What this scenario taught
          </div>
          <p
            className="iso-body"
            style={{
              fontSize: 'clamp(16px, 1.7vw, 19px)',
              lineHeight: 1.65,
              color: 'rgba(232, 222, 200, 0.92)',
              margin: 0,
            }}
            dangerouslySetInnerHTML={{ __html: renderProseMarkdown(scenario.closing) }}
          />
        </div>
      </div>
    </div>
  );
}

function ControlBar({
  step,
  totalSteps,
  onStep,
  onJump,
  playing,
  onPlay,
  onPause,
  atEnd,
  onPrevScenario,
  onNextScenario,
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
          onClick={onPrevScenario}
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
          ← Previous scenario
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
          <RotateCcw size={12} /> Replay
        </button>

        <button
          onClick={onNextScenario}
          disabled={!hasNext}
          className="iso-ui"
          style={{
            padding: '10px 18px',
            borderRadius: 6,
            background: hasNext
              ? 'linear-gradient(135deg, #a78bfa 0%, #f0abfc 100%)'
              : 'rgba(232,222,200,0.06)',
            color: hasNext ? '#0a0a0f' : 'rgba(232,222,200,0.3)',
            border: 'none',
            cursor: hasNext ? 'pointer' : 'not-allowed',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Next scenario →
        </button>
      </div>
    );
  }

  return (
    <div
      className="iso-card"
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
            background: playing ? 'rgba(232, 222, 200, 0.14)' : 'rgba(167, 139, 250, 0.14)',
            color: playing ? '#e8dec8' : '#a78bfa',
            border:
              '1px solid ' + (playing ? 'rgba(232, 222, 200, 0.2)' : 'rgba(167, 139, 250, 0.3)'),
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

      <div
        className="iso-ui"
        style={{
          fontSize: 11,
          color: 'rgba(232, 222, 200, 0.45)',
          whiteSpace: 'nowrap',
          textAlign: 'right',
        }}
      >
        Step {step} of {totalSteps - 1}
      </div>
    </div>
  );
}
