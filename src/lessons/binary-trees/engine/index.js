/**
 * Binary-tree engine — pure logic, no React, no DOM, no JSX.
 *
 * Extracted from BinaryTrees.jsx so the structures themselves can be unit-tested
 * and reused independently of the lesson's render code. Everything here is
 * deterministic given its inputs. Every tree, search, traversal, rotation, and
 * heap drawn in the lesson is produced by a real run of this machine.
 *
 *   insert / buildFresh / clone   — grow a binary-search tree from a sequence.
 *   searchPath / findNode         — walk the tree by the "smaller/larger" rule.
 *   inorder / preorder / postorder / orderEvents — the three traversals.
 *   height                        — longest root-to-leaf path (a leaf is 0).
 *   rotateRight / rotateLeft      — the local reshuffle that preserves order.
 *   layout / bstView              — in-order rank as x, depth as y (geometry).
 *   subtreeKeys                   — the key-set under a node (for dimming).
 *   heapPush / heapToTree / heapLayout / heapView — min-heap, sift-up, array trick.
 *   buildPerfect / capacityOf / fmt — the "n items → ~log₂ n levels" demo.
 *   guessSeq / pct                — the higher-or-lower binary-search game.
 *   findFrames / insertPlan       — the "three structures, two operations" race.
 *   Plus the example datasets every lab is seeded from.
 */

/* ════════════════════════════════════════════════════════════════════
   BINARY SEARCH TREE — the verified core
   ════════════════════════════════════════════════════════════════════ */

// Insert a key into a BST, returning the (possibly new) root. Duplicates are
// ignored: a key equal to a node is neither smaller nor larger, so it is dropped.
export function insert(root, key) {
  if (root === null) return { key, left: null, right: null };
  if (key < root.key) root.left = insert(root.left, key);
  else if (key > root.key) root.right = insert(root.right, key);
  return root;
}

// Deep copy of a node tree — used before a rotation so the source stays intact.
export function clone(n) {
  return n ? { key: n.key, left: clone(n.left), right: clone(n.right) } : null;
}

// Build a fresh BST by inserting `seq` left to right. The resulting shape is a
// fossil record of the order the keys arrived in.
export function buildFresh(seq) {
  let r = null;
  for (const k of seq) r = insert(r, k);
  return r;
}

// The search descent recorded as the path of keys compared, and whether the
// target was found. A miss returns the path to the empty slot it would occupy.
export function searchPath(root, t) {
  const path = [];
  let n = root;
  while (n) {
    path.push(n.key);
    if (t === n.key) return { found: true, path };
    n = t < n.key ? n.left : n.right;
  }
  return { found: false, path };
}

// The three traversals, each accumulating keys into `o`.
export const inorder = (n, o = []) => {
  if (!n) return o;
  inorder(n.left, o);
  o.push(n.key);
  inorder(n.right, o);
  return o;
};
export const preorder = (n, o = []) => {
  if (!n) return o;
  o.push(n.key);
  preorder(n.left, o);
  preorder(n.right, o);
  return o;
};
export const postorder = (n, o = []) => {
  if (!n) return o;
  postorder(n.left, o);
  postorder(n.right, o);
  o.push(n.key);
  return o;
};

// Height: the longest root-to-leaf path in edges. A single node is height 0; an
// empty tree is −1, so a leaf's children contribute −1 and the leaf is 0.
export const height = (n) => (n ? 1 + Math.max(height(n.left), height(n.right)) : -1);

// Locate the node holding `k`, walking by the same rule as a search.
export const findNode = (n, k) => {
  while (n) {
    if (k === n.key) return n;
    n = k < n.key ? n.left : n.right;
  }
  return null;
};

// Rotations pivot three nodes: a child rises, the parent sinks, one subtree
// re-hangs. Both preserve the in-order ordering while changing the height.
export const rotateRight = (y) => {
  const x = y.left;
  y.left = x.right;
  x.right = y;
  return x;
};
export const rotateLeft = (x) => {
  const y = x.right;
  x.right = y.left;
  y.left = x;
  return y;
};

/* ════════════════════════════════════════════════════════════════════
   LAYOUT GEOMETRY — in-order x (= sorted rank), depth as y
   ════════════════════════════════════════════════════════════════════ */

// Assign each node an x (its in-order rank, so the drawing reads left to right
// in sorted order) and a depth d, then collect node positions and the edge list.
export function layout(root) {
  let i = 0;
  (function assign(n, d) {
    if (!n) return;
    assign(n.left, d + 1);
    n._x = i++;
    n._d = d;
    assign(n.right, d + 1);
  })(root, 0);
  const pos = {};
  const edges = [];
  (function collect(n) {
    if (!n) return;
    pos[n.key] = { x: n._x, d: n._d };
    if (n.left) edges.push({ from: n.key, to: n.left.key });
    if (n.right) edges.push({ from: n.key, to: n.right.key });
    collect(n.left);
    collect(n.right);
  })(root);
  let maxD = 0;
  for (const k in pos) maxD = Math.max(maxD, pos[k].d);
  return { pos, edges, maxX: i - 1, maxD };
}

