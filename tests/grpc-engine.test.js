import { describe, expect, it } from 'vitest';
import {
  SCHEDULES,
  STREAM_FRAMES,
  completionTimes,
  encodeAccount,
  encodeField,
  fieldTag,
  jsonForAccount,
  toHex,
  toUnsigned64,
  varintBytes,
  varintGroups,
  zigzag,
} from '../src/lessons/grpc/engine/index.js';

describe('grpc-engine · varintBytes', () => {
  it('encodes 0 as a single zero byte', () => {
    expect(varintBytes(0n)).toEqual([0]);
  });

  it('keeps 0–127 in one byte', () => {
    expect(varintBytes(1n)).toEqual([1]);
    expect(varintBytes(127n)).toEqual([127]);
  });

  it('rolls into a second byte at 128 (low group first, continuation bit set)', () => {
    expect(varintBytes(128n)).toEqual([0x80, 0x01]);
    // 300 = 0b100101100 → groups 0101100 / 0000010 → 0xac, 0x02
    expect(varintBytes(300n)).toEqual([0xac, 0x02]);
  });

  it('grows to three bytes at 16384', () => {
    expect(varintBytes(16384n)).toHaveLength(3);
  });

  it('accepts a plain number as well as a BigInt', () => {
    expect(varintBytes(300)).toEqual(varintBytes(300n));
    expect(varintBytes(0)).toEqual([0]);
  });

  it('spends 10 bytes on a negative reinterpreted as unsigned int64', () => {
    expect(varintBytes(toUnsigned64(-1n))).toHaveLength(10);
  });
});

describe('grpc-engine · toUnsigned64 / zigzag', () => {
  it('leaves non-negative int64 values untouched', () => {
    expect(toUnsigned64(0n)).toBe(0n);
    expect(toUnsigned64(300n)).toBe(300n);
  });

  it('reinterprets a negative int64 as its two’s-complement unsigned value', () => {
    expect(toUnsigned64(-1n)).toBe((1n << 64n) - 1n);
    expect(toUnsigned64(-2n)).toBe((1n << 64n) - 2n);
  });

  it('zig-zags small magnitudes to small unsigned values', () => {
    expect(zigzag(0n)).toBe(0n);
    expect(zigzag(-1n)).toBe(1n);
    expect(zigzag(1n)).toBe(2n);
    expect(zigzag(-2n)).toBe(3n);
  });

  it('makes −1 cost a single byte under sint, vs ten under int64', () => {
    expect(varintBytes(zigzag(-1n))).toEqual([1]);
    expect(varintBytes(toUnsigned64(-1n))).toHaveLength(10);
  });
});

describe('grpc-engine · fieldTag / toHex', () => {
  it('packs (field << 3) | wireType', () => {
    expect(fieldTag(1, 0)).toEqual([0x08]); // field 1, varint
    expect(fieldTag(2, 0)).toEqual([0x10]); // field 2, varint
    expect(fieldTag(1, 2)).toEqual([0x0a]); // field 1, len-delimited
  });

  it('uses two bytes once the tag itself exceeds 127', () => {
    // field 16, varint: 16 << 3 = 128 → varint [0x80, 0x01]
    expect(fieldTag(16, 0)).toEqual([0x80, 0x01]);
  });

  it('zero-pads hex to two chars', () => {
    expect(toHex(5)).toBe('05');
    expect(toHex(255)).toBe('ff');
    expect(toHex(0)).toBe('00');
  });
});

describe('grpc-engine · encodeField', () => {
  it('encodes a string as tag · length · value bytes with the right roles', () => {
    const parts = encodeField(1, 'Al', 'string');
    expect(parts.map((p) => p.role)).toEqual(['tag', 'len', 'val', 'val']);
    expect(parts[0]).toMatchObject({ byte: 0x0a, first: true, kind: 'string' });
    expect(parts[1]).toMatchObject({ byte: 2, role: 'len', label: 'length = 2' });
    expect(parts.slice(2).map((p) => p.byte)).toEqual([65, 108]);
    expect(parts[2].label).toBe("'A'");
  });

  it('labels a single-byte varint with its value, multi-byte with byte indices', () => {
    const small = encodeField(2, 5n, 'varint');
    expect(small.map((p) => p.role)).toEqual(['tag', 'val']);
    expect(small[1].label).toBe('value = 5');

    const big = encodeField(2, 300n, 'varint');
    const valBytes = big.filter((p) => p.role === 'val');
    expect(valBytes).toHaveLength(2);
    expect(valBytes[0].label).toBe('varint byte 1/2');
    expect(valBytes[1].label).toBe('varint byte 2/2');
  });

  it('marks continuation bytes of a multi-byte tag as "tag cont."', () => {
    const parts = encodeField(16, 7n, 'varint'); // field 16 → two-byte tag
    const tagBytes = parts.filter((p) => p.role === 'tag');
    expect(tagBytes).toHaveLength(2);
    expect(tagBytes[0].label).toBe('field 16, type 0 (varint)');
    expect(tagBytes[1].label).toBe('tag cont.');
  });

  it('continues a multi-byte string tag too', () => {
    const parts = encodeField(16, 'x', 'string');
    const tagBytes = parts.filter((p) => p.role === 'tag');
    expect(tagBytes).toHaveLength(2);
    expect(tagBytes[0].label).toBe('field 16, type 2 (len-delimited)');
    expect(tagBytes[1].label).toBe('tag cont.');
  });

  it('zig-zags a sint field and passes bool through unsigned', () => {
    expect(encodeField(2, -1n, 'sint').find((p) => p.role === 'val').byte).toBe(1);
    expect(encodeField(4, 1n, 'bool').find((p) => p.role === 'val').byte).toBe(1);
  });

  it('emits nothing for an unrecognized kind', () => {
    expect(encodeField(2, 5n, 'mystery')).toEqual([]);
  });
});

