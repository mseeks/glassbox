export function SectionHead({ num, eyebrow, title, italic = null }) {
  return (
    <div className="cf-section-head">
      <div className="cf-section-num">§ {num}</div>
      <div className="cf-section-titlewrap">
        {eyebrow && <div className="cf-section-eyebrow">{eyebrow}</div>}
        <h2 className="cf-section-title">
          {title}
          {italic && (
            <>
              {' '}
              <em>{italic}</em>
            </>
          )}
        </h2>
      </div>
    </div>
  );
}
