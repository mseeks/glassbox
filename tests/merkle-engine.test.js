import { describe, expect, it } from 'vitest';
import {
  authPath,
  buildTree,
  hashHex,
  hashLeaf,
  hashNode,
  treeRoot,
} from '../src/lessons/merkle-trees/engine/index.js';

// A verifier climbs from a leaf to the root using only the sibling hashes the
// prover supplies — mirroring the lesson's fold (sibling side decides order).
function recomputeRoot(levels, leafIdx) {
  let selfH = levels[0][leafIdx].hash;
  for (const step of authPath(levels, leafIdx)) {
    const sibH = levels[step.level][step.siblingIdx].hash;
    const [l, r] = step.side === 'left' ? [sibH, selfH] : [selfH, sibH];
    selfH = hashNode(l, r);
  }
  return selfH;
}

describe('merkle-engine · hashing', () => {
  it('produces a deterministic 12-char hex digest', () => {
    expect(hashHex('alpha')).toMatch(/^[0-9a-f]{12}$/);
    expect(hashHex('alpha')).toBe(hashHex('alpha'));
  });

  it('avalanches: a one-character change yields a different digest', () => {
    expect(hashHex('alpha')).not.toBe(hashHex('alphb'));
  });

  it('domain-separates leaves from internal nodes', () => {
    // With separation on, a leaf hash is not the same as the raw hash...
    expect(hashLeaf('a')).not.toBe(hashHex('a'));
    // ...and turning separation off recovers the untagged hash.
    expect(hashLeaf('a', false)).toBe(hashHex('a'));
    // A node over two children is tagged differently from a leaf over the join.
    expect(hashNode('x', 'y')).not.toBe(hashLeaf('xy'));
  });
});

describe('merkle-engine · buildTree', () => {
  it('builds bottom-up levels with a single root', () => {
    const levels = buildTree(['a', 'b', 'c', 'd']);
    expect(levels).toHaveLength(3); // leaves, pairs, root
    expect(levels[0]).toHaveLength(4);
    expect(levels[1]).toHaveLength(2);
    expect(levels[2]).toHaveLength(1);
    expect(levels[0].every((n) => n.kind === 'leaf')).toBe(true);
    expect(levels[0].map((n) => n.data)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('duplicates the last node when a level has an odd count', () => {
    const levels = buildTree(['a', 'b', 'c']);
    expect(levels[0]).toHaveLength(3);
    // node built from leaf 2 pairs it with itself.
    expect(levels[1][1].l).toBe(2);
    expect(levels[1][1].r).toBe(2);
  });

  it('is deterministic', () => {
    expect(treeRoot(buildTree(['a', 'b', 'c', 'd']))).toBe(
      treeRoot(buildTree(['a', 'b', 'c', 'd'])),
    );
  });
});

describe('merkle-engine · inclusion proofs', () => {
  it('an authentication path has one step per tree level above the leaf', () => {
    const levels = buildTree(['a', 'b', 'c', 'd']);
    expect(authPath(levels, 0)).toHaveLength(2); // log2(4)
  });

  it('every leaf proof folds back to the root', () => {
    const data = ['alpha', 'bravo', 'charlie', 'delta', 'echo'];
    const levels = buildTree(data);
    const root = treeRoot(levels);
    for (let i = 0; i < data.length; i++) {
      expect(recomputeRoot(levels, i)).toBe(root);
    }
  });

  it('detects tampering: changing any leaf changes the root', () => {
    const clean = buildTree(['alpha', 'bravo', 'charlie', 'delta']);
    const tampered = buildTree(['alpha', 'bravo', 'charlie', 'DELTA']);
    expect(treeRoot(tampered)).not.toBe(treeRoot(clean));
    // And the old proof for an untouched leaf no longer reaches the new root.
    expect(recomputeRoot(clean, 0)).not.toBe(treeRoot(tampered));
  });

  it('proves a single-leaf tree trivially (root == leaf, empty path)', () => {
    const levels = buildTree(['only']);
    expect(levels).toHaveLength(1);
    expect(authPath(levels, 0)).toHaveLength(0);
    expect(treeRoot(levels)).toBe(hashLeaf('only'));
  });
});
