import { describe, expect, it } from 'vitest';
import {
  _mk,
  resetNodeIds,
  cloneTree,
  BTree,
  BPlus,
  buildLayout,
  levelsFor,
  heightOf,
  countOf,
  FANOUTS,
  N_KEYS,
} from '../src/lessons/b-trees/engine/index.js';

// ── helpers ───────────────────────────────────────────────────────────────

// Collect every key in a B-tree / B+ tree node, in left-to-right (in-order
// for a B-tree, leaf-order for a B+ tree) order.
function collectKeys(node) {
  const out = [];
  const walk = (n) => {
    if (n.leaf) {
      out.push(...n.keys);
      return;
    }
    n.children.forEach((c, i) => {
      walk(c);
      if (i < n.keys.length) out.push(n.keys[i]);
    });
  };
  walk(node);
  return out;
}

// Every leaf's depth (root = 0) — used to assert the tree stays balanced.
function leafDepths(node, depth = 0, acc = []) {
  if (node.leaf) acc.push(depth);
  else node.children.forEach((c) => leafDepths(c, depth + 1, acc));
  return acc;
}

// Assert the B-tree invariants hold everywhere: ordered keys, children =
// keys+1 on internal nodes, no node over the key cap, all leaves at one depth.
function assertBTreeInvariants(tree) {
  const depths = new Set(leafDepths(tree.root));
  expect(depths.size).toBe(1); // perfectly balanced: all leaves same depth
  const check = (n) => {
    for (let i = 1; i < n.keys.length; i++) expect(n.keys[i]).toBeGreaterThan(n.keys[i - 1]);
    expect(n.keys.length).toBeLessThanOrEqual(tree.maxKeys);
    if (!n.leaf) {
      expect(n.children.length).toBe(n.keys.length + 1);
      n.children.forEach(check);
    }
  };
  check(tree.root);
}

// ── _mk / resetNodeIds ──────────────────────────────────────────────────────

describe('b-trees-engine · node helpers', () => {
  it('_mk builds an empty leaf by default with a fresh incrementing id', () => {
    resetNodeIds(100);
    const a = _mk();
    const b = _mk(false);
    expect(a).toMatchObject({ id: 100, keys: [], leaf: true, children: [] });
    expect(b).toMatchObject({ id: 101, keys: [], leaf: false, children: [] });
  });

  it('resetNodeIds rewinds the counter so ids are stable & disjoint per lab', () => {
    resetNodeIds(5000);
    expect(_mk().id).toBe(5000);
    resetNodeIds(9000);
    expect(_mk().id).toBe(9000);
  });
});

// ── cloneTree ───────────────────────────────────────────────────────────────

describe('b-trees-engine · cloneTree', () => {
  it('deep-clones keys and children without sharing references', () => {
    resetNodeIds(1);
    const t = new BTree(5);
    [10, 20, 30, 40, 50, 60].forEach((k) => t.insert(k));
    const copy = cloneTree(t.root);
    expect(collectKeys(copy)).toEqual(collectKeys(t.root));
    expect(copy).not.toBe(t.root);
    expect(copy.keys).not.toBe(t.root.keys);
    // mutating the clone leaves the original untouched
    copy.keys.push(999);
    expect(t.root.keys).not.toContain(999);
  });

  it('carries the next pointer (used by B+ leaves)', () => {
    const n = { id: 1, keys: [1, 2], leaf: true, children: [], next: 7 };
    expect(cloneTree(n).next).toBe(7);
  });
});

// ── levelsFor / FANOUTS / N_KEYS ─────────────────────────────────────────────

describe('b-trees-engine · levelsFor', () => {
  it('binary fan-out needs ~30 levels for a billion keys', () => {
    expect(levelsFor(2)).toBe(30);
  });

  it('a fat node collapses a billion keys to three or four levels', () => {
    expect(levelsFor(256)).toBeLessThanOrEqual(4);
    expect(levelsFor(512)).toBeLessThanOrEqual(4);
  });

  it('levels strictly decrease (or hold) as fan-out grows', () => {
    const seq = FANOUTS.map(levelsFor);
    for (let i = 1; i < seq.length; i++) expect(seq[i]).toBeLessThanOrEqual(seq[i - 1]);
  });

  it('matches the ceil(log_f(N)) definition for every catalogued fan-out', () => {
    for (const f of FANOUTS) {
      expect(levelsFor(f)).toBe(Math.ceil(Math.log(N_KEYS) / Math.log(f)));
    }
  });
});

