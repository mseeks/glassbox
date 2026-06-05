/**
 * Saga-pattern engine — pure logic, no React, no DOM, no JSX.
 *
 * Extracted from SagaPattern.jsx so the three state machines that drive the
 * lesson's labs can be unit-tested and reused independently of the render code.
 * Everything here is deterministic given its inputs; each lab simply steps
 * through the frames a builder returns.
 *
 *   SAGA_STEPS        — the four-service checkout saga (Order → Payment →
 *                       Inventory → Shipping), each with its forward + comp.
 *   SAGA_OUTCOMES     — the failure points the executor lab offers.
 *   buildSagaFrames   — the saga executor: forward path, then compensation in
 *                       reverse for the steps that already committed when one
 *                       step fails at index k.
 *   build2pc          — the two-phase-commit state machine (survives | crashes).
 *   buildLU           — the lost-update interleaving (none | version check).
 *   STEP_KINDS / COUNTERMEASURES / TRADEOFFS / SPLIT_* / CVR_* / TOC / NEXT —
 *                       the example datasets the figures and tables render.
 */

// ── The checkout saga ──────────────────────────────────────────────────────
// Four local transactions in order, each with the compensating transaction
// that semantically negates it, the log lines for both directions, and the
// ledger words shown when the step is done vs. undone.
export const SAGA_STEPS = [
  {
    key: 'order',
    svc: 'Order',
    fwd: 'Create Order',
    comp: '↩ Cancel Order',
    fwdLog: 'order #4827 opened (pending)',
    compLog: 'order #4827 cancelled',
    done: 'created',
    undone: 'cancelled',
    reason: 'invalid cart',
  },
  {
    key: 'payment',
    svc: 'Payment',
    fwd: 'Charge Card',
    comp: '↩ Refund Payment',
    fwdLog: 'charged $129.00 to card',
    compLog: 'refunded $129.00',
    done: 'charged',
    undone: 'refunded',
    reason: 'card declined',
  },
  {
    key: 'inventory',
    svc: 'Inventory',
    fwd: 'Reserve Stock',
    comp: '↩ Release Stock',
    fwdLog: 'reserved 1× SKU-22',
    compLog: 'released 1× SKU-22',
    done: 'reserved',
    undone: 'released',
    reason: 'insufficient stock',
  },
  {
    key: 'shipping',
    svc: 'Shipping',
    fwd: 'Schedule Delivery',
    comp: '↩ Cancel Delivery',
    fwdLog: 'delivery scheduled for Tue',
    compLog: 'delivery cancelled',
    done: 'scheduled',
    undone: 'cancelled',
    reason: 'no courier slot',
  },
];

// The outcomes the executor lab offers: a clean run (failAt = null), or a
// failure at payment / inventory / shipping (failAt = 1 / 2 / 3).
export const SAGA_OUTCOMES = [
  ['succeeds', null],
  ['✗ payment', 1],
  ['✗ inventory', 2],
  ['✗ shipping', 3],
];

// The saga executor. Returns the ordered frames of one run: each frame snapshots
// every step's visual mark, the per-service ledger word, the chronicle log so
// far, and the overall status. Forward steps commit left → right; if the step
// at `failAt` fails, its own local transaction simply rolls back (it committed
// nothing), then the steps that DID commit are compensated in reverse order —
// "backward recovery". A null `failAt` runs clean and commits the whole saga.
export function buildSagaFrames(failAt) {
  const frames = [];
  let marks = { 0: 'st-idle', 1: 'st-idle', 2: 'st-idle', 3: 'st-idle' };
  let states = { order: '—', payment: '—', inventory: '—', shipping: '—' };
  let log = [];
  const snap = (status, statusText) =>
    frames.push({
      marks: { ...marks },
      states: { ...states },
      log: log.slice(),
      status: status || 'run',
      statusText: statusText || '',
    });
  snap('run', 'ready — choose an outcome, then run the saga');
  const committed = [];
  let failed = false;
  for (let i = 0; i < SAGA_STEPS.length; i++) {
    const s = SAGA_STEPS[i];
    if (i === failAt) {
      marks = { ...marks, [i]: 'st-fail' };
      log = [...log, { cls: 'fail', text: '✗ ' + s.svc + ': ' + s.fwd + ' failed — ' + s.reason }];
      snap('run', '');
      failed = true;
      break;
    }
    marks = { ...marks, [i]: 'st-active' };
    snap('run', '');
    marks = { ...marks, [i]: 'st-done' };
    states = { ...states, [s.key]: s.done };
    log = [...log, { cls: 'fwd', text: '▸ ' + s.svc + ': ' + s.fwdLog }];
    committed.push(i);
    snap('run', '');
  }
  if (failed) {
    for (let j = committed.length - 1; j >= 0; j--) {
      const idx = committed[j];
      const s = SAGA_STEPS[idx];
      marks = { ...marks, [idx]: 'st-active' };
      snap('run', '');
      marks = { ...marks, [idx]: 'st-comp' };
      states = { ...states, [s.key]: s.undone };
      log = [...log, { cls: 'comp', text: '↩ ' + s.svc + ': ' + s.compLog }];
      snap('run', '');
    }
    log = [...log, { cls: 'sys', text: '— saga aborted; every committed step compensated —' }];
    snap('bad', 'ABORTED · unwound by compensation');
  } else {
    log = [...log, { cls: 'sys', text: '— saga committed; the tale completes —' }];
    snap('ok', 'COMMITTED · all four steps done');
  }
  return frames;
}

