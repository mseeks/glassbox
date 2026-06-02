/**
 * TLS crypto engine — pure functions, no React, no DOM, no JSX.
 *
 * Extracted from Tls.jsx so the real (toy-sized) cryptography can be unit
 * tested and reused independently of the lesson's render code. Everything here
 * is deterministic given its inputs. The one non-pure helper from the source —
 * randBig, which uses Math.random — deliberately stays in the SignatureLab.
 *
 *   modpow        — modular exponentiation base^exp mod m (heart of DH and RSA).
 *   discreteLog   — brute-force recovery of x from g^x mod p (tiny p only).
 *   fnv1a         — a real, deterministic FNV-1a hash (stand-in for SHA-256).
 *   RSA           — toy textbook RSA params { n, e, d }.
 *   rsaHash       — message -> number in [0, n).
 *   rsaSign       — sign with the PRIVATE key.
 *   rsaVerify     — verify with the PUBLIC key.
 *   keystreamXor  — reversible xorshift keystream XOR (stand-in for AES-GCM).
 *   hexToRgb / rgbToHex / mix / hslToHex — the paint-metaphor colour helpers.
 *   threatState   — the §1 wire-attack state machine (depends only on attack,
 *                   sealed, and the MSG / MSG_TAMPERED constants).
 *   DH_P / DH_G   — public Diffie–Hellman parameters.
 *   MSG / MSG_TAMPERED — the open-wire example messages.
 */

import {
  Eye,
  EyeOff,
  PenLine,
  ShieldCheck,
  BadgeCheck,
  Radio,
  Lock,
  UserMinus,
} from 'lucide-react';

// Modular exponentiation — base^exp mod m  (heart of both DH and RSA)
export function modpow(base, exp, mod) {
  base %= mod;
  let r = 1n;
  while (exp > 0n) {
    if (exp & 1n) r = (r * base) % mod;
    base = (base * base) % mod;
    exp >>= 1n;
  }
  return r;
}

// Brute-force discrete log: recover x from g^x mod p. Feasible ONLY for tiny p.
export function discreteLog(g, y, p) {
  for (let x = 1n; x < p; x++) if (modpow(g, x, p) === y) return x;
  return null;
}

// FNV-1a — a real, deterministic hash. Stand-in so values fit on screen; real TLS uses SHA-256.
export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Toy RSA params (textbook): n=3233 (=61·53), e=17 public, d=2753 private.
export const RSA = { n: 3233n, e: 17n, d: 2753n };
export function rsaHash(msg) {
  return BigInt(fnv1a(msg)) % RSA.n;
} // message -> number in [0,n)
export function rsaSign(msg, d = RSA.d) {
  return modpow(rsaHash(msg), d, RSA.n);
} // sign with PRIVATE key
export function rsaVerify(msg, sig, e = RSA.e) {
  return modpow(sig, e, RSA.n) === rsaHash(msg);
} // verify with PUBLIC key

// stream-cipher stand-in for the symmetric panel (a real, reversible keystream XOR)
export function keystreamXor(text, key) {
  let s = (fnv1a(key) ^ 0x9e3779b9) >>> 0;
  const out = [];
  for (let i = 0; i < text.length; i++) {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0; // xorshift PRG seeded by the key
    out.push(text.charCodeAt(i) ^ (s & 0xff));
  }
  return out;
}

/* ════════════════════════ COLOR (paint metaphor) ════════════════════════ */
export const hexToRgb = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
export const rgbToHex = (r) =>
  '#' +
  r
    .map((v) =>
      Math.max(0, Math.min(255, Math.round(v)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');
export const mix = (...cols) => {
  const r = cols.map(hexToRgb);
  return rgbToHex([0, 1, 2].map((i) => r.reduce((a, c) => a + c[i], 0) / r.length));
};
export function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex([255 * f(0), 255 * f(8), 255 * f(4)]);
}

/* ════════════════════════ DIFFIE–HELLMAN PARAMS ════════════════════════ */
export const DH_P = 23n,
  DH_G = 5n;

/* ═══════════════════════ §1 · THE OPEN WIRE ═══════════════════════ */
export const MSG = 'Transfer $10 to Alice.';
export const MSG_TAMPERED = 'Transfer $9,000 to Alice.';

export function threatState(attack, sealed) {
  if (!sealed) {
    switch (attack) {
      case 'read':
        return {
          lock: 'broken',
          icon: Eye,
          wire: 'reads every byte',
          arrived: MSG,
          responder: 'BANK',
          okResp: true,
          property: 'Confidentiality',
          held: false,
          note: `The eavesdropper copies the plaintext: “${MSG}”`,
        };
      case 'tamper':
        return {
          lock: 'broken',
          icon: PenLine,
          wire: 'rewrites the bytes',
          arrived: MSG_TAMPERED,
          responder: 'BANK',
          okResp: true,
          property: 'Integrity',
          held: false,
          note: 'The amount was changed in flight and the bank has no way to tell.',
        };
      case 'impersonate':
        return {
          lock: 'broken',
          icon: UserMinus,
          wire: 'answers in the bank’s place',
          arrived: MSG,
          responder: 'FAKE BANK',
          okResp: false,
          property: 'Authenticity',
          held: false,
          note: 'You handed your request to an impostor that simply claimed to be the bank.',
        };
      default:
        return {
          lock: 'open',
          icon: Radio,
          wire: 'passes untouched',
          arrived: MSG,
          responder: 'BANK',
          okResp: true,
          property: null,
          held: null,
          note: 'No protection at all — it just happens that nobody is interfering this instant.',
        };
    }
  }
  switch (attack) {
    case 'read':
      return {
        lock: 'sealed',
        icon: EyeOff,
        wire: 'sees only ciphertext',
        arrived: MSG,
        responder: 'BANK',
        okResp: true,
        property: 'Confidentiality',
        held: true,
        note: 'Encryption turns the message into noise on the wire. The reader learns nothing.',
      };
    case 'tamper':
      return {
        lock: 'sealed',
        icon: ShieldCheck,
        wire: 'flips bytes → rejected',
        arrived: MSG,
        responder: 'BANK',
        okResp: true,
        property: 'Integrity',
        held: true,
        note: 'Every record carries an authentication tag. Any change breaks it, and the forged record is thrown away.',
      };
    case 'impersonate':
      return {
        lock: 'sealed',
        icon: BadgeCheck,
        wire: 'presents a fake certificate',
        arrived: MSG,
        responder: 'FAKE BANK',
        okResp: false,
        property: 'Authenticity',
        held: true,
        note: 'The impostor cannot produce a valid certificate for the bank’s name, so the connection is refused before any secret is sent.',
      };
    default:
      return {
        lock: 'sealed',
        icon: Lock,
        wire: 'sees only ciphertext',
        arrived: MSG,
        responder: 'BANK',
        okResp: true,
        property: null,
        held: null,
        note: 'The channel is sealed end to end.',
      };
  }
}
