export const HASH_SEEDS = [0x9747b28c, 0x85ebca6b, 0xc2b2ae35, 0x27d4eb2f, 0x165667b1, 0xbf58476d];

export function mixHash(str, seed) {
  let h = seed | 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 0x5bd1e995);
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
  }
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  return h >>> 0;
}

export function hashesFor(nodeId, k, m) {
  const a = mixHash(nodeId, HASH_SEEDS[0]);
  const b = mixHash(nodeId, HASH_SEEDS[1]);
  const positions = [];
  for (let i = 0; i < k; i++) {
    positions.push(((a + Math.imul(i, b)) >>> 0) % m);
  }
  return positions;
}

export function emptyClock(m) {
  return new Array(m).fill(0);
}

export function recordEvent(clock, nodeId, k) {
  const next = [...clock];
  hashesFor(nodeId, k, clock.length).forEach((position) => {
    next[position] += 1;
  });
  return next;
}

export function mergeClocks(a, b) {
  return a.map((value, index) => Math.max(value, b[index]));
}

export function compareClocks(a, b) {
  let aLEb = true;
  let bLEa = true;
  let eq = true;
  for (let i = 0; i < a.length; i++) {
    if (a[i] > b[i]) aLEb = false;
    if (a[i] < b[i]) bLEa = false;
    if (a[i] !== b[i]) eq = false;
  }
  if (eq) return 'equal';
  if (aLEb) return 'before';
  if (bLEa) return 'after';
  return 'concurrent';
}

export function clockWeight(clock, k) {
  return clock.reduce((sum, value) => sum + value, 0) / k;
}

export function emptyVector(n) {
  return new Array(n).fill(0);
}

export function vRecord(vec, idx) {
  const next = [...vec];
  next[idx] += 1;
  return next;
}

export function vMerge(a, b) {
  return a.map((value, index) => Math.max(value, b[index]));
}

export function vCompare(a, b) {
  let aLEb = true;
  let bLEa = true;
  let eq = true;
  for (let i = 0; i < a.length; i++) {
    if (a[i] > b[i]) aLEb = false;
    if (a[i] < b[i]) bLEa = false;
    if (a[i] !== b[i]) eq = false;
  }
  if (eq) return 'equal';
  if (aLEb) return 'before';
  if (bLEa) return 'after';
  return 'concurrent';
}
