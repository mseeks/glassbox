// Round-and-localize a number for the instrument readouts (e.g. 12345 -> "12,345").
export const fmt = (n) => Math.round(n).toLocaleString('en-US');
