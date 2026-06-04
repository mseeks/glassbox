export const LEVELS = [
  {
    id: 'read_uncommitted',
    name: 'Read Uncommitted',
    short: 'RU',
    blurb: "A read can see other transactions' uncommitted writes. The wild west.",
    rules: {
      seesUncommitted: true,
      consistentReads: false,
      snapshotOnBegin: false,
      conflictDetection: 'none',
    },
  },
  {
    id: 'read_committed',
    name: 'Read Committed',
    short: 'RC',
    blurb:
      "Reads only return data that's been committed. But two reads of the same row, inside one transaction, can return different values.",
    rules: {
      seesUncommitted: false,
      consistentReads: false,
      snapshotOnBegin: false,
      conflictDetection: 'none',
    },
  },
  {
    id: 'repeatable_read',
    name: 'Repeatable Read',
    short: 'RR',
    blurb:
      'Each row, once read, returns the same value for the rest of the transaction. ANSI definition still permits phantoms.',
    rules: {
      seesUncommitted: false,
      consistentReads: true,
      snapshotOnBegin: false,
      conflictDetection: 'none',
    },
  },
  {
    id: 'snapshot',
    name: 'Snapshot Isolation',
    short: 'SI',
    blurb:
      'The whole transaction reads from a consistent snapshot taken at BEGIN. Catches write-write conflicts at commit.',
    rules: {
      seesUncommitted: false,
      consistentReads: true,
      snapshotOnBegin: true,
      conflictDetection: 'ww',
    },
  },
  {
    id: 'serializable',
    name: 'Serializable',
    short: 'SER',
    blurb:
      'Equivalent to some serial schedule. Snapshot isolation plus monitoring for the dangerous read/write patterns that cause write skew.',
    rules: {
      seesUncommitted: false,
      consistentReads: true,
      snapshotOnBegin: true,
      conflictDetection: 'ssi',
    },
  },
];

