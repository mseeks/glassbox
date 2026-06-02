// Tiny display helpers used by the Hero and AvalancheLab to render digests
// nibble-by-nibble and mark which nibbles differ between two hashes.
export function splitNibbles(hex) {
  return hex.split('');
}

export function diffMask(a, b) {
  const m = [];
  for (let i = 0; i < a.length; i++) m.push(a[i] !== b[i]);
  return m;
}
