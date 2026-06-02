// Optional-titled annotation note. Used for sidebar caveats (e.g. "what
// bloom cannot do").
export default function Note({ h, children }) {
  return (
    <div className="note">
      {h && <div className="note-h">{h}</div>}
      {children}
    </div>
  );
}
