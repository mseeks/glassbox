// Section header: roman-numeral eyebrow + chapter title + optional lede.
export default function SecHead({ rn, title, lede }) {
  return (
    <div className="vp-sechead">
      <div className="vp-roman">{rn}</div>
      <h2 className="vp-h2">{title}</h2>
      {lede && <p className="vp-lede">{lede}</p>}
    </div>
  );
}
