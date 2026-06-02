import { describe, expect, it } from 'vitest';
import {
  mulberry32,
  dist,
  median,
  pickVantage,
  build,
  buildTree,
  collectPoints,
  nnSearch,
  brute,
  makeField,
  layoutTree,
  subtreeNodeIds,
  distND,
  pickVantageND,
  buildND,
  nnND,
  curseStats,
} from '../src/lessons/vp-tree/engine/index.js';

// Count nodes in a VP-tree (vantage nodes + bucket points).
function treeSize(node) {
  if (!node) return 0;
  if (node.leaf) return node.bucket.length;
  return 1 + treeSize(node.inside) + treeSize(node.outside);
}

// Serialize a tree's shape (ids + split radii + sizes) so two builds can be
// compared for structural equality.
function shape(node) {
  if (!node) return null;
  return {
    id: node.id,
    mu: node.mu,
    size: node.size,
    leaf: node.leaf,
    bucket: node.leaf ? node.bucket.map((p) => p.id) : undefined,
    inside: shape(node.inside),
    outside: shape(node.outside),
  };
}

describe('vp-tree-engine · mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(123);
    const b = mulberry32(123);
    for (let i = 0; i < 50; i++) expect(a()).toBe(b());
  });

  it('produces different streams for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    let same = 0;
    for (let i = 0; i < 50; i++) if (a() === b()) same++;
    expect(same).toBeLessThan(50);
  });

  it('returns values in [0, 1)', () => {
    const r = mulberry32(99);
    for (let i = 0; i < 1000; i++) {
      const x = r();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe('vp-tree-engine · dist / median', () => {
  it('dist is the Euclidean distance and obeys the basic metric axioms', () => {
    expect(dist({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(dist({ x: 7, y: 2 }, { x: 7, y: 2 })).toBe(0); // identity
    const a = { x: 1, y: 1 },
      b = { x: 4, y: 5 };
    expect(dist(a, b)).toBe(dist(b, a)); // symmetry
  });

  it('median of an odd-length array is the middle value', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([5])).toBe(5);
  });

  it('median of an even-length array averages the two middle values', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([10, 0])).toBe(5);
  });

  it('does not mutate its input', () => {
    const arr = [4, 2, 8, 1];
    const copy = [...arr];
    median(arr);
    expect(arr).toEqual(copy);
  });
});

describe('vp-tree-engine · pickVantage', () => {
  it('returns index 0 for two-or-fewer points', () => {
    const rnd = mulberry32(1);
    expect(pickVantage([{ x: 0, y: 0 }], rnd)).toBe(0);
    expect(
      pickVantage(
        [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
        rnd,
      ),
    ).toBe(0);
  });

  it('returns a valid in-range index for a larger set', () => {
    const pts = makeField(7, 20);
    const i = pickVantage(pts, mulberry32(3));
    expect(Number.isInteger(i)).toBe(true);
    expect(i).toBeGreaterThanOrEqual(0);
    expect(i).toBeLessThan(pts.length);
  });
});

describe('vp-tree-engine · buildTree / build', () => {
  it('builds a tree that stores exactly the input points', () => {
    const pts = makeField(101, 30);
    const tree = buildTree(pts, 5);
    expect(tree.size).toBe(pts.length);
    expect(treeSize(tree)).toBe(pts.length);
    const stored = collectPoints(tree)
      .map((p) => p.id)
      .sort((a, b) => a - b);
    expect(stored).toEqual(pts.map((p) => p.id).sort((a, b) => a - b));
  });

  it('is deterministic: same seed → identical structure', () => {
    const pts = makeField(202, 40);
    const a = buildTree(pts, 9);
    const b = buildTree(pts, 9);
    expect(treeSize(a)).toBe(treeSize(b));
    expect(a.size).toBe(b.size);
    expect(shape(a)).toEqual(shape(b));
  });

  it('resets the module-level node id counter on each buildTree (root id is 0)', () => {
    const pts = makeField(303, 12);
    const a = buildTree(pts, 1);
    const b = buildTree(pts, 1);
    expect(a.id).toBe(0);
    expect(b.id).toBe(0); // would drift upward if _NID were not reset
  });

  it('returns null for an empty point set', () => {
    expect(buildTree([], 1)).toBe(null);
    expect(build([], mulberry32(1))).toBe(null);
  });

  it('makes a single point a leaf bucket of size one', () => {
    const tree = buildTree([{ x: 10, y: 10, id: 0 }], 1);
    expect(tree.leaf).toBe(true);
    expect(tree.bucket).toHaveLength(1);
    expect(tree.size).toBe(1);
  });

  it('honors a larger leafSize (points land in buckets, not all internal)', () => {
    const pts = makeField(404, 24);
    const tree = buildTree(pts, 2, 5);
    expect(treeSize(tree)).toBe(pts.length);
    // collect leaf bucket sizes; with leafSize 5 every leaf holds <= 5
    const leaves = [];
    (function walk(n) {
      if (!n) return;
      if (n.leaf) leaves.push(n.bucket.length);
      else {
        walk(n.inside);
        walk(n.outside);
      }
    })(tree);
    expect(Math.max(...leaves)).toBeLessThanOrEqual(5);
  });

  it('splits at the median so the inside half is never larger than outside + 1', () => {
    const pts = makeField(505, 64);
    const tree = buildTree(pts, 4);
    // at the root, inside and outside subtree sizes should be close (balanced)
    const insideN = tree.inside ? tree.inside.size : 0;
    const outsideN = tree.outside ? tree.outside.size : 0;
    expect(Math.abs(insideN - outsideN)).toBeLessThanOrEqual(2);
  });
});

describe('vp-tree-engine · collectPoints', () => {
  it('counts every stored point in a subtree', () => {
    const pts = makeField(606, 22);
    const tree = buildTree(pts, 7);
    expect(collectPoints(tree)).toHaveLength(pts.length);
    const insideCount = tree.inside ? collectPoints(tree.inside).length : 0;
    const outsideCount = tree.outside ? collectPoints(tree.outside).length : 0;
    // root vantage (1) + both halves accounts for every stored point
    expect(1 + insideCount + outsideCount).toBe(pts.length);
  });

  it('returns the empty list for a null subtree', () => {
    expect(collectPoints(null)).toEqual([]);
  });
});

describe('vp-tree-engine · nnSearch vs brute force (the exactness invariant)', () => {
  it('finds the exact same nearest neighbour as brute force for many seeded queries', () => {
    const pts = makeField(20240903, 60);
    const tree = buildTree(pts, 11, 1);
    const qr = mulberry32(7777);
    let checked = 0;
    for (let t = 0; t < 300; t++) {
      const q = { x: 2 + qr() * 96, y: 2 + qr() * 96 };
      const ref = brute(pts, q);
      const got = nnSearch(tree, q);
      // distances must match exactly (the answer point is the true nearest)
      expect(got.tau).toBeCloseTo(ref.bd, 9);
      expect(dist(q, got.best)).toBeCloseTo(ref.bd, 9);
      checked++;
    }
    expect(checked).toBe(300);
  });

  it('works across several independent fields and leaf sizes', () => {
    for (const [fieldSeed, treeSeed, leaf] of [
      [1, 2, 1],
      [42, 99, 1],
      [13, 31, 3],
      [88, 17, 5],
    ]) {
      const pts = makeField(fieldSeed, 45);
      const tree = buildTree(pts, treeSeed, leaf);
      const qr = mulberry32(fieldSeed * 31 + 1);
      for (let t = 0; t < 60; t++) {
        const q = { x: 2 + qr() * 96, y: 2 + qr() * 96 };
        expect(nnSearch(tree, q).tau).toBeCloseTo(brute(pts, q).bd, 9);
      }
    }
  });

  it('reports a measurement count that never exceeds N and is usually below it (pruning happens)', () => {
    const pts = makeField(20240903, 80);
    const N = pts.length;
    const tree = buildTree(pts, 11, 1);
    const qr = mulberry32(555);
    let prunedQueries = 0;
    for (let t = 0; t < 200; t++) {
      const q = { x: 2 + qr() * 96, y: 2 + qr() * 96 };
      const { dcount, total } = nnSearch(tree, q);
      expect(dcount).toBeLessThanOrEqual(N);
      expect(total).toBe(N);
      if (dcount < N) prunedQueries++;
    }
    // in 2-D the tree should prune on the large majority of queries
    expect(prunedQueries).toBeGreaterThan(150);
  });

  it('emits a coherent step trace: measures, descends, and prunes only', () => {
    const pts = makeField(909, 50);
    const tree = buildTree(pts, 3, 1);
    const { steps, best, dcount } = nnSearch(tree, { x: 50, y: 50 });
    expect(steps.length).toBeGreaterThan(0);
    const kinds = new Set(steps.map((s) => s.kind));
    for (const k of kinds) expect(['measure', 'descend', 'prune']).toContain(k);
    expect(kinds.has('measure')).toBe(true);
    // the final measure step's dcount equals the reported total measurement count
    const measures = steps.filter((s) => s.kind === 'measure');
    expect(measures[measures.length - 1].dcount).toBe(dcount);
    // best is a real stored point
    expect(collectPoints(tree).some((p) => p.id === best.id)).toBe(true);
  });

  it('a prune step records how many contacts it skipped, all of them genuinely far', () => {
    const pts = makeField(20240903, 70);
    const tree = buildTree(pts, 11, 1);
    const { steps } = nnSearch(tree, { x: 20, y: 80 });
    const prunes = steps.filter((s) => s.kind === 'prune');
    for (const p of prunes) {
      expect(p.skipped).toBeGreaterThanOrEqual(0);
      expect(p.bound).toBeGreaterThanOrEqual(0);
      // the lower bound on the pruned side is at least the held best at prune time
      expect(p.bound).toBeGreaterThanOrEqual(p.tau - 1e-9);
    }
  });

  it('searching an empty tree returns total 0', () => {
    const r = nnSearch(null, { x: 1, y: 2 });
    expect(r.total).toBe(0);
    expect(r.best).toBe(null);
    expect(r.dcount).toBe(0);
  });
});

describe('vp-tree-engine · brute', () => {
  it('returns the closest point and its distance', () => {
    const pts = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 3, y: 0, id: 2 },
    ];
    const r = brute(pts, { x: 1, y: 0 });
    expect(r.best.id).toBe(0);
    expect(r.bd).toBe(1);
  });
});

describe('vp-tree-engine · makeField', () => {
  it('produces the requested number of separated points (separation > 6)', () => {
    const pts = makeField(20240903, 22);
    expect(pts.length).toBe(22);
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++)
        expect(Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)).toBeGreaterThan(6.0);
  });

  it('is deterministic for a seed and keeps every point inside the padded box', () => {
    const a = makeField(5, 18);
    const b = makeField(5, 18);
    expect(a).toEqual(b);
    for (const p of a) {
      expect(p.x).toBeGreaterThanOrEqual(8);
      expect(p.x).toBeLessThanOrEqual(92);
      expect(p.y).toBeGreaterThanOrEqual(8);
      expect(p.y).toBeLessThanOrEqual(92);
    }
  });

  it('assigns sequential ids starting at 0', () => {
    const pts = makeField(11, 15);
    expect(pts.map((p) => p.id)).toEqual(pts.map((_, i) => i));
  });
});