describe('grpc-engine · encodeAccount', () => {
  it('emits owner, balance, and currency fields when all are present', () => {
    const parts = encodeAccount({
      owner: 'Al',
      balanceCents: 300n,
      currency: 'USD',
      hasCurrency: true,
    });
    const fields = new Set(parts.map((p) => p.field));
    expect([...fields].sort()).toEqual([1, 2, 3]);
  });

  it('omits the owner field when the name is empty', () => {
    const parts = encodeAccount({
      owner: '',
      balanceCents: 300n,
      currency: 'USD',
      hasCurrency: true,
    });
    expect(parts.some((p) => p.field === 1)).toBe(false);
  });

  it('omits currency when toggled off or empty', () => {
    const off = encodeAccount({
      owner: 'Al',
      balanceCents: 1n,
      currency: 'USD',
      hasCurrency: false,
    });
    expect(off.some((p) => p.field === 3)).toBe(false);
    const empty = encodeAccount({ owner: 'Al', balanceCents: 1n, currency: '', hasCurrency: true });
    expect(empty.some((p) => p.field === 3)).toBe(false);
  });

  it('clamps a negative balance to zero', () => {
    const parts = encodeAccount({ owner: '', balanceCents: -5n, currency: '', hasCurrency: false });
    const val = parts.find((p) => p.field === 2 && p.role === 'val');
    expect(val.byte).toBe(0);
  });
});

describe('grpc-engine · jsonForAccount', () => {
  it('serializes the message and reports its UTF-8 byte length', () => {
    const { text, bytes } = jsonForAccount({
      owner: 'Al',
      balanceCents: 300n,
      currency: 'USD',
      hasCurrency: true,
    });
    expect(JSON.parse(text)).toEqual({ owner: 'Al', balance_cents: 300, currency: 'USD' });
    expect(bytes).toBe(new TextEncoder().encode(text).length);
  });

  it('drops currency when toggled off and clamps negatives', () => {
    const { text } = jsonForAccount({
      owner: 'Al',
      balanceCents: -9n,
      currency: 'USD',
      hasCurrency: false,
    });
    const obj = JSON.parse(text);
    expect(obj).not.toHaveProperty('currency');
    expect(obj.balance_cents).toBe(0);
  });

  it('is larger than the protobuf encoding for the same message', () => {
    const msg = { owner: 'Al', balanceCents: 300n, currency: 'USD', hasCurrency: true };
    expect(jsonForAccount(msg).bytes).toBeGreaterThan(encodeAccount(msg).length);
  });
});

describe('grpc-engine · varintGroups', () => {
  it('breaks bytes into 7-bit groups with continuation flags and hex', () => {
    const groups = varintGroups(varintBytes(300n)); // [0xac, 0x02]
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ cont: true, hex: 'ac' });
    expect(groups[1]).toMatchObject({ cont: false, hex: '02' });
    expect(groups[0].bits).toHaveLength(7);
  });

  it('flags a lone byte as non-continuing', () => {
    expect(varintGroups([5])).toEqual([{ cont: false, bits: '0000101', hex: '05' }]);
  });
});

describe('grpc-engine · completionTimes', () => {
  it('shows head-of-line blocking under the serial (h1) schedule', () => {
    expect(completionTimes(SCHEDULES.h1)).toEqual({ A: 6, B: 8, C: 10 });
  });

  it('frees the small streams early under the interleaved (h2) schedule', () => {
    expect(completionTimes(SCHEDULES.h2)).toEqual({ A: 10, B: 5, C: 6 });
  });

  it('accepts a custom frame-count map', () => {
    expect(completionTimes(['X', 'X', 'Y'], { X: 2, Y: 1 })).toEqual({ X: 2, Y: 3 });
  });

  it('exposes the default frame counts', () => {
    expect(STREAM_FRAMES).toEqual({ A: 6, B: 2, C: 2 });
  });
});
