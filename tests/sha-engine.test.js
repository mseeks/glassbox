import { describe, expect, it } from 'vitest';
import {
  bitsToBoolArray,
  forgeExtension,
  glueBytes,
  padFor,
  popcountWords,
  rotr,
  sha256BlockStates,
  sha256Hex,
  sha256RoundStates,
  sha256Words,
  strBytes,
  wordsToHex,
} from '../src/lessons/sha/engine/index.js';

describe('sha-engine · NIST FIPS 180-4 vectors', () => {
  // Canonical SHA-256 test vectors.
  const VECTORS = {
    '': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    abc: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    // 56 bytes — exercises the two-block path (message + padding cross 64 bytes).
    abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq:
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
  };

  for (const [input, digest] of Object.entries(VECTORS)) {
    it(`hashes ${JSON.stringify(input).slice(0, 24)} correctly`, () => {
      expect(sha256Hex(input)).toBe(digest);
    });
  }

  it('digest is 64 lowercase hex chars', () => {
    expect(sha256Hex('zo')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('accepts raw bytes as well as strings', () => {
    expect(sha256Hex(strBytes('abc'))).toBe(sha256Hex('abc'));
  });

  it('is deterministic', () => {
    expect(sha256Hex('Glassbox')).toBe(sha256Hex('Glassbox'));
  });
});

describe('sha-engine · word arithmetic', () => {
  it('sha256Words returns eight 32-bit unsigned words', () => {
    const H = sha256Words(strBytes('abc'));
    expect(H).toHaveLength(8);
    for (const w of H) {
      expect(Number.isInteger(w)).toBe(true);
      expect(w).toBeGreaterThanOrEqual(0);
      expect(w).toBeLessThanOrEqual(0xffffffff);
    }
    expect(wordsToHex(H)).toBe(sha256Hex('abc'));
  });

  it('rotr rotates within 32 bits', () => {
    expect(rotr(0x00000001, 1)).toBe(0x80000000);
    expect(rotr(0x80000000, 31)).toBe(0x00000001);
    expect(rotr(0x12345678, 0)).toBe(0x12345678);
  });

  it('popcountWords counts set bits', () => {
    expect(popcountWords([0x00000000])).toBe(0);
    expect(popcountWords([0xffffffff])).toBe(32);
    expect(popcountWords([0xffffffff, 0xffffffff])).toBe(64);
    expect(popcountWords([0x0000000f, 0x1])).toBe(5);
  });

  it('bitsToBoolArray is big-endian, 32 bits per word', () => {
    const bits = bitsToBoolArray([0x80000001]);
    expect(bits).toHaveLength(32);
    expect(bits[0]).toBe(1); // most-significant bit
    expect(bits[31]).toBe(1); // least-significant bit
    expect(bits.slice(1, 31).every((b) => b === 0)).toBe(true);
  });
});

describe('sha-engine · padding & block structure', () => {
  it('padFor produces a message whose total length is a multiple of 64', () => {
    for (const len of [0, 1, 55, 56, 63, 64, 120]) {
      const bits = len * 8;
      const pad = padFor(len, Math.floor(bits / 0x100000000), bits >>> 0);
      expect((len + pad.length) % 64).toBe(0);
      expect(pad[0]).toBe(0x80); // padding always starts with the 1 bit
    }
  });

  it('sha256BlockStates reports the right block count and chain length', () => {
    const single = sha256BlockStates(strBytes('abc')); // < 56 bytes -> 1 block
    expect(single.nBlocks).toBe(1);
    expect(single.states).toHaveLength(2); // IV + one chained state
    expect(single.paddedLen % 64).toBe(0);

    const two = sha256BlockStates(strBytes('a'.repeat(56))); // forces a second block
    expect(two.nBlocks).toBe(2);
    expect(two.states).toHaveLength(3);

    // Final chained state must equal the published digest.
    expect(wordsToHex(single.states.at(-1))).toBe(sha256Hex('abc'));
  });

  it('sha256RoundStates yields 65 snapshots of eight words each', () => {
    const rounds = sha256RoundStates(strBytes('abc'));
    expect(rounds).toHaveLength(65); // round 0 (IV) .. round 64
    expect(rounds[0]).toHaveLength(8);
    expect(rounds[64]).toHaveLength(8);
  });
});

describe('sha-engine · avalanche', () => {
  it('a one-letter change flips roughly half the output bits', () => {
    const a = bitsToBoolArray(sha256Words(strBytes('abc')));
    const b = bitsToBoolArray(sha256Words(strBytes('abd')));
    let diff = 0;
    for (let i = 0; i < 256; i++) if (a[i] !== b[i]) diff++;
    // Strict diffusion: well clear of the tails. Expectation is ~128/256.
    expect(diff).toBeGreaterThan(96);
    expect(diff).toBeLessThan(160);
  });
});

describe('sha-engine · length-extension forgery', () => {
  // The headline vulnerability of naive secret-prefix MACs over a
  // Merkle-Damgård hash: knowing H(secret || msg) and |secret| is enough to
  // compute H(secret || msg || glue || ext) without ever seeing the secret.
  it('forges a valid digest without knowing the secret', () => {
    const secret = strBytes('SUPER_SECRET_KEY_32CHARS_LONG!!!');
    const msgBytes = strBytes('amount=100&to=alice');
    const extBytes = strBytes('&to=mallory');

    const macWords = sha256Words(new Uint8Array([...secret, ...msgBytes]));
    const { forgedHex, glue } = forgeExtension(macWords, secret.length, msgBytes, extBytes);

    const honest = wordsToHex(
      sha256Words(new Uint8Array([...secret, ...msgBytes, ...glue, ...extBytes])),
    );
    expect(forgedHex).toBe(honest);
  });

  it('glueBytes matches the padding the victim appended to secret || msg', () => {
    const secretLen = 32;
    const msgBytes = strBytes('amount=100&to=alice');
    const smLen = secretLen + msgBytes.length;
    const glue = glueBytes(smLen);
    expect((smLen + glue.length) % 64).toBe(0);
    expect(glue[0]).toBe(0x80);
  });
});