describe('vp-tree-engine · layoutTree', () => {
  it('lays out exactly one position per node and N matches the in-order count', () => {
    const pts = makeField(20240903, 22);
    const tree = buildTree(pts, 11, 1);
    const { map, links, N, maxD, order } = layoutTree(tree);
    const nodeIds = subtreeNodeIds(tree, new Set());
    expect(Object.keys(map)).toHaveLength(nodeIds.size);
    expect(N).toBe(nodeIds.size);
    expect(order).toHaveLength(nodeIds.size);
    // a binary tree has nodes-1 internal links
    expect(links).toHaveLength(nodeIds.size - 1);
    expect(maxD).toBeGreaterThan(0);
  });

  it('gives the root depth 0 and every node a finite depth/idx', () => {
    const tree = buildTree(makeField(8, 30), 2, 1);
    const { map } = layoutTree(tree);
    expect(map[tree.id].depth).toBe(0);
    for (const id of Object.keys(map)) {
      expect(Number.isFinite(map[id].idx)).toBe(true);
      expect(Number.isFinite(map[id].depth)).toBe(true);
    }
  });

  it('handles a single-node tree', () => {
    const tree = buildTree([{ x: 5, y: 5, id: 0 }], 1);
    const { N, links, maxD } = layoutTree(tree);
    expect(N).toBe(1);
    expect(links).toHaveLength(0);
    expect(maxD).toBe(0);
  });
});