/* ────────────────────────────────────────────────────────────────────
SCENARIOS — each is a script of operations + an explanation
──────────────────────────────────────────────────────────────────── */
export const SCENARIOS = [
  {
    id: 'dirty_read',
    title: 'The Dirty Read',
    subtitle: 'Reading the not-yet-committed',
    intro:
      "Two transactions are about to run side by side. T₁ wants to update X. T₂ wants to read X and use it to compute Y. Each believes it is alone with the database. The level the database has promised will determine whether T₁'s in-progress work is allowed to leak into T₂'s view.",
    invariant: "No transaction should ever observe another transaction's uncommitted writes.",
    initial: { X: 100 },
    keys: ['X', 'Y'],
    timeline: [
      {
        txn: 'T1',
        type: 'begin',
        prose:
          'T₁ opens its session. Its workspace is private. Any writes it makes will be invisible to others until it commits.',
      },
      {
        txn: 'T2',
        type: 'begin',
        prose:
          'T₂ opens its session alongside. They are now concurrent. The database must decide what each is allowed to see of the other.',
      },
      {
        txn: 'T1',
        type: 'write',
        key: 'X',
        expr: '500',
        prose:
          "T₁ writes X = 500. This write is **pending**, held in T₁'s private workspace, not yet sealed into the official database. Think of it as a sealed letter T₁ has written but not yet sent.",
      },
      {
        txn: 'T2',
        type: 'read',
        key: 'X',
        prose:
          'T₂ reads X. What it sees depends entirely on the level. Watch carefully. This is the moment that defines a dirty read.',
        proseByLevel: {
          read_uncommitted:
            "T₂ reads X. At Read Uncommitted, the database is willing to peek inside T₁'s private workspace and hand its pending value to T₂. T₂ sees X = 500. That value does not officially exist.",
          read_committed:
            "T₂ reads X. At Read Committed, the database refuses to leak T₁'s pending write. T₂ sees X = 100, the last committed value. The dirty read is impossible here.",
          repeatable_read:
            'T₂ reads X. At Repeatable Read, T₂ sees only committed values, and from now on, this read is pinned. X = 100.',
          snapshot:
            'T₂ reads X. T₂ took a snapshot at BEGIN; that snapshot says X = 100. The pending write is a non-event.',
          serializable:
            "T₂ reads X. The serializable level reads from a snapshot. X = 100. Nothing of T₁'s is visible.",
        },
      },
      {
        txn: 'T2',
        type: 'write',
        key: 'Y',
        expr: '$X * 2',
        prose:
          "Trusting what it just read, T₂ writes Y = 2 × X. Whatever value of X it saw a moment ago is now baked into Y's pending write.",
      },
      {
        txn: 'T2',
        type: 'commit',
        prose:
          'T₂ commits. Its writes, including Y, are now sealed into the database, permanent and visible to everyone.',
      },
      {
        txn: 'T1',
        type: 'abort',
        prose:
          "T₁ aborts. Perhaps an error, perhaps a rollback. Its uncommitted X = 500 vanishes. The database's X reverts to 100. But T₂'s Y has already committed. Whatever Y holds is now part of the permanent record.",
      },
    ],
    anomalyOnRead: {
      stepIdx: 3,
      atLevels: ['read_uncommitted'],
      note: "T₂ just observed T₁'s uncommitted write. The dirty read has occurred.",
    },
    anomalyAtEnd: {
      atLevels: ['read_uncommitted'],
      note: 'Y = 1000 is now permanent. It records twice an X = 500 that the database itself disowns. A permanent record of unreality.',
    },
    closing: {
      bad: "This is the dirty read in its full ugliness: T₂'s committed work depends on a value the database itself rejected. Not a transient inconsistency. A permanent record of a reality that never was. This is why almost every database forbids dirty reads by default.",
      good: "At this level, T₁'s pending write was hidden from T₂. T₂ read X = 100, computed Y = 200, and committed cleanly. When T₁ aborted, none of T₂'s work was poisoned. The dirty read cannot occur here. That's the promise.",
    },
  },
  {
    id: 'non_repeatable',
    title: 'The Non-Repeatable Read',
    subtitle: 'Same row, different answers, same transaction',
    intro:
      "A subtler trouble than the dirty read. Here T₁ reads a row, then later, still inside the same transaction, reads the same row again. Should it get the same value? At lower levels, no: the database is allowed to let another transaction's commit slip in between the two reads. T₁ ends up with two different beliefs about a single piece of data.",
    invariant: 'A transaction reading the same row twice should see the same value.',
    initial: { X: 100 },
    keys: ['X'],
    timeline: [
      {
        txn: 'T1',
        type: 'begin',
        prose: 'T₁ begins. It is about to do some work that involves reading X more than once.',
      },
      {
        txn: 'T1',
        type: 'read',
        key: 'X',
        prose:
          'T₁ reads X for the first time. It sees X = 100 and, perhaps, holds that value in its application memory.',
      },
      { txn: 'T2', type: 'begin', prose: 'Meanwhile, T₂ begins.' },
      {
        txn: 'T2',
        type: 'write',
        key: 'X',
        expr: '200',
        prose: 'T₂ writes X = 200. Pending in its workspace.',
      },
      {
        txn: 'T2',
        type: 'commit',
        prose: 'T₂ commits. X = 200 is now the official value in the database.',
      },
      {
        txn: 'T1',
        type: 'read',
        key: 'X',
        prose: 'T₁ reads X again. Will it see what it saw before, or what is now true?',
        proseByLevel: {
          read_uncommitted:
            "T₁ reads X. At RU, the database simply returns the latest committed value: 200. T₁'s two reads disagree.",
          read_committed:
            "T₁ reads X. At RC, the database returns the latest committed value: 200. T₁'s two reads disagree, within a single transaction.",
          repeatable_read:
            "T₁ reads X. At Repeatable Read, T₁'s first read is *pinned*. The database returns the same value it returned before: 100.",
          snapshot:
            "T₁ reads X. T₁'s snapshot says X = 100. It has always said so. T₁ sees 100, just as before.",
          serializable:
            'T₁ reads X. The snapshot is sacred. T₁ sees 100, exactly as it did the first time.',
        },
      },
      {
        txn: 'T1',
        type: 'commit',
        prose: 'T₁ commits and exits. It made no writes; the database state is unchanged.',
      },
    ],
    anomalyOnRead: {
      stepIdx: 5,
      atLevels: ['read_uncommitted', 'read_committed'],
      note: 'T₁ has just observed two different values for X within one transaction. The ground shifted underneath.',
    },
    closing: {
      bad: 'Inside one logical unit of work, T₁ saw two different truths about X. Whatever business logic depended on consistency between those reads has now been silently broken. The database did nothing wrong; it just kept its weak promise.',
      good: "Once T₁ read X, that read was held steady. Even though T₂ committed a new value, T₁'s view of X did not change. Two reads, one answer. The promise was kept.",
    },
  },
  {
    id: 'read_skew',
    title: 'Read Skew',
    subtitle: 'A reality stitched from mismatched moments',
    intro:
      "A bank account is split between savings and checking. The total must always be exactly 200. That's the rule. Money moves between the two halves all day, but always in pairs that preserve the total. T₁ is auditing the account: it will read savings, then later read checking, and verify the sum. In between, T₂ will atomically rebalance the two halves. Will T₁'s two reads still tell a coherent story? (This shape also underlies the famous *phantom read*: rows appearing in a range query that did not appear before. Phantom is read skew applied to set membership.)",
    invariant: 'X + Y = 200 at all times.',
    initial: { X: 100, Y: 100 },
    keys: ['X', 'Y'],
    timeline: [
      {
        txn: 'T1',
        type: 'begin',
        prose: 'T₁ begins. It will be reading two related values, X and Y.',
      },
      {
        txn: 'T1',
        type: 'read',
        key: 'X',
        prose:
          'T₁ reads X. It sees 100, the current committed value. The invariant still holds: X + Y = 100 + 100 = 200.',
      },
      { txn: 'T2', type: 'begin', prose: 'T₂ begins, intending to rebalance.' },
      { txn: 'T2', type: 'write', key: 'X', expr: '40', prose: 'T₂ writes X = 40. Pending.' },
      {
        txn: 'T2',
        type: 'write',
        key: 'Y',
        expr: '160',
        prose: 'T₂ writes Y = 160. Pending. Together with the X write, this preserves X + Y = 200.',
      },
      {
        txn: 'T2',
        type: 'commit',
        prose:
          'T₂ commits. Both writes land atomically. The database now holds X = 40, Y = 160, still summing to 200.',
      },
      {
        txn: 'T1',
        type: 'read',
        key: 'Y',
        prose: 'T₁ now reads Y. What value will it pair with the X = 100 it read earlier?',
        proseByLevel: {
          read_uncommitted:
            "T₁ reads Y from the latest committed: 160. T₁'s view is now X = 100, Y = 160. Their sum is 260: an impossible state.",
          read_committed:
            "T₁ reads Y from the latest committed: 160. T₁'s view is now X = 100, Y = 160. Sum: 260. The invariant appears violated, even though the database itself never held that state.",
          repeatable_read:
            'T₁ reads Y. RR pins individual rows it has already read, but Y was never read before, so this returns the latest committed Y = 160. T₁ sees X = 100, Y = 160. The invariant appears broken, because RR does not snapshot the whole database.',
          snapshot:
            'T₁ reads Y. The snapshot says Y = 100 (this is what Y was when T₁ began). T₁ sees X = 100, Y = 100. Sum: 200. The invariant holds.',
          serializable:
            'T₁ reads Y. From its snapshot: Y = 100. Sum: 200. Consistent with what was true when T₁ began.',
        },
      },
      {
        txn: 'T1',
        type: 'commit',
        prose: 'T₁ commits. It made no writes; the database state is whatever T₂ left it at.',
      },
    ],
    anomalyOnRead: {
      stepIdx: 6,
      atLevels: ['read_uncommitted', 'read_committed', 'repeatable_read'],
      note: "T₁ has now stitched together a state that never existed in reality: X from before T₂'s update, Y from after.",
    },
    closing: {
      bad: 'T₁ saw an impossible composite: an X from one moment, a Y from another. No real database state ever looked like this. Repeatable Read does not save us here. It only pins individual rows. To prevent read skew you need the *whole database* frozen, which is exactly what Snapshot Isolation provides.',
      good: "T₁'s reads came from a single, coherent moment in the database's life. Even though T₂'s commit slipped past in real time, T₁'s view stayed loyal to the snapshot it took at BEGIN. No impossible state was ever observed.",
    },
  },
  {
    id: 'lost_update',
    title: 'Lost Update',
    subtitle: 'Two increments, one survivor',
    intro:
      'A page-view counter sits at 5. Two requests arrive at almost the same instant. Both want to increment it. Each one does the same simple thing: read the current value, add one, write the result back. If the database ran them one after the other, the counter would end at 7. But they will run concurrently. Whether the database notices is the entire question.',
    invariant:
      'Every committed write must be observed by subsequent transactions; no increment may silently disappear.',
    initial: { counter: 5 },
    keys: ['counter'],
    timeline: [
      { txn: 'T1', type: 'begin', prose: 'T₁ begins.' },
      { txn: 'T2', type: 'begin', prose: 'T₂ begins, concurrent with T₁.' },
      { txn: 'T1', type: 'read', key: 'counter', prose: 'T₁ reads counter. It sees 5.' },
      {
        txn: 'T2',
        type: 'read',
        key: 'counter',
        prose:
          'T₂ reads counter. It also sees 5. (At any level above RU, both see the same committed value.)',
      },
      {
        txn: 'T1',
        type: 'write',
        key: 'counter',
        expr: '$counter + 1',
        prose: 'T₁ computes 5 + 1 = 6 and writes counter = 6. Pending.',
      },
      {
        txn: 'T2',
        type: 'write',
        key: 'counter',
        expr: '$counter + 1',
        prose:
          'T₂ computes 5 + 1 = 6 and writes counter = 6. Pending. Both transactions, in their private workspaces, hold the same intended result.',
      },
      { txn: 'T1', type: 'commit', prose: 'T₁ commits. counter = 6 is now the official value.' },
      {
        txn: 'T2',
        type: 'commit',
        prose:
          'T₂ attempts to commit. The question is whether the database notices what just happened.',
        proseByLevel: {
          read_uncommitted:
            "T₂ commits. No conflict detection at this level. The database simply records counter = 6 again. T₁'s increment has been overwritten, silently lost.",
          read_committed:
            "T₂ commits. No conflict detection. counter = 6 again. T₁'s increment is lost.",
          repeatable_read:
            "T₂ commits. Generic MVCC Repeatable Read (MySQL/InnoDB) does no write-write conflict detection, so counter = 6 again and T₁'s increment is lost. ANSI/locking RR and Postgres's snapshot RR would both have caught it — at this level it depends on the engine.",
          snapshot:
            "T₂ attempts to commit. Snapshot Isolation now checks: did anyone commit a write to counter after T₂'s snapshot? Yes. T₁ did. The first-committer-wins rule fires. T₂ is **aborted**.",
          serializable:
            'T₂ attempts to commit. The same write-write conflict is detected. T₂ is **aborted** to preserve serializability.',
        },
      },
    ],
    anomalyAtEnd: {
      atLevels: ['read_uncommitted', 'read_committed', 'repeatable_read'],
      note: 'Both transactions read 5, both wrote 6, both committed. Final value: 6 instead of 7. One increment vanished into nothing.',
    },
    closing: {
      bad: 'Both transactions thought they had successfully incremented the counter. Both committed without error. But one of their increments was silently overwritten. The database has 6 where it should have 7. This is the canonical lost update.',
      good: "Snapshot Isolation noticed that T₂ was about to overwrite a key that another concurrent transaction had already committed. Rather than allow the lost update, it refused T₂'s commit. The application will see a serialization error and must retry. On the retry, T₂ will read counter = 6 and correctly commit 7.",
    },
  },
  {
    id: 'write_skew',
    title: 'Write Skew',
    subtitle: 'The hospital where everyone clocked out',
    intro:
      'Two doctors, Alice and Bob, are both on call. Hospital policy: at least one doctor must always be on call. Two transactions arrive simultaneously. Alice wants to clock out, Bob wants to clock out. Each one reads the schedule, sees that *two* doctors are on call, and concludes its individual change is safe. The trap is that they will write to **different rows**, so the database sees no direct conflict between their writes.',
    invariant: 'At least one doctor must be on call at all times (alice_oncall + bob_oncall ≥ 1).',
    initial: { alice_oncall: 1, bob_oncall: 1 },
    keys: ['alice_oncall', 'bob_oncall'],
    timeline: [
      { txn: 'T1', type: 'begin', prose: "T₁ (Alice's clock-out request) begins." },
      { txn: 'T2', type: 'begin', prose: "T₂ (Bob's clock-out request) begins, concurrent." },
      { txn: 'T1', type: 'read', key: 'alice_oncall', prose: "T₁ reads Alice's status. On call." },
      {
        txn: 'T1',
        type: 'read',
        key: 'bob_oncall',
        prose:
          "T₁ reads Bob's status. On call. T₁ concludes: with two on call, Alice can safely leave.",
      },
      { txn: 'T2', type: 'read', key: 'alice_oncall', prose: 'T₂ reads Alice. On call.' },
      {
        txn: 'T2',
        type: 'read',
        key: 'bob_oncall',
        prose: 'T₂ reads Bob. On call. T₂ concludes: with two on call, Bob can safely leave.',
      },
      {
        txn: 'T1',
        type: 'write',
        key: 'alice_oncall',
        expr: '0',
        prose: "T₁ writes alice_oncall = 0. Pending. Note: T₁ is writing to *Alice's row*.",
      },
      {
        txn: 'T2',
        type: 'write',
        key: 'bob_oncall',
        expr: '0',
        prose:
          "T₂ writes bob_oncall = 0. Pending. T₂ is writing to a *different row*, Bob's. The two transactions touch entirely separate keys.",
      },
      {
        txn: 'T1',
        type: 'commit',
        prose: 'T₁ commits. alice_oncall = 0. The database now believes only Bob is on call.',
      },
      {
        txn: 'T2',
        type: 'commit',
        specialAbortAt: ['serializable'],
        prose: 'T₂ attempts to commit. Will the database catch what is about to happen?',
        proseByLevel: {
          read_uncommitted:
            'T₂ commits. No conflict detection. bob_oncall = 0. Now no one is on call. The invariant has been quietly destroyed.',
          read_committed: 'T₂ commits. No conflict. bob_oncall = 0. No one is on call.',
          repeatable_read:
            'T₂ commits. No write-write conflict (the writes are to disjoint keys). bob_oncall = 0. No one is on call.',
          snapshot:
            'T₂ attempts to commit. Snapshot Isolation looks for **write-write** conflicts: did anyone commit a write to *the same key* T₂ wrote? T₁ wrote alice_oncall; T₂ wrote bob_oncall. Different keys, no conflict. T₂ commits. Both doctors are now off call. SI cannot catch this.',
          serializable:
            'T₂ attempts to commit. Serializable Snapshot Isolation goes further: it tracks *read-write dependencies*. T₁ read bob_oncall and wrote alice_oncall. T₂ read alice_oncall and wrote bob_oncall. That is a dangerous cycle. There is no serial order in which both could have committed safely. SSI **aborts T₂**.',
        },
      },
    ],
    anomalyAtEnd: {
      atLevels: ['read_uncommitted', 'read_committed', 'repeatable_read', 'snapshot'],
      note: 'Both transactions committed. Both doctors are off call. The invariant is broken, even though every individual transaction independently verified it before writing.',
    },
    closing: {
      bad: 'Each transaction was, on its own, completely correct. Each verified the invariant. Each made a small change. Yet the *combined* effect violates the rule no individual write violated. Snapshot Isolation cannot catch this because there is no write-write conflict: the writes go to different rows. Only Serializable, by tracking *read-write* dependencies, sees the danger.',
      good: 'Serializable Snapshot Isolation detected that the two transactions formed a read/write dependency cycle: each read what the other was about to modify. Such a schedule is not equivalent to any serial order, so SSI aborted one of them. The application catches the serialization error and retries. On retry it sees the new world (one doctor already off) and refuses to remove the second.',
    },
  },
];

