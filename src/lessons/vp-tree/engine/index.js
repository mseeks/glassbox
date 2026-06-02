/**
 * Vantage-point tree engine — pure functions, no React, no DOM, no JSX.
 *
 * Extracted from VPTreeLesson.jsx so the structure logic can be unit tested and
 * reused (the lesson imports these to keep its render code thin). Every ring,
 * prune, and counter on screen comes from this code, and it is validated against
 * brute force.
 *
 *   mulberry32   — seeded PRNG (deterministic; returns floats in [0,1)).
 *   dist         — Euclidean distance between two 2-D points.
 *   median       — median of a numeric array.
 *   pickVantage  — choose a vantage point with a spread-out distance shell.
 *   build        — recursive 2-D VP-tree construction (uses module-level _NID).
 *   buildTree    — reset _NID and build a tree from points + seed.
 *   collectPoints— gather every stored point inside a subtree.
 *   nnSearch     — branch-and-bound nearest-neighbour search with step trace.
 *   brute        — linear-scan nearest neighbour (the baseline).
 *   makeField    — seeded, separated contact field on the scope.
 *   layoutTree   — in-order binary-tree layout → {map, links, N, maxD, order}.
 *   subtreeNodeIds — collect every node id within a subtree.
 *
 * High-dimensional engine (for the curse-of-dimensionality lab):
 *   distND, pickVantageND, buildND, nnND, curseStats (memoized in a module
 *   cache — kept deliberately).
 *
 * Seeded RNG is pure; Math.random()/Date are NOT — those stay inside the labs.
 */

