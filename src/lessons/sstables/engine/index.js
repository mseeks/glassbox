/**
 * Sorted String Table engine — pure logic, no React, no DOM, no JSX.
 *
 * Extracted from SSTables.jsx so the format itself can be unit-tested and reused
 * independently of the lesson's render code. Everything here is deterministic
 * given its inputs; every plate in the lesson is driven by a real run of these
 * functions, checked in Node — nothing on screen is hand-typed fiction.
 *
 *   TOMBSTONE / isTomb   — the delete-marker sentinel and its predicate.
 *   blen / recBytes      — UTF-8 byte length and an on-disk record's size.
 *   build                — the SSTable builder: data blocks + a sparse index + a footer.
 *   getBlockedTrace      — blocked lookup (index binary-search → 1 block fetch → scan).
 *   getFlatTrace         — flat lookup (binary search over every record; each probe seeks).
 *   flatSeeksFor         — ⌈log2(n+1)⌉, the seeks a flat binary search costs.
 *   Bloom / bloomFor     — a real (FNV-seeded, double-hashed) bloom filter.
 *   kwayMerge            — compaction's k-way merge: recency wins, tombstones collapse.
 *   commonPrefix / prefixEncode — restart-pointed shared-prefix key compression.
 *   The sample datasets and the constants the lesson derives from them.
 */

// A delete marker. A real store can't erase a key from an immutable file, so a
// later run carries a tombstone that shadows any older value beneath it.
export const TOMBSTONE = '\u0000__tombstone__';
export const isTomb = (v) => v === TOMBSTONE;

// UTF-8 byte length (so multi-byte keys cost what they really cost on disk).
const _enc = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
export const blen = (s) => (_enc ? _enc.encode(s).length : s.length);

// One record's on-disk size: two length prefixes + the key + the value (a
// tombstone stores no value payload).
export const recBytes = (k, v) => 2 + blen(k) + (isTomb(v) ? 0 : blen(v));

// Build a sorted string table from already-sorted [key, value] pairs. Records
// are packed front-to-back into blocks of about `targetBlockBytes`; the sparse
// index keeps only the first key + offset of each block, and the footer records
// where that index begins (written last, since offsets exist only once the data
// is done).
export function build(sorted, targetBlockBytes = 46) {
  const blocks = [];
  let cur = [],
    curBytes = 0,
    offset = 0;
  const seal = () => {
    if (!cur.length) return;
    blocks.push({ firstKey: cur[0][0], records: cur, bytes: curBytes, offset });
    offset += curBytes;
    cur = [];
    curBytes = 0;
  };
  for (const [k, v] of sorted) {
    cur.push([k, v]);
    curBytes += recBytes(k, v);
    if (curBytes >= targetBlockBytes) seal();
  }
  seal();
  const index = blocks.map((b, i) => ({ firstKey: b.firstKey, blockIndex: i, offset: b.offset }));
  const indexLen = index.reduce((a, e) => a + 2 + blen(e.firstKey) + 8, 0);
  return {
    blocks,
    index,
    footer: { indexOffset: offset, indexLen },
    records: sorted,
    dataBytes: offset,
  };
}

// Blocked lookup with a step trace. The sparse index is binary-searched in
// memory (0 seeks) for the last block whose first key is ≤ the target; that one
// block is fetched (1 seek) and scanned in memory until the key is found, passed,
// or the block ends.
export function getBlockedTrace(sst, key) {
  const ix = sst.index;
  const steps = [];
  let lo = 0,
    hi = ix.length - 1,
    b = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    steps.push({ phase: 'index', at: mid, lo, hi });
    if (ix[mid].firstKey <= key) {
      b = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  if (b < 0)
    return {
      found: false,
      deleted: false,
      value: undefined,
      seeks: 0,
      blockIndex: -1,
      steps,
      scan: 0,
    };
  steps.push({ phase: 'fetch', block: b });
  const block = sst.blocks[b];
  let scan = 0,
    value,
    found = false;
  for (let r = 0; r < block.records.length; r++) {
    const [k, v] = block.records[r];
    scan++;
    steps.push({ phase: 'scan', block: b, at: r });
    if (k === key) {
      value = v;
      found = true;
      break;
    }
    if (k > key) break;
  }
  const deleted = isTomb(value);
  return {
    found: found && !deleted,
    deleted,
    value: deleted ? undefined : value,
    seeks: 1,
    blockIndex: b,
    steps,
    scan,
  };
}

// Flat lookup: a binary search over every record. There is no index, so each
// probe lands on an arbitrary record — and on real hardware each probe is a
// separate disk seek.
export function getFlatTrace(sst, key) {
  const r = sst.records;
  const steps = [];
  let lo = 0,
    hi = r.length - 1,
    value,
    found = false;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    steps.push({ phase: 'probe', at: mid, lo, hi });
    if (r[mid][0] === key) {
      value = r[mid][1];
      found = true;
      break;
    }
    if (r[mid][0] < key) lo = mid + 1;
    else hi = mid - 1;
  }
  const deleted = isTomb(value);
  return {
    found: found && !deleted,
    deleted,
    value: deleted ? undefined : value,
    seeks: steps.length,
    steps,
  };
}

