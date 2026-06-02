/**
 * Protocol-buffer wire encoding + HTTP/2 multiplexing math — pure functions,
 * no React, no DOM.
 *
 * Extracted from GrpcLesson.jsx so the byte-level logic can be unit tested and
 * reused (the labs import these to keep their render code thin).
 *
 *   varintBytes      — base-128 varint: 7 value bits per byte, top bit = "more".
 *   toUnsigned64     — two's-complement reinterpretation of a negative int64
 *                      (why a plain int64 −1 costs 10 bytes on the wire).
 *   zigzag           — sint zig-zag mapping (−1→1, 1→2, −2→3 …) so small
 *                      magnitudes stay small after varint encoding.
 *   fieldTag         — the key byte(s): (field << 3) | wireType, varint-encoded.
 *   toHex            — one byte as a two-char hex string.
 *   encodeField      — one proto field → array of {byte, role, …} so the UI can
 *                      colour every byte (tag / length / value).
 *   encodeAccount    — the demo Account message → coloured byte parts.
 *   jsonForAccount   — the same message as JSON, with its UTF-8 byte length, for
 *                      the size comparison.
 *   varintGroups     — a varint's 7-bit groups (low group first) with the
 *                      continuation flag, for the bit-construction view.
 *   STREAM_FRAMES /  — the multiplexing scope's fixtures: three streams sharing
 *   SCHEDULES           one connection, serial (h1) vs interleaved (h2).
 *   completionTimes  — time slot at which each stream finishes under a schedule
 *                      (the head-of-line-blocking readout).
 */

const TEXT_ENCODER = new TextEncoder();

// Base-128 varint. Accepts a BigInt or a number; returns an array of byte
// values (low group first). 0 encodes as a single 0x00 byte.
export function varintBytes(value) {
  let v = typeof value === 'bigint' ? value : BigInt(value);
  const out = [];
  if (v === 0n) return [0];
  while (v > 0n) {
    let b = Number(v & 0x7fn);
    v >>= 7n;
    if (v > 0n) b |= 0x80;
    out.push(b);
  }
  return out;
}

// A negative int64 is sent as its 64-bit two's-complement value — which is a
// huge unsigned number, hence 10 varint bytes for the smallest negatives.
export const toUnsigned64 = (n) => (n < 0n ? (1n << 64n) + n : n);

// Zig-zag interleaves sign into the low bit so |small| stays small: 0,−1,1,−2 …
// map to 0,1,2,3 …
export const zigzag = (n) => (n >= 0n ? n * 2n : -n * 2n - 1n);

// The field "key": field number shifted left 3, OR'd with the 3-bit wire type.
export const fieldTag = (field, wireType) => varintBytes(BigInt((field << 3) | wireType));

export const toHex = (b) => b.toString(16).padStart(2, '0');

// Encode one field into coloured byte parts. `kind` is one of
// 'string' | 'varint' | 'sint' | 'bool'. Numeric kinds expect a BigInt value;
// 'string' expects a JS string.
export function encodeField(field, value, kind) {
  const parts = [];
  if (kind === 'string') {
    const body = Array.from(TEXT_ENCODER.encode(value));
    fieldTag(field, 2).forEach((b, i) =>
      parts.push({
        byte: b,
        role: 'tag',
        first: i === 0,
        field,
        kind,
        label: i === 0 ? `field ${field}, type 2 (len-delimited)` : 'tag cont.',
      }),
    );
    varintBytes(BigInt(body.length)).forEach((b) =>
      parts.push({ byte: b, role: 'len', field, kind, label: `length = ${body.length}` }),
    );
    body.forEach((b) =>
      parts.push({ byte: b, role: 'val', field, kind, label: `'${String.fromCharCode(b)}'` }),
    );
    return parts;
  }
  // varint / sint / bool all ride wire type 0. An unrecognized kind yields no
  // bytes (an empty field), matching the original artifact's explicit guard.
  if (kind === 'varint' || kind === 'sint' || kind === 'bool') {
    const payload = kind === 'sint' ? zigzag(value) : toUnsigned64(value);
    fieldTag(field, 0).forEach((b, i) =>
      parts.push({
        byte: b,
        role: 'tag',
        first: i === 0,
        field,
        kind,
        label: i === 0 ? `field ${field}, type 0 (varint)` : 'tag cont.',
      }),
    );
    const vb = varintBytes(payload);
    vb.forEach((b, i) =>
      parts.push({
        byte: b,
        role: 'val',
        field,
        kind,
        label: vb.length > 1 ? `varint byte ${i + 1}/${vb.length}` : `value = ${value}`,
      }),
    );
  }
  return parts;
}

// The demo Account message → coloured byte parts. `balanceCents` is a BigInt;
// negatives are clamped to 0 (the lab forbids them for the unsigned field).
export function encodeAccount({ owner, balanceCents, currency, hasCurrency }) {
  const parts = [];
  if (owner.length) parts.push(...encodeField(1, owner, 'string'));
  parts.push(...encodeField(2, balanceCents < 0n ? 0n : balanceCents, 'varint'));
  if (hasCurrency && currency.length) parts.push(...encodeField(3, currency, 'string'));
  return parts;
}

// The same message rendered as JSON, with the UTF-8 byte length it would take
// on the wire — the baseline the protobuf encoding is measured against.
export function jsonForAccount({ owner, balanceCents, currency, hasCurrency }) {
  const obj = {
    owner,
    balance_cents: Number(balanceCents < 0n ? 0n : balanceCents),
    ...(hasCurrency ? { currency } : {}),
  };
  const text = JSON.stringify(obj);
  return { text, bytes: TEXT_ENCODER.encode(text).length };
}

// A varint's 7-bit groups (low group first) with the continuation flag and hex,
// for the bit-by-bit construction view.
export function varintGroups(bytes) {
  return bytes.map((b, i) => ({
    cont: i < bytes.length - 1,
    bits: (b & 0x7f).toString(2).padStart(7, '0'),
    hex: toHex(b),
  }));
}

// Multiplexing scope fixtures: three streams share one connection. A is big
// (6 frames), B and C are small (2 each). h1 sends each response to completion
// before the next; h2 round-robins frames across streams.
export const STREAM_FRAMES = { A: 6, B: 2, C: 2 };

export const SCHEDULES = {
  h1: ['A', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'C', 'C'],
  h2: ['A', 'B', 'C', 'A', 'B', 'C', 'A', 'A', 'A', 'A'],
};

// The time slot (1-based) at which each stream's last frame lands under a
// schedule — the head-of-line-blocking readout.
export function completionTimes(schedule, frames = STREAM_FRAMES) {
  const seen = {};
  const done = {};
  schedule.forEach((s, i) => {
    seen[s] = (seen[s] || 0) + 1;
    if (seen[s] === frames[s]) done[s] = i + 1;
  });
  return done;
}