// In-order traversal as a flat sequence of visit events, for animation.
export function inorderEvents(root) {
  const ev = [];
  (function rec(n) {
    if (!n) return;
    rec(n.left);
    ev.push(n.key);
    rec(n.right);
  })(root);
  return ev;
}

// Visit events for any of the three traversal kinds ('pre' | 'in' | 'post').
export function orderEvents(root, kind) {
  const ev = [];
  (function rec(n) {
    if (!n) return;
    if (kind === 'pre') ev.push(n.key);
    rec(n.left);
    if (kind === 'in') ev.push(n.key);
    rec(n.right);
    if (kind === 'post') ev.push(n.key);
  })(root);
  return ev;
}

// The key-set of a subtree, accumulated into `set` — used to dim the discarded
// branch a search throws away.
export function subtreeKeys(node, set) {
  if (!node) return set;
  set.add(node.key);
  subtreeKeys(node.left, set);
  subtreeKeys(node.right, set);
  return set;
}

// Convert a BST root into the props a tree drawing needs: node positions, edges,
// extents, and the node list in in-order (left-to-right) order.
export function bstView(root) {
  const { pos, edges, maxX, maxD } = layout(root);
  const nodes = inorder(root).map((k) => ({ id: k, label: k }));
  return { pos, edges, maxX, maxD, nodes };
}

/* ════════════════════════════════════════════════════════════════════
   MIN-HEAP — the array trick
   ════════════════════════════════════════════════════════════════════ */

// Push `key` into the last slot of a min-heap and sift it up, recording each
// step (the live array, the index being examined, whether it moved) for replay.
export function heapPush(arr, key) {
  const a = arr.slice();
  a.push(key);
  let i = a.length - 1;
  const steps = [{ i, a: a.slice(), moved: false }];
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (a[i] < a[p]) {
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
      steps.push({ i, a: a.slice(), moved: true });
    } else break;
  }
  steps.push({ i, a: a.slice(), moved: false, done: true });
  return { result: a, steps };
}

// Build a node tree from a complete-binary-tree array (index i → children
// 2i+1, 2i+2), so a packed heap can be drawn like any other tree.
export function heapToTree(a) {
  function build(i) {
    if (i >= a.length) return null;
    const n = { key: a[i], idx: i, left: null, right: null };
    n.left = build(2 * i + 1);
    n.right = build(2 * i + 2);
    return n;
  }
  return build(0);
}

// Layout for a heap array: positions keyed by array index, plus the edge list.
export function heapLayout(a) {
  const root = heapToTree(a);
  let i = 0;
  const idxPos = {};
  (function assign(n, d) {
    if (!n) return;
    assign(n.left, d + 1);
    n._x = i++;
    n._d = d;
    idxPos[n.idx] = { x: n._x, d: n._d, key: n.key };
    assign(n.right, d + 1);
  })(root, 0);
  const edges = [];
  (function collect(n) {
    if (!n) return;
    if (n.left) edges.push({ from: n.idx, to: n.left.idx });
    if (n.right) edges.push({ from: n.idx, to: n.right.idx });
    collect(n.left);
    collect(n.right);
  })(root);
  let maxD = 0;
  for (const k in idxPos) maxD = Math.max(maxD, idxPos[k].d);
  return { idxPos, edges, maxX: i - 1, maxD };
}

// Convert a heap array into tree-drawing props, keyed by array index.
export function heapView(arr) {
  const { idxPos, edges, maxX, maxD } = heapLayout(arr);
  const nodes = arr.map((v, idx) => ({ id: idx, label: v }));
  const pos = {};
  for (let idx = 0; idx < arr.length; idx++) pos[idx] = idxPos[idx];
  return { nodes, pos, edges, maxX, maxD };
}

/* ════════════════════════════════════════════════════════════════════
   "n ITEMS → ~log₂ n LEVELS" — perfect trees and capacity
   ════════════════════════════════════════════════════════════════════ */

// A perfectly balanced tree of height `h`, keys numbered 1..2^(h+1)−1 in
// in-order (so it draws as a tidy pyramid of consecutive integers).
export function buildPerfect(h) {
  let c = 1;
  function rec(d) {
    if (d > h) return null;
    const n = { key: 0, left: null, right: null };
    n.left = rec(d + 1);
    n.key = c++;
    n.right = rec(d + 1);
    return n;
  }
  return rec(0);
}

