/**
 * B-tree engine — pure logic, no React, no DOM, no JSX.
 *
 * Extracted from BTrees.jsx so the structure logic can be unit tested and
 * reused (the lesson's labs/components import these to keep render code thin).
 *
 *   _mk / resetNodeIds — node factory + the module-level id counter. The
 *                        original labs poke `_nid = 5000` etc. before building
 *                        a tree so node ids are stable per lab; resetNodeIds(n)
 *                        does that explicitly.
 *   BTree              — classic B-tree: median MOVES up; bottom-up insert with
 *                        frame recording for the split animation; balanced by
 *                        construction (it only ever grows at the root).
 *   BPlus              — B+ tree: all data in leaves, leaves linked left→right;
 *                        internal nodes are pure signposts. rangeScan locates the
 *                        start leaf then walks the leaf chain.
 *   cloneTree          — deep-clone helper for snapshot trees (animation frames).
 *   buildLayout        — in-order leaf placement, parents centered; returns
 *                        {nodes, edges, minX, width, height} for TreeSVG.
 *   levelsFor/heightOf/countOf — tree-shape readouts. FANOUTS / N_KEYS are the
 *                        constants used by levelsFor in the fan-out lab.
 *
 * Node shape: { id, keys, leaf, children, next? }.
 */

/* fan-out lab constants */
export const FANOUTS = [2, 4, 8, 16, 32, 64, 128, 256, 512];
export const N_KEYS = 1e9;
export function levelsFor(f) {
  return Math.ceil(Math.log(N_KEYS) / Math.log(f));
}

/* ── node helpers + the module-level id counter ─────────────────────────── */
let _nid = 1;
export const _mk = (leaf = true) => ({ id: _nid++, keys: [], leaf, children: [] });
// The original labs set `_nid = 5000` (search), `9000` (split), `7000` (range)
// before building a tree so each lab's node ids are stable and disjoint.
export function resetNodeIds(n) {
  _nid = n;
}

/* deep-clone helper for snapshot trees */
export const cloneTree = (n) => ({
  id: n.id,
  keys: [...n.keys],
  leaf: n.leaf,
  children: (n.children || []).map(cloneTree),
  next: n.next,
});

/* classic B-tree: median MOVES up. Bottom-up insert with frame recording. */
export class BTree {
  constructor(order = 5) {
    this.order = order;
    this.maxKeys = order - 1;
    this.mid = Math.floor((order - 1) / 2);
    this.root = _mk(true);
  }
  height() {
    let h = 1,
      n = this.root;
    while (!n.leaf) {
      h++;
      n = n.children[0];
    }
    return h;
  }
  count() {
    let c = 0;
    const w = (n) => {
      c += n.keys.length;
      if (!n.leaf) n.children.forEach(w);
    };
    w(this.root);
    return c;
  }
  search(key) {
    let n = this.root;
    const path = [];
    while (n) {
      let i = 0;
      while (i < n.keys.length && key > n.keys[i]) i++;
      const hit = n.keys[i] === key;
      path.push({ id: n.id, cmpKey: n.keys[Math.min(i, n.keys.length - 1)], idx: i, hit });
      if (hit) return { found: true, path };
      if (n.leaf) return { found: false, path };
      n = n.children[i];
    }
    return { found: false, path };
  }
  insert(key) {
    const frames = [];
    // reject duplicates quietly
    if (this.search(key).found) return frames;
    const over = this._ins(this.root, key, frames);
    if (over) {
      const old = this.root;
      const ns = _mk(false);
      ns.children.push(old);
      this.root = ns;
      this._split(ns, 0, frames, true);
    }
    frames.push({
      snap: cloneTree(this.root),
      focus: [],
      median: null,
      grew: false,
      kind: 'settled',
      caption:
        'Settled. Every leaf still rests at exactly the same depth. The tree stayed perfectly level.',
    });
    return frames;
  }
  _ins(node, key, frames) {
    if (node.leaf) {
      let i = node.keys.length - 1;
      node.keys.push(0);
      while (i >= 0 && key < node.keys[i]) {
        node.keys[i + 1] = node.keys[i];
        i--;
      }
      node.keys[i + 1] = key;
      const over = node.keys.length > this.maxKeys;
      frames.push({
        snap: cloneTree(this.root),
        focus: [node.id],
        median: null,
        grew: false,
        kind: over ? 'overflow' : 'placed',
        caption: over
          ? `${key} files into its leaf. That makes ${node.keys.length} cards, one past the drawer's limit of ${this.maxKeys}. The drawer must split.`
          : `${key} files neatly into its leaf. The drawer has room. Nothing else stirs.`,
      });
      return over;
    }
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) i++;
    const childOver = this._ins(node.children[i], key, frames);
    if (childOver) {
      this._split(node, i, frames, false);
      return node.keys.length > this.maxKeys;
    }
    return false;
  }
  _split(parent, i, frames, isRoot) {
    const y = parent.children[i];
    const mid = this.mid;
    const medianKey = y.keys[mid];
    const z = _mk(y.leaf);
    z.keys = y.keys.slice(mid + 1);
    y.keys = y.keys.slice(0, mid);
    if (!y.leaf) {
      z.children = y.children.slice(mid + 1);
      y.children = y.children.slice(0, mid + 1);
    }
    parent.children.splice(i + 1, 0, z);
    parent.keys.splice(i, 0, medianKey);
    frames.push({
      snap: cloneTree(this.root),
      focus: isRoot ? [parent.id, y.id, z.id] : [y.id, z.id],
      median: medianKey,
      grew: isRoot,
      kind: isRoot ? 'grew' : 'split',
      caption: isRoot
        ? `The root drawer was full too, so ${medianKey} rises to form a brand-new guide drawer on top. This is the only way a B-tree ever grows taller. It lifts every leaf down by one, all at once.`
        : `Median ${medianKey} rises into the parent as a new guide card; the drawer breaks cleanly in two. The parent grew wider, not taller.`,
    });
  }
}