/* ────────────────────────────────────────────────────────────────────
ANOMALY MATRIX — quick reference card
──────────────────────────────────────────────────────────────────── */
export const MATRIX = [
  {
    anomaly: 'Dirty Read',
    levels: {
      read_uncommitted: 0,
      read_committed: 1,
      repeatable_read: 1,
      snapshot: 1,
      serializable: 1,
    },
  },
  {
    anomaly: 'Non-Repeatable',
    levels: {
      read_uncommitted: 0,
      read_committed: 0,
      repeatable_read: 1,
      snapshot: 1,
      serializable: 1,
    },
  },
  {
    anomaly: 'Read Skew',
    levels: {
      read_uncommitted: 0,
      read_committed: 0,
      repeatable_read: 0,
      snapshot: 1,
      serializable: 1,
    },
  },
  {
    anomaly: 'Phantom Read',
    levels: {
      read_uncommitted: 0,
      read_committed: 0,
      repeatable_read: 0.5,
      snapshot: 1,
      serializable: 1,
    },
  },
  {
    anomaly: 'Lost Update',
    levels: {
      read_uncommitted: 0,
      read_committed: 0,
      repeatable_read: 0.5,
      snapshot: 1,
      serializable: 1,
    },
  },
  {
    anomaly: 'Write Skew',
    levels: {
      read_uncommitted: 0,
      read_committed: 0,
      repeatable_read: 0,
      snapshot: 0,
      serializable: 1,
    },
  },
];
// 1 = prevented, 0 = allowed, 0.5 = depends on implementation (e.g., InnoDB RR uses gap locks; Postgres RR is actually SI)

