import { describe, expect, it } from 'vitest';
import {
  TOMBSTONE,
  isTomb,
  blen,
  recBytes,
  build,
  getBlockedTrace,
  getFlatTrace,
  flatSeeksFor,
  Bloom,
  bloomFor,
  kwayMerge,
  commonPrefix,
  prefixEncode,
  skipTrace,
  CITY_DATA,
  LOOKUP_SST,
  LOOKUP_N,
  FLAT_SEEKS_SMALL,
  FLAT_SEEKS_BIG,
  LOOKUP_TARGETS,
  LOOKUP_ABSENT,
  BUILD_SST,
  BUILD_DATA,
  MERGE_RUNS,
  SKIP_RUNS,
  SKIP_M,
  SKIP_K,
  SKIP_TARGETS,
  BLOOMS,
  PREFIX_KEYS,
  PREFIX_R,
} from '../src/lessons/sstables/engine/index.js';

describe('sstables-engine · tombstone sentinel', () => {
  it('is a value, distinct from any real value', () => {
    expect(typeof TOMBSTONE).toBe('string');
    expect(TOMBSTONE.charCodeAt(0)).toBe(0); // NUL-prefixed, so it never collides with a key
    expect(isTomb(TOMBSTONE)).toBe(true);
    expect(isTomb('r9')).toBe(false);
    expect(isTomb(undefined)).toBe(false);
    expect(isTomb('')).toBe(false);
  });
});

describe('sstables-engine · byte accounting', () => {
  it('blen counts UTF-8 bytes, not code units', () => {
    expect(blen('abc')).toBe(3);
    expect(blen('')).toBe(0);
    expect(blen('café')).toBe(5); // é is two bytes in UTF-8
  });

  it('recBytes is two length prefixes + key + value', () => {
    // 'athens' (6) + '100' (3) + 2 framing bytes = 11
    expect(recBytes('athens', '100')).toBe(11);
    expect(recBytes('', '')).toBe(2);
  });

  it('recBytes charges no value payload for a tombstone', () => {
    // 'cedar' (5) + 2 framing bytes, tombstone value contributes 0
    expect(recBytes('cedar', TOMBSTONE)).toBe(7);
  });
});

describe('sstables-engine · build', () => {
  it('packs the 31 city keys into 7 blocks and a 7-entry sparse index', () => {
    const sst = build(CITY_DATA, 46);
    expect(sst.blocks).toHaveLength(7);
    expect(sst.index).toHaveLength(7);
    expect(sst.records).toBe(CITY_DATA);
    // the sparse index keeps only each block's first key
    expect(sst.index.map((e) => e.firstKey)).toEqual([
      'amsterdam',
      'cairo',
      'hanoi',
      'madrid',
      'osaka',
      'quito',
      'vienna',
    ]);
    // block sizes: the first seals as soon as it crosses the byte target
    expect(sst.blocks.map((b) => b.records.length)).toEqual([4, 5, 5, 5, 5, 5, 2]);
  });

  it('each index entry mirrors its block (firstKey, blockIndex, offset)', () => {
    const sst = build(CITY_DATA, 46);
    sst.index.forEach((e, i) => {
      expect(e.blockIndex).toBe(i);
      expect(e.firstKey).toBe(sst.blocks[i].firstKey);
      expect(e.offset).toBe(sst.blocks[i].offset);
    });
  });

  it('writes the footer last: indexOffset equals the total data bytes', () => {
    const sst = build(CITY_DATA, 46);
    expect(sst.footer.indexOffset).toBe(sst.dataBytes);
    // block offsets are contiguous and run from 0 to dataBytes
    let running = 0;
    for (const b of sst.blocks) {
      expect(b.offset).toBe(running);
      running += b.bytes;
    }
    expect(running).toBe(sst.dataBytes);
    expect(sst.footer.indexLen).toBeGreaterThan(0);
  });

  it('handles an empty input with no blocks and a zero-offset footer', () => {
    const sst = build([], 46);
    expect(sst.blocks).toEqual([]);
    expect(sst.index).toEqual([]);
    expect(sst.footer.indexOffset).toBe(0);
    expect(sst.footer.indexLen).toBe(0);
    expect(sst.dataBytes).toBe(0);
  });

  it('seals one block when the data never reaches the byte target', () => {
    const sst = build([['a', '1']], 9999);
    expect(sst.blocks).toHaveLength(1);
    expect(sst.blocks[0].records).toEqual([['a', '1']]);
  });
});

