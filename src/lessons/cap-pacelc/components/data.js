export const CONSISTENCY_LEVELS = [
  {
    id: 'strict-ser',
    name: 'Strict Serializability',
    tier: 0,
    color: 'var(--emerald)',
    short: 'Linearizability + multi-object serializability.',
    desc: 'There exists one global total order of all transactions consistent with real time. The strongest practical model. Single-object real-time order AND multi-object transactional order, jointly.',
    rules: 'Every concurrency anomaly is ruled out.',
    permits: 'Nothing.',
    systems: ['Spanner', 'FoundationDB', 'CockroachDB (default)'],
    cost: 'Distributed consensus on every commit; clock-bounded waits.',
  },
  {
    id: 'lin',
    name: 'Linearizability',
    tier: 1,
    color: 'var(--emerald)',
    short: 'Single-object reads see the most recent write, in real-time order.',
    desc: "There appears to be one copy of each object. Each operation takes effect atomically at some instant between invocation and response. This is CAP's C.",
    rules: 'Stale reads, non-real-time reordering.',
    permits: 'Multi-object anomalies (since it only covers single objects).',
    systems: ['etcd', 'Zookeeper', 'Raft-backed KV stores'],
    cost: 'Quorum round-trip per operation, or a leader lease.',
  },
  {
    id: 'ser',
    name: 'Serializability',
    tier: 1,
    color: 'var(--emerald)',
    short: 'Transactions appear to run in some serial order.',
    desc: 'Multi-object transactions appear to run one at a time, in some order, though not necessarily the real-time one. So a transaction begun later may appear to commit earlier.',
    rules: 'Dirty read, lost update, write skew, phantoms.',
    permits: 'Reading a "consistent old view" of the system.',
    systems: ['PostgreSQL SERIALIZABLE', 'CockroachDB serializable mode'],
    cost: 'Conflict detection (SSI), aborts on conflict.',
  },
  {
    id: 'si',
    name: 'Snapshot Isolation',
    tier: 2,
    color: 'var(--cyan)',
    short: 'Each transaction reads from a consistent snapshot at its start.',
    desc: 'Each transaction sees an unchanging snapshot of the database from the moment it began. Writes succeed only if no conflict at commit time.',
    rules: 'Dirty read, non-repeatable read, most phantoms.',
    permits:
      'Write skew. Concurrent transactions read overlapping data and each make a decision valid alone but jointly invariant-violating.',
    systems: ['PostgreSQL REPEATABLE READ', 'Oracle', 'MySQL InnoDB default'],
    cost: 'MVCC machinery, occasional aborts.',
  },
  {
    id: 'causal-plus',
    name: 'Causal+ Consistency',
    tier: 3,
    color: 'var(--cyan)',
    short: 'Causality preserved; concurrent operations resolved to one value.',
    desc: 'Every observer sees causally-related operations in causal order. Concurrent operations are resolved deterministically to a single value (CRDT merge, LWW with stable tiebreak).',
    rules: 'Causality violations ("reply before post"), divergent siblings.',
    permits: 'Concurrent operations may merge in unintuitive ways.',
    systems: ['COPS', 'Eiger', 'AntidoteDB', 'CRDT-based stores'],
    cost: 'Dependency tracking, convergent merge functions.',
  },
  {
    id: 'causal',
    name: 'Causal Consistency',
    tier: 4,
    color: 'var(--violet)',
    short: 'If A caused B, every observer sees A before B.',
    desc: 'Operations linked by happens-before are observed in order; concurrent operations may be observed in any order. The "+ convergence" is optional, so siblings can persist.',
    rules: 'Causality violations.',
    permits: 'Divergent siblings the client must reconcile.',
    systems: ['Riak (vector clocks)', 'Cassandra LWT-free path'],
    cost: 'Vector clocks, version vectors.',
  },
  {
    id: 'session',
    name: 'Session Guarantees',
    tier: 5,
    color: 'var(--violet)',
    short: 'Local promises: read-your-writes, monotonic reads, etc.',
    desc: 'A bundle of four small guarantees: read-your-writes, monotonic reads, monotonic writes, writes-follow-reads. Locally enforceable, no global coordination required.',
    rules:
      'The most jarring user-visible anomalies: seeing your own write disappear, time moving backwards.',
    permits: 'Cross-user anomalies, anything outside the session.',
    systems: ['MongoDB (default session)', 'most AP systems with sticky routing'],
    cost: 'Session tokens, sticky load balancing.',
  },
  {
    id: 'eventual',
    name: 'Eventual Consistency',
    tier: 6,
    color: 'var(--amber)',
    short: 'If writes stop, replicas eventually converge.',
    desc: 'The minimum non-trivial guarantee: if no new writes are issued, all replicas will eventually agree on the same value. Says nothing about what you observe in the meantime, including how long "eventually" is.',
    rules: 'Permanent divergence.',
    permits:
      'Almost everything else. Read your own write back as the old value. See time move backward. See A then B then A again.',
    systems: ['DynamoDB (default)', 'Cassandra defaults', 'S3 (legacy)'],
    cost: 'Background anti-entropy; gossip.',
  },
];

