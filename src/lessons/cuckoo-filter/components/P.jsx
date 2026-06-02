export function P({ children, size = 'base' }) {
  const sizes = { base: 18, lead: 22, small: 15.5 };
  return (
    <p
      className="cf-body"
      style={{
        margin: '0 0 1.1em',
        fontSize: sizes[size],
        lineHeight: size === 'lead' ? 1.5 : 1.65,
      }}
    >
      {children}
    </p>
  );
}
