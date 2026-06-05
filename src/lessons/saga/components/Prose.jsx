// Prose block — the reading column. `drop` adds the illuminated drop-cap to the
// first letter (the gilded initial that opens each canto's first paragraph).
export default function Prose({ drop, children }) {
  return <div className={`sg-prose ${drop ? 'sg-dropcap' : ''}`}>{children}</div>;
}
