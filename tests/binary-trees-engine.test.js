import { describe, expect, it } from 'vitest';
import {
  insert,
  clone,
  buildFresh,
  searchPath,
  inorder,
  preorder,
  postorder,
  height,
  findNode,
  rotateRight,
  rotateLeft,
  layout,
  inorderEvents,
  orderEvents,
  subtreeKeys,
  bstView,
  heapPush,
  heapToTree,
  heapLayout,
  heapView,
  buildPerfect,
  capacityOf,
  fmt,
  guessSeq,
  pct,
  findFrames,
  insertPlan,
  HERO_KEYS,
  SORTED12,
  UNSORTED12,
  FIND_T,
  INS_V,
  INS_POOL,
  SORTED_ORDER,
  SHUFFLED_ORDER,
  ROT_INIT,
  HEAP_INIT,
} from '../src/lessons/binary-trees/engine/index.js';

describe('bst-engine · insert / buildFresh / clone', () => {
  it('makes a single-node tree from null', () => {
    const r = insert(null, 5);
    expect(r).toEqual({ key: 5, left: null, right: null });
  });

  it('places smaller keys left and larger keys right', () => {
    const r = buildFresh([50, 25, 75]);
    expect(r.key).toBe(50);
    expect(r.left.key).toBe(25);
    expect(r.right.key).toBe(75);
    expect(r.left.left).toBeNull();
  });

  it('ignores duplicate keys (neither smaller nor larger)', () => {
    const r = buildFresh([10, 5, 10, 5]);
    expect(inorder(r)).toEqual([5, 10]);
    // re-inserting an existing key returns the same root unchanged
    expect(insert(r, 10)).toBe(r);
  });

  it('buildFresh of an empty sequence is null', () => {
    expect(buildFresh([])).toBeNull();
  });

  it('clone produces a deep, independent copy', () => {
    const r = buildFresh([2, 1, 3]);
    const c = clone(r);
    expect(c).toEqual(r);
    expect(c).not.toBe(r);
    expect(c.left).not.toBe(r.left);
    c.left.key = 99;
    expect(r.left.key).toBe(1);
  });

  it('clone of null is null', () => {
    expect(clone(null)).toBeNull();
  });
});

describe('bst-engine · searchPath', () => {
  const root = buildFresh(HERO_KEYS); // 50,25,75,12,37,62,87

  it('records the comparison path to a present key and reports found', () => {
    expect(searchPath(root, 37)).toEqual({ found: true, path: [50, 25, 37] });
    expect(searchPath(root, 50)).toEqual({ found: true, path: [50] });
    expect(searchPath(root, 87)).toEqual({ found: true, path: [50, 75, 87] });
  });

  it('reports the path to the empty slot for a missing key', () => {
    // 40: 50→left(25)→right(37)→right(null). 40 > 37 so we fall off right of 37.
    expect(searchPath(root, 40)).toEqual({ found: false, path: [50, 25, 37] });
    // 90: 50→right(75)→right(87)→right(null)
    expect(searchPath(root, 90)).toEqual({ found: false, path: [50, 75, 87] });
  });

  it('an empty tree yields an empty path, not found', () => {
    expect(searchPath(null, 1)).toEqual({ found: false, path: [] });
  });
});

describe('bst-engine · traversals', () => {
  const root = buildFresh(HERO_KEYS);

  it('inorder yields ascending order (the sorted sequence)', () => {
    expect(inorder(root)).toEqual([12, 25, 37, 50, 62, 75, 87]);
  });

  it('preorder visits node before children', () => {
    expect(preorder(root)).toEqual([50, 25, 12, 37, 75, 62, 87]);
  });

  it('postorder visits children before the node', () => {
    expect(postorder(root)).toEqual([12, 37, 25, 62, 87, 75, 50]);
  });

  it('all traversals of an empty tree are empty', () => {
    expect(inorder(null)).toEqual([]);
    expect(preorder(null)).toEqual([]);
    expect(postorder(null)).toEqual([]);
  });
});

