// A small colour key: each item is a swatch (decorative) plus its label.
export default function Legend({ items }) {
  return (
    <div className="bst-legend">
      {items.map((it, i) => (
        <span key={i}>
          <i
            className="bst-swatch"
            style={{ background: it.c, borderColor: it.c }}
            aria-hidden="true"
          />
          {it.t}
        </span>
      ))}
    </div>
  );
}
