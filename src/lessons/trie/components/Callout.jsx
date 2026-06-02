// Inset callout — a labelled paragraph used by sections to highlight a key
// definition or take-away.
export default function Callout({ title, children }) {
  return (
    <div className="callout">
      <div className="ct">{title}</div>
      <p>{children}</p>
    </div>
  );
}
