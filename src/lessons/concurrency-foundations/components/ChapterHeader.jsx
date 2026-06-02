export function ChapterHeader({ num, anchor, blurb, children }) {
  return (
    <section className="chapter-header" id={anchor}>
      <div className="chapter-line" />
      <div className="chapter-mark">part {num}</div>
      <h2 className="chapter-title">{children}</h2>
      <p className="chapter-blurb">{blurb}</p>
    </section>
  );
}
