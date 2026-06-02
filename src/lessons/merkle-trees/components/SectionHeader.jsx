// Section header — kicker eyebrow + display title, with offset padding for
// scroll-spy anchoring (so the Nav's scroll-into-view doesn't tuck the title
// under the sticky bar).
export default function SectionHeader({ kicker, title, id }) {
  return (
    <div id={id} style={{ paddingTop: 96, marginTop: -64, marginBottom: 24 }}>
      <div className="mk-kicker">{kicker}</div>
      <h2 className="mk-h2 mk-display">{title}</h2>
    </div>
  );
}
