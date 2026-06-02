// Section header — eyebrow tag + display title + optional lede. All three
// lines reveal-on-scroll via the .tls-rv class observed at the lesson root.
export default function SectionHeader({ tag, title, lede }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <div className="tls-eyebrow tls-rv">
        <span className="tls-dash" />
        {tag}
      </div>
      <h2 className="tls-h2 tls-rv" style={{ marginTop: 16, transitionDelay: '.05s' }}>
        {title}
      </h2>
      {lede && (
        <p
          className="tls-lede tls-rv"
          style={{ marginTop: 16, maxWidth: 660, transitionDelay: '.1s' }}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