export const MYTHS = [
  {
    myth: '"Pick two of three."',
    short: 'The triangle metaphor.',
    truth:
      "You don't pick P; the network does. The real choice is binary: during a partition, A or C. The CA corner of the triangle describes only single-machine systems, which is not what CAP is talking about.",
  },
  {
    myth: '"Eventually consistent means no consistency."',
    short: 'AP systems offer nothing.',
    truth:
      'AP systems can layer strong session guarantees (read-your-writes, monotonic reads, causal consistency) on top of eventual convergence. These are local promises that cover most user-visible anomalies. "Eventual" is the floor, not the ceiling.',
  },
  {
    myth: '"Spanner beat the CAP theorem."',
    short: 'TrueTime is magic.',
    truth:
      'Spanner is CP. It chooses to refuse writes when its TrueTime bounds widen or its Paxos groups lose quorum. Its trick is to make those windows so short and rare that users perceive availability. But it has not escaped the theorem, only hidden the cost.',
  },
  {
    myth: '"Linearizable means serializable."',
    short: 'They are the same thing.',
    truth:
      'Different axes. Linearizability is about single-object real-time order. Serializability is about multi-object transactional equivalence to some serial schedule. You can have either, both (strict serializability), or neither. Confusing them obscures what most "strongly consistent" systems actually offer.',
  },
  {
    myth: '"C in ACID is the same C as in CAP."',
    short: 'One letter, one meaning.',
    truth:
      "Two completely different things. ACID's C is application-defined invariants preserved across a transaction. CAP's C is linearizability across replicas. ACID's C is a property of the transaction; CAP's C is a property of the system. The shared letter is an unfortunate coincidence.",
  },
  {
    myth: '"Stronger consistency is always better."',
    short: 'Pick the strongest level you can.',
    truth:
      'Every step up the consistency lattice costs round-trips, throughput, or availability. Sometimes catastrophically. Most applications don\'t need linearizability; they need read-your-writes plus causal order, which is far cheaper to provide. "Stronger" without "needed" is engineering tax.',
  },
];

export const WIDER_FIELD = [
  {
    glyph: '⊘',
    name: 'FLP Impossibility',
    year: '1985',
    by: 'Fischer · Lynch · Paterson',
    body: 'A cousin of CAP, often confused with it. "Consensus" here means getting a group of nodes to agree on a single value: which leader is in charge, which transaction wins, which order events happened in. FLP proves that in a purely asynchronous network (where messages can be arbitrarily delayed) and where even one process can crash, no deterministic algorithm can guarantee consensus will ever finish. CAP is about replicated data; FLP is about agreement itself. Both say "you cannot have everything," in different ways. Real systems escape FLP using randomness, partial synchrony assumptions, or failure detectors, which is exactly how Raft and Paxos work in practice.',
  },
  {
    glyph: '↯',
    name: "Kleppmann's Critique",
    year: '2015',
    by: 'A Critique of the CAP Theorem',
    body: 'CAP\'s definitions are useful, but they\'re not the only useful ones. Kleppmann argues that the theorem\'s "availability" is operationally too strict (most systems are never CAP-available in the strict sense, even during normal operation) and its "consistency" too narrow (linearizability is one model among many). The deeper truth: every system makes tradeoffs along multiple axes; CAP describes one cross-section, well, but not the whole space.',
  },
  {
    glyph: '⌬',
    name: 'Harvest and Yield',
    year: '1999',
    by: 'Fox · Brewer',
    body: "A pre-CAP framing from the same authors. Harvest is the fraction of data reflected in a response; yield is the fraction of requests that get a response at all. Under partition, you trade these against each other. A search engine might reduce harvest (return results from only the partitions it can reach) to preserve yield (still answer every query). A subtler decomposition than CAP's binary letters.",
  },
  {
    glyph: '◇',
    name: 'CALM Theorem',
    year: '2010',
    by: 'Hellerstein · Ameloot',
    body: 'Consistency As Logical Monotonicity. A computation can run without coordination if and only if it is "monotonic," meaning adding more input only ever produces more output, never retracts something already said. Counting (a counter only goes up), set-union (a set only grows), and minimum-finding (the min only gets smaller) are monotonic. Bank-balance updates are not (you can both add and subtract). CALM is the formal basis for "design your data to be CRDT-shaped." It tells you precisely which problems consensus is avoidable for, and which truly require it.',
  },
  {
    glyph: '◴',
    name: 'Probabilistically Bounded Staleness',
    year: '2012',
    by: 'Bailis et al.',
    body: 'CAP is worst-case. PBS is what you actually observe. For tunable systems (R/W/N), Bailis et al. showed that even at R=W=1 ("eventual"), readers see the latest write within milliseconds at >99% probability in typical deployments. The theoretical anomaly is real; the operational anomaly is rare. Worth measuring for your workload before paying for stricter levels.',
  },
  {
    glyph: '⌇',
    name: 'Gray Failures',
    year: '2017',
    by: 'Huang et al.',
    body: 'CAP\'s partition is a clean cut: messages either flow or they don\'t. Real failures are messier. A node responds to pings but drops writes, a link works for small packets and times out on large ones, a process pauses for a GC long enough to look dead. Gray failures hurt CP systems disproportionately, because they cannot distinguish "I am isolated" from "my peer is slow." The cleanest theorems describe the messiest reality only approximately.',
  },
  {
    glyph: '◌',
    name: 'Jepsen',
    year: '2013 →',
    by: 'Kyle Kingsbury',
    body: 'Distributed-systems claims are empirically falsifiable. Jepsen is a testing framework that partitions, clock-skews, and chaos-monkeys real production databases, then checks whether they actually deliver the consistency they advertise. Findings have been humbling: nearly every system tested has had bugs that violated its stated guarantees under stress. Theory tells you what is possible; Jepsen tells you what is implemented.',
  },
];
