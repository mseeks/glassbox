/**
 * The Swarm — BitTorrent engine. Pure logic, no React, no DOM, no JSX.
 *
 * Extracted from Torrents.jsx so every mechanism the lesson teaches can be
 * unit-tested and reused independently of the render code. Everything here is
 * deterministic given its inputs (the one source of randomness, mulberry32, is
 * a seeded PRNG; the live swarm step that uses Math.random stays in the view).
 *
 *   sha256hex / sha   — real SHA-256, validated against NIST vectors. Every
 *                       fingerprint, infohash and Merkle hash in the lesson is
 *                       a real hash of real bytes.
 *   mulberry32        — seeded PRNG; makes the network / starfield reproducible.
 *   DBITS / DMASK     — the 24-bit toy address space the DHT lives in.
 *   dxor / sharedPrefix / hex6 / bin24 — Kademlia XOR-metric helpers.
 *   buildNetwork / dhtLookup — the "getting warmer" iterative lookup showpiece.
 *   serverPP / swarmPerPeer — the server-vs-swarm bandwidth model (the inversion).
 *   initSwarm         — the constellation lab's seeded starting holdings.
 *   diffChars         — the per-character hash diff (avalanche effect).
 *   chokeState        — tit-for-tat: 3 reciprocal + 1 rotating optimistic slot.
 *   pieceAvailability / pickPiece — rarest-first vs in-order piece selection.
 *   buildMerkle / merkleProof — the v2 Merkle tree over piece hashes.
 *   example datasets  — the named pieces, neighbours, peer holdings, magnet steps.
 */

/* ── real SHA-256 (validated against NIST vectors) ───────────────────────── */

// Hash raw bytes → a 64-char lowercase hex digest. A faithful, dependency-free
// SHA-256: message schedule, eight working variables, the 64 round constants.
export function sha256hex(bytes) {
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  let h0 = 0x6a09e667,
    h1 = 0xbb67ae85,
    h2 = 0x3c6ef372,
    h3 = 0xa54ff53a,
    h4 = 0x510e527f,
    h5 = 0x9b05688c,
    h6 = 0x1f83d9ab,
    h7 = 0x5be0cd19;
  const l = bytes.length,
    withOne = l + 1,
    k = ((56 - (withOne % 64) + 64) % 64) + 0,
    total = withOne + k + 8;
  const m = new Uint8Array(total);
  m.set(bytes);
  m[l] = 0x80;
  const dv = new DataView(m.buffer);
  const bitLen = l * 8;
  dv.setUint32(total - 4, bitLen >>> 0);
  dv.setUint32(total - 8, Math.floor(bitLen / 0x100000000));
  const w = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let a = h0,
      b = h1,
      c = h2,
      d = h3,
      e = h4,
      f = h5,
      g = h6,
      h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }
    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((x) => (x >>> 0).toString(16).padStart(8, '0'))
    .join('');
}

// Hash a UTF-8 string → 64-char hex digest. The convenience hasher the labs use.
export const sha = (s) => sha256hex(new TextEncoder().encode(s));

/* ── seeded PRNG ─────────────────────────────────────────────────────────── */

// A small, fast, seedable PRNG. Returns a function producing floats in [0, 1).
// Used to make the DHT network, the swarm seeding and the starfield reproducible.
export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── DHT engine (Kademlia XOR metric + iterative lookup) ─────────────────── */

// The toy address space is 24 bits wide: small enough to draw, large enough to
// show the logarithmic "getting warmer" shape.
export const DBITS = 24;
export const DMASK = (1 << DBITS) - 1;

// XOR distance, masked to the address space. Distance zero == same id.
export const dxor = (a, b) => (a ^ b) & DMASK;

// Count the leading bits two ids share (the warmth of the search). The first
// differing bit ends the run; a perfect match shares all DBITS bits.
export function sharedPrefix(a, b) {
  let x = (a ^ b) & DMASK,
    n = 0;
  for (let bit = DBITS - 1; bit >= 0; bit--) {
    if ((x >>> bit) & 1) break;
    n++;
  }
  return n;
}

// id → 6-hex-char catalog designation (24 bits = 6 nibbles).
export const hex6 = (x) => (x & DMASK).toString(16).padStart(6, '0');

// id → its 24-bit binary string (for the "getting warmer" bit rows).
export const bin24 = (x) => (x & DMASK).toString(2).padStart(DBITS, '0');

