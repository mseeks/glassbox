// Pure, React-free logic for the LSM Trees lesson.
//
// Everything here is a plain function over plain data so it can be unit-tested
// without rendering. The lesson's labs (borehole, write path, read descent,
// compaction, tombstone storm) own their animation + DOM; the rules they
// illustrate live here. Mirror of the canonical pattern in bloom-math.js.

// ── §I — The one idea: newest layer wins; a tombstone shadows what's beneath ──
//
// Layers are ordered newest-first. A read drills from the surface and stops at
// the first layer it meets: a value answers, a tombstone reports "not found"
// (the older value below is shadowed, not erased), an empty core reports
// "nothing here".
export function resolveBorehole(layers) {
  const top = layers[0];
  return {
    empty: !top,
    tomb: !!(top && top.tomb),
    answer: top ? (top.tomb ? null : top.v) : null,
  };
}

// ── §II — Asymmetry: where the write head lands, sequential vs. scattered ──
//
// Append-only (LSM) writes march across the medium in order; in-place (B-tree)
// writes seek to wherever the key already lives. 53 is coprime with the cell
// count, so randPos eventually visits every cell while looking scattered.
export const seqPos = (t, ncells) => t % ncells;
export const randPos = (t, ncells) => (t * 53 + 7) % ncells;
export const cellRC = (p, cols) => ({ r: Math.floor(p / cols), c: p % cols });

// ── §III — The write path: a sorted memtable that freezes at capacity ──
//
// Every write upserts the key into the in-memory memtable (kept sorted). When
// the memtable reaches capacity it is frozen, whole, into one immutable sstable
// and a fresh memtable opens. A delete is just a write carrying a tombstone.
export function upsertMemtable(mem, key, value, tomb) {
  const idx = mem.findIndex((m) => m.k === key);
  const next =
    idx >= 0
      ? mem.map((m, i) => (i === idx ? { ...m, v: value, tomb } : m))
      : [...mem, { k: key, v: value, tomb }];
  next.sort((a, b) => a.k.localeCompare(b.k));
  return next;
}

export const memtableFull = (mem, cap) => mem.length >= cap;

// Freeze a (non-empty, sorted) memtable into an immutable sstable. `makeId`
// supplies the unique key the UI needs; the range is the first/last key.
export function freezeSSTable(keys, makeId) {
  return { id: makeId(), keys, range: [keys[0].k, keys[keys.length - 1].k] };
}

// ── §IV — The descent: the surface is always opened; depth is gated by Bloom ──
//
// The memtable (surface) is always checked. Every deeper stratum is fronted by
// a Bloom filter: "no" rules it out for free, "maybe" forces it open, and "fp"
// is a false positive — a stratum opened for nothing. The drill stops at the
// first real hit. bloomVerdict is deterministic so the lab (and tests) replay.
export function bloomVerdict(key, keys) {
  if (keys.includes(key)) return 'maybe';
  if ((key.charCodeAt(0) * 17 + (keys[0] || 'x').charCodeAt(0) * 31 + key.length * 7) % 100 < 8) {
    return 'fp';
  }
  return 'no';
}

// Resolve a full top-down read over the given levels (level 0 = surface).
// Returns the trace of strata touched plus the verdict. The labs reveal the
// trace one stratum at a time, but the resolution itself is pure.
export function readDescent(levels, key) {
  const trace = [];
  for (let j = 0; j < levels.length; j++) {
    const lv = levels[j];
    if (j === 0) {
      const hit = lv.keys.includes(key);
      trace.push({ name: lv.name, opened: true, hit });
      if (hit) return { trace, found: true, foundAt: lv.name };
    } else {
      const b = bloomVerdict(key, lv.keys);
      const opened = b !== 'no';
      const hit = opened && lv.keys.includes(key);
      trace.push({ name: lv.name, bloom: b, opened, skipped: b === 'no', hit });
      if (hit) return { trace, found: true, foundAt: lv.name };
    }
  }
  return { trace, found: false, foundAt: null };
}