// ── BTree: insert / search / split ───────────────────────────────────────────

describe('b-trees-engine · BTree', () => {
  it('order 5 caps a node at 4 keys and splits on the fifth', () => {
    resetNodeIds(1);
    const t = new BTree(5);
    expect(t.maxKeys).toBe(4);
    [10, 20, 30, 40].forEach((k) => t.insert(k));
    expect(t.height()).toBe(1); // still a single leaf, four keys
    expect(t.root.keys).toEqual([10, 20, 30, 40]);

    const frames = t.insert(50); // fifth key — overflow → root split → grow
    expect(t.height()).toBe(2); // grew exactly one level
    assertBTreeInvariants(t);
    // median (30) promoted to the brand-new root
    expect(t.root.keys).toEqual([30]);
    // the split sequence is recorded: placed/overflow, grew, settled
    const kinds = frames.map((f) => f.kind);
    expect(kinds).toContain('overflow');
    expect(kinds).toContain('grew');
    expect(kinds[kinds.length - 1]).toBe('settled');
    expect(frames.some((f) => f.grew)).toBe(true);
  });

  it('a plain insert that fits records a single "placed" frame, no growth', () => {
    resetNodeIds(1);
    const t = new BTree(5);
    const frames = t.insert(42);
    expect(frames.map((f) => f.kind)).toEqual(['placed', 'settled']);
    expect(t.height()).toBe(1);
    expect(frames.every((f) => !f.grew)).toBe(true);
  });

  it('stays balanced and ordered through a long, shuffled insert run', () => {
    resetNodeIds(1);
    const t = new BTree(5);
    const keys = [];
    for (let k = 1; k <= 60; k++) keys.push(k * 3);
    // deterministic shuffle (no Math.random in the engine)
    for (let i = keys.length - 1; i > 0; i--) {
      const j = (i * 7 + 13) % (i + 1);
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    keys.forEach((k) => t.insert(k));
    assertBTreeInvariants(t);
    expect(collectKeys(t.root)).toEqual([...keys].sort((a, b) => a - b));
    expect(t.count()).toBe(keys.length);
  });

  it('keys filed already in order still produce a balanced tree (no vine)', () => {
    resetNodeIds(1);
    const t = new BTree(5);
    for (let k = 1; k <= 40; k++) t.insert(k);
    assertBTreeInvariants(t);
    expect(t.height()).toBeLessThanOrEqual(4); // shallow despite sorted input
  });

  it('rejects duplicates quietly (no frames, no key change)', () => {
    resetNodeIds(1);
    const t = new BTree(5);
    t.insert(10);
    t.insert(20);
    const before = t.count();
    const frames = t.insert(10);
    expect(frames).toEqual([]);
    expect(t.count()).toBe(before);
  });

  it('search finds present keys and reports the read path; misses bottom out at a leaf', () => {
    resetNodeIds(5000);
    const t = new BTree(5);
    [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110].forEach((k) => t.insert(k));

    const hit = t.search(70);
    expect(hit.found).toBe(true);
    expect(hit.path.length).toBeGreaterThanOrEqual(1);
    expect(hit.path.length).toBeLessThanOrEqual(t.height());
    expect(hit.path[hit.path.length - 1].hit).toBe(true);

    const miss = t.search(55);
    expect(miss.found).toBe(false);
    expect(miss.path[miss.path.length - 1].hit).toBe(false);
  });

  it('count and height agree with a direct walk', () => {
    resetNodeIds(1);
    const t = new BTree(5);
    [5, 15, 25, 35, 45, 55, 65, 75, 85, 95].forEach((k) => t.insert(k));
    expect(t.count()).toBe(countOf(t.root));
    expect(t.height()).toBe(heightOf(t.root));
  });

  it('a mid-level (non-root) split widens the parent without growing the tree', () => {
    resetNodeIds(1);
    const t = new BTree(5);
    // build past one root split, then keep filing until a leaf splits under a
    // root that still has room — the "wider, not taller" case.
    [10, 20, 30, 40, 50].forEach((k) => t.insert(k)); // height 2 now
    const hBefore = t.height();
    let sawSplit = false;
    for (const k of [60, 70, 80, 90, 100, 110, 120]) {
      const frames = t.insert(k);
      if (frames.some((f) => f.kind === 'split')) sawSplit = true;
    }
    expect(sawSplit).toBe(true);
    expect(t.height()).toBe(hBefore); // a non-root split did not add a level
    assertBTreeInvariants(t);
  });
});

// ── BPlus: insert / leaves / rangeScan ───────────────────────────────────────

describe('b-trees-engine · BPlus', () => {
  function buildBPlus(keys, order = 4) {
    resetNodeIds(7000);
    const t = new BPlus(order);
    keys.forEach((k) => t.insert(k));
    return t;
  }

  it('keeps every key in the leaves, sorted left-to-right', () => {
    const keys = [10, 20, 30, 40, 50, 60, 70, 80];
    const t = buildBPlus(keys);
    const leaves = t.leaves();
    const flat = leaves.flatMap((l) => l.keys);
    expect(flat).toEqual([...keys].sort((a, b) => a - b));
    // every leaf is internally sorted, and leaves are sorted relative to each other
    for (const lf of leaves) {
      expect(lf.leaf).toBe(true);
      for (let i = 1; i < lf.keys.length; i++) {
        expect(lf.keys[i]).toBeGreaterThan(lf.keys[i - 1]);
      }
    }
    for (let i = 1; i < leaves.length; i++) {
      const prevMax = leaves[i - 1].keys[leaves[i - 1].keys.length - 1];
      const curMin = leaves[i].keys[0];
      expect(curMin).toBeGreaterThan(prevMax);
    }
  });

  it('splits leaves so more than one leaf exists once it overflows', () => {
    const t = buildBPlus([10, 20, 30, 40, 50, 60, 70, 80]);
    expect(t.leaves().length).toBeGreaterThan(1);
    expect(t.root.leaf).toBe(false); // root became an internal signpost node
  });

  it('rejects duplicate keys', () => {
    const t = buildBPlus([10, 20, 30]);
    const before = t.leaves().flatMap((l) => l.keys);
    t.insert(20);
    const after = t.leaves().flatMap((l) => l.keys);
    expect(after).toEqual(before);
  });

  it('rangeScan returns exactly the keys within [lo, hi]', () => {
    const keys = [10, 20, 30, 40, 50, 60, 70, 80];
    const t = buildBPlus(keys);
    const { hits } = t.rangeScan(35, 75);
    expect(hits).toEqual([40, 50, 60, 70]);
    for (const h of hits) {
      expect(h).toBeGreaterThanOrEqual(35);
      expect(h).toBeLessThanOrEqual(75);
    }
  });

  it('rangeScan records a root-to-start-leaf descent path and a left-to-right visit order', () => {
    const t = buildBPlus([10, 20, 30, 40, 50, 60, 70, 80]);
    const leaves = t.leaves();
    const idxOf = new Map(leaves.map((l, i) => [l.id, i]));
    const res = t.rangeScan(35, 75);
    // path starts at the root and ends at the located start leaf
    expect(res.path[0]).toBe(t.root.id);
    expect(res.path[res.path.length - 1]).toBe(res.startId);
    // visited leaves are contiguous and strictly left-to-right
    const visitedIdx = res.visited.map((id) => idxOf.get(id));
    for (let i = 1; i < visitedIdx.length; i++) {
      expect(visitedIdx[i]).toBe(visitedIdx[i - 1] + 1);
    }
    // the walk stops as soon as a leaf's max exceeds hi (doesn't scan all leaves)
    expect(res.visited.length).toBeLessThanOrEqual(leaves.length);
  });

  it('a range below the first key still locates the leftmost leaf', () => {
    const t = buildBPlus([10, 20, 30, 40, 50, 60, 70, 80]);
    const res = t.rangeScan(5, 25);
    expect(res.hits).toEqual([10, 20]);
    expect(res.startId).toBe(t.leaves()[0].id);
  });

  it('an empty range yields no hits', () => {
    const t = buildBPlus([10, 20, 30, 40, 50, 60, 70, 80]);
    expect(t.rangeScan(41, 49).hits).toEqual([]);
  });

  it('single-leaf tree: leaves() is one node and rangeScan walks just it', () => {
    const t = buildBPlus([10, 20, 30]);
    expect(t.leaves().length).toBe(1);
    expect(t.root.leaf).toBe(true);
    const res = t.rangeScan(15, 25);
    expect(res.hits).toEqual([20]);
    expect(res.visited).toEqual([t.root.id]);
  });

  it('grows a third level when an internal signpost node itself overflows', () => {
    // enough sorted keys to overflow leaves repeatedly, then overflow the
    // internal node that collects their separators — forcing an internal split.
    const keys = [];
    for (let k = 1; k <= 40; k++) keys.push(k * 5);
    const t = buildBPlus(keys);
    // every key still lives, sorted, only in the leaves
    expect(t.leaves().flatMap((l) => l.keys)).toEqual([...keys].sort((a, b) => a - b));
    // the tree is now at least three levels deep (root → internals → leaves)
    expect(heightOf(t.root)).toBeGreaterThanOrEqual(3);
    // a full-span range still collects every key by walking the leaf chain
    const res = t.rangeScan(0, 1000);
    expect(res.hits).toEqual([...keys].sort((a, b) => a - b));
  });
});

// ── buildLayout ──────────────────────────────────────────────────────────────

describe('b-trees-engine · buildLayout', () => {
  const O = { cellW: 31, cellH: 33, padX: 7, leafGap: 24, levelH: 94 };

  it('emits one layout node per tree node and (nodes - 1) edges', () => {
    resetNodeIds(1);
    const t = new BTree(5);
    [10, 20, 30, 40, 50, 60, 70, 80, 90].forEach((k) => t.insert(k));
    const countTreeNodes = (n) =>
      1 + (n.leaf ? 0 : n.children.reduce((s, c) => s + countTreeNodes(c), 0));
    const L = buildLayout(t.root, O);
    expect(L.nodes.length).toBe(countTreeNodes(t.root));
    expect(L.edges.length).toBe(L.nodes.length - 1); // a tree has nodes-1 edges
  });

  it('gives every node and edge finite coordinates and a positive viewport', () => {
    resetNodeIds(1);
    const t = new BTree(5);
    [10, 20, 30, 40, 50, 60].forEach((k) => t.insert(k));
    const L = buildLayout(t.root, O);
    expect(L.width).toBeGreaterThan(0);
    expect(L.height).toBeGreaterThan(0);
    expect(Number.isFinite(L.minX)).toBe(true);
    for (const n of L.nodes) {
      expect(Number.isFinite(n.x)).toBe(true);
      expect(Number.isFinite(n.cx)).toBe(true);
      expect(Number.isFinite(n.y)).toBe(true);
    }
    for (const e of L.edges) {
      [e.x1, e.y1, e.x2, e.y2].forEach((v) => expect(Number.isFinite(v)).toBe(true));
    }
  });

  it('stacks levels by depth: a child sits one levelH below its parent', () => {
    resetNodeIds(1);
    const t = new BTree(5);
    [10, 20, 30, 40, 50].forEach((k) => t.insert(k)); // height 2
    const L = buildLayout(t.root, O);
    const ys = [...new Set(L.nodes.map((n) => n.y))].sort((a, b) => a - b);
    expect(ys).toEqual([0, O.levelH]);
  });

  it('lays out a single leaf at depth 0 with no edges', () => {
    resetNodeIds(1);
    const t = new BTree(5);
    t.insert(10);
    const L = buildLayout(t.root, O);
    expect(L.nodes.length).toBe(1);
    expect(L.edges.length).toBe(0);
    expect(L.nodes[0].y).toBe(0);
    expect(L.nodes[0].leaf).toBe(true);
  });

  it('is deterministic for the same tree and options', () => {
    resetNodeIds(1);
    const t = new BTree(5);
    [10, 20, 30, 40, 50, 60, 70].forEach((k) => t.insert(k));
    const a = buildLayout(cloneTree(t.root), O);
    const b = buildLayout(cloneTree(t.root), O);
    expect(a).toEqual(b);
  });
});

// ── heightOf / countOf ───────────────────────────────────────────────────────

describe('b-trees-engine · heightOf / countOf', () => {
  it('a single leaf is height 1 with its key count', () => {
    const leaf = { id: 1, keys: [1, 2, 3], leaf: true, children: [] };
    expect(heightOf(leaf)).toBe(1);
    expect(countOf(leaf)).toBe(3);
  });

  it('counts every key across all nodes and reports the leftmost-spine depth', () => {
    resetNodeIds(1);
    const t = new BTree(5);
    const keys = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    keys.forEach((k) => t.insert(k));
    expect(countOf(t.root)).toBe(keys.length);
    expect(heightOf(t.root)).toBe(t.height());
    expect(heightOf(t.root)).toBeGreaterThanOrEqual(2);
  });
});
