// A labelled, captioned figure container — every lab renders inside one.
export default function Figure({ label, title, foot, children, right }) {
  return (
    <figure className="figure reveal">
      <div className="figure-head">
        <div>
          <div className="figure-label">{label}</div>
          <div className="figure-title">{title}</div>
        </div>
        {right}
      </div>
      <div className="figure-body">{children}</div>
      {foot && <figcaption className="figure-foot">{foot}</figcaption>}
    </figure>
  );
}
