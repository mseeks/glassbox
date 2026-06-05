// A plate is one prose chapter: an anchored <section> with the standard wrap.
// The reveal-on-scroll blocks inside are tagged .bst-rv and lit by the shared
// useRevealRoot observer attached to the lesson root.
export default function Plate({ id, children, style }) {
  return (
    <section id={id} className="bst-plate" style={style}>
      <div className="bst-wrap">{children}</div>
    </section>
  );
}
