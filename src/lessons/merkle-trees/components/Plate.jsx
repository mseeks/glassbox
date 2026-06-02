// Engraved plate — the figure/card container every lab and standout content
// block uses. The `.mk-plate-corner` class adds the corner ornament that
// matches the lesson's banknote-security aesthetic.
export default function Plate({ children, style, className = '' }) {
  return (
    <div className={`mk-plate mk-plate-corner ${className}`} style={{ padding: 22, ...style }}>
      {children}
    </div>
  );
}
