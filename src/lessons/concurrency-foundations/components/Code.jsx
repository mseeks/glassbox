export function Code({ children, label }) {
  return (
    <pre className="code">
      {label && <span className="code-label">{label}</span>}
      {children}
    </pre>
  );
}
