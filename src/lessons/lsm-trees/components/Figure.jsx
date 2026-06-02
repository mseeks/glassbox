// Captioned figure container — every lab and standalone visual lives in one.
export default function Figure({ cap, children, style }) {
  return (
    <div className="fig" style={style}>
      {cap && <span className="fig-cap">{cap}</span>}
      {children}
    </div>
  );
}