export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function median(arr) {
  const a = [...arr].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

// Choose a vantage point with a spread-out distance distribution (sharp shell).
export function pickVantage(points, rnd) {
  if (points.length <= 2) return 0;
  const cand = [];
  const cN = Math.min(points.length, 10);
  for (let i = 0; i < cN; i++) cand.push(Math.floor(rnd() * points.length));
  const test = [];
  for (let i = 0; i < Math.min(points.length, 14); i++)
    test.push(points[Math.floor(rnd() * points.length)]);
  let bestI = cand[0],
    bestSpread = -1;
  for (const ci of cand) {
    const v = points[ci];
    const ds = test.map((p) => dist(v, p));
    const mean = ds.reduce((s, x) => s + x, 0) / ds.length;
    const varc = ds.reduce((s, x) => s + (x - mean) * (x - mean), 0) / ds.length;
    if (varc > bestSpread) {
      bestSpread = varc;
      bestI = ci;
    }
  }
  return bestI;
}

let _NID = 0;
export function build(points, rnd, leafSize = 1, depth = 0) {
  if (points.length === 0) return null;
  if (points.length <= leafSize) {
    return {
      id: _NID++,
      vp: points[0],
      mu: 0,
      inside: null,
      outside: null,
      leaf: true,
      bucket: points,
      size: points.length,
      depth,
    };
  }
  const pts = [...points];
  const vi = pickVantage(pts, rnd);
  const vp = pts.splice(vi, 1)[0];
  if (pts.length === 0)
    return {
      id: _NID++,
      vp,
      mu: 0,
      inside: null,
      outside: null,
      leaf: true,
      bucket: [vp],
      size: 1,
      depth,
    };
  const ds = pts.map((p) => dist(vp, p));
  const mu = median(ds);
  const inside = [],
    outside = [];
  pts.forEach((p, i) => {
    (ds[i] <= mu ? inside : outside).push(p);
  });
  const node = { id: _NID++, vp, mu, leaf: false, depth };
  node.inside = build(inside, rnd, leafSize, depth + 1);
  node.outside = build(outside, rnd, leafSize, depth + 1);
  node.size = 1 + (node.inside ? node.inside.size : 0) + (node.outside ? node.outside.size : 0);
  return node;
}

export function buildTree(points, seed, leafSize = 1) {
  _NID = 0;
  return build([...points], mulberry32(seed), leafSize, 0);
}

// Collect every stored point inside a subtree (for "N contacts skipped" counts).
export function collectPoints(node, acc = []) {
  if (!node) return acc;
  if (node.leaf) {
    for (const p of node.bucket) acc.push(p);
    return acc;
  }
  acc.push(node.vp);
  collectPoints(node.inside, acc);
  collectPoints(node.outside, acc);
  return acc;
}

/* Nearest-neighbour search with branch-and-bound pruning.
   Returns the answer AND an ordered list of steps for animation. */
export function nnSearch(root, q) {
  let best = null,
    tau = Infinity,
    dcount = 0;
  const steps = [];
  function visit(node) {
    if (!node) return;
    if (node.leaf) {
      for (const p of node.bucket) {
        const d = dist(q, p);
        dcount++;
        const improved = d < tau;
        if (improved) {
          tau = d;
          best = p;
        }
        steps.push({ kind: 'measure', node, point: p, d, tau, best, dcount, improved, leaf: true });
      }
      return;
    }
    const d = dist(q, node.vp);
    dcount++;
    const improved = d < tau;
    if (improved) {
      tau = d;
      best = node.vp;
    }
    steps.push({
      kind: 'measure',
      node,
      point: node.vp,
      d,
      tau,
      best,
      dcount,
      improved,
      mu: node.mu,
    });

    const insideFirst = d < node.mu;
    const near = insideFirst ? node.inside : node.outside;
    const far = insideFirst ? node.outside : node.inside;
    visit(near);

    // pruning test for the far child, using the (possibly updated) tau
    let mustFar, bound;
    if (insideFirst) {
      mustFar = !(d + tau < node.mu);
      bound = node.mu - d;
    } else {
      mustFar = !(d - tau > node.mu);
      bound = d - node.mu;
    }
    const farSide = insideFirst ? 'outside' : 'inside';
    if (mustFar) {
      steps.push({ kind: 'descend', node, side: farSide, bound, tau });
      visit(far);
    } else {
      const skipped = far ? collectPoints(far).length : 0;
      steps.push({ kind: 'prune', node, side: farSide, bound, tau, skipped, mu: node.mu });
    }
  }
  visit(root);
  return { best, tau, dcount, steps, total: root ? root.size : 0 };
}

export function brute(points, q) {
  let best = null,
    bd = Infinity;
  for (const p of points) {
    const d = dist(q, p);
    if (d < bd) {
      bd = d;
      best = p;
    }
  }
  return { best, bd };
}

/* ── seeded contact field for the scope (0..100 box, padded) ── */
export function makeField(seed, n) {
  const rnd = mulberry32(seed);
  const pts = [];
  let tries = 0;
  while (pts.length < n && tries < n * 40) {
    tries++;
    const x = 8 + rnd() * 84,
      y = 8 + rnd() * 84;
    if (pts.every((p) => Math.hypot(p.x - x, p.y - y) > 6.0)) pts.push({ x, y, id: pts.length });
  }
  return pts;
}

// in-order layout of a binary tree → {idx, depth} per node id
export function layoutTree(root) {
  const map = {};
  let i = 0,
    maxD = 0;
  const order = [];
  (function rec(n, d) {
    if (!n) return;
    rec(n.inside, d + 1);
    map[n.id] = { idx: i++, depth: d, node: n };
    maxD = Math.max(maxD, d);
    order.push(n.id);
    rec(n.outside, d + 1);
  })(root, 0);
  const links = [];
  (function walk(n) {
    if (!n || n.leaf) return;
    if (n.inside) {
      links.push([n.id, n.inside.id]);
      walk(n.inside);
    }
    if (n.outside) {
      links.push([n.id, n.outside.id]);
      walk(n.outside);
    }
  })(root);
  return { map, links, N: i, maxD, order };
}

export function subtreeNodeIds(node, acc) {
  if (!node) return acc;
  acc.add(node.id);
  if (!node.leaf) {
    subtreeNodeIds(node.inside, acc);
    subtreeNodeIds(node.outside, acc);
  }
  return acc;
}

/* ── high-dimensional engine for the curse-of-dimensionality lab ── */
export const distND = (a, b) => {
  let s = 0;
  for (let i = 0; i < a.v.length; i++) {
    const d = a.v[i] - b.v[i];
    s += d * d;
  }
  return Math.sqrt(s);
};

export function pickVantageND(points, rnd) {
  if (points.length <= 2) return 0;
  const cand = [];
  const cN = Math.min(points.length, 8);
  for (let i = 0; i < cN; i++) cand.push(Math.floor(rnd() * points.length));
  const test = [];
  for (let i = 0; i < Math.min(points.length, 12); i++)
    test.push(points[Math.floor(rnd() * points.length)]);
  let bi = cand[0],
    bs = -1;
  for (const ci of cand) {
    const v = points[ci];
    const ds = test.map((p) => distND(v, p));
    const mean = ds.reduce((a, b) => a + b, 0) / ds.length;
    const vc = ds.reduce((a, b) => a + (b - mean) * (b - mean), 0) / ds.length;
    if (vc > bs) {
      bs = vc;
      bi = ci;
    }
  }
  return bi;
}

export function buildND(points, rnd) {
  if (points.length === 0) return null;
  if (points.length === 1)
    return { vp: points[0], mu: 0, inside: null, outside: null, leaf: true, size: 1 };
  const pts = [...points];
  const vi = pickVantageND(pts, rnd);
  const vp = pts.splice(vi, 1)[0];
  if (pts.length === 0) return { vp, mu: 0, inside: null, outside: null, leaf: true, size: 1 };
  const ds = pts.map((p) => distND(vp, p));
  const mu = median(ds);
  const inside = [],
    outside = [];
  pts.forEach((p, i) => {
    (ds[i] <= mu ? inside : outside).push(p);
  });
  const n = { vp, mu, leaf: false };
  n.inside = buildND(inside, rnd);
  n.outside = buildND(outside, rnd);
  n.size = 1 + (n.inside ? n.inside.size : 0) + (n.outside ? n.outside.size : 0);
  return n;
}

export function nnND(root, q) {
  let tau = Infinity,
    dc = 0;
  function visit(node) {
    if (!node) return;
    if (node.leaf) {
      const d = distND(q, node.vp);
      dc++;
      if (d < tau) tau = d;
      return;
    }
    const d = distND(q, node.vp);
    dc++;
    if (d < tau) tau = d;
    const inF = d < node.mu;
    const near = inF ? node.inside : node.outside;
    const far = inF ? node.outside : node.inside;
    visit(near);
    let mf;
    if (inF) mf = !(d + tau < node.mu);
    else mf = !(d - tau > node.mu);
    if (mf) visit(far);
  }
  visit(root);
  return dc;
}

// cached per-dimension statistics (computed once, lazily)
const _curseCache = {};
export function curseStats(D) {
  if (_curseCache[D]) return _curseCache[D];
  const rnd = mulberry32(42);
  const N = 160;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const v = [];
    for (let k = 0; k < D; k++) v.push(rnd());
    pts.push({ v, id: i });
  }
  const ds = [];
  for (let i = 0; i < 400; i++) {
    const a = pts[Math.floor(rnd() * N)],
      b = pts[Math.floor(rnd() * N)];
    if (a !== b) ds.push(distND(a, b));
  }
  const mean = ds.reduce((a, b) => a + b, 0) / ds.length;
  const std = Math.sqrt(ds.reduce((a, b) => a + (b - mean) * (b - mean), 0) / ds.length);
  const tree = buildND([...pts], mulberry32(99));
  let tot = 0,
    qN = 36;
  for (let t = 0; t < qN; t++) {
    const v = [];
    for (let k = 0; k < D; k++) v.push(rnd());
    tot += nnND(tree, { v });
  }
  const avg = tot / qN;
  // histogram of NORMALISED distance (d / mean) on a FIXED axis [0,2],
  // so the relative concentration (the real curse) is visible as the bump tightens around 1.
  const BINS = 30,
    AX = 2;
  const hist = new Array(BINS).fill(0);
  for (const d of ds) {
    let b = Math.floor((d / mean / AX) * BINS);
    if (b >= BINS) b = BINS - 1;
    if (b < 0) b = 0;
    hist[b]++;
  }
  const hmax = Math.max(...hist, 1);
  const res = { D, mean, std, cv: std / mean, avg, N, pruned: 1 - avg / N, hist, hmax, AX };
  _curseCache[D] = res;
  return res;
}