describe('sstables-engine · blocked lookup', () => {
  it('finds a present key with exactly one seek and reports its block', () => {
    const t = getBlockedTrace(LOOKUP_SST, 'kyoto');
    expect(t.found).toBe(true);
    expect(t.deleted).toBe(false);
    expect(t.value).toBe('111'); // kyoto is the 12th key → 100 + 11
    expect(t.seeks).toBe(1);
    expect(t.blockIndex).toBe(2); // block whose firstKey is 'hanoi'
    // the trace ends with a fetch then a run of in-memory scans
    expect(t.steps.some((s) => s.phase === 'fetch')).toBe(true);
    expect(t.steps.filter((s) => s.phase === 'scan')).toHaveLength(t.scan);
  });

  it('binary-searches the sparse index in memory before the single seek', () => {
    const t = getBlockedTrace(LOOKUP_SST, 'athens');
    expect(t.found).toBe(true);
    expect(t.value).toBe('101');
    expect(t.blockIndex).toBe(0);
    // every index probe is recorded with its lo/hi window
    const idxSteps = t.steps.filter((s) => s.phase === 'index');
    expect(idxSteps.length).toBeGreaterThan(0);
    for (const s of idxSteps) expect(s.lo).toBeLessThanOrEqual(s.hi);
  });

  it('an absent key still costs one seek (the block fetch)', () => {
    const t = getBlockedTrace(LOOKUP_SST, 'mecca');
    expect(t.found).toBe(false);
    expect(t.seeks).toBe(1);
    // 'mecca' would sort into a block but isn't there; the scan stops at the
    // first key past it
    expect(t.blockIndex).toBeGreaterThanOrEqual(0);
  });

  it('reports zero seeks when the key sorts before the first block', () => {
    const t = getBlockedTrace(LOOKUP_SST, 'aaa');
    expect(t.found).toBe(false);
    expect(t.blockIndex).toBe(-1);
    expect(t.seeks).toBe(0);
    expect(t.scan).toBe(0);
  });

  it('treats a tombstoned key as not-found, surfacing deleted', () => {
    const sst = build(
      [
        ['a', '1'],
        ['b', TOMBSTONE],
        ['c', '3'],
      ],
      9999,
    );
    const t = getBlockedTrace(sst, 'b');
    expect(t.found).toBe(false);
    expect(t.deleted).toBe(true);
    expect(t.value).toBeUndefined();
    expect(t.seeks).toBe(1);
  });
});

describe('sstables-engine · flat lookup', () => {
  it('finds a present key but pays a seek per probe', () => {
    const t = getFlatTrace(LOOKUP_SST, 'athens');
    expect(t.found).toBe(true);
    expect(t.value).toBe('101');
    // each binary-search probe is a separate seek
    expect(t.seeks).toBe(t.steps.length);
    expect(t.steps.every((s) => s.phase === 'probe')).toBe(true);
  });

  it('records the seeks it wasted on an absent key', () => {
    const t = getFlatTrace(LOOKUP_SST, 'mecca');
    expect(t.found).toBe(false);
    expect(t.deleted).toBe(false);
    expect(t.seeks).toBeGreaterThan(0);
  });

  it('treats a tombstoned key as deleted, not found', () => {
    const sst = build(
      [
        ['a', '1'],
        ['b', TOMBSTONE],
      ],
      9999,
    );
    const t = getFlatTrace(sst, 'b');
    expect(t.found).toBe(false);
    expect(t.deleted).toBe(true);
    expect(t.value).toBeUndefined();
  });
});

describe('sstables-engine · flatSeeksFor', () => {
  it('is the ceiling of log2(n+1)', () => {
    expect(flatSeeksFor(0)).toBe(0);
    expect(flatSeeksFor(1)).toBe(1);
    expect(flatSeeksFor(7)).toBe(3);
    expect(flatSeeksFor(31)).toBe(5); // the small file
    expect(flatSeeksFor(1e9)).toBe(30); // a billion keys ≈ 30 seeks
  });
});

describe('sstables-engine · Bloom filter', () => {
  it('never reports a false negative for an added key', () => {
    const bf = new Bloom(64, 4);
    const keys = ['ginger', 'maple', 'saffron', 'thyme'];
    keys.forEach((k) => bf.add(k));
    for (const k of keys) expect(bf.probe(k).hit).toBe(true);
  });

  it('probe reports exactly k bit positions, all in range', () => {
    const bf = new Bloom(24, 3);
    bf.add('ginger');
    const { idx } = bf.probe('ginger');
    expect(idx).toHaveLength(3);
    for (const i of idx) {
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(24);
    }
  });

  it('is deterministic — same key hashes to the same positions', () => {
    const bf = new Bloom(24, 3);
    bf.add('ginger');
    expect(bf.probe('ginger').idx).toEqual([5, 17, 13]);
  });

  it('reports a miss for a key whose bits are not all set', () => {
    const bf = new Bloom(64, 4);
    bf.add('ginger');
    // an unrelated key is overwhelmingly unlikely to collide at m=64,k=4
    expect(bf.probe('zzzzzz').hit).toBe(false);
  });

  it('bloomFor builds a filter over a key set with default k=3', () => {
    const bf = bloomFor(['a', 'b', 'c'], 32);
    expect(bf.m).toBe(32);
    expect(bf.k).toBe(3);
    for (const k of ['a', 'b', 'c']) expect(bf.probe(k).hit).toBe(true);
  });
});

