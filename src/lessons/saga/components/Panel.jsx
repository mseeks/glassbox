// Panel — the framed plate that holds a figure or a lab. `title` renders the
// gilt header bar (a marker dot + a mono label); `note` renders the italic
// footer gloss beneath the body.
export default function Panel({ title, note, children }) {
  return (
    <div className="sg-panel">
      {title && (
        <div className="sg-panel-bar">
          <span className="dot" />
          <span className="ttl">{title}</span>
        </div>
      )}
      <div className="sg-panel-body">{children}</div>
      {note && <div className="sg-panel-note">{note}</div>}
    </div>
  );
}