describe('bst-engine · height', () => {
  it('an empty tree is -1 and a single node is 0', () => {
    expect(height(null)).toBe(-1);
    expect(height(buildFresh([1]))).toBe(0);
  });

  it('a balanced tree of seven nodes has height 2', () => {
    expect(height(buildFresh(HERO_KEYS))).toBe(2);
  });

  it('sorted input degenerates into a stick of height n-1', () => {
    expect(height(buildFresh(SORTED_ORDER))).toBe(SORTED_ORDER.length - 1); // 6
  });

  it('a shuffled order stays bushy', () => {
    expect(height(buildFresh(SHUFFLED_ORDER))).toBe(2);
  });
});

describe('bst-engine · findNode', () => {
  const root = buildFresh(HERO_KEYS);
  it('returns the node holding a present key', () => {
    expect(findNode(root, 25).key).toBe(25);
    expect(findNode(root, 25).left.key).toBe(12);
  });
  it('returns null for a missing key', () => {
    expect(findNode(root, 99)).toBeNull();
    expect(findNode(null, 1)).toBeNull();
  });
});

describe('bst-engine · rotations preserve in-order', () => {
  it('rotateRight raises the left child and re-hangs its right subtree', () => {
    // 30(20(10,25),40): rotate right at root → 20 rises
    const t = buildFresh(ROT_INIT);
    const before = inorder(t);
    const r = rotateRight(t);
    expect(r.key).toBe(20);
    expect(r.right.key).toBe(30);
    expect(r.right.left.key).toBe(25); // 25 re-hung as 30's left
    expect(inorder(r)).toEqual(before); // order unchanged
  });

  it('rotateLeft is the inverse shape and also preserves order', () => {
    const t = buildFresh([10, 5, 20, 15, 30]);
    const before = inorder(t);
    const r = rotateLeft(t);
    expect(r.key).toBe(20);
    expect(r.left.key).toBe(10);
    expect(r.left.right.key).toBe(15);
    expect(inorder(r)).toEqual(before);
  });

  it('rotateRight then rotateLeft round-trips the root key', () => {
    const t = buildFresh(ROT_INIT);
    const back = rotateLeft(rotateRight(t));
    expect(back.key).toBe(30);
    expect(inorder(back)).toEqual(inorder(buildFresh(ROT_INIT)));
  });
});

describe('bst-engine · layout geometry', () => {
  it('assigns in-order rank as x and depth as d, with edges and extents', () => {
    const root = buildFresh(HERO_KEYS);
    const { pos, edges, maxX, maxD } = layout(root);
    // in-order is [12,25,37,50,62,75,87] so x runs 0..6 in that order
    expect(pos[12]).toEqual({ x: 0, d: 2 });
    expect(pos[50]).toEqual({ x: 3, d: 0 });
    expect(pos[87]).toEqual({ x: 6, d: 2 });
    expect(maxX).toBe(6);
    expect(maxD).toBe(2);
    // six edges in a seven-node tree
    expect(edges).toHaveLength(6);
    expect(edges).toContainEqual({ from: 50, to: 25 });
    expect(edges).toContainEqual({ from: 25, to: 12 });
    expect(edges).toContainEqual({ from: 75, to: 87 });
  });

  it('a single node has no edges and zero extents', () => {
    const { pos, edges, maxX, maxD } = layout(buildFresh([7]));
    expect(pos).toEqual({ 7: { x: 0, d: 0 } });
    expect(edges).toEqual([]);
    expect(maxX).toBe(0);
    expect(maxD).toBe(0);
  });
});

describe('bst-engine · event sequences', () => {
  const root = buildFresh(HERO_KEYS);
  it('inorderEvents matches inorder', () => {
    expect(inorderEvents(root)).toEqual(inorder(root));
    expect(inorderEvents(null)).toEqual([]);
  });
  it('orderEvents covers all three kinds', () => {
    expect(orderEvents(root, 'in')).toEqual([12, 25, 37, 50, 62, 75, 87]);
    expect(orderEvents(root, 'pre')).toEqual([50, 25, 12, 37, 75, 62, 87]);
    expect(orderEvents(root, 'post')).toEqual([12, 37, 25, 62, 87, 75, 50]);
    expect(orderEvents(null, 'pre')).toEqual([]);
  });
});

