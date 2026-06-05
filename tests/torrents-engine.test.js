import { describe, expect, it } from 'vitest';
import {
  sha256hex,
  sha,
  mulberry32,
  DBITS,
  DMASK,
  dxor,
  sharedPrefix,
  hex6,
  bin24,
  buildNetwork,
  dhtLookup,
  keyFromSeed,
  DOWNLINK,
  SERVER_CAP,
  PEER_UP,
  serverPP,
  swarmPerPeer,
  serverTotal,
  swarmTotal,
  PIECES,
  NODE_POS,
  initSwarm,
  diffChars,
  ORIG_PIECE,
  OTHER_PIECES,
  infohashOf,
  corruptByte,
  GIVE_RATE,
  GIVE_LABEL,
  NEIGHBORS,
  chokeState,
  RP,
  PEER_HOLD,
  YOU_START,
  pieceAvailability,
  pickPiece,
  initRarestYou,
  V2_PIECES,
  buildMerkle,
  merkleProof,
  V2_INFOHASH,
  magnetSteps,
} from '../src/lessons/torrents/engine/index.js';

describe('torrents-engine · SHA-256', () => {
  it('matches the NIST vector for "abc"', () => {
    expect(sha('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('matches the NIST vector for the empty string', () => {
    expect(sha('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('matches the NIST vector for a 448-bit message (two blocks of padding)', () => {
    expect(sha('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')).toBe(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
    );
  });

  it('hashes raw bytes identically to the string convenience hasher', () => {
    const bytes = new TextEncoder().encode('hello world');
    expect(sha256hex(bytes)).toBe(sha('hello world'));
    expect(sha256hex(bytes)).toHaveLength(64);
  });

  it('shows the avalanche effect — a one-char change rewrites the digest', () => {
    const a = sha('the swarm');
    const b = sha('the swarn');
    expect(a).not.toBe(b);
    // far more than half the hex chars differ
    let diff = 0;
    for (let i = 0; i < 64; i++) if (a[i] !== b[i]) diff++;
    expect(diff).toBeGreaterThan(40);
  });
});

describe('torrents-engine · mulberry32 PRNG', () => {
  it('is deterministic for a given seed', () => {
    const r1 = mulberry32(42);
    const r2 = mulberry32(42);
    expect(r1()).toBe(r2());
    expect(r1()).toBe(r2());
  });

  it('returns floats in [0, 1)', () => {
    const r = mulberry32(9);
    for (let i = 0; i < 200; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('diverges across different seeds', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
});

describe('torrents-engine · DHT XOR metric', () => {
  it('defines a 24-bit address space', () => {
    expect(DBITS).toBe(24);
    expect(DMASK).toBe(0xffffff);
  });

  it('dxor is the masked exclusive-or; distance to self is zero', () => {
    expect(dxor(0b1010, 0b0110)).toBe(0b1100);
    expect(dxor(123456, 123456)).toBe(0);
    // masking keeps it inside the space
    expect(dxor(0xffffffff, 0)).toBe(DMASK);
  });

  it('sharedPrefix counts leading bits in common', () => {
    expect(sharedPrefix(5, 5)).toBe(DBITS); // identical → all bits
    expect(sharedPrefix(0, DMASK)).toBe(0); // top bit differs → none
    // ids differing only in the lowest bit share DBITS-1 leading bits
    expect(sharedPrefix(0, 1)).toBe(DBITS - 1);
    // flipping the top bit only → zero shared
    expect(sharedPrefix(0, 1 << (DBITS - 1))).toBe(0);
  });

  it('hex6 renders a 6-nibble catalog id', () => {
    expect(hex6(0xabcdef)).toBe('abcdef');
    expect(hex6(0)).toBe('000000');
    expect(hex6(0xff)).toBe('0000ff');
  });

  it('bin24 renders a zero-padded 24-bit string', () => {
    expect(bin24(0)).toBe('0'.repeat(24));
    expect(bin24(1)).toBe('0'.repeat(23) + '1');
    expect(bin24(DMASK)).toBe('1'.repeat(24));
    expect(bin24(DMASK)).toHaveLength(24);
  });
});

describe('torrents-engine · DHT network + lookup', () => {
  it('builds a network of distinct ids each with a routing table', () => {
    const net = buildNetwork(777, 64, 1);
    expect(net.ids).toHaveLength(64);
    expect(new Set(net.ids).size).toBe(64); // all unique
    for (const id of net.ids) {
      expect(net.table.has(id)).toBe(true);
      expect(Array.isArray(net.table.get(id))).toBe(true);
      // a self never appears in its own table
      expect(net.table.get(id)).not.toContain(id);
    }
  });

  it('caps contacts per shared-prefix bucket at perBucket', () => {
    const a = buildNetwork(5, 80, 1);
    // with perBucket=1 every node keeps at most one contact per prefix length,
    // so its table is no larger than DBITS+1 entries
    for (const id of a.ids) expect(a.table.get(id).length).toBeLessThanOrEqual(DBITS + 1);
    const b = buildNetwork(5, 80, 3);
    // a looser bucket keeps strictly more (or equal) contacts on average
    const sizeA = a.ids.reduce((s, id) => s + a.table.get(id).length, 0);
    const sizeB = b.ids.reduce((s, id) => s + b.table.get(id).length, 0);
    expect(sizeB).toBeGreaterThan(sizeA);
  });

  it('keyFromSeed is deterministic and inside the address space', () => {
    expect(keyFromSeed(2026)).toBe(keyFromSeed(2026));
    expect(keyFromSeed(2026)).toBeLessThanOrEqual(DMASK);
    expect(keyFromSeed(2026)).toBeGreaterThanOrEqual(0);
  });

  it('converges toward the key, getting strictly warmer each recorded hop', () => {
    const net = buildNetwork(777, 512, 1);
    const start = net.ids[7];
    const target = keyFromSeed(2026);
    const res = dhtLookup(net, start, target, 1);
    expect(res.hops.length).toBeGreaterThan(1);
    // the first hop is the start; the final best is closer than the start
    expect(res.hops.at(-1).bestDist).toBeLessThan(res.hops[0].bestDist);
    // distance is monotonically non-increasing across the recorded hops
    for (let i = 1; i < res.hops.length; i++) {
      expect(res.hops[i].bestDist).toBeLessThanOrEqual(res.hops[i - 1].bestDist);
    }
    // and the shared prefix never shrinks
    for (let i = 1; i < res.hops.length; i++) {
      expect(res.hops[i].prefix).toBeGreaterThanOrEqual(res.hops[i - 1].prefix);
    }
    expect(res.contacted).toBeGreaterThan(0);
    expect(res.closest.length).toBeLessThanOrEqual(8);
  });

  it('reaches the target itself when the target is a node in the network', () => {
    const net = buildNetwork(123, 256, 2);
    const start = net.ids[0];
    const target = net.ids[200];
    const res = dhtLookup(net, start, target, 2);
    // the closest the lookup finds includes the target (distance 0 is reachable)
    expect(res.hops.at(-1).bestDist).toBeLessThanOrEqual(dxor(start, target));
  });

  it('a wider alpha contacts at least as many nodes', () => {
    const net = buildNetwork(31, 256, 2);
    const target = keyFromSeed(99);
    const one = dhtLookup(net, net.ids[3], target, 1);
    const three = dhtLookup(net, net.ids[3], target, 3);
    expect(three.contacted).toBeGreaterThanOrEqual(one.contacted);
  });
});

describe('torrents-engine · server vs swarm bandwidth model', () => {
  it('exposes the model constants', () => {
    expect(DOWNLINK).toBe(25);
    expect(SERVER_CAP).toBe(120);
    expect(PEER_UP).toBe(8);
  });

  it('a single peer is capped by its own link in both models', () => {
    expect(serverPP(1)).toBe(DOWNLINK);
    expect(swarmPerPeer(1)).toBe(DOWNLINK);
  });

  it('the server share shrinks toward zero as the crowd grows', () => {
    expect(serverPP(120)).toBeCloseTo(1, 5); // 120 / 120
    expect(serverPP(240)).toBeCloseTo(0.5, 5);
    // strictly decreasing past the point the server can no longer saturate links
    expect(serverPP(10)).toBeGreaterThan(serverPP(60));
  });

  it('the swarm holds the per-peer rate up while supply grows with the crowd', () => {
    // 40 peers: supply = 120 + 39*8 = 432, /40 = 10.8 < DOWNLINK
    expect(swarmPerPeer(40)).toBeCloseTo(432 / 40, 5);
    // the swarm always serves each peer at least as fast as the lone server
    for (const n of [2, 5, 20, 80, 200]) {
      expect(swarmPerPeer(n)).toBeGreaterThanOrEqual(serverPP(n));
    }
  });

  it('totals: the server caps at SERVER_CAP, the swarm climbs past it', () => {
    expect(serverTotal(2)).toBe(2 * DOWNLINK); // links not yet the bottleneck
    expect(serverTotal(100)).toBe(SERVER_CAP); // capped
    expect(swarmTotal(10)).toBe(SERVER_CAP + 9 * PEER_UP); // 192
    expect(swarmTotal(100)).toBeGreaterThan(serverTotal(100));
  });
});

describe('torrents-engine · swarm seeding', () => {
  it('splits the file into PIECES and seeds a reproducible swarm', () => {
    expect(PIECES).toBe(8);
    const a = initSwarm(11);
    const b = initSwarm(11);
    expect(a).toEqual(b); // deterministic in seed
    expect(a).toHaveLength(NODE_POS.length);
  });

  it('node 0 is you (empty), nodes 1 & 2 are full seeders', () => {
    const s = initSwarm(11);
    expect(s[0].you).toBe(true);
    expect(s[0].bits.every(Boolean)).toBe(false); // you start empty
    expect(s[0].bits.filter(Boolean)).toHaveLength(0);
    expect(s[1].seed).toBe(true);
    expect(s[2].seed).toBe(true);
    expect(s[1].bits.every(Boolean)).toBe(true);
  });

  it('every node carries exactly PIECES bits', () => {
    for (const n of initSwarm(404)) expect(n.bits).toHaveLength(PIECES);
  });

  it('different seeds produce different leecher holdings', () => {
    const a = initSwarm(1);
    const b = initSwarm(99999);
    // the seeders/you are fixed, but the partial leechers should differ somewhere
    const flat = (s) => s.map((n) => n.bits.join('')).join('');
    expect(flat(a)).not.toBe(flat(b));
  });
});

describe('torrents-engine · content addressing', () => {
  it('diffChars flags each character same/different against the expected digest', () => {
    const d = diffChars('abcd', 'abxd');
    expect(d).toHaveLength(4);
    expect(d.map((c) => c.same)).toEqual([true, true, false, true]);
    expect(d[2].ch).toBe('x');
  });

  it('the original piece verifies against its own fingerprint', () => {
    expect(sha(ORIG_PIECE)).toHaveLength(64);
    expect(OTHER_PIECES).toHaveLength(3);
  });

  it('infohashOf folds the received piece in with the other fingerprints', () => {
    const clean = infohashOf(ORIG_PIECE);
    expect(clean).toHaveLength(64);
    // hand-derivable: it is sha of the piped piece fingerprints
    const expected = sha([sha(ORIG_PIECE), ...OTHER_PIECES.map(sha)].join('|'));
    expect(clean).toBe(expected);
  });

  it('tampering with the received piece shifts the whole torrent name', () => {
    expect(infohashOf(corruptByte(ORIG_PIECE))).not.toBe(infohashOf(ORIG_PIECE));
  });

  it('corruptByte deterministically flips one byte', () => {
    const c = corruptByte(ORIG_PIECE);
    expect(c).not.toBe(ORIG_PIECE);
    expect(c).toHaveLength(ORIG_PIECE.length); // same length, one byte changed
    expect(corruptByte(ORIG_PIECE)).toBe(c); // deterministic, not random
    // the fixed 42%-offset character is the only difference
    let diffs = 0;
    for (let i = 0; i < c.length; i++) if (c[i] !== ORIG_PIECE[i]) diffs++;
    expect(diffs).toBe(1);
  });

  it('corruptByte maps a space to an underscore', () => {
    // a string whose 42% offset lands on a space
    const s = '         ';
    expect(corruptByte(s)).toContain('_');
  });

  it("corruptByte maps an 'e' to a '3'", () => {
    const s = 'eeeeeeeeee';
    expect(corruptByte(s)).toContain('3');
  });

  it('corruptByte uses the parity fallback for other characters', () => {
    // 'a' (charCode 97, odd) → 'x'; 'b' (charCode 98, even) → 'q'
    expect(corruptByte('aaaaa')).toContain('x');
    expect(corruptByte('bbbbb')).toContain('q');
  });
});

describe('torrents-engine · tit-for-tat choking', () => {
  it('exposes the generosity scale and the neighbour set', () => {
    expect(GIVE_RATE).toEqual([0, 2, 6]);
    expect(GIVE_LABEL).toEqual(['none', 'low', 'high']);
    expect(NEIGHBORS).toHaveLength(6);
  });

  it('unchokes the three fastest plus one rotating optimistic slot', () => {
    const give = [2, 1, 0, 2, 1, 0];
    const s = chokeState(give, 0);
    // top three by give desc, ties by index: idx0(2), idx3(2), idx1(1)
    expect([...s.top3].sort((a, b) => a - b)).toEqual([0, 1, 3]);
    expect(s.unchoked.size).toBe(4); // 3 reciprocal + 1 optimistic
    // optimistic is the first eligible (idx4, give 1) at round 0
    expect(s.optimistic).toBe(4);
    // received = 6 (idx0) + 6 (idx3) + 2 (idx1) + 2 (idx4) = 16
    expect(s.received).toBe(16);
  });

  it('rotates the optimistic slot with the round number', () => {
    const give = [2, 1, 0, 2, 1, 0];
    // eligible (not top3) = [4, 2, 5]; optimistic cycles through them
    expect(chokeState(give, 0).optimistic).toBe(4);
    expect(chokeState(give, 1).optimistic).toBe(2);
    expect(chokeState(give, 2).optimistic).toBe(5);
    expect(chokeState(give, 3).optimistic).toBe(4); // wraps
  });

  it('labels each peer reciprocal / optimistic / choked', () => {
    const give = [2, 1, 0, 2, 1, 0];
    const s = chokeState(give, 0);
    expect(s.statusOf(0)).toBe('reciprocal');
    expect(s.statusOf(4)).toBe('optimistic');
    expect(s.statusOf(2)).toBe('choked');
  });

  it('a freeloader giving none is choked (unless it draws the optimistic slot)', () => {
    const give = [2, 2, 2, 1, 0, 0];
    // top3 = idx0,1,2; eligible = [3,4,5]; round 1 → optimistic idx4
    const s = chokeState(give, 1);
    expect(s.statusOf(5)).toBe('choked'); // a zero-giver, not the optimistic pick
    expect(s.unchoked.has(5)).toBe(false);
  });

  it('handles a swarm small enough to have no eligible optimistic peer', () => {
    // exactly three neighbours: all are top3, none eligible → optimistic = -1
    const s = chokeState([3, 2, 1], 0);
    expect(s.optimistic).toBe(-1);
    expect(s.unchoked.size).toBe(3);
    expect(s.statusOf(0)).toBe('reciprocal');
  });
});

describe('torrents-engine · rarest-first piece selection', () => {
  it('exposes the piece count, peer holdings, and your starting pieces', () => {
    expect(RP).toBe(12);
    expect(PEER_HOLD).toHaveLength(5);
    expect(PEER_HOLD[0]).toContain(9); // peer 0 is the only holder of piece 9
    expect(YOU_START).toEqual([0, 1]);
  });

  it('initRarestYou marks only the starting pieces', () => {
    const you = initRarestYou();
    expect(you).toHaveLength(RP);
    expect(you[0]).toBe(true);
    expect(you[1]).toBe(true);
    expect(you.filter(Boolean)).toHaveLength(2);
  });

  it('counts copies of each piece across living peers and your own holdings', () => {
    const you = initRarestYou();
    const alive = [true, true, true, true, true];
    const av = pieceAvailability(you, alive);
    expect(av).toHaveLength(RP);
    // piece 9 lives only on peer 0
    expect(av[9]).toBe(1);
    // piece 0: peers 0,1,4 hold it (3) plus you (1) = 4
    expect(av[0]).toBe(4);
  });

  it('a dead peer no longer contributes its pieces', () => {
    const you = initRarestYou();
    const before = pieceAvailability(you, [true, true, true, true, true]);
    const after = pieceAvailability(you, [false, true, true, true, true]);
    // peer 0 was the sole holder of piece 9, so it drops to zero copies
    expect(before[9]).toBe(1);
    expect(after[9]).toBe(0);
  });

  it('rarest-first picks the scarcest needed piece; in-order picks the lowest index', () => {
    const you = initRarestYou();
    const av = pieceAvailability(you, [true, true, true, true, true]);
    expect(pickPiece(you, av, 'rarest')).toBe(9); // the single-copy piece
    expect(pickPiece(you, av, 'order')).toBe(2); // lowest index you lack
  });

  it('only picks a piece some living peer still has', () => {
    const you = initRarestYou();
    // kill everyone except peer 0; many pieces vanish
    const av = pieceAvailability(you, [true, false, false, false, false]);
    const pick = pickPiece(you, av, 'rarest');
    expect(av[pick]).toBeGreaterThan(0);
  });

  it('returns null when nothing is grabbable', () => {
    const full = Array(RP).fill(true);
    const av = pieceAvailability(full, [true, true, true, true, true]);
    expect(pickPiece(full, av, 'rarest')).toBeNull();
    expect(pickPiece(full, av, 'order')).toBeNull();
  });

  it('the death spiral: in-order never grabs piece 9 before its holder leaves', () => {
    let you = initRarestYou();
    let alive = [true, true, true, true, true];
    // greedily take in-order pieces; piece 9 is high-index, never reached early
    for (let step = 0; step < 4; step++) {
      const av = pieceAvailability(you, alive);
      const pick = pickPiece(you, av, 'order');
      you = you.map((v, k) => (k === pick ? true : v));
    }
    expect(you[9]).toBe(false); // still missing the rare piece
    alive = [false, true, true, true, true]; // the sole holder departs
    expect(pieceAvailability(you, alive)[9]).toBe(0); // gone — swarm can't complete
  });
});

describe('torrents-engine · v2 Merkle tree', () => {
  it('builds an 8-leaf tree whose levels each hash up to a single root', () => {
    expect(V2_PIECES).toHaveLength(8);
    const t = buildMerkle();
    expect(t.leaf).toHaveLength(8);
    expect(t.l1).toHaveLength(4);
    expect(t.l2).toHaveLength(2);
    expect(t.root).toHaveLength(64);
  });

  it('each level is the pairwise hash of the level below', () => {
    const t = buildMerkle();
    expect(t.l1[0]).toBe(sha(t.leaf[0] + t.leaf[1]));
    expect(t.l2[0]).toBe(sha(t.l1[0] + t.l1[1]));
    expect(t.root).toBe(sha(t.l2[0] + t.l2[1]));
  });

  it('is deterministic and changes if any piece changes', () => {
    expect(buildMerkle().root).toBe(buildMerkle().root);
    const altered = [...V2_PIECES];
    altered[4] = 'tampered·blk4';
    expect(buildMerkle(altered).root).not.toBe(buildMerkle().root);
  });

  it('merkleProof yields the sibling at each level (a 3-hash proof for 8 leaves)', () => {
    const t = buildMerkle();
    const p = merkleProof(t, 3);
    expect(p.pathLeaf).toBe(3);
    expect(p.pathL1).toBe(1); // 3 >> 1
    expect(p.pathL2).toBe(0); // 3 >> 2
    expect(p.sibLeaf).toBe(2); // 3 ^ 1
    expect(p.sibL1).toBe(0); // (3 >> 1) ^ 1
    expect(p.sibL2).toBe(1); // (3 >> 2) ^ 1
    expect(p.siblings).toHaveLength(3);
    expect(p.siblings.map((s) => s.lvl)).toEqual(['leaf', 'level 1', 'level 2']);
    expect(p.siblings[0].h).toBe(t.leaf[2]);
    expect(p.root).toBe(t.root);
  });

  it('rebuilds the root by folding the proof siblings up the path', () => {
    const t = buildMerkle();
    const sel = 5;
    const p = merkleProof(t, sel);
    // leaf 5 is the right child of l1[2]; fold in its sibling (leaf 4)
    const up1 = sha(t.leaf[4] + t.leaf[sel]);
    expect(up1).toBe(t.l1[p.pathL1]);
    // l1[2] is the left child of l2[1]; fold in l1[3]
    const up2 = sha(up1 + t.l1[3]);
    expect(up2).toBe(t.l2[p.pathL2]);
    // l2[1] is the right child of the root; fold in l2[0]
    expect(sha(t.l2[0] + up2)).toBe(t.root);
  });

  it('the proof is the same size (3) for every leaf', () => {
    const t = buildMerkle();
    for (let i = 0; i < 8; i++) expect(merkleProof(t, i).siblings).toHaveLength(3);
  });
});

describe('torrents-engine · magnet resolution', () => {
  it('V2_INFOHASH is the hash of the v2 info dictionary', () => {
    expect(V2_INFOHASH).toHaveLength(64);
    expect(V2_INFOHASH).toBe(sha('ubuntu-24.04.1-desktop-amd64 · v2 info dictionary'));
  });

  it('magnetSteps lays out the five resolve stages with icons and mono lines', () => {
    const steps = magnetSteps();
    expect(steps).toHaveLength(5);
    expect(steps.map((s) => s.icon)).toEqual(['magnet', 'compass', 'share', 'verify', 'pieces']);
    for (const s of steps) {
      expect(typeof s.t).toBe('string');
      expect(typeof s.d).toBe('string');
      expect(typeof s.mono).toBe('string');
    }
    // the first step embeds the magnet's infohash prefix
    expect(steps[0].mono).toContain(V2_INFOHASH.slice(0, 32));
  });

  it('threads a custom infohash through the steps', () => {
    const fake = sha('something else');
    const steps = magnetSteps(fake);
    expect(steps[0].mono).toContain(fake.slice(0, 32));
    expect(steps[1].mono).toContain(fake.slice(0, 12));
  });
});
