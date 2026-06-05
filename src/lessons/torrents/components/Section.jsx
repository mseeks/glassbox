// A chapter header: the mono "§n · kicker" eyebrow and the display title whose
// final phrase (the source marked it with `{}`) is highlighted in gold via `em`.
// Rendered from plain nodes — no dangerouslySetInnerHTML — so it stays safe.
export function SectionHeader({ n, kicker, title, em }) {
  const [head, tail] = title.split('{}');
  return (
    <div className="tor-rv" style={{ marginBottom: 28 }}>
      <div className="tor-kicker">
        §{n} · {kicker}
      </div>
      <h2 className="tor-sec">
        {head}
        {em ? <span className="tor-em">{em}</span> : null}
        {tail}
      </h2>
    </div>
  );
}