// Build a network of `n` distinct random nodes, each carrying a routing table
// (a flat contact list) that is dense for nearby prefixes and sparse far away:
// at most `perBucket` contacts per shared-prefix length. Deterministic in `seed`.
export function buildNetwork(seed, n, perBucket) {
  const rng = mulberry32(seed);
  const ids = [];
  const seen = new Set();
  while (ids.length < n) {
    const id = Math.floor(rng() * (DMASK + 1)) & DMASK;
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  const table = new Map();
  for (const self of ids) {
    const buckets = Array.from({ length: DBITS + 1 }, () => []);
    for (const p of ids) {
      if (p === self) continue;
      const b = sharedPrefix(self, p);
      if (buckets[b].length < perBucket) buckets[b].push(p);
    }
    table.set(self, buckets.flat());
  }
  return { ids, table };
}

// Iterative Kademlia lookup: from `start`, query the `alpha` closest unqueried
// nodes each round, merge in their contacts, keep the `k` closest to `target`,
// and stop when a round fails to make progress. Records one `hop` per round so
// the UI can replay the convergence step by step.
export function dhtLookup(net, start, target, alpha = 1, k = 8) {
  const { table } = net;
  const byD = (a, b) => dxor(a, target) - dxor(b, target);
  const queried = new Set();
  let shortlist = [start, ...(table.get(start) || [])].sort(byD);
  let bestDist = dxor(shortlist[0], target);
  const hops = [
    {
      round: -1,
      best: shortlist[0],
      bestDist,
      prefix: sharedPrefix(shortlist[0], target),
      queried: [],
      shortlist: shortlist.slice(0, k),
    },
  ];
  for (let r = 0; r < 40; r++) {
    const toQuery = shortlist.filter((x) => !queried.has(x)).slice(0, alpha);
    if (!toQuery.length) break;
    for (const node of toQuery) {
      queried.add(node);
      const found = table.get(node) || [];
      shortlist = Array.from(new Set([...shortlist, ...found]))
        .sort(byD)
        .slice(0, 16);
    }
    const nd = dxor(shortlist[0], target);
    hops.push({
      round: r,
      best: shortlist[0],
      bestDist: nd,
      prefix: sharedPrefix(shortlist[0], target),
      queried: [...toQuery],
      shortlist: shortlist.slice(0, k),
    });
    if (nd >= bestDist) break;
    bestDist = nd;
  }
  return { hops, closest: shortlist.slice(0, k), contacted: queried.size };
}

// Derive a key id from a seed (a "new catalog designation" the lab navigates to).
export const keyFromSeed = (seed) => Math.floor(mulberry32(seed)() * (DMASK + 1)) & DMASK;

/* ── the inversion: server vs swarm bandwidth model ──────────────────────── */

// Each peer's own link tops out here (MB/s); the lone server's total pipe; and
// what each peer also contributes upward once it holds a piece.
export const DOWNLINK = 25;
export const SERVER_CAP = 120;
export const PEER_UP = 8;

// One server splitting a fixed pipe N ways: each downloader gets the smaller of
// its own link and the server's share — and the share shrinks toward zero.
export function serverPP(n) {
  return Math.min(DOWNLINK, SERVER_CAP / n);
}

// A swarm: total supply grows with the crowd (one seed at full cap, plus every
// other peer uploading), so the per-peer rate holds steady instead of starving.
export function swarmPerPeer(n) {
  const supply = SERVER_CAP + (n - 1) * PEER_UP; // total MB/s available to the swarm
  return Math.min(DOWNLINK, supply / n);
}

// Swarm-wide throughput under each model — what the readout's "swarm total" shows.
export const serverTotal = (n) => Math.min(SERVER_CAP, n * DOWNLINK);
export const swarmTotal = (n) => Math.min(n * DOWNLINK, SERVER_CAP + (n - 1) * PEER_UP);

/* ── the constellation: a swarm's starting holdings ──────────────────────── */

// How many pieces the example file is split into for the swarm lab.
export const PIECES = 8;

// Fixed node positions for the constellation; node 0 is "you", nodes 1 & 2 seed.
export const NODE_POS = [
  { x: 250, y: 185, you: true },
  { x: 110, y: 90 },
  { x: 400, y: 90 },
  { x: 70, y: 250 },
  { x: 440, y: 255 },
  { x: 185, y: 60 },
  { x: 330, y: 60 },
  { x: 160, y: 300 },
  { x: 355, y: 300 },
  { x: 480, y: 160 },
  { x: 30, y: 160 },
];

// Seed the swarm: nodes 1 & 2 hold the full file, "you" start empty, the rest
// hold a random partial scatter of pieces. Deterministic in `seed`.
export function initSwarm(seed) {
  const r = mulberry32(seed);
  return NODE_POS.map((p, i) => {
    let have;
    if (i === 1 || i === 2)
      have = PIECES; // two seeders
    else if (p.you)
      have = 0; // you start empty
    else have = Math.floor(r() * 4); // leechers, partial
    const bits = Array.from({ length: PIECES }, (_, k) => k < have);
    // shuffle which pieces (except seeders / empty / full)
    if (have < PIECES && have > 0) {
      const idx = [...Array(PIECES).keys()].sort(() => r() - 0.5);
      for (let k = 0; k < PIECES; k++) bits[k] = idx.indexOf(k) < have;
    }
    return { ...p, bits, seed: have === PIECES };
  });
}

/* ── content addressing: per-character hash diff ─────────────────────────── */

// Compare the received digest `b` against the expected digest `a` character by
// character. Returns one entry per char of `b` with a `same` flag, so the view
// can paint the avalanche of differences without any layout logic of its own.
export function diffChars(a, b) {
  const out = [];
  for (let i = 0; i < b.length; i++) out.push({ ch: b[i], same: a[i] === b[i] });
  return out;
}

// The piece text the integrity lab verifies, plus the other pieces whose
// fingerprints fold into the example infohash.
export const ORIG_PIECE =
  'Ubuntu 24.04 LTS — desktop image — block 0x104C : the boot sector and partition table.';
export const OTHER_PIECES = [
  'GRUB stage loads the kernel from the initrd image.',
  'Casper live filesystem squashfs, compressed.',
  'Release signature & GPG checksum manifest.',
];

// The infohash of a .torrent is the hash of all its piece-fingerprints together.
// Change one received piece and this name shifts too.
export function infohashOf(receivedPiece) {
  const ph = [sha(receivedPiece), ...OTHER_PIECES.map(sha)];
  return sha(ph.join('|'));
}

// Flip one byte of `text` deterministically (the lab's "corrupt a byte" button,
// which uses a fixed offset so the demo is repeatable, not random).
export function corruptByte(text) {
  const arr = text.split('');
  const i = Math.floor(text.length * 0.42);
  const c = arr[i];
  arr[i] = c === 'e' ? '3' : c === ' ' ? '_' : c.charCodeAt(0) % 2 ? 'x' : 'q';
  return arr.join('');
}

/* ── tit-for-tat: choking & optimistic unchoking ─────────────────────────── */

// How fast each generosity level feeds you (MB/s), and its label.
export const GIVE_RATE = [0, 2, 6];
export const GIVE_LABEL = ['none', 'low', 'high'];
// The named neighbours in the choking economy.
export const NEIGHBORS = ['orion', 'vega', 'rigel', 'lyra', 'mira', 'atlas'];

// Tit-for-tat with four upload slots: reward the three peers feeding you fastest
// (ties broken by index), choke the rest, and hand one rotating "optimistic"
// slot to a choked peer chosen by `round`. Returns the per-peer status, the set
// of unchoked indices, and the total rate you receive from them this round.
export function chokeState(give, round) {
  const order = give.map((g, i) => ({ g, i })).sort((a, b) => b.g - a.g || a.i - b.i);
  const top3 = new Set(order.slice(0, 3).map((o) => o.i));
  const eligible = order.slice(3).map((o) => o.i);
  const optimistic = eligible.length ? eligible[round % eligible.length] : -1;
  const unchoked = new Set([...top3, optimistic].filter((i) => i >= 0));
  const received = [...unchoked].reduce((s, i) => s + GIVE_RATE[give[i]], 0);
  const statusOf = (i) => (top3.has(i) ? 'reciprocal' : i === optimistic ? 'optimistic' : 'choked');
  return { order, top3, optimistic, unchoked, received, statusOf };
}

/* ── rarest-first piece selection ────────────────────────────────────────── */

// Total pieces in the rarest-first file, who holds what, and what you start with.
export const RP = 12;
export const PEER_HOLD = [
  [0, 1, 2, 3, 9], // peer 0 — the ONLY holder of the rare piece 9
  [0, 1, 2, 4, 5],
  [1, 2, 5, 6, 7],
  [3, 4, 6, 8, 10],
  [0, 5, 7, 8, 11],
];
export const YOU_START = [0, 1];

// How many copies of each piece exist across the swarm right now: every living
// peer's holdings, plus the pieces you yourself hold.
export function pieceAvailability(you, alive) {
  const a = Array(RP).fill(0);
  PEER_HOLD.forEach((h, i) => {
    if (alive[i]) h.forEach((p) => a[p]++);
  });
  you.forEach((has, p) => {
    if (has) a[p]++;
  });
  return a;
}

// Choose the next piece to fetch from those you lack and someone still has.
// 'order' takes the lowest index (in-order, naive); 'rarest' takes the piece the
// fewest peers hold — spreading scarce pieces before their holder vanishes.
// Returns the chosen index, or null when nothing is grabbable.
export function pickPiece(you, avail, strategy) {
  const lack = [...Array(RP).keys()].filter((p) => !you[p] && avail[p] > 0);
  if (!lack.length) return null;
  if (strategy === 'order') return lack[0];
  let pick = lack[0],
    m = Infinity;
  for (const p of lack) {
    if (avail[p] < m) {
      m = avail[p];
      pick = p;
    }
  }
  return pick;
}

// The initial "you" holdings vector for the rarest-first lab.
export const initRarestYou = () => {
  const a = Array(RP).fill(false);
  YOU_START.forEach((p) => (a[p] = true));
  return a;
};

/* ── v2: the Merkle tree over piece hashes ───────────────────────────────── */

// The named pieces the v2 example file is split into (a power of two: 8 leaves).
export const V2_PIECES = [
  'boot.img·blk0',
  'kernel·blk1',
  'initrd·blk2',
  'squashfs·blk3',
  'squashfs·blk4',
  'locale·blk5',
  'drivers·blk6',
  'sig·blk7',
];

// Build the Merkle tree bottom-up over `pieces`: hash each piece into a leaf,
// then pairwise-hash up to a single root that commits to the whole file.
// Returns { leaf, l1, l2, root } for an 8-leaf tree.
export function buildMerkle(pieces = V2_PIECES) {
  const leaf = pieces.map(sha);
  const l1 = [0, 1, 2, 3].map((j) => sha(leaf[2 * j] + leaf[2 * j + 1]));
  const l2 = [0, 1].map((j) => sha(l1[2 * j] + l1[2 * j + 1]));
  const root = sha(l2[0] + l2[1]);
  return { leaf, l1, l2, root };
}

// The authentication path for leaf `sel`: the sibling at each level you fold in
// to rebuild the root, plus the indices the view highlights (path & sibling per
// level). For 8 leaves the proof is three hashes regardless of which piece.
export function merkleProof(tree, sel) {
  const pathLeaf = sel,
    pathL1 = sel >> 1,
    pathL2 = sel >> 2;
  const sibLeaf = sel ^ 1,
    sibL1 = (sel >> 1) ^ 1,
    sibL2 = (sel >> 2) ^ 1;
  const siblings = [
    { lvl: 'leaf', h: tree.leaf[sibLeaf] },
    { lvl: 'level 1', h: tree.l1[sibL1] },
    { lvl: 'level 2', h: tree.l2[sibL2] },
  ];
  return {
    pathLeaf,
    pathL1,
    pathL2,
    sibLeaf,
    sibL1,
    sibL2,
    siblings,
    root: tree.root,
  };
}

// The infohash of the v2 example torrent (the magnet-resolve walkthrough's name).
export const V2_INFOHASH = sha('ubuntu-24.04.1-desktop-amd64 · v2 info dictionary');

// The five steps of resolving a magnet link from nothing but a hash. Icons are
// chosen in the view; the engine carries only the text and the mono one-liner.
export const magnetSteps = (ih = V2_INFOHASH) => [
  {
    icon: 'magnet',
    t: 'You have only a magnet link',
    d: 'No .torrent file — just an infohash: a single self-certifying name.',
    // v2 magnets carry the SHA-256 infohash as a multihash under urn:btmh
    // (1220 = the multihash prefix for a 32-byte SHA-256), not the v1 urn:btih.
    mono: `magnet:?xt=urn:btmh:1220${ih.slice(0, 32)}…`,
  },
  {
    icon: 'compass',
    t: 'Ask the distributed hash table',
    d: 'A handful of hops land on the nodes nearest that infohash; they return peers in the swarm.',
    mono: `lookup ${ih.slice(0, 12)}… → ~5 hops → peers`,
  },
  {
    icon: 'share',
    t: 'Fetch the metadata from peers',
    d: 'The piece list and Merkle root arrive from peers — treated as its own tiny torrent.',
    mono: 'info-dict: pieces[], merkle root, sizes',
  },
  {
    icon: 'verify',
    t: 'Verify before trusting a byte',
    d: 'Hash the metadata you received and check it equals the infohash you started with.',
    mono: 'sha256(metadata) == infohash  ✓',
  },
  {
    icon: 'pieces',
    t: 'Download & verify each piece',
    d: 'Every piece is checked against the Merkle root; any mismatch is discarded and re-fetched.',
    mono: 'piece k ▸ proof ▸ root ✓ ▸ keep',
  },
];