describe('bst-engine · subtreeKeys', () => {
  const root = buildFresh(HERO_KEYS);
  it('collects every key under a node', () => {
    const set = subtreeKeys(findNode(root, 25), new Set());
    expect([...set].sort((a, b) => a - b)).toEqual([12, 25, 37]);
  });
  it('a leaf yields just itself; null yields the empty set', () => {
    expect([...subtreeKeys(findNode(root, 12), new Set())]).toEqual([12]);
    expect([...subtreeKeys(null, new Set())]).toEqual([]);
  });
});

describe('bst-engine · bstView', () => {
  it('returns drawing props with nodes in in-order', () => {
    const v = bstView(buildFresh(HERO_KEYS));
    expect(v.nodes.map((n) => n.id)).toEqual([12, 25, 37, 50, 62, 75, 87]);
    expect(v.nodes.map((n) => n.label)).toEqual([12, 25, 37, 50, 62, 75, 87]);
    expect(v.maxX).toBe(6);
    expect(v.maxD).toBe(2);
    expect(v.edges).toHaveLength(6);
    expect(v.pos[50]).toEqual({ x: 3, d: 0 });
  });
});

describe('bst-engine · heapPush (min-heap sift-up)', () => {
  it('records a no-move push when the value belongs at the bottom', () => {
    const { result, steps } = heapPush([2, 5, 3], 9);
    expect(result).toEqual([2, 5, 3, 9]); // 9 > parent 5, stays put
    expect(steps[0]).toEqual({ i: 3, a: [2, 5, 3, 9], moved: false });
    expect(steps.at(-1)).toEqual({ i: 3, a: [2, 5, 3, 9], moved: false, done: true });
    expect(steps.some((s) => s.moved)).toBe(false);
  });

  it('sifts a new minimum all the way to the root', () => {
    const { result, steps } = heapPush([2, 5, 3], 1);
    // 1 starts at index 3 (parent 5) → swaps up to index 1 (parent 2) → swaps to root
    expect(result).toEqual([1, 2, 3, 5]);
    expect(result[0]).toBe(1);
    const moves = steps.filter((s) => s.moved);
    expect(moves).toHaveLength(2); // two swaps to reach the root
    expect(steps.at(-1).done).toBe(true);
  });

  it('does not mutate the input array', () => {
    const a = [2, 5, 3];
    heapPush(a, 1);
    expect(a).toEqual([2, 5, 3]);
  });

  it('pushing into an empty heap just seats the value', () => {
    const { result, steps } = heapPush([], 4);
    expect(result).toEqual([4]);
    expect(steps.at(-1).done).toBe(true);
  });
});

describe('bst-engine · heapToTree / heapLayout / heapView', () => {
  it('heapToTree wires children at 2i+1 and 2i+2', () => {
    const t = heapToTree([2, 5, 3, 9]);
    expect(t.key).toBe(2);
    expect(t.idx).toBe(0);
    expect(t.left.key).toBe(5);
    expect(t.left.idx).toBe(1);
    expect(t.right.key).toBe(3);
    expect(t.left.left.key).toBe(9);
    expect(t.left.right).toBeNull();
  });

  it('heapToTree of an empty array is null', () => {
    expect(heapToTree([])).toBeNull();
  });

  it('heapLayout keys positions and edges by array index', () => {
    const { idxPos, edges, maxX, maxD } = heapLayout([2, 5, 3, 9, 7, 4, 8]);
    expect(idxPos[0]).toMatchObject({ d: 0, key: 2 });
    expect(idxPos[3]).toMatchObject({ d: 2, key: 9 });
    expect(maxD).toBe(2);
    expect(maxX).toBe(6);
    expect(edges).toContainEqual({ from: 0, to: 1 });
    expect(edges).toContainEqual({ from: 0, to: 2 });
    expect(edges).toContainEqual({ from: 1, to: 3 });
    expect(edges).toHaveLength(6);
  });

  it('heapView returns nodes keyed by index with the value as label', () => {
    const v = heapView([2, 5, 3]);
    expect(v.nodes).toEqual([
      { id: 0, label: 2 },
      { id: 1, label: 5 },
      { id: 2, label: 3 },
    ]);
    expect(v.pos[0]).toMatchObject({ d: 0, key: 2 });
    expect(v.edges).toHaveLength(2);
  });
});