// The seeks a flat binary search costs over n keys: ⌈log2(n+1)⌉.
export const flatSeeksFor = (n) => Math.ceil(Math.log2(n + 1));

// A small in-memory bloom filter. Two FNV-seeded 32-bit hashes are combined
// (double hashing) into k bit positions; `add` sets them, `probe` reports
// whether all are set (a "maybe") and which positions it touched.
export class Bloom {
  constructor(m, k) {
    this.m = m;
    this.k = k;
    this.bits = new Uint8Array(m);
  }
  _h(key) {
    let h1 = 2166136261 >>> 0,
      h2 = (0x811c9dc5 ^ 0x9e3779b9) >>> 0;
    for (let i = 0; i < key.length; i++) {
      const c = key.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
      h2 = Math.imul(h2 ^ c, 2246822519) >>> 0;
    }
    const o = [];
    for (let i = 0; i < this.k; i++) o.push(((h1 + Math.imul(i, h2)) >>> 0) % this.m);
    return o;
  }
  add(key) {
    for (const i of this._h(key)) this.bits[i] = 1;
  }
  probe(key) {
    const idx = this._h(key);
    return { hit: idx.every((i) => this.bits[i] === 1), idx };
  }
}

// Build a bloom filter of `m` bits with `k` hashes over the given keys.
export function bloomFor(keys, m, k = 3) {
  const bf = new Bloom(m, k);
  for (const key of keys) bf.add(key);
  return bf;
}

// Compaction's k-way merge with a step trace. A cursor rides each sorted run;
// the smallest head key is emitted and every run sharing it advances. The
// newest run (lowest index) wins on a tie and the rest are discarded; a
// tombstone is carried forward, but dropped (`bottomLevel`) once the merge
// reaches the level beneath which no older copy can hide.
export function kwayMerge(tables, { bottomLevel = false } = {}) {
  const cur = tables.map(() => 0);
  const out = [];
  const trace = [];
  const heads = () => tables.map((t, i) => (cur[i] < t.length ? t[cur[i]][0] : null));
  while (true) {
    const h = heads();
    let min = null;
    for (const k of h) if (k !== null && (min === null || k < min)) min = k;
    if (min === null) break;
    const at = [];
    for (let i = 0; i < tables.length; i++) if (h[i] === min) at.push(i);
    const winner = at[0];
    const value = tables[winner][cur[winner]][1];
    const discarded = at.slice(1);
    const positions = tables.map((t, i) => cur[i]);
    for (const i of at) cur[i]++;
    const tomb = isTomb(value);
    const dropped = tomb && bottomLevel;
    if (!dropped) out.push([min, value]);
    trace.push({ key: min, winner, value, discarded, tomb, dropped, emitted: !dropped, positions });
  }
  return { out, trace };
}

// Length of the longest common prefix of two strings.
export function commonPrefix(a, b) {
  let i = 0;
  const n = Math.min(a.length, b.length);
  while (i < n && a[i] === b[i]) i++;
  return i;
}

// Prefix-coding of sorted keys with restart points every R entries. A restart
// stores the whole key (so you can binary-search restarts and jump in); every
// other entry stores only how many leading bytes it shares with its predecessor
// and the new suffix. `bytesRaw`/`bytesPacked` are the before/after sizes.
export function prefixEncode(keys, R = 3) {
  const entries = [];
  let prev = '';
  let bytesRaw = 0,
    bytesPacked = 0;
  keys.forEach((k, i) => {
    bytesRaw += blen(k) + 1;
    if (i % R === 0) {
      entries.push({ restart: true, shared: 0, suffix: k });
      bytesPacked += blen(k) + 2;
    } else {
      const s = commonPrefix(prev, k);
      entries.push({ restart: false, shared: s, suffix: k.slice(s), full: k });
      bytesPacked += blen(k.slice(s)) + 2;
    }
    prev = k;
  });
  return { entries, bytesRaw, bytesPacked };
}

/* ════════════════════════════════════════════════════════════════════════
   DEMO DATA — every value below is produced by the functions above. The
   lesson renders these, so the numbers on screen are really computed.
   ════════════════════════════════════════════════════════════════════════ */

