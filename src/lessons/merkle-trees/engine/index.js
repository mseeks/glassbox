/**
 * Merkle tree construction + inclusion proofs — pure functions, no React.
 *
 * Extracted from MerkleTreesLesson.jsx so the engine can be unit tested and
 * reused (the lesson imports these to keep its render code thin). Real systems
 * use SHA-256/BLAKE3; here the digest is rendered to 12 hex chars so the trees
 * stay readable — the structure (domain separation, odd-node duplication,
 * authentication paths) is faithful.
 *
 *   digestParts / hashHex — fast non-cryptographic 12-hex-char digest.
 *   LEAF_TAG / NODE_TAG   — domain-separation prefixes: leaves and internal
 *                           nodes hash *differently* (second-preimage defence).
 *   hashLeaf / hashNode   — tagged hashers.
 *   buildTree             — bottom-up levels; levels[0] = leaves. Odd nodes
 *                           duplicate themselves to pair up.
 *   treeRoot              — the single root hash that vouches for everything.
 *   authPath              — sibling hashes a verifier needs to climb from a
 *                           leaf to the root: [{level, siblingIdx, side, selfIdx}].
 */

function digestParts(str) {
  let h1 = 0xdeadbeef ^ str.length;
  let h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return [h1 >>> 0, h2 >>> 0];
}

export function hashHex(str) {
  const [a, b] = digestParts(str);
  return (a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0')).slice(0, 12);
}

// domain-separated hashers: leaves and internal nodes hash *differently*.
const LEAF_TAG = '\u0000';
const NODE_TAG = '\u0001';
export const hashLeaf = (data, separated = true) => hashHex((separated ? LEAF_TAG : '') + data);
export const hashNode = (l, r, separated = true) => hashHex((separated ? NODE_TAG : '') + l + r);

// Build levels bottom-up. levels[0] = leaves. Each node: {hash, kind, data?, l?, r?}
export function buildTree(leafData, { separated = true } = {}) {
  const leaves = leafData.map((d, i) => ({
    hash: hashLeaf(d, separated),
    kind: 'leaf',
    data: d,
    idx: i,
  }));
  const levels = [leaves];
  let cur = leaves;
  while (cur.length > 1) {
    const next = [];
    for (let i = 0; i < cur.length; i += 2) {
      const left = cur[i];
      const right = cur[i + 1] !== undefined ? cur[i + 1] : cur[i]; // duplicate if odd
      next.push({
        hash: hashNode(left.hash, right.hash, separated),
        kind: 'node',
        l: i,
        r: cur[i + 1] !== undefined ? i + 1 : i,
      });
    }
    levels.push(next);
    cur = next;
  }
  return levels;
}

export const treeRoot = (levels) => levels[levels.length - 1][0].hash;

// authentication path for a leaf index: list of {level, siblingIdx, side}
export function authPath(levels, leafIdx) {
  const path = [];
  let idx = leafIdx;
  for (let L = 0; L < levels.length - 1; L++) {
    const sib = idx ^ 1;
    const sibExists = sib < levels[L].length;
    path.push({
      level: L,
      siblingIdx: sibExists ? sib : idx, // duplicate-self if no sibling
      side: idx % 2 === 0 ? 'right' : 'left', // sibling is on this side
      selfIdx: idx,
    });
    idx = idx >> 1;
  }
  return path;
}
