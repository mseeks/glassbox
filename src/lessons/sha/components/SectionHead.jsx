// Section header — eyebrow + numbered, title with an italic accent, optional lede.
export default function SectionHead({ num, eyebrow, title, italic, lede }) {
  return (
    <div className="reveal" style={{ marginBottom: 6 }}>
      <div className="eyebrow">
        <span className="dash" />
        {num} · {eyebrow}
      </div>
      <h2 className="h-sec" style={{ marginTop: 14 }}>
        {title}
        {italic ? (
          <>
            {' '}
            <em>{italic}</em>
          </>
        ) : null}
      </h2>
      {lede && (
        <p className="lede" style={{ marginTop: 16 }}>
          {lede}
        </p>
      )}
    </div>
  );
}