// 31 sorted city keys → build() yields 7 blocks + a 7-entry sparse index.
// Internal seed for CITY_DATA below (not exported).
const CITY_NAMES = [
  'amsterdam',
  'athens',
  'berlin',
  'bruges',
  'cairo',
  'delhi',
  'dublin',
  'florence',
  'geneva',
  'hanoi',
  'istanbul',
  'kyoto',
  'lima',
  'lisbon',
  'madrid',
  'milan',
  'mumbai',
  'nairobi',
  'naples',
  'osaka',
  'oslo',
  'paris',
  'porto',
  'prague',
  'quito',
  'rome',
  'seoul',
  'tokyo',
  'turin',
  'vienna',
  'zurich',
];
export const CITY_DATA = CITY_NAMES.map((c, i) => [c, String(100 + i)]);
export const LOOKUP_SST = build(CITY_DATA, 46); // 7 blocks, sparse index of 7
export const LOOKUP_N = CITY_DATA.length; // 31
export const FLAT_SEEKS_SMALL = flatSeeksFor(LOOKUP_N); // 5
export const FLAT_SEEKS_BIG = flatSeeksFor(1e9); // 30
// targets the reader can pick: a spread across blocks + one absent key (mecca)
export const LOOKUP_TARGETS = ['athens', 'cairo', 'kyoto', 'porto', 'tokyo', 'zurich', 'mecca'];
export const LOOKUP_ABSENT = new Set(['mecca']);

// Build animation uses a smaller, legible set (≈3 blocks).
// Internal seed for BUILD_DATA below (not exported).
const BUILD_NAMES = [
  'arc',
  'bay',
  'cove',
  'dune',
  'fjord',
  'glen',
  'heath',
  'isle',
  'key',
  'loch',
  'moor',
  'ness',
];
export const BUILD_DATA = BUILD_NAMES.map((c, i) => [c, String(i + 1)]);
export const BUILD_SST = build(BUILD_DATA, 34);

// Three runs for compaction (newest → oldest). cedar carries a tombstone.
// Internal seeds for MERGE_RUNS below (not exported).
const MERGE_T0 = [
  ['amber', 'r5'],
  ['cedar', TOMBSTONE],
  ['maple', 'r9'],
]; // newest
const MERGE_T1 = [
  ['amber', 'r2'],
  ['delta', 'r2'],
  ['maple', 'r4'],
]; // middle
const MERGE_T2 = [
  ['cedar', 'r1'],
  ['delta', 'r9'],
  ['fern', 'r8'],
  ['maple', 'r3'],
]; // oldest
export const MERGE_RUNS = [
  { tag: 'T0', age: 'newest', data: MERGE_T0 },
  { tag: 'T1', age: 'older', data: MERGE_T1 },
  { tag: 'T2', age: 'oldest', data: MERGE_T2 },
];

// Four stacked runs for the bloom-skip lab (newest L0·a → oldest L2). m=24, k=3.
export const SKIP_RUNS = [
  { tag: 'L0·a', age: 'newest', keys: ['maple', 'sage', 'thyme'] },
  { tag: 'L0·b', age: '', keys: ['basil', 'clove', 'dill'] },
  { tag: 'L1', age: '', keys: ['anise', 'cumin', 'fennel', 'ginger'] },
  { tag: 'L2', age: 'oldest', keys: ['mint', 'nutmeg', 'oregano', 'pepper', 'saffron'] },
];
export const SKIP_M = 24,
  SKIP_K = 3;
// ginger = real hit · quartz = clean all-skip · zephyr = honest false positive
export const SKIP_TARGETS = ['ginger', 'maple', 'saffron', 'quartz', 'zephyr'];

// One bloom filter per skip run, built once over its keys.
export const BLOOMS = Object.fromEntries(
  SKIP_RUNS.map((r) => [r.tag, bloomFor(r.keys, SKIP_M, SKIP_K)]),
);

// Query the stacked runs newest-first: a filter "no" skips for free; a "maybe"
// costs a seek. Stop at the first real hit; a maybe that misses is a false
// positive — one wasted seek, the honest price of a probabilistic filter.
export function skipTrace(key) {
  const seq = [];
  for (const run of SKIP_RUNS) {
    const bf = BLOOMS[run.tag];
    const { hit, idx } = bf.probe(key);
    const present = run.keys.includes(key);
    if (!hit) {
      seq.push({ tag: run.tag, verdict: 'skip', seeks: 0, idx });
      continue;
    }
    seq.push({ tag: run.tag, verdict: present ? 'hit' : 'falsepos', seeks: 1, idx });
    if (present) break;
  }
  return { seq, totalSeeks: seq.reduce((a, s) => a + s.seeks, 0) };
}

// Prefix-compression demo (six user keys, restart every 3).
export const PREFIX_KEYS = [
  'user:10023:profile',
  'user:10023:settings',
  'user:10024:profile',
  'user:10024:settings',
  'user:10031:profile',
  'user:10031:settings',
];
export const PREFIX_R = 3;