// ── §V — Compaction: one write stream, two strategies, measured amplification ──
//
// Both strategies ingest the same stream (one unit-size file per tick into L0)
// and keep a running tally of bytes physically written, so write-amplification
// is measured rather than asserted. `state` is { L:[[],[],[]], ingested,
// written, flash, flashAt }; `makeFile(size) -> { id, size }` supplies unique
// ids; `now` stamps the most recent merge so the UI can flash it.
export const emptyCompaction = () => ({
  L: [[], [], []],
  ingested: 0,
  written: 0,
  flash: null,
  flashAt: 0,
});

// Size-tiered: a level holding ≥3 files collapses them into one file in the
// next level down. Hoards, then collapses — cheap writes, more files per read.
export function sizeTieredStep(state, makeFile, now = Date.now()) {
  const L = state.L.map((a) => [...a]);
  let written = state.written;
  let flash = null;
  L[0].push(makeFile(1));
  written += 1;
  for (let i = 0; i < 2; i++) {
    if (L[i].length >= 3) {
      const m = L[i].reduce((a, f) => a + f.size, 0);
      written += m;
      L[i] = [];
      L[i + 1].push(makeFile(m));
      flash = i + 1;
    }
  }
  if (L[2].length >= 3) {
    const m = L[2].reduce((a, f) => a + f.size, 0);
    written += m;
    L[2] = [makeFile(m)];
    flash = 2;
  }
  return {
    L,
    ingested: state.ingested + 1,
    written,
    flash,
    flashAt: flash != null ? now : state.flashAt,
  };
}

// Leveled: one sorted run per level. L0 tolerates ≤2 files; overflow rewrites
// L0+L1 into a single L1 run, cascading into L2 when that run grows past 6.
// Rewrites the same bytes repeatedly — few files per read, high write-amp.
export function leveledStep(state, makeFile, now = Date.now()) {
  const L = state.L.map((a) => [...a]);
  let written = state.written;
  let flash = null;
  L[0].push(makeFile(1));
  written += 1;
  if (L[0].length > 2) {
    const inL0 = L[0].reduce((a, f) => a + f.size, 0);
    const inL1 = L[1].reduce((a, f) => a + f.size, 0);
    written += inL0 + inL1;
    const total = inL0 + inL1;
    L[0] = [];
    L[1] = [makeFile(total)];
    flash = 1;
    if (total > 6) {
      const inL2 = L[2].reduce((a, f) => a + f.size, 0);
      written += total + inL2;
      L[2] = [makeFile(total + inL2)];
      L[1] = [makeFile(Math.round(total * 0.5))];
      flash = 2;
    }
  }
  return {
    L,
    ingested: state.ingested + 1,
    written,
    flash,
    flashAt: flash != null ? now : state.flashAt,
  };
}

// Read amplification = files a point lookup may have to probe. Size-tiered
// counts every file; leveled counts at most one run per level.
export const readAmpSizeTiered = (L) => L[0].length + L[1].length + L[2].length;
export const readAmpLeveled = (L) => L[0].length + (L[1].length ? 1 : 0) + (L[2].length ? 1 : 0);
export const writeAmp = (written, ingested) => (ingested ? written / ingested : 0);

// ── §VII — The tombstone storm: deletes that outlive compaction tax every read ──
//
// A tombstone can't retire until it has outlived every older copy of its key,
// so a delete-heavy workload makes reads wade through the dead. As the
// delete-to-write ratio climbs, scan cost grows linearly and latency super-
// linearly.
export const tombFraction = (rate) => Math.min(rate * 1.4, 0.95);
export const tombScanCost = (frac) => Math.round(1 + frac * 180);
export const tombReadLatency = (frac) => 1 + Math.pow(frac * 11, 1.6);