describe('sstables-engine · k-way merge (compaction)', () => {
  const tables = MERGE_RUNS.map((r) => r.data);

  it('emits a single sorted run, newest copy winning each duplicate', () => {
    const { out, trace } = kwayMerge(tables, { bottomLevel: false });
    expect(out.map(([k]) => k)).toEqual(['amber', 'cedar', 'delta', 'fern', 'maple']);
    // amber & maple both win from T0 (newest); delta from T1; fern from T2
    const byKey = Object.fromEntries(out);
    expect(byKey.amber).toBe('r5'); // T0's r5 beats T1's r2
    expect(byKey.maple).toBe('r9'); // T0's r9 beats T1/T2
    expect(byKey.delta).toBe('r2'); // only T1 & T2 have it → T1 (newer) wins
    expect(byKey.fern).toBe('r8'); // only T2 has it
    expect(trace).toHaveLength(5);
  });

  it('carries a tombstone forward at an intermediate level', () => {
    const { out, trace } = kwayMerge(tables, { bottomLevel: false });
    const cedar = out.find(([k]) => k === 'cedar');
    expect(isTomb(cedar[1])).toBe(true); // cedar's delete marker survives
    const cedarStep = trace.find((s) => s.key === 'cedar');
    expect(cedarStep.tomb).toBe(true);
    expect(cedarStep.dropped).toBe(false);
    expect(cedarStep.emitted).toBe(true);
  });

  it('buries the tombstone at the bottom level', () => {
    const { out, trace } = kwayMerge(tables, { bottomLevel: true });
    expect(out.map(([k]) => k)).toEqual(['amber', 'delta', 'fern', 'maple']); // cedar gone
    const cedarStep = trace.find((s) => s.key === 'cedar');
    expect(cedarStep.tomb).toBe(true);
    expect(cedarStep.dropped).toBe(true);
    expect(cedarStep.emitted).toBe(false);
  });

  it('records which runs were discarded on each tie', () => {
    const { trace } = kwayMerge(tables, { bottomLevel: false });
    const byKey = Object.fromEntries(trace.map((s) => [s.key, s]));
    expect(byKey.amber.winner).toBe(0);
    expect(byKey.amber.discarded).toEqual([1]); // T1's amber dropped
    expect(byKey.maple.winner).toBe(0);
    expect(byKey.maple.discarded).toEqual([1, 2]); // both older mapless dropped
    expect(byKey.fern.discarded).toEqual([]); // fern is unique to T2
    // each step snapshots the cursor position of every run
    expect(byKey.amber.positions).toHaveLength(tables.length);
  });

  it('handles an empty run set', () => {
    const { out, trace } = kwayMerge([], { bottomLevel: false });
    expect(out).toEqual([]);
    expect(trace).toEqual([]);
  });

  it('defaults to an intermediate (non-bottom) level', () => {
    const { out } = kwayMerge(tables);
    expect(out.some(([k]) => k === 'cedar')).toBe(true);
  });
});

describe('sstables-engine · prefix compression', () => {
  it('commonPrefix returns the shared leading length', () => {
    expect(commonPrefix('user:10023:profile', 'user:10023:settings')).toBe(11);
    expect(commonPrefix('abc', 'abc')).toBe(3);
    expect(commonPrefix('abc', 'xyz')).toBe(0);
    expect(commonPrefix('', 'abc')).toBe(0);
    expect(commonPrefix('abcd', 'ab')).toBe(2); // stops at the shorter length
  });

  it('plants a full restart key every R entries and shares the rest', () => {
    const enc = prefixEncode(PREFIX_KEYS, PREFIX_R);
    expect(enc.entries).toHaveLength(PREFIX_KEYS.length);
    // restart points fall on multiples of R
    enc.entries.forEach((e, i) => {
      expect(e.restart).toBe(i % PREFIX_R === 0);
    });
    // a restart stores the whole key; a non-restart stores a shared count + suffix
    expect(enc.entries[0]).toMatchObject({ restart: true, shared: 0, suffix: PREFIX_KEYS[0] });
    expect(enc.entries[1].restart).toBe(false);
    expect(enc.entries[1].shared).toBe(11); // shares 'user:10023:'
    expect(enc.entries[1].suffix).toBe('settings');
    expect(enc.entries[1].full).toBe(PREFIX_KEYS[1]);
  });

  it('packs the six user keys roughly 28% smaller', () => {
    const enc = prefixEncode(PREFIX_KEYS, PREFIX_R);
    expect(enc.bytesRaw).toBe(117);
    expect(enc.bytesPacked).toBe(84);
    expect(Math.round((1 - enc.bytesPacked / enc.bytesRaw) * 100)).toBe(28);
  });

  it('with R=1 every entry is a restart and packing only adds framing', () => {
    const enc = prefixEncode(['ab', 'ac', 'ad'], 1);
    expect(enc.entries.every((e) => e.restart)).toBe(true);
  });
});

