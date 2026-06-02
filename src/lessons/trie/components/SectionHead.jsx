// Numbered section header — Roman numeral + kicker eyebrow + chapter title.
export default function SectionHead({ n, kicker, title }) {
  return (
    <div className="shead">
      <div className="num-rule">
        <span className="n">{n}</span>
        <span className="line" />
      </div>
      <div className="kicker">{kicker}</div>
      <h2 className="ch">{title}</h2>
    </div>
  );
}
