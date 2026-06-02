import { describe, expect, it } from 'vitest';
import {
  resolveBorehole,
  seqPos,
  randPos,
  cellRC,
  upsertMemtable,
  memtableFull,
  freezeSSTable,
  bloomVerdict,
  readDescent,
  emptyCompaction,
  sizeTieredStep,
  leveledStep,
  readAmpSizeTiered,
  readAmpLeveled,
  writeAmp,
  tombFraction,
  tombScanCost,
  tombReadLatency,
} from '../src/lessons/lsm-trees/engine/index.js';

// The lesson's read-descent fixture: level 0 is the in-memory surface.
const READ_LV = [
  { name: 'memtable', keys: ['fox', 'ivy', 'owl'], surface: true },
  { name: 'L0', keys: ['ant', 'bat', 'cod', 'elm'] },
  { name: 'L1', keys: ['ash', 'bee', 'dale', 'elk', 'fern', 'gorse'] },
  { name: 'L2', keys: ['birch', 'crag', 'dell', 'fen', 'heath', 'larch', 'moor', 'reed'] },
  {
    name: 'L3',
    keys: [
      'alder',
      'bracken',
      'clover',
      'dune',
      'ember',
      'gully',
      'hollow',
      'ledge',
      'marsh',
      'quarry',
      'ridge',
      'scree',
    ],
  },
];

// Deterministic file factory for compaction tests (the UI uses ids only as keys).
const fileMaker = () => {
  let id = 0;
  return (size) => ({ id: ++id, size });
};

describe('lsm-engine · borehole (newest wins, tombstones shadow)', () => {
  it('returns nothing for an empty core', () => {
    expect(resolveBorehole([])).toEqual({ empty: true, tomb: false, answer: null });
  });

  it('answers with the newest value, never looking deeper', () => {
    const layers = [{ v: '120' }, { v: '95' }, { v: '40' }];
    expect(resolveBorehole(layers)).toEqual({ empty: false, tomb: false, answer: '120' });
  });

  it('reports not-found when the newest layer is a tombstone', () => {
    const layers = [{ tomb: true }, { v: '95' }];
    expect(resolveBorehole(layers)).toEqual({ empty: false, tomb: true, answer: null });
  });
});

describe('lsm-engine · asymmetry positions', () => {
  const NCELLS = 120;
  const COLS = 20;

  it('walks sequentially and wraps', () => {
    expect(seqPos(0, NCELLS)).toBe(0);
    expect(seqPos(5, NCELLS)).toBe(5);
    expect(seqPos(NCELLS + 3, NCELLS)).toBe(3);
  });

  it('scatters but covers every cell (53 coprime with 120)', () => {
    const visited = new Set();
    for (let t = 0; t < NCELLS; t++) visited.add(randPos(t, NCELLS));
    expect(visited.size).toBe(NCELLS);
  });

  it('maps a flat position to row/col', () => {
    expect(cellRC(0, COLS)).toEqual({ r: 0, c: 0 });
    expect(cellRC(23, COLS)).toEqual({ r: 1, c: 3 });
  });
});

describe('lsm-engine · memtable write path', () => {
  it('inserts new keys in sorted order', () => {
    let mem = [];
    mem = upsertMemtable(mem, 'cwm', 1);
    mem = upsertMemtable(mem, 'ash', 2);
    mem = upsertMemtable(mem, 'bog', 5);
    expect(mem.map((m) => m.k)).toEqual(['ash', 'bog', 'cwm']);
  });

  it('upserts an existing key in place (no duplicate)', () => {
    let mem = upsertMemtable([], 'ash', 2);
    mem = upsertMemtable(mem, 'ash', 9);
    expect(mem).toEqual([{ k: 'ash', v: 9, tomb: undefined }]);
  });

  it('records a delete as a tombstone entry', () => {
    const mem = upsertMemtable([], 'ash', '∅', true);
    expect(mem[0]).toMatchObject({ k: 'ash', tomb: true });
  });

  it('signals a flush only at capacity', () => {
    expect(memtableFull([1, 2, 3], 6)).toBe(false);
    expect(memtableFull([1, 2, 3, 4, 5, 6], 6)).toBe(true);
  });

  it('freezes a memtable into an sstable with a key range', () => {
    const keys = [{ k: 'ash' }, { k: 'bog' }, { k: 'cwm' }];
    const sst = freezeSSTable(keys, () => 'sst-1');
    expect(sst).toEqual({ id: 'sst-1', keys, range: ['ash', 'cwm'] });
  });
});

describe('lsm-engine · bloom verdict', () => {
  it('says "maybe" when the key is present', () => {
    expect(bloomVerdict('cod', READ_LV[1].keys)).toBe('maybe');
  });

  it('says "no" when confidently absent', () => {
    expect(bloomVerdict('bracken', READ_LV[1].keys)).toBe('no');
  });

  it('can return a false positive ("fp") for an absent key', () => {
    // willow is absent from L2 yet trips its Bloom filter.
    expect(bloomVerdict('willow', READ_LV[3].keys)).toBe('fp');
  });
});