// Map a frame's bare state mark(s) to this lesson's prefixed CSS class(es).
// The frame builders speak the semantic vocabulary ("st-fail is-blocked") so
// they stay independent of the lesson's class prefix; the view turns that into
// "sg-st-fail sg-is-blocked". An empty / nullish mark yields an empty string.
export const markClass = (mark) =>
  (mark || '')
    .split(' ')
    .filter(Boolean)
    .map((t) => 'sg-' + t)
    .join(' ');

// ── Two-phase commit ───────────────────────────────────────────────────────
// The participants of the 2PC lab, in order.
export const TPC_PARTICIPANTS = ['Order', 'Payment', 'Inventory'];

// The 2PC state machine. Returns the frames of one run: the coordinator state,
// each participant's state + mark, and a caption. `crash = false` runs to a
// clean COMMIT; `crash = true` kills the coordinator after the votes, freezing
// every participant with its locks held — the availability cost of 2PC.
export function build2pc(crash) {
  const P = TPC_PARTICIPANTS;
  const f = [];
  f.push({
    coord: { m: 'idle', d: false },
    parts: P.map(() => ({ s: '—', c: 'st-idle' })),
    cap: 'A coordinator wants all three services to commit together, atomically — the guarantee a single database gives for free.',
  });
  f.push({
    coord: { m: 'PREPARE?', d: false },
    parts: P.map(() => ({ s: 'preparing…', c: 'st-active' })),
    cap: 'Phase 1 — the coordinator asks every participant to prepare: do all the work, but do not commit yet.',
  });
  f.push({
    coord: { m: 'collecting votes', d: false },
    parts: P.map(() => ({ s: 'YES · locked', c: 'st-active' })),
    cap: 'Each participant votes YES and locks the affected rows, promising it can commit the instant it is told to.',
  });
  if (crash) {
    f.push({
      coord: { m: '✗ CRASHED', d: true },
      parts: P.map(() => ({ s: 'BLOCKED', c: 'st-fail is-blocked' })),
      cap: 'The coordinator dies before sending the verdict. No participant dares commit alone (others may have been told to abort) or abort alone (others may have committed). They wait — locks held — for a decision that never comes.',
    });
  } else {
    f.push({
      coord: { m: 'COMMIT →', d: false },
      parts: P.map(() => ({ s: 'committed', c: 'st-done' })),
      cap: 'Phase 2 — the coordinator broadcasts COMMIT. Every participant commits and releases its locks. One atomic outcome, exactly as intended.',
    });
  }
  return f;
}

// ── Lost update ────────────────────────────────────────────────────────────
// The two events each saga walks through in the lost-update lab.
export const luEvents = (useV) => [
  'read: seats = 1' + (useV ? ' (v0)' : ''),
  'commit — book the seat',
];

// The lost-update interleaving. Two sagas race for the last seat; each commits
// its own local transaction at once, so the second can read and write the same
// row in between. Returns the frames of the interleave: `useV = false` lets B
// overwrite A (a lost update); `useV = true` adds an optimistic version check
// so B sees v0→v1 and aborts — isolation rebuilt by hand at one hot spot.
export function buildLU(useV) {
  const mk = (aShow, bShow, aMark, bMark, seats, version, verdict, vc) => ({
    aShow,
    bShow,
    aMark,
    bMark,
    seats,
    version,
    verdict,
    vc,
  });
  const f = [];
  f.push(mk(0, 0, [], [], 1, 0, '', ''));
  f.push(mk(1, 0, ['on'], [], 1, 0, '', ''));
  f.push(mk(1, 1, ['on'], ['on'], 1, 0, '', ''));
  f.push(mk(2, 1, ['on', 'on win'], ['on'], 0, 1, '', ''));
  if (useV) {
    f.push(
      mk(
        2,
        2,
        ['on', 'on win'],
        ['on', 'on lose'],
        0,
        1,
        'One seat sold. B’s commit saw the version move v0→v1 and aborted. Isolation, rebuilt by hand.',
        'ok',
      ),
    );
  } else {
    f.push(
      mk(
        2,
        2,
        ['on', 'on win'],
        ['on', 'on win'],
        0,
        1,
        'Two confirmations, one seat. B wrote straight over A — a lost update, because nothing isolated the two sagas.',
        'bad',
      ),
    );
  }
  return f;
}

// ── Figure & table datasets ─────────────────────────────────────────────────