// Capacity of a perfect tree of height h: 2^(h+1) − 1 nodes.
export const capacityOf = (h) => Math.pow(2, h + 1) - 1;

// Thousands-separated integer, for the capacity readout.
export const fmt = (n) => n.toLocaleString('en-US');

/* ════════════════════════════════════════════════════════════════════
   THE GUESSING GAME — binary search over 1..100
   ════════════════════════════════════════════════════════════════════ */

// The optimal higher-or-lower run for `target` in 1..100: each guess is the
// midpoint, halving the live range. cmp is 0 hit, −1 too high, +1 too low.
export function guessSeq(target) {
  let lo = 1,
    hi = 100;
  const g = [];
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const cmp = mid === target ? 0 : target < mid ? -1 : 1;
    g.push({ lo, hi, mid, cmp });
    if (cmp === 0) break;
    if (cmp < 0) hi = mid - 1;
    else lo = mid + 1;
  }
  return g;
}

// Map a value in 1..100 to its 0..100 percent position on the range bar.
export const pct = (v) => ((v - 1) / 99) * 100;

/* ════════════════════════════════════════════════════════════════════
   THREE STRUCTURES, TWO OPERATIONS — the comparison race
   ════════════════════════════════════════════════════════════════════ */

// Frames for a "find" animation over a flat array. 'binary' halves a sorted
// array; anything else is a sequential scan. Each frame is a per-cell state
// string ('' | 'dim' | 'probe' | 'kept'); also returns the comparison count.
export function findFrames(kind, arr, target) {
  const frames = [];
  if (kind === 'binary') {
    let lo = 0,
      hi = arr.length - 1;
    const recs = [];
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const cmp = arr[mid] === target ? 0 : target < arr[mid] ? -1 : 1;
      recs.push({ lo, hi, mid, cmp });
      if (cmp === 0) break;
      if (cmp < 0) hi = mid - 1;
      else lo = mid + 1;
    }
    recs.forEach((r) => {
      const st = arr.map((_, i) => (i < r.lo || i > r.hi ? 'dim' : ''));
      st[r.mid] = r.cmp === 0 ? 'kept' : 'probe';
      frames.push(st);
    });
    return { frames, comparisons: recs.length };
  }
  const f = arr.indexOf(target);
  const n = f === -1 ? arr.length : f + 1;
  for (let t = 1; t <= n; t++) {
    frames.push(
      arr.map((_, i) => (i < t - 1 ? 'dim' : i === t - 1 ? (i === f ? 'kept' : 'probe') : '')),
    );
  }
  return { frames, comparisons: n };
}

// The plan for inserting `val` into a structure: the resulting cells, a per-cell
// state string, and a short cost label. 'append' drops it at the end; 'shiftSorted'
// opens a gap in a sorted array; otherwise it splices into a sorted list.
export function insertPlan(kind, arr, val) {
  if (kind === 'append')
    return {
      cells: arr.concat([val]),
      states: arr.map(() => '').concat(['shift']),
      cost: '1 write',
    };
  let p = 0;
  while (p < arr.length && arr[p] < val) p++;
  const cells = arr.slice(0, p).concat([val], arr.slice(p));
  if (kind === 'shiftSorted')
    return {
      cells,
      states: cells.map((_, i) => (i >= p ? 'shift' : '')),
      cost: `shift ${arr.length - p + 1}`,
    };
  return {
    cells,
    states: cells.map((_, i) => (i === p ? 'shift' : '')),
    cost: '1 pointer',
  };
}

/* ════════════════════════════════════════════════════════════════════
   EXAMPLE DATASETS — every lab is seeded from one of these
   ════════════════════════════════════════════════════════════════════ */

export const HERO_KEYS = [50, 25, 75, 12, 37, 62, 87];

// §01 — twelve numbers stored three ways, and the find/insert targets.
export const SORTED12 = [4, 9, 15, 23, 31, 42, 56, 63, 72, 80, 88, 95];
export const UNSORTED12 = [42, 15, 88, 9, 63, 95, 4, 31, 72, 23, 80, 56];
export const FIND_T = 72;
export const INS_V = 50;

// §04 — the insert/search sandbox pools.
export const INS_POOL = [20, 60, 40, 80, 10, 90];

// §06 — same keys, two insertion orders: a stick vs a bush.
export const SORTED_ORDER = [10, 20, 30, 40, 50, 60, 70];
export const SHUFFLED_ORDER = [40, 20, 60, 10, 30, 50, 70];

// §07 — the rotation playground seed.
export const ROT_INIT = [30, 20, 40, 10, 25];

// §08 — the min-heap seed.
export const HEAP_INIT = [2, 5, 3, 9, 7, 4, 8];