describe('lsm-engine · read descent', () => {
  it('stops at the surface when the key is in the memtable', () => {
    const r = readDescent(READ_LV, 'fox');
    expect(r).toMatchObject({ found: true, foundAt: 'memtable' });
    expect(r.trace).toHaveLength(1);
  });

  it('descends one stratum to find a key in L0', () => {
    const r = readDescent(READ_LV, 'cod');
    expect(r).toMatchObject({ found: true, foundAt: 'L0' });
    expect(r.trace.map((t) => t.name)).toEqual(['memtable', 'L0']);
  });

  it('skips Bloom-negative strata on the way to a deep hit', () => {
    const r = readDescent(READ_LV, 'bracken');
    expect(r).toMatchObject({ found: true, foundAt: 'L3' });
    const skipped = r.trace.filter((t) => t.skipped).map((t) => t.name);
    expect(skipped).toEqual(['L0', 'L1', 'L2']);
  });

  it('opens a false-positive stratum but still misses, then reports not found', () => {
    const r = readDescent(READ_LV, 'willow');
    expect(r.found).toBe(false);
    expect(r.foundAt).toBeNull();
    const fp = r.trace.find((t) => t.bloom === 'fp');
    expect(fp).toMatchObject({ name: 'L2', opened: true, hit: false });
    expect(r.trace).toHaveLength(READ_LV.length);
  });
});

describe('lsm-engine · size-tiered compaction', () => {
  it('collapses three L0 files into one L1 file (write-amp 2× at first merge)', () => {
    const make = fileMaker();
    let s = emptyCompaction();
    for (let i = 0; i < 3; i++) s = sizeTieredStep(s, make, 1000);
    expect(s.L[0]).toEqual([]);
    expect(s.L[1].map((f) => f.size)).toEqual([3]);
    expect(s).toMatchObject({ ingested: 3, written: 6, flash: 1 });
    expect(readAmpSizeTiered(s.L)).toBe(1);
    expect(writeAmp(s.written, s.ingested)).toBe(2);
  });

  it('cascades a full L1 down into L2', () => {
    const make = fileMaker();
    let s = emptyCompaction();
    for (let i = 0; i < 9; i++) s = sizeTieredStep(s, make, 1000);
    expect(s.L[0]).toEqual([]);
    expect(s.L[1]).toEqual([]);
    expect(s.L[2].map((f) => f.size)).toEqual([9]);
    expect(s).toMatchObject({ ingested: 9, written: 27, flash: 2 });
    expect(writeAmp(s.written, s.ingested)).toBe(3);
  });
});

describe('lsm-engine · leveled compaction', () => {
  it('rewrites L0+L1 into a single L1 run on overflow', () => {
    const make = fileMaker();
    let s = emptyCompaction();
    for (let i = 0; i < 3; i++) s = leveledStep(s, make, 1000);
    expect(s.L[0]).toEqual([]);
    expect(s.L[1].map((f) => f.size)).toEqual([3]);
    expect(s).toMatchObject({ ingested: 3, written: 6, flash: 1 });
    expect(readAmpLeveled(s.L)).toBe(1);
  });

  it('cascades into L2 and pays a higher write-amp than size-tiered', () => {
    const make = fileMaker();
    let s = emptyCompaction();
    for (let i = 0; i < 9; i++) s = leveledStep(s, make, 1000);
    expect(s.L[2].map((f) => f.size)).toEqual([9]);
    expect(s).toMatchObject({ ingested: 9, written: 36, flash: 2 });
    // leveled (4×) rewrites more than size-tiered (3×) over the same stream.
    expect(writeAmp(s.written, s.ingested)).toBe(4);
    expect(writeAmp(s.written, s.ingested)).toBeGreaterThan(3);
  });

  it('does not merge while L0 is within its file budget', () => {
    const make = fileMaker();
    let s = emptyCompaction();
    s = leveledStep(s, make, 1000);
    s = leveledStep(s, make, 1000);
    expect(s.L[0].map((f) => f.size)).toEqual([1, 1]);
    expect(s.flash).toBeNull();
    expect(s.written).toBe(2);
  });
});

describe('lsm-engine · tombstone storm', () => {
  it('caps the tombstone fraction at 0.95', () => {
    expect(tombFraction(0)).toBe(0);
    expect(tombFraction(0.25)).toBeCloseTo(0.35, 5);
    expect(tombFraction(0.8)).toBe(0.95);
  });

  it('grows scan cost linearly and latency super-linearly with the dead', () => {
    expect(tombScanCost(0)).toBe(1);
    expect(tombScanCost(0.5)).toBe(91);
    expect(tombReadLatency(0)).toBe(1);
    // a heavy delete ratio makes reads many times slower
    expect(tombReadLatency(0.95)).toBeGreaterThan(8);
  });
});