/* ────────────────────────────────────────────────────────────────────
ACID PROPERTIES — high-level framing for the four pillars
──────────────────────────────────────────────────────────────────── */
// Each pillar carries TWO forms of its accent: `accent` is the raw dark-mode
// hex, used only where a bright pastel paints a faint decorative wash/glow
// (hexToRgb → low-alpha gradient + box-shadow) that reads in both themes;
// `accentVar` is the theme-flipping token, used everywhere the accent carries
// TEXT, a glyph, or a border, so it deepens to a readable wax-seal on paper.
export const ACID_PROPERTIES = [
  {
    letter: 'A',
    name: 'Atomicity',
    domain: 'Failure',
    accent: '#a78bfa',
    accentVar: 'var(--iso-violet)',
    question: 'What if the transaction is interrupted mid-flight?',
    promise: 'All writes succeed together, or none do.',
    mechanism: 'Write-ahead log',
    section: 'atomicity',
  },
  {
    letter: 'C',
    name: 'Consistency',
    domain: 'Invariants',
    accent: '#f0abfc',
    accentVar: 'var(--iso-pink)',
    question: 'What rules must the data always obey?',
    promise: 'Every committed transaction leaves the database valid.',
    mechanism: 'Constraints + application logic',
    section: 'consistency',
  },
  {
    letter: 'I',
    name: 'Isolation',
    domain: 'Concurrency',
    accent: '#5eead4',
    accentVar: 'var(--iso-teal)',
    question: 'What does each transaction see of the others?',
    promise: 'Concurrent execution behaves as the level promises.',
    mechanism: 'Locks · snapshots · SSI',
    section: 'isolation',
  },
  {
    letter: 'D',
    name: 'Durability',
    domain: 'Persistence',
    accent: '#fbbf24',
    accentVar: 'var(--iso-amber)',
    question: 'What survives a power outage?',
    promise: 'Once committed, it persists through any failure.',
    mechanism: 'fsync + replication',
    section: 'durability',
  },
];