/* B+ tree: all data in leaves, leaves linked left→right; internals are signposts. */
export class BPlus {
  constructor(order = 4) {
    this.order = order;
    this.max = order - 1;
    this.root = _mk(true);
  }
  _insert(node, key) {
    if (node.leaf) {
      let i = 0;
      while (i < node.keys.length && key > node.keys[i]) i++;
      if (node.keys[i] === key) return null;
      node.keys.splice(i, 0, key);
      if (node.keys.length <= this.max) return null;
      const m = Math.ceil(node.keys.length / 2);
      const r = _mk(true);
      r.keys = node.keys.slice(m);
      node.keys = node.keys.slice(0, m);
      r.next = node.next;
      node.next = r.id; // store id; resolve via map when needed
      r._nextNode = node._nextNode || null; // not used; chain rebuilt from structure
      return { sep: r.keys[0], right: r };
    }
    let i = 0;
    while (i < node.keys.length && key >= node.keys[i]) i++;
    const res = this._insert(node.children[i], key);
    if (!res) return null;
    node.keys.splice(i, 0, res.sep);
    node.children.splice(i + 1, 0, res.right);
    if (node.keys.length <= this.max) return null;
    const mid = Math.floor(node.keys.length / 2);
    const sep = node.keys[mid];
    const r = _mk(false);
    r.keys = node.keys.slice(mid + 1);
    node.keys = node.keys.slice(0, mid);
    r.children = node.children.slice(mid + 1);
    node.children = node.children.slice(0, mid + 1);
    return { sep, right: r };
  }
  insert(key) {
    const res = this._insert(this.root, key);
    if (res) {
      const ni = _mk(false);
      ni.keys = [res.sep];
      ni.children = [this.root, res.right];
      this.root = ni;
    }
  }
  /* left-to-right ordered list of leaves (by structure, ignoring stored next) */
  leaves() {
    const out = [];
    const w = (n) => {
      if (n.leaf) out.push(n);
      else n.children.forEach(w);
    };
    w(this.root);
    return out;
  }
  rangeScan(lo, hi) {
    const order = this.leaves();
    const path = [];
    // descend to find start leaf, recording the route
    let n = this.root;
    path.push(n.id);
    while (!n.leaf) {
      let i = 0;
      while (i < n.keys.length && lo >= n.keys[i]) i++;
      n = n.children[i];
      path.push(n.id);
    }
    const startIdx = order.findIndex((lf) => lf.id === n.id);
    const visited = [];
    const hits = [];
    for (let k = startIdx; k < order.length; k++) {
      const lf = order[k];
      visited.push(lf.id);
      for (const key of lf.keys) if (key >= lo && key <= hi) hits.push(key);
      const last = lf.keys[lf.keys.length - 1];
      if (last > hi) break;
    }
    return { path, visited, hits, startId: n.id };
  }
}

/* ── tree layout (in-order leaf placement, parents centered) ────────────── */
export function buildLayout(root, o) {
  const nodes = [],
    edges = [];
  let cursor = 0;
  const wOf = (n) => Math.max(1, n.keys.length) * o.cellW + o.padX * 2;
  function place(n, depth) {
    const w = wOf(n);
    if (n.leaf || !n.children || n.children.length === 0) {
      const x = cursor;
      cursor += w + o.leafGap;
      const cx = x + w / 2;
      const node = { id: n.id, x, cx, y: depth * o.levelH, w, keys: n.keys, leaf: true, depth };
      nodes.push(node);
      return node;
    }
    const kids = n.children.map((c) => place(c, depth + 1));
    const cx = (kids[0].cx + kids[kids.length - 1].cx) / 2;
    const x = cx - w / 2;
    const node = { id: n.id, x, cx, y: depth * o.levelH, w, keys: n.keys, leaf: false, depth };
    nodes.push(node);
    kids.forEach((kid, i) => {
      const gapX = x + o.padX + i * o.cellW;
      edges.push({ to: kid.id, x1: gapX, y1: node.y + o.cellH, x2: kid.cx, y2: kid.y });
    });
    return node;
  }
  place(root, 0);
  const minX = Math.min(...nodes.map((d) => d.x)) - o.padX;
  const maxX = Math.max(...nodes.map((d) => d.x + d.w)) + o.padX;
  const maxY = Math.max(...nodes.map((d) => d.y)) + o.cellH + 4;
  return { nodes, edges, minX, width: Math.max(1, maxX - minX), height: maxY };
}

/* ── tree-shape readouts ────────────────────────────────────────────────── */
export const heightOf = (n) => {
  let h = 1;
  while (!n.leaf && n.children.length) {
    h++;
    n = n.children[0];
  }
  return h;
};
export const countOf = (n) => {
  let c = n.keys.length;
  if (!n.leaf) n.children.forEach((c2) => (c += countOf(c2)));
  return c;
};
