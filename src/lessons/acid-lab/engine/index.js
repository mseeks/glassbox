export function evalExpr(expr, ctx) {
  if (expr === undefined || expr === null) return null;
  if (/^-?\d+(\.\d+)?$/.test(String(expr).trim())) return Number(expr);

  const expanded = String(expr).replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, name) => {
    return String(ctx[name] ?? 0);
  });

  try {
    return Function(`"use strict"; return (${expanded});`)();
  } catch {
    return null;
  }
}

function deepCopy(value) {
  return JSON.parse(JSON.stringify(value));
}

export function formatValue(value) {
  if (value === null || value === undefined) return '∅';
  return String(value);
}

export function transactionView(txn) {
  if (!txn || txn.status === 'idle') return null;
  return { ...txn.view, ...txn.writes };
}

function resolveLevel(levelOrId, levels) {
  if (typeof levelOrId !== 'string') return levelOrId;
  const level = levels.find((candidate) => candidate.id === levelOrId);
  if (!level) throw new Error(`Unknown isolation level: ${levelOrId}`);
  return level;
}

export function simulateIsolation(scenario, levelOrId, levels = []) {
  const level = resolveLevel(levelOrId, levels);
  const levelId = level.id;
  const { rules } = level;

  const committed = { ...scenario.initial };
  for (const key of scenario.keys) {
    if (!(key in committed)) committed[key] = 0;
  }

  const txns = {};
  for (const op of scenario.timeline) {
    if (!txns[op.txn]) {
      txns[op.txn] = {
        id: op.txn,
        status: 'idle',
        snapshot: null,
        view: {},
        writes: {},
        startStep: -1,
        endStep: -1,
        readLog: [],
      };
    }
  }

  const steps = [
    {
      idx: 0,
      op: null,
      committed: deepCopy(committed),
      txns: deepCopy(txns),
      message:
        'Initial state. The database holds: ' +
        Object.entries(committed)
          .map(([key, value]) => `${key}=${value}`)
          .join(', ') +
        '.',
      note: null,
      flag: null,
      annotation: null,
    },
  ];

  scenario.timeline.forEach((op, opIdx) => {
    const stepIdx = opIdx + 1;
    const t = txns[op.txn];
    let message = '';
    let flag = null;
    let annotation = null;
    let readValue = null;
    let writeValue = null;
    let aborted = false;

    if (op.type === 'begin') {
      t.status = 'active';
      t.startStep = stepIdx;
      if (rules.snapshotOnBegin) {
        t.snapshot = { ...committed };
      }
      message = `${op.txn} begins.`;
      if (rules.snapshotOnBegin) {
        message += ' It takes a snapshot of the database as it stands now.';
      }
    } else if (op.type === 'read') {
      const key = op.key;
      let value;

      if (key in t.writes) {
        value = t.writes[key];
      } else if (rules.consistentReads && key in t.view) {
        value = t.view[key];
      } else if (rules.snapshotOnBegin) {
        value = t.snapshot[key] ?? 0;
      } else if (rules.seesUncommitted) {
        let latest = committed[key] ?? 0;
        for (const otherId of Object.keys(txns)) {
          if (otherId === op.txn) continue;
          const other = txns[otherId];
          if (other.status === 'active' && key in other.writes) {
            latest = other.writes[key];
          }
        }
        value = latest;
      } else {
        value = committed[key] ?? 0;
      }

      t.view[key] = value;
      readValue = value;
      t.readLog.push({ key, valueSeen: value, atStep: stepIdx });
      message = `${op.txn} reads ${key}, sees ${formatValue(value)}.`;

      if (
        scenario.anomalyOnRead &&
        scenario.anomalyOnRead.stepIdx === opIdx &&
        scenario.anomalyOnRead.atLevels.includes(levelId)
      ) {
        flag = 'anomaly';
        annotation = scenario.anomalyOnRead.note;
      }
    } else if (op.type === 'write') {
      const ctx = { ...committed };
      if (rules.snapshotOnBegin && t.snapshot) Object.assign(ctx, t.snapshot);
      Object.assign(ctx, t.view);
      Object.assign(ctx, t.writes);
      const value = evalExpr(op.expr, ctx);
      t.writes[op.key] = value;
      writeValue = value;
      message = `${op.txn} writes ${op.key} = ${formatValue(value)} (uncommitted).`;
    } else if (op.type === 'commit') {
      if (rules.conflictDetection === 'ww' || rules.conflictDetection === 'ssi') {
        for (const key of Object.keys(t.writes)) {
          for (const otherId of Object.keys(txns)) {
            if (otherId === op.txn) continue;
            const other = txns[otherId];
            if (
              other.status === 'committed' &&
              other.endStep > t.startStep &&
              key in other.writes
            ) {
              aborted = true;
              break;
            }
          }
          if (aborted) break;
        }
        if (aborted) {
          t.status = 'aborted';
          t.systemAborted = true;
          t.endStep = stepIdx;
          message = `${op.txn} attempts to commit. The database detects a write-write conflict.`;
          flag = 'abort';
          annotation = `${op.txn} aborts: another transaction has already committed a write to a key ${op.txn} also wrote. (First-committer-wins.)`;
        }
      }

      if (
        !aborted &&
        rules.conflictDetection === 'ssi' &&
        op.specialAbortAt &&
        op.specialAbortAt.includes(levelId)
      ) {
        aborted = true;
        t.status = 'aborted';
        t.systemAborted = true;
        t.endStep = stepIdx;
        message = `${op.txn} attempts to commit. Serializable Snapshot Isolation detects a dangerous read/write dependency cycle.`;
        flag = 'abort';
        annotation = `${op.txn} aborts: SSI noticed that ${op.txn} read data another concurrent transaction modified, and that transaction read data ${op.txn} modified. That cycle breaks serializability. One transaction must die for the schedule to be equivalent to a serial order.`;
      }

      if (!aborted) {
        for (const [key, value] of Object.entries(t.writes)) committed[key] = value;
        t.status = 'committed';
        t.endStep = stepIdx;
        message = `${op.txn} commits. Its writes are now part of the durable database.`;
        flag = 'success';
      }
    } else if (op.type === 'abort') {
      t.status = 'aborted';
      t.endStep = stepIdx;
      message = `${op.txn} aborts. Its uncommitted writes are discarded.`;
    }

    const isLastStep = opIdx === scenario.timeline.length - 1;
    if (isLastStep && scenario.anomalyAtEnd && scenario.anomalyAtEnd.atLevels.includes(levelId)) {
      flag = 'anomaly';
      annotation = scenario.anomalyAtEnd.note;
    }

    steps.push({
      idx: stepIdx,
      op,
      committed: deepCopy(committed),
      txns: deepCopy(txns),
      message,
      readValue,
      writeValue,
      flag,
      annotation,
    });
  });

  const finalStep = steps[steps.length - 1];
  finalStep.hadAnomaly = steps.some((step) => step.flag === 'anomaly');
  finalStep.anySystemAborted = Object.values(txns).some((txn) => txn.systemAborted);

  return steps;
}

