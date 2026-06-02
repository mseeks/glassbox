import { describe, expect, it } from 'vitest';
import {
  modpow,
  discreteLog,
  fnv1a,
  RSA,
  rsaHash,
  rsaSign,
  rsaVerify,
  keystreamXor,
  hexToRgb,
  rgbToHex,
  mix,
  hslToHex,
  threatState,
  DH_P,
  DH_G,
  MSG,
  MSG_TAMPERED,
} from '../src/lessons/tls/engine/index.js';

// Reference modular exponentiation via the native BigInt operators, valid for
// the small exponents the lesson uses (keeps the intermediate within reach).
function refModpow(base, exp, mod) {
  return base ** exp % mod;
}

describe('tls-engine · modpow', () => {
  it('matches BigInt ** % for small known values', () => {
    expect(modpow(5n, 3n, 23n)).toBe(refModpow(5n, 3n, 23n));
    expect(modpow(2n, 10n, 1000n)).toBe(refModpow(2n, 10n, 1000n));
    expect(modpow(7n, 4n, 13n)).toBe(refModpow(7n, 4n, 13n));
  });

  it('returns hand-computed values', () => {
    expect(modpow(5n, 6n, 23n)).toBe(8n); // 5^6 = 15625, 15625 mod 23 = 8
    expect(modpow(5n, 15n, 23n)).toBe(19n);
    expect(modpow(3n, 0n, 7n)).toBe(1n); // anything^0 = 1
  });

  it('agrees with the reference over a sweep of small exponents', () => {
    for (let g = 2n; g <= 6n; g++) {
      for (let e = 0n; e <= 12n; e++) {
        expect(modpow(g, e, DH_P)).toBe(refModpow(g, e, DH_P));
      }
    }
  });
});

describe('tls-engine · Diffie–Hellman', () => {
  it('both sides derive the identical shared secret', () => {
    for (const a of [1n, 6n, 11n, 15n, 22n]) {
      for (const b of [2n, 9n, 14n, 20n]) {
        const A = modpow(DH_G, a, DH_P);
        const B = modpow(DH_G, b, DH_P);
        // client computes B^a, server computes A^b — must agree
        expect(modpow(B, a, DH_P)).toBe(modpow(A, b, DH_P));
        // and equals g^(ab)
        expect(modpow(B, a, DH_P)).toBe(modpow(DH_G, a * b, DH_P));
      }
    }
  });

  it('discreteLog recovers the secret exponent for p=23, g=5', () => {
    for (let x = 1n; x < DH_P; x++) {
      const y = modpow(DH_G, x, DH_P);
      const recovered = discreteLog(DH_G, y, DH_P);
      // g=5 is a primitive root mod 23, so each exponent maps to a unique value
      expect(recovered).toBe(x);
    }
  });

  it('discreteLog returns null when no exponent produces the target', () => {
    // pick a value that g never reaches: g=2 mod 7 cycles {2,4,1}, so 3 is unreachable
    expect(discreteLog(2n, 3n, 7n)).toBeNull();
  });
});

describe('tls-engine · fnv1a', () => {
  it('is deterministic — same input, same hash', () => {
    expect(fnv1a('hello')).toBe(fnv1a('hello'));
    expect(fnv1a(MSG)).toBe(fnv1a(MSG));
  });

  it('distinguishes different inputs', () => {
    expect(fnv1a('hello')).not.toBe(fnv1a('hellp'));
    expect(fnv1a(MSG)).not.toBe(fnv1a(MSG_TAMPERED));
  });

  it('returns an unsigned 32-bit integer', () => {
    const h = fnv1a('a string of some length');
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });

  it('hashes the empty string to the FNV-1a offset basis', () => {
    expect(fnv1a('')).toBe(0x811c9dc5);
  });
});

describe('tls-engine · RSA signatures', () => {
  it('round-trips: a freshly signed message verifies', () => {
    const msg = 'I am the real bank.';
    expect(rsaVerify(msg, rsaSign(msg))).toBe(true);
  });

  it('verifies several distinct messages', () => {
    for (const msg of ['hello', 'transfer funds', MSG, MSG_TAMPERED, '']) {
      expect(rsaVerify(msg, rsaSign(msg))).toBe(true);
    }
  });

  it('a tampered message fails verification against the original signature', () => {
    const sig = rsaSign(MSG);
    expect(rsaVerify(MSG, sig)).toBe(true);
    expect(rsaVerify(MSG_TAMPERED, sig)).toBe(false);
  });

  it('a wrong/forged signature fails verification', () => {
    const sig = rsaSign(MSG);
    const wrong = (sig + 1n) % RSA.n;
    expect(rsaVerify(MSG, wrong)).toBe(false);
    expect(rsaVerify(MSG, 0n)).toBe(false);
  });

  it('rsaHash maps every message into [0, n)', () => {
    for (const msg of ['a', 'bb', 'ccc', MSG, MSG_TAMPERED]) {
      const h = rsaHash(msg);
      expect(h).toBeGreaterThanOrEqual(0n);
      expect(h).toBeLessThan(RSA.n);
    }
  });

  it('sign is hash^d mod n and verify is sig^e mod n (mutual inverses)', () => {
    const h = rsaHash(MSG);
    const sig = rsaSign(MSG);
    expect(sig).toBe(modpow(h, RSA.d, RSA.n));
    expect(modpow(sig, RSA.e, RSA.n)).toBe(h);
  });
});

