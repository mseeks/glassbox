import { describe, expect, it } from 'vitest';
import { GB, KB, MB, PB, PLACE, TB, charOf, fmtBytes } from '../src/lessons/memory/engine/index.js';

describe('memory-engine · unit constants', () => {
  it('each unit is 1024× the previous', () => {
    expect(KB).toBe(1024);
    expect(MB).toBe(1024 * KB);
    expect(GB).toBe(1024 * MB);
    expect(TB).toBe(1024 * GB);
    expect(PB).toBe(1024 * TB);
  });

  it('PLACE is the eight binary place values, MSB→LSB', () => {
    expect(PLACE).toEqual([128, 64, 32, 16, 8, 4, 2, 1]);
    expect(PLACE.reduce((a, b) => a + b, 0)).toBe(255); // a full byte
  });
});

describe('memory-engine · fmtBytes', () => {
  it('prints raw bytes below 1 KB', () => {
    expect(fmtBytes(0)).toBe('0 B');
    expect(fmtBytes(1)).toBe('1 B');
    expect(fmtBytes(1023)).toBe('1023 B');
  });

  it('rolls over at the 1024 boundary to the next unit', () => {
    expect(fmtBytes(1024)).toBe('1.00 KB');
    expect(fmtBytes(MB)).toBe('1.00 MB');
    expect(fmtBytes(GB)).toBe('1.00 GB');
    expect(fmtBytes(TB)).toBe('1.00 TB');
    expect(fmtBytes(PB)).toBe('1.00 PB');
  });

  it('uses 2 / 1 / 0 decimals across the <10, <100, ≥100 bands', () => {
    expect(fmtBytes(1.5 * KB)).toBe('1.50 KB'); // < 10 → two decimals
    expect(fmtBytes(15 * KB)).toBe('15.0 KB'); // < 100 → one decimal
    expect(fmtBytes(150 * KB)).toBe('150 KB'); // ≥ 100 → rounded integer
  });

  it('picks the largest unit that keeps the leading digit ≥ 1', () => {
    expect(fmtBytes(512 * KB)).toBe('512 KB');
    expect(fmtBytes(2.5 * GB)).toBe('2.50 GB');
  });
});

describe('memory-engine · charOf', () => {
  it('renders printable ASCII as itself', () => {
    expect(charOf(65)).toBe('A');
    expect(charOf(126)).toBe('~');
    expect(charOf(33)).toBe('!');
  });

  it('renders a space as the visible ␣ glyph', () => {
    expect(charOf(32)).toBe('␣');
  });

  it('renders control and out-of-range codes as ·', () => {
    expect(charOf(0)).toBe('·');
    expect(charOf(31)).toBe('·');
    expect(charOf(127)).toBe('·');
    expect(charOf(200)).toBe('·');
  });
});