// Canto I — the monolith that splits into four independently-logged services.
export const SPLIT_MONOLITH = {
  name: 'Checkout',
  log: 'one database · one write-ahead log',
  desc: 'BEGIN · order · charge · reserve · ship · COMMIT — the engine guarantees all, or nothing.',
};
export const SPLIT_SERVICES = [
  ['Order', 'own db · own log'],
  ['Payment', 'own db · own log'],
  ['Inventory', 'own db · own log'],
  ['Shipping', 'own db · own log'],
];

// Canto III — the contrast that rollback is not compensation.
export const CVR_ROLLBACK = ['v3', 'v2', 'v1'];
export const CVR_COMPENSATION = ['charge $129', 'refund $129'];

// Canto IV — the three kinds of saga step, around the pivot.
export const STEP_KINDS = [
  {
    t: 'compensatable',
    c: 'var(--verdigris)',
    d: 'Has an undo: a later compensating transaction can reverse it — cancel, refund, release.',
    e: 'Create Order · Reserve Stock',
  },
  {
    t: 'pivot',
    c: 'var(--gold)',
    d: 'The go / no-go point. Once it commits, no compensatable steps remain behind it, so the saga is now bound to finish.',
    e: 'Charge a non-refundable deposit',
  },
  {
    t: 'retriable',
    c: 'var(--lapis)',
    d: 'Sits after the pivot and cannot be undone, so it is built to always eventually succeed — retried until it does.',
    e: 'Send confirmation · Issue ticket',
  },
];

// Canto VI — the four moves that rebuild a sliver of isolation.
export const COUNTERMEASURES = [
  {
    h: 'Semantic lock',
    s: 'an application-level lock',
    p: 'A committed-but-not-final row carries a flag — PENDING — that warns other sagas it is still in flux, so they wait or handle it deliberately instead of trusting it as settled.',
    e: 'order.state = PENDING → APPROVED',
  },
  {
    h: 'Commutative updates',
    s: 'order cannot matter',
    p: 'Shape the writes so interleaving cannot lose data. Addition commutes: a debit and a later credit reach the same balance in any order, so no write is silently overwritten.',
    e: 'balance += −129 ; balance += +129',
  },
  {
    h: 'Reread / version',
    s: 'optimistic concurrency',
    p: 'Before writing, re-read and confirm the row has not moved since you read it; abort if it has. This is the version check from the lab — isolation, reassembled exactly where needed.',
    e: 'UPDATE … WHERE version = 7',
  },
  {
    h: 'Pessimistic ordering',
    s: 'reorder the tale',
    p: 'Sequence the steps so the most dangerous dirty-read window is smallest — performing a step that could be exploited last, once the risky data has settled.',
    e: 'reorder steps to shrink exposure',
  },
];

// Canto VII — the four services as they appear in choreography vs orchestration.
export const CHOREO_SERVICES = ['Order', 'Payment', 'Inventory', 'Shipping'];
export const CHOREO_STATES = [
  'emits OrderPlaced',
  'reacts · emits',
  'reacts · emits',
  'reacts → done',
];
export const ORCH_STATES = ['done ✓', 'done ✓', 'working…', 'waiting'];

// Canto VIII — the honest ledger of costs: each property, for 2PC then saga.
export const TRADEOFFS = [
  ['Consistency', 'strong — one atomic moment', 'eventual — converges by compensation'],
  ['Availability', 'low — a coordinator crash blocks', 'high — no lock-step, no shared lock'],
  ['Isolation', 'provided by the protocol', 'none — you rebuild what you need'],
  ['Coupling', 'tight — synchronous, in lock-step', 'loose — each service commits alone'],
  ['Latency', 'pays the prepare round-trip', 'each step commits at local speed'],
  [
    'Reach for it',
    'few participants, one trust domain, short',
    'long-lived, cross-service, availability-first',
  ],
];

// The proem's table of contents — the eight cantos, in order.
export const TOC = [
  ['I', 'The Broken Promise', 'canto-1'],
  ['II', 'The Tempting Detour', 'canto-2'],
  ['III', 'The Inversion', 'canto-3'],
  ['IV', 'Walking the Tale', 'canto-4'],
  ['V', 'The Price — No Isolation', 'canto-5'],
  ['VI', 'Countermeasures', 'canto-6'],
  ['VII', 'Two Ways to Conduct', 'canto-7'],
  ['VIII', 'When to Reach for It', 'canto-8'],
];

// The colophon's "where the tale goes next" reading list.
export const NEXT = [
  [
    'Event sourcing & CQRS',
    'store the facts, not just the latest state — the natural substrate for choreography',
  ],
  [
    'The transactional outbox',
    'emit an event in the same commit as the state change, defeating the dual-write trap',
  ],
  [
    'Durable execution',
    'Temporal, Cadence, Step Functions — orchestrators that survive their own crashes',
  ],
  [
    'TCC — Try / Confirm / Cancel',
    'a saga variant that reserves first, then confirms, instead of compensating after',
  ],
  [
    'Idempotency & deduplication',
    'the discipline that makes retries safe, without which none of this holds',
  ],
  ['Process managers', 'stateful coordinators that decide the next step from accumulated history'],
];