describe('bst-engine · buildPerfect / capacityOf / fmt', () => {
  it('buildPerfect makes a tidy pyramid of consecutive in-order integers', () => {
    const t = buildPerfect(2); // 7 nodes
    expect(inorder(t)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(t.key).toBe(4); // middle is the root
    expect(height(t)).toBe(2);
  });

  it('buildPerfect of height 0 is a single node', () => {
    const t = buildPerfect(0);
    expect(t).toMatchObject({ key: 1, left: null, right: null });
  });

  it('capacityOf is 2^(h+1) - 1', () => {
    expect(capacityOf(0)).toBe(1);
    expect(capacityOf(2)).toBe(7);
    expect(capacityOf(20)).toBe(2097151); // a million-plus in 20 levels
    expect(capacityOf(30)).toBe(2147483647);
  });

  it('fmt groups thousands', () => {
    expect(fmt(1000)).toBe('1,000');
    expect(fmt(2097151)).toBe('2,097,151');
    expect(fmt(7)).toBe('7');
  });
});

describe('bst-engine · guessSeq / pct', () => {
  it('binary-searches 1..100 with midpoints, ending on the target', () => {
    const g = guessSeq(73);
    // first guess is the midpoint of 1..100
    expect(g[0]).toEqual({ lo: 1, hi: 100, mid: 50, cmp: 1 }); // 73 > 50, too low
    expect(g.at(-1).mid).toBe(73);
    expect(g.at(-1).cmp).toBe(0);
    // each step narrows the live range monotonically
    for (let k = 1; k < g.length; k++) {
      expect(g[k].hi - g[k].lo).toBeLessThan(g[k - 1].hi - g[k - 1].lo);
    }
  });

  it('cmp encodes too-high (-1) and too-low (+1)', () => {
    const g = guessSeq(12);
    expect(g[0].cmp).toBe(-1); // 12 < 50, too high
    const g2 = guessSeq(99);
    expect(g2[0].cmp).toBe(1); // 99 > 50, too low
  });

  it('never needs more than seven guesses for any number in 1..100', () => {
    for (let t = 1; t <= 100; t++) {
      const g = guessSeq(t);
      expect(g.at(-1).mid).toBe(t);
      expect(g.length).toBeLessThanOrEqual(7);
    }
  });

  it('pct maps the range ends to 0 and 100', () => {
    expect(pct(1)).toBe(0);
    expect(pct(100)).toBe(100);
    expect(pct(50)).toBeCloseTo((49 / 99) * 100, 6);
  });
});

describe('bst-engine · findFrames', () => {
  it('binary search of a sorted array halves the live window', () => {
    const { frames, comparisons } = findFrames('binary', SORTED12, FIND_T); // find 72
    expect(comparisons).toBe(frames.length);
    // the last frame marks the target cell as kept
    const last = frames.at(-1);
    const keptIdx = last.indexOf('kept');
    expect(SORTED12[keptIdx]).toBe(FIND_T);
    // a binary search of twelve sorted items is far cheaper than a scan
    expect(comparisons).toBeLessThan(SORTED12.length);
    // first frame probes the middle and dims nothing
    expect(frames[0].filter((s) => s === 'dim')).toHaveLength(0);
    expect(frames[0].filter((s) => s === 'probe')).toHaveLength(1);
  });

  it('a sequential scan probes cell by cell until the hit', () => {
    const { frames, comparisons } = findFrames('seq', UNSORTED12, FIND_T);
    const idx = UNSORTED12.indexOf(FIND_T);
    expect(comparisons).toBe(idx + 1);
    expect(frames).toHaveLength(idx + 1);
    // the final cell is the match (kept), earlier ones were dimmed/probed
    expect(frames.at(-1)[idx]).toBe('kept');
  });

  it('a sequential miss scans the whole array', () => {
    const { frames, comparisons } = findFrames('seq', UNSORTED12, 999);
    expect(comparisons).toBe(UNSORTED12.length);
    expect(frames).toHaveLength(UNSORTED12.length);
    // nothing was ever kept
    expect(frames.at(-1).includes('kept')).toBe(false);
  });

  it('binary search records cmp=0 as a kept midpoint when it lands on target', () => {
    // SORTED12 middle of 0..11 is index 5 (= 42); search for 42 hits immediately
    const { frames, comparisons } = findFrames('binary', SORTED12, 42);
    expect(comparisons).toBe(1);
    expect(frames[0][5]).toBe('kept');
  });

  it('binary search exercises the go-low branch for a small target', () => {
    // 9 < 42 (the first midpoint), so the search moves the window left.
    const { frames, comparisons } = findFrames('binary', SORTED12, 9);
    const last = frames.at(-1);
    expect(SORTED12[last.indexOf('kept')]).toBe(9);
    expect(comparisons).toBeLessThan(SORTED12.length);
    // the first probe dimmed the entire right half (indices past the midpoint)
    expect(frames[1].slice(6).every((s) => s === 'dim')).toBe(true);
  });

  it('binary search of a missing key scans down to an empty window', () => {
    // 100 is larger than everything, so the window keeps moving right until empty.
    const { frames, comparisons } = findFrames('binary', SORTED12, 100);
    expect(frames).toHaveLength(comparisons);
    expect(frames.at(-1).includes('kept')).toBe(false);
  });
});

describe('bst-engine · insertPlan', () => {
  it('append drops the value at the end with a single write', () => {
    const p = insertPlan('append', UNSORTED12, INS_V);
    expect(p.cells).toEqual([...UNSORTED12, INS_V]);
    expect(p.cost).toBe('1 write');
    expect(p.states.at(-1)).toBe('shift');
    expect(p.states.slice(0, -1).every((s) => s === '')).toBe(true);
  });

  it('shiftSorted opens a gap and shoves the tail over', () => {
    const p = insertPlan('shiftSorted', SORTED12, INS_V); // 50 into the sorted twelve
    // 50 lands between 42 (idx5) and 56 (idx6)
    expect(p.cells[6]).toBe(50);
    expect(p.cost).toBe('shift 7'); // 6 tail elements + the inserted one
    // every cell from the insertion point onward is marked shifted
    expect(p.states[6]).toBe('shift');
    expect(p.states.slice(0, 6).every((s) => s === '')).toBe(true);
    expect(p.states.slice(6).every((s) => s === 'shift')).toBe(true);
  });

  it('a sorted-list splice marks only the new cell and costs one pointer', () => {
    const p = insertPlan('spliceList', SORTED12, INS_V);
    expect(p.cells[6]).toBe(50);
    expect(p.cost).toBe('1 pointer');
    expect(p.states.filter((s) => s === 'shift')).toHaveLength(1);
    expect(p.states[6]).toBe('shift');
  });

  it('inserting at the front of a sorted array shifts everything', () => {
    const p = insertPlan('shiftSorted', [10, 20, 30], 5);
    expect(p.cells).toEqual([5, 10, 20, 30]);
    expect(p.cost).toBe('shift 4');
    expect(p.states.every((s) => s === 'shift')).toBe(true);
  });
});

describe('bst-engine · example datasets', () => {
  it('exposes the seeds the labs are built from', () => {
    expect(HERO_KEYS).toEqual([50, 25, 75, 12, 37, 62, 87]);
    expect(SORTED12).toHaveLength(12);
    expect([...SORTED12].sort((a, b) => a - b)).toEqual(SORTED12); // already sorted
    expect([...UNSORTED12].sort((a, b) => a - b)).toEqual(SORTED12); // same multiset
    expect(FIND_T).toBe(72);
    expect(INS_V).toBe(50);
    expect(INS_POOL).toEqual([20, 60, 40, 80, 10, 90]);
    expect(SORTED_ORDER).toEqual([10, 20, 30, 40, 50, 60, 70]);
    // shuffled order is the same key set as the sorted one
    expect([...SHUFFLED_ORDER].sort((a, b) => a - b)).toEqual(SORTED_ORDER);
    expect(ROT_INIT).toEqual([30, 20, 40, 10, 25]);
    expect(HEAP_INIT).toEqual([2, 5, 3, 9, 7, 4, 8]);
  });
});
