// Accent-barred, tinted aside with a small mono label. Styled entirely through
// the --lk-* token contract (see lesson-kit.css), so it inherits the lesson's
// accent/ink/tint. `label` is the uppercase eyebrow; children are the body.
export function Callout({ label, children, className = '', as: Tag = 'div', ...rest }) {
  return (
    <Tag className={`lk-callout ${className}`.trim()} {...rest}>
      {label != null && <div className="lk-callout-label">{label}</div>}
      <div className="lk-callout-body">{children}</div>
    </Tag>
  );
}
