// A margin gloss — note (lapis), warn (vermilion), or key (gold). The `label`
// is the small rubricated tag above the gloss; `kind` tints the left rule.
export default function Callout({ kind = 'note', label, children }) {
  return (
    <div className={`sg-call ${kind}`}>
      {label && <span className="lab">{label}</span>}
      {children}
    </div>
  );
}
