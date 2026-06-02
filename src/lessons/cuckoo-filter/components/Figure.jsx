export function Figure({ label, title, foot, children }) {
  return (
    <div className="cf-fig">
      <div className="cf-fig-frame">
        <div className="cf-fig-head">
          <span className="cf-fig-label">{label}</span>
          <span className="cf-fig-title">{title}</span>
        </div>
        <div className="cf-fig-body">{children}</div>
        {foot && <div className="cf-fig-foot">{foot}</div>}
      </div>
    </div>
  );
}
