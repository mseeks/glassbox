/**
 * Cuckoo filter mechanics — pure functions, no React, no DOM.
 *
 * Extracted from CuckooFilterLesson.jsx so the engine can be unit tested and
 * reused (the lesson imports these to keep its render code thin).
 *
 *   fnv1a32 / mix32      — 32-bit non-cryptographic string hash + bit mixer.
 *   fingerprintOf        — short non-zero fingerprint of an item (0 is the
 *                          empty-slot sentinel, so it is bumped to 1).
 *   makeFilter           — fresh filter: numBuckets × slotsPerBucket of zeros.
 *   indexOf / altIndex   — the two candidate buckets. altIndex is the partial-
 *                          key trick: i2 = i1 XOR hash(fp), which is its own
 *                          inverse when numBuckets is a power of two, so either
 *                          bucket can recover the other from just the fingerprint.
 *   insertItem           — place, or cuckoo-kick up to maxKicks times. Returns
 *                          a step trace for the visualization. (Eviction picks
 *                          a random victim slot, so the kick path is stochastic.)
 *   lookupItem           — membership: is the fingerprint in either bucket?
 *   deleteByLookup       — clear one matching fingerprint slot.
 *   filterLoad           — occupancy in [0, 1].
 */

export function fnv1a32(s) {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function mix32(x) {
  x = (x ^ (x >>> 16)) >>> 0;
  x = Math.imul(x, 0x7feb352d) >>> 0;
  x = (x ^ (x >>> 15)) >>> 0;
  x = Math.imul(x, 0x846ca68b) >>> 0;
  x = (x ^ (x >>> 16)) >>> 0;
  return x >>> 0;
}

export function fingerprintOf(item, bits = 8) {
  const h = mix32(fnv1a32('f:' + item));
  const mask = (1 << bits) - 1;
  let fp = h & mask;
  if (fp === 0) fp = 1;
  return fp;
}

export function fpHex(fp, bits = 8) {
  const chars = Math.ceil(bits / 4);
  return fp.toString(16).toUpperCase().padStart(chars, '0');
}

/**
 * True when n is a positive power of two. The partial-key trick (altIndex) is
 * only its own inverse for power-of-two bucket counts, so makeFilter warns when
 * handed anything else.
 */
export function isPowerOfTwo(n) {
  return Number.isInteger(n) && n > 0 && (n & (n - 1)) === 0;
}

export function makeFilter({
  numBuckets = 32,
  slotsPerBucket = 4,
  fpBits = 8,
  maxKicks = 250,
} = {}) {
  if (!isPowerOfTwo(numBuckets)) {
    // altIndex(i, fp) = (i ^ (mix32(fp) % numBuckets)) % numBuckets is only its
    // own inverse when numBuckets is a power of two; otherwise the alternate
    // bucket cannot be recovered from a fingerprint, so lookups and deletes on
    // it silently break. Callers must pass a power-of-two bucket count.
    console.warn(
      `makeFilter: numBuckets=${numBuckets} is not a power of two; ` +
        'altIndex is no longer an involution and the filter will misbehave.',
    );
  }
  const buckets = Array.from({ length: numBuckets }, () => new Array(slotsPerBucket).fill(0));
  return { buckets, numBuckets, slotsPerBucket, fpBits, maxKicks, items: 0 };
}

export function indexOf(item, numBuckets) {
  return mix32(fnv1a32('i:' + item)) % numBuckets;
}

export function altIndex(i, fp, numBuckets) {
  return (i ^ (mix32(fp) % numBuckets)) % numBuckets;
}

export function insertItem(filter, item) {
  const fp = fingerprintOf(item, filter.fpBits);
  const i1 = indexOf(item, filter.numBuckets);
  const i2 = altIndex(i1, fp, filter.numBuckets);
  const trace = [{ kind: 'compute', fp, i1, i2 }];
  const s1 = filter.buckets[i1].findIndex((s) => s === 0);
  if (s1 !== -1) {
    filter.buckets[i1][s1] = fp;
    filter.items++;
    trace.push({ kind: 'placed', bucket: i1, slot: s1, fp });
    return { success: true, trace, kicks: 0 };
  }
  const s2 = filter.buckets[i2].findIndex((s) => s === 0);
  if (s2 !== -1) {
    filter.buckets[i2][s2] = fp;
    filter.items++;
    trace.push({ kind: 'placed', bucket: i2, slot: s2, fp });
    return { success: true, trace, kicks: 0 };
  }
  trace.push({ kind: 'both-full' });
  let curFp = fp;
  let curBucket = Math.random() < 0.5 ? i1 : i2;
  for (let kick = 0; kick < filter.maxKicks; kick++) {
    const slotIdx = Math.floor(Math.random() * filter.slotsPerBucket);
    const evicted = filter.buckets[curBucket][slotIdx];
    filter.buckets[curBucket][slotIdx] = curFp;
    trace.push({ kind: 'evict', bucket: curBucket, slot: slotIdx, placed: curFp, kicked: evicted });
    curFp = evicted;
    const next = altIndex(curBucket, curFp, filter.numBuckets);
    const open = filter.buckets[next].findIndex((s) => s === 0);
    if (open !== -1) {
      filter.buckets[next][open] = curFp;
      filter.items++;
      trace.push({ kind: 'placed', bucket: next, slot: open, fp: curFp, afterEvict: true });
      return { success: true, trace, kicks: kick + 1 };
    }
    curBucket = next;
  }
  trace.push({ kind: 'failed', kicks: filter.maxKicks });
  return { success: false, trace, kicks: filter.maxKicks };
}

export function lookupItem(filter, item) {
  const fp = fingerprintOf(item, filter.fpBits);
  const i1 = indexOf(item, filter.numBuckets);
  const i2 = altIndex(i1, fp, filter.numBuckets);
  const in1 = filter.buckets[i1].includes(fp);
  const in2 = filter.buckets[i2].includes(fp);
  return { fp, i1, i2, in1, in2, found: in1 || in2 };
}

export function deleteByLookup(filter, item) {
  const fp = fingerprintOf(item, filter.fpBits);
  const i1 = indexOf(item, filter.numBuckets);
  const i2 = altIndex(i1, fp, filter.numBuckets);
  for (const idx of [i1, i2]) {
    const slot = filter.buckets[idx].indexOf(fp);
    if (slot !== -1) {
      filter.buckets[idx][slot] = 0;
      filter.items--;
      return { success: true, bucket: idx, slot, fp };
    }
  }
  return { success: false, fp, i1, i2 };
}

export function filterLoad(filter) {
  return filter.items / (filter.numBuckets * filter.slotsPerBucket);
}
