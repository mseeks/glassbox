// A small mono pill. Token-driven via the --lk-* contract.
export function Chip({ children, className = '', ...rest }) {
  return (
    <span className={`lk-chip ${className}`.trim()} {...rest}>
      {children}
    </span>
  );
}
