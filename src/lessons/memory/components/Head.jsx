// Numbered section header — eyebrow with chapter number + kicker, then the
// chapter title in the display face.
export default function Head({ num, kicker, title }) {
  return (
    <div className="rev" style={{ marginBottom: 22 }}>
      <div className="eyebrow" style={{ marginBottom: 14 }}>
        {num} · {kicker}
      </div>
      <h2 className="sec">{title}</h2>
    </div>
  );
}
