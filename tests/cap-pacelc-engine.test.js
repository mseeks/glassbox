import { describe, expect, it } from 'vitest';
import { analyzeQuorum } from '../src/lessons/cap-pacelc/engine/index.js';

describe('cap-pacelc-engine · analyzeQuorum', () => {
  it('clamps read and write quorums to N', () => {
    expect(analyzeQuorum({ n: 3, r: 9, w: 8 })).toMatchObject({ safeR: 3, safeW: 3 });
  });

  it('is strong if and only if R + W > N', () => {
    expect(analyzeQuorum({ n: 5, r: 3, w: 3 }).strong).toBe(true);
    expect(analyzeQuorum({ n: 5, r: 2, w: 3 }).strong).toBe(false);
  });

  it('detects the balanced majority-majority profile', () => {
    expect(analyzeQuorum({ n: 5, r: 3, w: 3 })).toMatchObject({
      strong: true,
      profile: 'Balanced strong (quorum)',
    });
  });

  it('detects maximum availability', () => {
    expect(analyzeQuorum({ n: 5, r: 1, w: 1 })).toMatchObject({
      strong: false,
      profile: 'Maximum availability',
    });
  });

  it('detects read-optimized and write-optimized profiles', () => {
    expect(analyzeQuorum({ n: 5, r: 1, w: 5 }).profile).toBe('Read-optimized');
    expect(analyzeQuorum({ n: 5, r: 5, w: 1 }).profile).toBe('Write-optimized');
  });

  it('reports read and write failure tolerance', () => {
    expect(analyzeQuorum({ n: 7, r: 3, w: 4 })).toMatchObject({
      readFailTol: 4,
      writeFailTol: 3,
    });
  });
});