export function simulateAtomicity(scenario) {
  const db = { ...scenario.initial };
  const wal = [];
  let active = null;
  let crashed = false;
  let recovered = false;

  const steps = [
    {
      idx: 0,
      op: null,
      db: { ...db },
      wal: [],
      active: null,
      crashed: false,
      recovered: false,
      message:
        'Initial state. The database holds: ' +
        Object.entries(db)
          .map(([key, value]) => `${key}=${value}`)
          .join(', ') +
        '. The write-ahead log is empty.',
    },
  ];

  scenario.timeline.forEach((op, opIdx) => {
    const stepIdx = opIdx + 1;
    let message = '';

    if (op.type === 'begin') {
      active = { id: 'T1', writes: {}, status: 'active' };
      wal.push({ id: wal.length + 1, type: 'BEGIN', txn: 'T1' });
      message = 'T₁ begins. BEGIN entry appended to log.';
    } else if (op.type === 'write') {
      const ctx = { ...db, ...(active?.writes || {}) };
      const value = evalExpr(op.expr, ctx);
      if (active) active.writes[op.key] = value;
      wal.push({ id: wal.length + 1, type: 'WRITE', txn: 'T1', key: op.key, value });
      message = `T₁ writes ${op.key} = ${value}. Logged; database not yet touched.`;
    } else if (op.type === 'commit_log') {
      wal.push({ id: wal.length + 1, type: 'COMMIT', txn: 'T1' });
      if (active) active.status = 'committed_in_log';
      message = "COMMIT marker fsync'd to log. T₁ is officially committed.";
    } else if (op.type === 'commit_apply') {
      if (active) {
        for (const [key, value] of Object.entries(active.writes)) {
          db[key] = value;
        }
        active.status = 'fully_committed';
      }
      active = null;
      message = 'Writes applied to database from workspace.';
    } else if (op.type === 'abort') {
      wal.push({ id: wal.length + 1, type: 'ABORT', txn: 'T1' });
      active = null;
      message = 'T₁ aborts. Workspace discarded. ABORT entry logged.';
    } else if (op.type === 'crash') {
      active = null;
      crashed = true;
      message = '💥 System crash. In-memory state lost. Disk (database + WAL) survives.';
    } else if (op.type === 'recover') {
      const committedTxns = new Set();
      for (const entry of wal) {
        if (entry.type === 'COMMIT') committedTxns.add(entry.txn);
      }
      const redone = [];
      for (const entry of wal) {
        if (entry.type === 'WRITE' && committedTxns.has(entry.txn)) {
          db[entry.key] = entry.value;
          redone.push(`${entry.key}=${entry.value}`);
        }
      }
      crashed = false;
      recovered = true;
      message =
        redone.length > 0
          ? `Recovery: walked log, found COMMIT for T₁, redid: ${redone.join(', ')}.`
          : 'Recovery: walked log, no COMMIT marker for T₁. Discarding partial writes. Database unchanged.';
    }

    steps.push({
      idx: stepIdx,
      op,
      db: { ...db },
      wal: wal.map((entry) => ({ ...entry })),
      active: active ? { ...active, writes: { ...active.writes } } : null,
      crashed,
      recovered,
      message,
    });
  });

  return steps;
}