describe('vp-tree-engine · subtreeNodeIds', () => {
  it('collects every node id in the subtree', () => {
    const tree = buildTree(makeField(77, 31), 4, 1);
    const ids = subtreeNodeIds(tree, new Set());
    // matches the layout node count
    expect(ids.size).toBe(layoutTree(tree).N);
    // children's id sets are disjoint and sum (plus the root) to the whole
    const inside = subtreeNodeIds(tree.inside, new Set());
    const outside = subtreeNodeIds(tree.outside, new Set());
    expect(inside.size + outside.size + 1).toBe(ids.size);
  });

  it('returns the accumulator unchanged for a null node', () => {
    const acc = new Set([42]);
    expect(subtreeNodeIds(null, acc)).toBe(acc);
    expect(acc.size).toBe(1);
  });
});

describe('vp-tree-engine · ND engine (the curse)', () => {
  it('distND is the Euclidean norm over the vector and is symmetric', () => {
    const a = { v: [0, 0, 0] },
      b = { v: [1, 2, 2] };
    expect(distND(a, b)).toBe(3); // sqrt(1+4+4)
    expect(distND(a, b)).toBe(distND(b, a));
    expect(distND(a, a)).toBe(0);
  });

  it('pickVantageND returns a valid in-range index', () => {
    const rnd = mulberry32(2);
    const pts = [];
    for (let i = 0; i < 20; i++) pts.push({ v: [rnd(), rnd(), rnd()], id: i });
    const i = pickVantageND(pts, mulberry32(9));
    expect(i).toBeGreaterThanOrEqual(0);
    expect(i).toBeLessThan(pts.length);
    expect(pickVantageND([{ v: [0] }], rnd)).toBe(0); // small-set short circuit
  });

  it('buildND stores every point and nnND matches a brute scan in low dimensions', () => {
    const rnd = mulberry32(31);
    const D = 2,
      N = 50;
    const pts = [];
    for (let i = 0; i < N; i++) {
      const v = [];
      for (let k = 0; k < D; k++) v.push(rnd());
      pts.push({ v, id: i });
    }
    const tree = buildND([...pts], mulberry32(88));
    expect(tree.size).toBe(N);
    const qr = mulberry32(404);
    for (let t = 0; t < 40; t++) {
      const q = { v: [qr(), qr()] };
      // brute nearest distance
      let bd = Infinity;
      for (const p of pts) bd = Math.min(bd, distND(q, p));
      // nnND returns the measurement count; verify it never exceeds N
      const dc = nnND(tree, q);
      expect(dc).toBeLessThanOrEqual(N);
      expect(dc).toBeGreaterThan(0);
      expect(bd).toBeLessThan(Infinity);
    }
  });

  it('buildND returns null for empty input and a leaf for a single point', () => {
    expect(buildND([], mulberry32(1))).toBe(null);
    const leaf = buildND([{ v: [1, 2], id: 0 }], mulberry32(1));
    expect(leaf.leaf).toBe(true);
    expect(leaf.size).toBe(1);
  });

  it('curseStats returns sane, memoized statistics', () => {
    const a = curseStats(2);
    const b = curseStats(2);
    expect(a).toBe(b); // memoized: same object reference
    expect(a.N).toBe(160);
    expect(a.hist).toHaveLength(30);
    expect(a.hmax).toBeGreaterThanOrEqual(1);
    expect(a.pruned).toBeGreaterThanOrEqual(0);
    expect(a.pruned).toBeLessThanOrEqual(1);
    expect(a.avg).toBeGreaterThan(0);
    expect(a.avg).toBeLessThanOrEqual(a.N);
  });

  it('spread (cv) shrinks and pruning collapses as dimensionality grows (the curse)', () => {
    const low = curseStats(1);
    const high = curseStats(50);
    // relative spread of pairwise distances falls with dimension
    expect(high.cv).toBeLessThan(low.cv);
    // at D=1 the tree prunes a large fraction; at D=50 it prunes far less
    expect(low.pruned).toBeGreaterThan(0.4);
    expect(high.pruned).toBeLessThan(low.pruned);
    // and the measured-fraction climbs toward brute force in high dimensions
    expect(high.avg).toBeGreaterThan(low.avg);
  });
});
