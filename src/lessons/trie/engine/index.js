/**
 * Trie construction + layout — pure functions, no React, no DOM.
 *
 * Extracted from TrieLesson.jsx so the structure logic can be unit tested and
 * reused (the lesson imports these to keep its render code thin).
 *
 *   buildTrie    — character-per-edge prefix tree from a word list.
 *   buildRadix   — radix/compressed trie: collapse single-child, non-terminal
 *                  chains into multi-character edges.
 *   layoutTrie   — tidy top-down geometry: returns {nodes, edges, w, h} with
 *                  node id = prefix ("" -> "·root").
 *   layoutRadix  — layoutTrie over a radix tree (multi-char edge labels).
 *
 * Node shape: { prefix, end, children } where children maps a single character
 * (or, after compression, a multi-char label) to a child node.
 */

export function buildTrie(words) {
  const root = { prefix: '', end: false, children: {} };
  for (const w of words) {
    let n = root;
    for (let i = 0; i < w.length; i++) {
      const c = w[i];
      if (!n.children[c]) n.children[c] = { prefix: w.slice(0, i + 1), end: false, children: {} };
      n = n.children[c];
    }
    n.end = true;
  }
  return root;
}

// Tidy top-down layout. Returns {nodes, edges, w, h}. Node id = prefix ("" = root).
export function layoutTrie(root, { colW = 66, rowH = 70, pad = 30 } = {}) {
  const nodes = [];
  const edges = [];
  let leafX = 0;
  function place(node, depth, parent, edgeChar) {
    const kids = Object.keys(node.children).sort();
    let x;
    if (kids.length === 0) {
      x = leafX;
      leafX += 1;
    } else {
      const childXs = kids.map((c) => place(node.children[c], depth + 1, node, c));
      x = (childXs[0] + childXs[childXs.length - 1]) / 2;
    }
    const id = node.prefix === '' ? '·root' : node.prefix;
    const branch = node.prefix === '' ? null : node.prefix[0]; // top-level letter
    nodes.push({
      id,
      x,
      depth,
      end: node.end,
      prefix: node.prefix,
      char: edgeChar,
      branch,
      isRoot: node.prefix === '',
      leaf: kids.length === 0,
    });
    if (parent !== null) {
      const pid = parent.prefix === '' ? '·root' : parent.prefix;
      edges.push({ from: pid, to: id, char: edgeChar, branch });
    }
    return x;
  }
  place(root, 0, null, null);
  const maxDepth = Math.max(...nodes.map((n) => n.depth));
  for (const n of nodes) {
    n.px = pad + n.x * colW + colW / 2;
    n.py = pad + n.depth * rowH + 24;
  }
  for (const e of edges) {
    const a = nodes.find((n) => n.id === e.from);
    const b = nodes.find((n) => n.id === e.to);
    e.x1 = a.px;
    e.y1 = a.py;
    e.x2 = b.px;
    e.y2 = b.py;
  }
  const w = pad * 2 + leafX * colW;
  const h = pad * 2 + maxDepth * rowH + 40;
  return { nodes, edges, w, h };
}

// Radix (compressed) layout: collapse single-child, non-terminal chains into multi-char edges.
export function buildRadix(words) {
  const std = buildTrie(words);
  function compress(node) {
    const newChildren = {};
    for (const c of Object.keys(node.children)) {
      let child = node.children[c];
      let label = c;
      // walk down while the child has exactly one child AND is not itself a word end
      while (Object.keys(child.children).length === 1 && !child.end) {
        const onlyKey = Object.keys(child.children)[0];
        child = child.children[onlyKey];
        label += onlyKey;
      }
      newChildren[label] = {
        prefix: child.prefix,
        end: child.end,
        children: compress(child).children,
      };
    }
    return { prefix: node.prefix, end: node.end, children: newChildren };
  }
  return compress(std);
}

export function layoutRadix(root, opts = {}) {
  // reuse layoutTrie geometry but labels can be multi-char; node ids = prefix still unique
  return layoutTrie(root, opts);
}