describe('sstables-engine · skipTrace (bloom doorman)', () => {
  it('reads only the run that actually holds the key', () => {
    const { seq, totalSeeks } = skipTrace('ginger'); // lives in L1
    expect(totalSeeks).toBe(1);
    expect(seq.map((s) => s.verdict)).toEqual(['skip', 'skip', 'hit']);
    expect(seq.at(-1).tag).toBe('L1');
  });

  it('finds a hit in the newest run without touching the rest', () => {
    const { seq, totalSeeks } = skipTrace('maple'); // top of L0·a
    expect(totalSeeks).toBe(1);
    expect(seq).toHaveLength(1);
    expect(seq[0].verdict).toBe('hit');
  });

  it('proves an absent key with zero seeks when every filter says no', () => {
    const { seq, totalSeeks } = skipTrace('quartz');
    expect(totalSeeks).toBe(0);
    expect(seq.every((s) => s.verdict === 'skip')).toBe(true);
    expect(seq).toHaveLength(SKIP_RUNS.length);
  });

  it('charges one wasted seek for an honest false positive', () => {
    const { seq, totalSeeks } = skipTrace('zephyr');
    expect(totalSeeks).toBe(1);
    expect(seq.some((s) => s.verdict === 'falsepos')).toBe(true);
    // never a real hit — zephyr is in none of the runs
    expect(seq.some((s) => s.verdict === 'hit')).toBe(false);
  });

  it('saffron lives in the oldest run, reached after three skips', () => {
    const { seq, totalSeeks } = skipTrace('saffron');
    expect(totalSeeks).toBe(1);
    expect(seq.map((s) => s.verdict)).toEqual(['skip', 'skip', 'skip', 'hit']);
    expect(seq.at(-1).tag).toBe('L2');
  });

  it('every skip-trace step carries the probed bit positions', () => {
    const { seq } = skipTrace('ginger');
    for (const s of seq) {
      expect(s.idx).toHaveLength(SKIP_K);
      for (const i of s.idx) expect(i).toBeLessThan(SKIP_M);
    }
  });
});

describe('sstables-engine · demo datasets', () => {
  it('the city file is the canonical 31-key, 7-block fixture', () => {
    expect(CITY_DATA).toHaveLength(31);
    expect(LOOKUP_N).toBe(31);
    expect(LOOKUP_SST.blocks).toHaveLength(7);
    expect(FLAT_SEEKS_SMALL).toBe(5);
    expect(FLAT_SEEKS_BIG).toBe(30);
  });

  it('lookup targets include exactly one absent key', () => {
    expect(LOOKUP_TARGETS).toContain('mecca');
    expect(LOOKUP_ABSENT.has('mecca')).toBe(true);
    expect(LOOKUP_ABSENT.has('kyoto')).toBe(false);
    // every non-absent target really resolves in the file
    for (const t of LOOKUP_TARGETS) {
      if (LOOKUP_ABSENT.has(t)) continue;
      expect(getBlockedTrace(LOOKUP_SST, t).found).toBe(true);
    }
  });

  it('the build fixture is a smaller 12-key file', () => {
    expect(BUILD_DATA).toHaveLength(12);
    expect(BUILD_SST.blocks.length).toBeGreaterThan(1);
    expect(BUILD_SST.footer.indexOffset).toBe(BUILD_SST.dataBytes);
  });

  it('the merge fixture has three runs, newest first', () => {
    expect(MERGE_RUNS).toHaveLength(3);
    expect(MERGE_RUNS[0].tag).toBe('T0');
    expect(MERGE_RUNS[0].age).toBe('newest');
    expect(MERGE_RUNS.at(-1).age).toBe('oldest');
  });

  it('exposes one prebuilt bloom filter per skip run', () => {
    expect(Object.keys(BLOOMS)).toEqual(SKIP_RUNS.map((r) => r.tag));
    for (const run of SKIP_RUNS) {
      for (const k of run.keys) expect(BLOOMS[run.tag].probe(k).hit).toBe(true);
    }
  });

  it('skip targets cover hit, clean-skip, and false-positive cases', () => {
    expect(SKIP_TARGETS).toContain('ginger'); // real hit
    expect(SKIP_TARGETS).toContain('quartz'); // clean all-skip
    expect(SKIP_TARGETS).toContain('zephyr'); // honest false positive
  });
});
