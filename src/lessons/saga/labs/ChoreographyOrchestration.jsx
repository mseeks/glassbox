import { useState } from 'react';
import { CHOREO_SERVICES, CHOREO_STATES, ORCH_STATES } from '../engine/index.js';
import Panel from '../components/Panel.jsx';

// The four services as a small grid, each with a one-line status under it.
// Shared between the two architectures the lab toggles between.
function ChoreoOrchSvcs({ states }) {
  return (
    <div className="sg-sx-ledger" style={{ marginTop: 0 }}>
      {CHOREO_SERVICES.map((s, i) => (
        <div className="sg-sx-row" key={s} style={{ padding: '10px 6px' }}>
          <div
            className="v"
            style={{ fontFamily: "'Marcellus',serif", fontSize: '14px', color: 'var(--ink)' }}
          >
            {s}
          </div>
          <div className="k" style={{ marginTop: 4 }}>
            {states[i]}
          </div>
        </div>
      ))}
    </div>
  );
}

// §VII — the same checkout, conducted two ways. In choreography there is no
// conductor: services react to events on a shared bus. In orchestration a
// single durable orchestrator drives each step and records its progress. Toggle
// between them. No motion here — a pure toggle between two static figures.
export default function ChoreographyOrchestration() {
  const [mode, setMode] = useState('choreography');
  const choreo = mode === 'choreography';
  return (
    <Panel
      title="lab · two ways to conduct the tale"
      note={
        choreo
          ? 'Choreography: no conductor. Each service listens for events on a shared bus and emits its own in response. Maximally decoupled — but the saga’s logic is smeared across services, and no single place knows the whole story.'
          : 'Orchestration: a central orchestrator drives each step and records progress as a durable state machine, so it can resume mid-saga after a crash. One place owns the plot — at the cost of a component every saga depends on.'
      }
    >
      <div className="sg-sx-controls" style={{ marginBottom: 16 }}>
        <span className="lbl">architecture</span>
        <div className="sg-seg">
          <button className={choreo ? 'on' : ''} onClick={() => setMode('choreography')}>
            choreography
          </button>
          <button className={!choreo ? 'on' : ''} onClick={() => setMode('orchestration')}>
            orchestration
          </button>
        </div>
      </div>
      {choreo ? (
        <div>
          <div
            style={{
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              border: '1.5px dashed var(--gold)',
              borderRadius: '6px',
              padding: '11px',
              background: 'var(--inset)',
            }}
          >
            ⇆ event bus — an append-only log of facts
          </div>
          <div
            style={{
              textAlign: 'center',
              color: 'var(--ink-3)',
              margin: '9px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: '11.5px',
              letterSpacing: '.06em',
            }}
          >
            ▲ publish&nbsp;&nbsp;·&nbsp;&nbsp;subscribe ▼
          </div>
          <ChoreoOrchSvcs states={CHOREO_STATES} />
          <div
            style={{
              marginTop: 13,
              fontFamily: 'var(--font-mono)',
              fontSize: '11.5px',
              color: 'var(--ink-2)',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            OrderPlaced → PaymentTaken → StockReserved → Shipped
          </div>
        </div>
      ) : (
        <div>
          <div
            className="sg-tpc-coord sg-st"
            style={{ borderColor: 'var(--lapis)', maxWidth: '380px' }}
          >
            <div className="role" style={{ color: 'var(--lapis)' }}>
              Orchestrator · durable state machine
            </div>
            <div className="msg">step 3 of 4 — reserve stock</div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--ink-3)',
                marginTop: 6,
              }}
            >
              progress persisted ▸ resumes after a crash
            </div>
          </div>
          <div className="sg-tpc-rail">
            <span>↑&nbsp;&nbsp;command · reply&nbsp;&nbsp;↓</span>
          </div>
          <ChoreoOrchSvcs states={ORCH_STATES} />
        </div>
      )}
    </Panel>
  );
}
