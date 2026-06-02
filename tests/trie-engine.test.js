import { describe, expect, it } from 'vitest';
import {
  buildRadix,
  buildTrie,
  layoutRadix,
  layoutTrie,
} from '../src/lessons/trie/engine/index.js';

// Collect every word-terminating prefix in a (standard or radix) trie.
function collectWords(node) {
  const out = [];
  const walk = (n) => {
    if (n.end) out.push(n.prefix);
    for (const k of Object.keys(n.children)) walk(n.children[k]);
  };
  walk(node);
  return out.sort();
}

function countNodes(node) {
  let n = 1;
  for (const k of Object.keys(node.children)) n += countNodes(node.children[k]);
  return n;
}

describe('trie-engine · buildTrie', () => {
  it('round-trips the exact word set', () => {
    const words = ['cat', 'car', 'card', 'dog', 'do'];
    expect(collectWords(buildTrie(words))).toEqual([...words].sort());
  });

  it('shares a common prefix and only branches where words differ', () => {
    const root = buildTrie(['cat', 'car']);
    expect(Object.keys(root.children)).toEqual(['c']);
    const a = root.children.c.children.a;
    expect(Object.keys(a.children).sort()).toEqual(['r', 't']);
    expect(a.end).toBe(false); // "ca" is not itself a word
    expect(a.children.t.end).toBe(true);
    expect(a.children.t.prefix).toBe('cat');
  });

  it('marks a word that is a prefix of another as a word-end', () => {
    const root = buildTrie(['do', 'dog']);
    const o = root.children.d.children.o;
    expect(o.end).toBe(true); // "do"
    expect(o.children.g.end).toBe(true); // "dog"
  });

  it('handles the empty word list', () => {
    const root = buildTrie([]);
    expect(root.prefix).toBe('');
    expect(root.end).toBe(false);
    expect(Object.keys(root.children)).toHaveLength(0);
  });
});

describe('trie-engine · buildRadix', () => {
  it('preserves the same word set as the standard trie', () => {
    const words = ['cat', 'car', 'card', 'care', 'dog', 'do'];
    expect(collectWords(buildRadix(words))).toEqual(collectWords(buildTrie(words)));
  });

  it('collapses a single-child non-terminal chain into one multi-char edge', () => {
    const root = buildRadix(['cat', 'car']);
    // "c" -> "a" collapse to a single "ca" edge that then splits.
    expect(Object.keys(root.children)).toEqual(['ca']);
    expect(Object.keys(root.children.ca.children).sort()).toEqual(['r', 't']);
    expect(root.children.ca.children.t.end).toBe(true);
  });

  it('stops compression at a word boundary even with a single child', () => {
    const root = buildRadix(['ca', 'cat']);
    expect(Object.keys(root.children)).toEqual(['ca']);
    expect(root.children.ca.end).toBe(true); // "ca" is a word -> chain must break here
    expect(Object.keys(root.children.ca.children)).toEqual(['t']);
    expect(root.children.ca.children.t.end).toBe(true); // "cat"
  });

  it('keeps a multi-char edge that is also a word with further branches', () => {
    const root = buildRadix(['car', 'card', 'care']);
    expect(Object.keys(root.children)).toEqual(['car']);
    const car = root.children.car;
    expect(car.end).toBe(true);
    expect(Object.keys(car.children).sort()).toEqual(['d', 'e']);
  });
});

describe('trie-engine · layoutTrie / layoutRadix', () => {
  const words = ['cat', 'car', 'card', 'dog', 'do'];

  it('emits one node per trie node and a tree of edges', () => {
    const trie = buildTrie(words);
    const { nodes, edges } = layoutTrie(trie);
    expect(nodes).toHaveLength(countNodes(trie));
    expect(edges).toHaveLength(nodes.length - 1); // a tree has nodes-1 edges
  });

  it('labels the root and gives every node screen coordinates', () => {
    const { nodes, w, h } = layoutTrie(buildTrie(words));
    const root = nodes.find((n) => n.isRoot);
    expect(root.id).toBe('·root');
    expect(w).toBeGreaterThan(0);
    expect(h).toBeGreaterThan(0);
    for (const n of nodes) {
      expect(Number.isFinite(n.px)).toBe(true);
      expect(Number.isFinite(n.py)).toBe(true);
    }
  });

  it('is deterministic', () => {
    expect(layoutTrie(buildTrie(words))).toEqual(layoutTrie(buildTrie(words)));
  });

  it('layoutRadix lays out the compressed tree', () => {
    const { nodes } = layoutRadix(buildRadix(words));
    expect(nodes.length).toBe(countNodes(buildRadix(words)));
  });
});
