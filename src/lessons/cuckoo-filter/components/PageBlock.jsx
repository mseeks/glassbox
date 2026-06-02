export function PageBlock({ children, wide = false }) {
  return (
    <div className="cf-page">
      <div className={wide ? 'cf-block-wide' : 'cf-block'}>{children}</div>
    </div>
  );
}
