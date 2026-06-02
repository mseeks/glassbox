// An instrument panel chrome: a labelled tab strip over a padded body.
export default function Panel({ label, sub, children }) {
  return (
    <div className="panel">
      <div className="ptab">
        <span className="dot" />
        <span className="lbl">
          <b>{label}</b>
          {sub ? ` · ${sub}` : ''}
        </span>
      </div>
      <div className="pbody">{children}</div>
    </div>
  );
}