describe('tls-engine · keystreamXor', () => {
  it('is a reversible involution — xor twice with the same key restores plaintext', () => {
    const text = 'meet me at noon';
    const key = 's3cret';
    const cipher = keystreamXor(text, key);
    const back = keystreamXor(String.fromCharCode(...cipher), key);
    expect(String.fromCharCode(...back)).toBe(text);
  });

  it('the wrong key does not recover the plaintext', () => {
    const text = 'meet me at noon';
    const cipher = keystreamXor(text, 's3cret');
    const back = keystreamXor(String.fromCharCode(...cipher), 's3cret!');
    expect(String.fromCharCode(...back)).not.toBe(text);
  });

  it('produces one output byte per input character, all in [0,255]', () => {
    const out = keystreamXor('hello world', 'k');
    expect(out).toHaveLength('hello world'.length);
    for (const b of out) {
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(255);
    }
  });

  it('is deterministic for the same text + key', () => {
    expect(keystreamXor('abc', 'key')).toEqual(keystreamXor('abc', 'key'));
  });

  it('handles the empty string', () => {
    expect(keystreamXor('', 'key')).toEqual([]);
  });
});

describe('tls-engine · colour helpers', () => {
  it('hexToRgb parses the three channels', () => {
    expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]);
    expect(hexToRgb('#00ff00')).toEqual([0, 255, 0]);
    expect(hexToRgb('#0000ff')).toEqual([0, 0, 255]);
    expect(hexToRgb('#cdba46')).toEqual([0xcd, 0xba, 0x46]);
  });

  it('rgbToHex round-trips with hexToRgb', () => {
    for (const hex of ['#000000', '#ffffff', '#46d6c6', '#e0ad4e', '#f0644d']) {
      expect(rgbToHex(hexToRgb(hex))).toBe(hex);
    }
  });

  it('rgbToHex clamps out-of-range channels and zero-pads', () => {
    expect(rgbToHex([-10, 300, 5])).toBe('#00ff05');
    expect(rgbToHex([1, 2, 3])).toBe('#010203');
  });

  it('mix averages channels — black + white is mid-grey', () => {
    expect(mix('#000000', '#ffffff')).toBe('#808080');
  });

  it('mix of identical colours is that colour', () => {
    expect(mix('#46d6c6', '#46d6c6', '#46d6c6')).toBe('#46d6c6');
  });

  it('hslToHex returns a valid 7-char hex and known anchors', () => {
    const c = hslToHex(355, 72, 56);
    expect(c).toMatch(/^#[0-9a-f]{6}$/);
    expect(hslToHex(0, 0, 0)).toBe('#000000'); // black
    expect(hslToHex(0, 0, 100)).toBe('#ffffff'); // white
    expect(hslToHex(0, 100, 50)).toBe('#ff0000'); // pure red
    expect(hslToHex(120, 100, 50)).toBe('#00ff00'); // pure green
    expect(hslToHex(240, 100, 50)).toBe('#0000ff'); // pure blue
  });
});

describe('tls-engine · threatState', () => {
  const attacks = ['read', 'tamper', 'impersonate'];

  it('each attack is HELD when the channel is sealed', () => {
    for (const a of attacks) {
      const s = threatState(a, true);
      expect(s.held).toBe(true);
      expect(s.lock).toBe('sealed');
    }
  });

  it('each attack is BROKEN (held=false) when the channel is not sealed', () => {
    for (const a of attacks) {
      const s = threatState(a, false);
      expect(s.held).toBe(false);
      expect(s.lock).toBe('broken');
    }
  });

  it('tampering on the open wire delivers the tampered message', () => {
    expect(threatState('tamper', false).arrived).toBe(MSG_TAMPERED);
    // sealing it restores the genuine message and rejects the change
    expect(threatState('tamper', true).arrived).toBe(MSG);
  });

  it('impersonation is answered by a FAKE BANK either way', () => {
    expect(threatState('impersonate', false).responder).toBe('FAKE BANK');
    expect(threatState('impersonate', false).okResp).toBe(false);
    expect(threatState('impersonate', true).responder).toBe('FAKE BANK');
  });

  it('the "none" case has no property and a null held flag', () => {
    const open = threatState('none', false);
    expect(open.lock).toBe('open');
    expect(open.property).toBeNull();
    expect(open.held).toBeNull();
    const sealed = threatState('none', true);
    expect(sealed.lock).toBe('sealed');
    expect(sealed.property).toBeNull();
    expect(sealed.held).toBeNull();
  });

  it('reading the open wire copies the genuine plaintext into the note', () => {
    expect(threatState('read', false).note).toContain(MSG);
  });

  it('attaches the right security property to each named attack', () => {
    expect(threatState('read', true).property).toBe('Confidentiality');
    expect(threatState('tamper', true).property).toBe('Integrity');
    expect(threatState('impersonate', true).property).toBe('Authenticity');
  });

  it('every state carries an icon component', () => {
    for (const sealed of [false, true]) {
      for (const a of [...attacks, 'none']) {
        expect(threatState(a, sealed).icon).toBeTypeOf('object');
      }
    }
  });
});

describe('tls-engine · constants', () => {
  it('exposes the textbook RSA params and DH params', () => {
    expect(RSA).toEqual({ n: 3233n, e: 17n, d: 2753n });
    expect(DH_P).toBe(23n);
    expect(DH_G).toBe(5n);
  });

  it('RSA keys are genuine inverses: (m^e)^d ≡ m (mod n) for messages < n', () => {
    for (const m of [2n, 42n, 1000n, 3232n]) {
      const enc = modpow(m, RSA.e, RSA.n);
      expect(modpow(enc, RSA.d, RSA.n)).toBe(m);
    }
  });
});
