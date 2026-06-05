// A chapter's header plate: the steel Roman numeral, the oxblood kicker, the
// Bodoni title, and an optional italic dek.
export default function SectionHeading({ roman, kicker, title, dek }) {
  return (
    <header style={{ marginBottom: 26 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 10 }}>
        <span className="sst-roman" style={{ fontSize: 22 }}>
          {roman}
        </span>
        <span className="sst-kicker">{kicker}</span>
      </div>
      <h2 className="sst-h2">{title}</h2>
      {dek && <p className="sst-dek">{dek}</p>}
    </header>
  );
}