/* ────────────────────────────────────────────────────────────────────
ATOMICITY — three scenarios that together teach the WAL
Different shape from isolation: ONE transaction, plus the log
──────────────────────────────────────────────────────────────────── */
export const ATOMICITY_SCENARIOS = [
  {
    id: 'clean_commit',
    title: 'The Successful Commit',
    subtitle: 'Two phases, one promise',
    intro:
      "A transaction in flight is not yet a transaction in fact. T₁ is going to write two values, A and B, then commit. Watch how the **write-ahead log** becomes the truth before the database does. The log is *durable* (every entry is immediately fsync'd); the database itself is updated in a second, lazier phase.",
    initial: { A: 0, B: 0 },
    timeline: [
      {
        type: 'begin',
        prose:
          'T₁ opens a transaction. The database appends a BEGIN entry to the log. So far, nothing has changed in the database itself; this is purely a marker.',
      },
      {
        type: 'write',
        key: 'A',
        expr: '10',
        prose:
          "T₁ writes A = 10. The new value is held in T₁'s **private workspace** (volatile, in memory) and a corresponding entry is appended to the WAL (durable, on disk). The database itself still shows the old value.",
      },
      {
        type: 'write',
        key: 'B',
        expr: '20',
        prose:
          "T₁ writes B = 20. Same shape: workspace updated, log appended. Two writes are now pending. Crucially, the WAL entries are fsync'd. They will survive any crash.",
      },
      {
        type: 'commit_log',
        prose:
          "Phase one of commit: a **COMMIT** marker is appended to the WAL and fsync'd. *This is the moment T₁ becomes officially committed.* From here on, even if everything crashes, the database has a binding promise to make T₁'s writes real.",
      },
      {
        type: 'commit_apply',
        prose:
          "Phase two of commit: the writes from T₁'s workspace are applied to the database itself. This is the part the application has been waiting for. Yet pedagogically, it's the *less important* phase. The COMMIT marker in the log was the real moment of truth.",
      },
    ],
    closing:
      "The WAL became the source of truth before the database did. As soon as the COMMIT marker was fsync'd, T₁ was officially complete, even though the database hadn't yet been updated. Splitting commit into two phases (log first, apply second) is what makes atomicity survivable across crashes. The next two scenarios show how.",
  },
  {
    id: 'crash_before',
    title: 'The Crash Before Commit',
    subtitle: 'How the database escapes a partial transaction',
    intro:
      'Sometimes things go wrong. T₁ is in the middle of writing. The WAL has its writes, the workspace holds them, and then the power dies. What happens when the database comes back up? It walks the log, and the absence of one specific marker tells it everything.',
    initial: { A: 0, B: 0 },
    timeline: [
      { type: 'begin', prose: 'T₁ begins. BEGIN appended to log.' },
      {
        type: 'write',
        key: 'A',
        expr: '10',
        prose: 'T₁ writes A = 10. Logged. Workspace holds the pending value.',
      },
      {
        type: 'write',
        key: 'B',
        expr: '20',
        prose:
          'T₁ writes B = 20. Logged. Two writes are now in the WAL, but **no COMMIT marker yet**. The database itself is still untouched.',
      },
      {
        type: 'crash',
        prose:
          "The power dies mid-transaction. T₁'s in-memory workspace evaporates instantly. The WAL on disk and the database on disk both survive. But T₁'s pending writes are now stranded in the log without ever being made official.",
      },
      {
        type: 'recover',
        prose:
          "The system restarts and runs **recovery**. It walks the WAL from the beginning, looking for transactions. It sees T₁'s BEGIN, two WRITEs, and then… the log ends without a COMMIT. T₁'s verdict: incomplete. Its log entries are **discarded**. They will never become real. The database stays in its original state.",
      },
    ],
    closing:
      "The crash was indistinguishable, from the database's point of view, from T₁ never having started. That is atomicity's core promise: **without the COMMIT marker, no part of you survives**. The WAL's job here was to remember enough that the recovery pass could clean up confidently.",
  },
  {
    id: 'crash_after',
    title: 'The Crash After Commit',
    subtitle: 'Why the log is the truth, not the database',
    intro:
      "Now the harder case. T₁ has done its work: every write is in the log, the COMMIT marker has been fsync'd, the application has been told the commit succeeded. But the database itself hasn't been updated yet. That's the lazier second phase. Then the power dies. Has T₁ committed or not?",
    initial: { A: 0, B: 0 },
    timeline: [
      { type: 'begin', prose: 'T₁ begins.' },
      { type: 'write', key: 'A', expr: '10', prose: 'T₁ writes A = 10. Logged.' },
      { type: 'write', key: 'B', expr: '20', prose: 'T₁ writes B = 20. Logged.' },
      {
        type: 'commit_log',
        prose:
          "The COMMIT marker is fsync'd to the WAL. *T₁ is now officially committed.* The application has received its acknowledgment. The promise has been made.",
      },
      {
        type: 'crash',
        prose:
          'The power dies, *before phase two could run*. The database on disk is still showing A = 0, B = 0. The application thinks T₁ committed. The database appears not to have it. This is precisely the moment durability would be lost, except for one thing: the COMMIT marker is in the log.',
      },
      {
        type: 'recover',
        prose:
          "Recovery walks the WAL. It sees T₁'s BEGIN, two WRITEs, and a COMMIT. T₁'s verdict: **committed**. The recovery pass **REDOes** the writes, applying them to the database from the log. The database now reflects T₁ exactly as if the crash had never happened.",
      },
    ],
    closing:
      'T₁\'s commit was acknowledged before the database was physically updated, and the crash threatened to lose that work. But the WAL had it. Recovery\'s **REDO** pass replayed the committed writes into the database. To the application, the crash is invisible. *This is why we say "the WAL is the source of truth": the database is just a derived view of what the log says happened.*',
  },
];
export const SYNTHESIS_PHASES = [
  {
    phase: 'BEGIN',
    detail: 'A transaction opens.',
    activeProps: ['I'],
    annotations: {
      I: "Snapshot taken (under SI/Serializable). The transaction's reads will come from this frozen view.",
    },
  },
  {
    phase: 'WRITE A',
    detail: 'A pending write is added to the workspace.',
    activeProps: ['A', 'C'],
    annotations: {
      A: 'WAL entry appended on disk. Even if the system crashes here, the partial write can be discarded cleanly.',
      C: 'Constraint check: does this write violate NOT NULL, FK, CHECK? If so, the transaction will be rejected.',
    },
  },
  {
    phase: 'WRITE B',
    detail: 'Another pending write.',
    activeProps: ['A', 'C'],
    annotations: {
      A: 'WAL entry appended.',
      C: 'Constraint check.',
    },
  },
  {
    phase: 'COMMIT',
    detail: 'The application requests commitment.',
    activeProps: ['I', 'A', 'D'],
    annotations: {
      I: 'Conflict detection: SI checks for write-write conflicts; Serializable checks for dangerous read/write dependency cycles. Either may abort the transaction.',
      A: "COMMIT marker appended to WAL. Then fsync'd (next phase).",
      D: 'fsync forces the WAL to durable storage. After this returns, the commit survives any crash. If replication is configured, the entry is also sent to replicas, and the commit may wait for their acknowledgment.',
    },
  },
  {
    phase: 'APPLY',
    detail: 'The writes are applied to the database itself.',
    activeProps: ['A'],
    annotations: {
      A: 'Workspace writes are applied to the database. This phase is lazy, it can be deferred, because the WAL already holds the truth.',
    },
  },
  {
    phase: 'END',
    detail: 'Acknowledgment returned to the application.',
    activeProps: [],
    annotations: {},
  },
];
